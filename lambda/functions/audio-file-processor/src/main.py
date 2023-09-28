import json
import boto3
import os
import subprocess
import string
import random
from logger import logger


def lambda_handler(event, context):
    """This function is intended to be triggered by an direct call from a client
    The event is a JSON object with the following structure:
    {
        "input_file_bucket": "bucket-name",
        "input_file_key": "path/to/file.mp3",
        "input_file_format": "mp3",
        "output_file_bucket": "bucket-name",
        "output_file_key": "path/to/file.mp3",
        "output_file_format": "mp3",
    }

    Args:
        event (_type_): _description_
        context (_type_): _description_

    Returns:
        _type_: _description_
    """
    SAMPLE_RATE = 16000
    BIT_RATE = "32k"
    MAX_LENGTH_SECONDS = 60 * 60 * 3  # 3 hours
    N = 5
    random_string = "".join(random.choices(string.ascii_letters, k=N))

    # TODO implement
    ffmpeg_path = os.environ.get("FFMPEG_PATH", "/opt/bin/ffmpeg")
    ffprobe_path = os.environ.get("FFPROBE_PATH", "/opt/bin/ffprobe")

    logger.info(f"FFMPEG_PATH: {ffmpeg_path}. FFPROBE_PATH: {ffprobe_path}")
    # Get the input file from S3
    s3 = boto3.client("s3")
    download_path = f"/tmp/input_file.{event['input_file_format']}"
    processed_file_path = (
        f"/tmp/input_file_processed-{random_string}.{event['output_file_format']}"
    )
    logger.info(
        f"Downloading file from {event['input_file_bucket']} with key {event['input_file_key']}"
    )
    try:
        s3.download_file(
            event["input_file_bucket"], event["input_file_key"], download_path
        )
    except Exception as e:
        return {"statusCode": 500, "body": json.dumps(f"Error downloading file: {e}")}

    # Get the duration of the input file
    try:
        logger.info(f"Getting length of file")
        output = subprocess.check_output(
            [
                ffprobe_path,
                "-v",
                "error",  # Set error verbosity level
                "-show_entries",
                "format=duration",  # Show the duration of the format
                "-of",
                "json",  # Output in JSON format
                download_path,
            ]
        )
        info = json.loads(output)
        file_length = float(info["format"]["duration"])
    except Exception as e:
        return {"statusCode": 500, "body": "Error getting file length"}

    # Process the file using ffmpeg
    """
    * Normalize the audio
    * Trim the audio to 3h 
    * Convert the audio to mp3
    * Set the bitrate to 
    """
    try:
        command = [
            ffmpeg_path,
            "-loglevel",
            "error",
            "-hide_banner",
            "-y",
            "-i",
            download_path,
            "-ar",
            f"{SAMPLE_RATE}",
            "-ab",
            f"{BIT_RATE}",
            "-ss",
            "0",
            "-t",
            f"{MAX_LENGTH_SECONDS}",
            processed_file_path,
        ]
        logger.info(" ".join(command))
        subprocess.check_output(command)
    except Exception as e:
        return {"statusCode": 500, "body": json.dumps(f"Error processing file: {e}")}

    # Upload the file to S3
    logger.info(
        f"Uploading file to {event['output_file_bucket']} with key {event['output_file_key']}"
    )
    try:
        s3.upload_file(
            processed_file_path,
            event["output_file_bucket"],
            event["output_file_key"],
        )
        os.remove(processed_file_path)
    except Exception as e:
        return {"statusCode": 500, "body": json.dumps(f"Error uploading file: {e}")}

    return {
        "statusCode": 200,
        "body": json.dumps(
            {
                "original_file_length": file_length,
                "processed_file_length": min(MAX_LENGTH_SECONDS, file_length),
            }
        ),
    }
