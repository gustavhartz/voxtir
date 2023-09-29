from __future__ import print_function

import os
import json
import tempfile
import flask
import boto3
import whisper
from whisper.tokenizer import TO_LANGUAGE_CODE, LANGUAGES
import gc
from pyannote.audio import Pipeline
import torch
from collections import defaultdict
import sys
from json_logger import logger

JSON_TYPE = "application/json"
TEXT_TYPE = "text/plain"
try:
    ENVIRONMENT = os.environ.get("ENVIRONMENT", "development")
    HF_AUTH_TOKEN = os.environ.get("HF_AUTH_TOKEN")
    AVAILABLE_WHISPER_MODELS = json.loads(os.environ.get("AVAILABLE_WHISPER_MODELS"))
except KeyError as e:
    logger.error(f"Missing environment variable {e}")
    raise e


app = flask.Flask(__name__)
if ENVIRONMENT != "development":
    session = boto3.Session()
else:
    session = boto3.Session(
        aws_access_key_id=os.environ["AWS_ACCESS_KEY_ID"],
        aws_secret_access_key=os.environ["AWS_SECRET_ACCESS_KEY"],
    )

s3_client = session.client("s3")


@app.route("/ping", methods=["GET"])
def ping():
    logger.debug(f"PING {sys.version_info}")
    return flask.Response(response="pong", status=200, mimetype=JSON_TYPE)


@app.route("/execution-parameters", methods=["GET"])
def execution_parameters():
    logger.debug("execution-parameters")
    content_type = flask.request.content_type
    request_data = flask.request.data
    logger.info(f"execution-parameters: {content_type} {request_data}")
    return flask.Response(response="{}", status=200, mimetype=JSON_TYPE)


@app.route("/invocations", methods=["POST"])
def transformation() -> flask.Response:
    """Do an inference on a single batch of data. The input format originates from the server. At the time of writing this is
    interface TranscriptionJsonFile {
        bucketName: string;
        audioInputKey: string;
        speakerDiarizationOutputKey: string;
        speechToTextOutputKey: string;
        modelOptions: modelOptions;
    }

    export interface modelOptions {
        model: string;
        language?: string;
        speakerCount?: number;
    }

    Returns:
        flask.Response: The response object. The response does not contain the transcription result. The result is written to the s3 bucket
    """
    request_data = flask.request.data
    data = request_data.decode("utf-8")

    input_dict = None

    if flask.request.content_type == JSON_TYPE:
        try:
            input_dict = json.loads(data)
        except json.JSONDecodeError:
            logger.exception(f"Unable to parse payload {data}")
            return flask.Response(
                response="Unable to parse payload", status=400, mimetype=TEXT_TYPE
            )
    else:
        return flask.Response(
            response="The predictor only supports application/json content type",
            status=415,
            mimetype=TEXT_TYPE,
        )

    bucket_name = input_dict["bucketName"]
    audio_input_key = input_dict["audioInputKey"]
    speaker_diarization_output_key = input_dict["speakerDiarizationOutputKey"]
    speech_to_text_output_key = input_dict["speechToTextOutputKey"]
    model_options = input_dict["modelOptions"]
    model = model_options.get("model")
    language = model_options.get("language", None)
    speaker_count = model_options.get("speakerCount", None)

    language = TO_LANGUAGE_CODE.get(language, language)
    if language and (language not in TO_LANGUAGE_CODE) and (language not in LANGUAGES):
        logger.error(
            f"Language {language} not supported. Supported languages: {TO_LANGUAGE_CODE}"
        )
        return flask.Response(
            response=f"Language {language} not supported. Supported languages: {LANGUAGES}",
            status=400,
            mimetype=TEXT_TYPE,
        )

    if model not in AVAILABLE_WHISPER_MODELS:
        logger.error(
            f"Model {model} not supported. Supported models: {AVAILABLE_WHISPER_MODELS}"
        )
        return flask.Response(
            response=f"Model {model} not supported. Supported models: {AVAILABLE_WHISPER_MODELS}",
            status=400,
            mimetype=TEXT_TYPE,
        )

    fd, filename = tempfile.mkstemp()
    try:
        os.close(fd)
        logger.info(f"Downloading s3://{bucket_name}/{audio_input_key} to {filename}")
        s3_client.download_file(bucket_name, audio_input_key, filename)
        logger.info(f"Loading model {model}")

        # The root is relative to the current working directory in docker
        model = whisper.load_model(model, download_root="../whisper_image")
        logger.info(f"Transcribing {filename}")
        result = model.transcribe(filename, language=language, word_timestamps=True)
        logger.info(f"Transcription of {filename} complete")
        # Dump the result to a file
        WHISPER_FILE_NAME = "whisper.json"
        with open(WHISPER_FILE_NAME, "w") as outfile:
            json.dump(result, outfile)
        # Upload to s3
        logger.info(
            f"Uploading transcription to s3://{bucket_name}/{speech_to_text_output_key}"
        )
        s3_client.upload_file(WHISPER_FILE_NAME, bucket_name, speech_to_text_output_key)

        # Cleanup of resources
        logger.info(f"Cleaning up resources")
        del model
        del result
        torch.cuda.empty_cache()
        gc.collect()
        torch.cuda.empty_cache()
        logger.info(f"Resources cleaned up. Loading speaker diarization model")
        # Run speaker diarization
        pipeline = Pipeline.from_pretrained(
            "pyannote/speaker-diarization", use_auth_token=HF_AUTH_TOKEN
        )
        logger.info(f"Speaker diarization model loaded. Setting device")
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        pipeline = pipeline.to(device)
        logger.info(f"Running speaker diarization on {filename}")
        diarization = pipeline(filename, num_speakers=speaker_count)
        logger.info(f"Speaker diarization of {filename} complete")

        # Create the result
        result = defaultdict(list)
        for idx, (turn, _, speaker) in enumerate(
            diarization.itertracks(yield_label=True)
        ):
            result["segments"].append(
                {
                    "start": turn.start,
                    "end": turn.end,
                    "idx": idx,
                    "speaker": speaker,
                }
            )
        # Dump the result to a file
        DIARIZATION_FILE_NAME = "diarization.json"
        with open(DIARIZATION_FILE_NAME, "w") as outfile:
            json.dump(result, outfile)
        # Upload to s3
        logger.info(
            f"Uploading speaker diarization to s3://{bucket_name}/{speaker_diarization_output_key}"
        )
        s3_client.upload_file(
            DIARIZATION_FILE_NAME, bucket_name, speaker_diarization_output_key
        )
        logger.info(f"ML pipeline of {audio_input_key} complete")
        payload = {"message": "success", "error": None}
        status = 200
    except Exception as e:
        logger.exception(f"An error occured while processing {audio_input_key}")
        payload = {"error": str(e)}
        status = 500
    finally:
        os.unlink(filename)

    response = json.dumps(payload)
    return flask.Response(response=response, status=status, mimetype="application/json")
