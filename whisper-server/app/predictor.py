# This is the file that implements a flask server to do inferences. It"s the file that you will modify to
# implement the scoring for your own algorithm.

from __future__ import print_function

import os
import logging
import json
import tempfile
import flask
import boto3
import whisper
from whisper.tokenizer import TO_LANGUAGE_CODE, LANGUAGES

ENVIRONMENT = os.environ.get("ENVIRONMENT", "development")

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)
JSON_TYPE = "application/json"

app = flask.Flask(__name__)
if ENVIRONMENT == "production":
    session = boto3.Session()
else:
    session = boto3.Session(aws_access_key_id=os.environ["AWS_ACCESS_KEY_ID"],aws_secret_access_key=os.environ["AWS_SECRET_ACCESS_KEY"])

s3_client = session.client("s3")

@app.route("/ping", methods=["GET"])
def ping():
    logger.debug("PING")
    status = 200
    return flask.Response(response="\n", status=status, mimetype=JSON_TYPE)


@app.route("/execution-parameters", methods=["GET"])
def execution_parameters():
    logger.debug("execution-parameters")
    content_type = flask.request.content_type
    request_data = flask.request.data
    logger.info(f"execution-parameters: {content_type} {request_data}")
    status = 200
    return flask.Response(response="{}", status=status, mimetype=JSON_TYPE)

@app.route("/invocations", methods=["POST"])
def transformation():
    """Do an inference on a single batch of data. 
    """
    content_type = flask.request.content_type
    request_data = flask.request.data
    logger.info(f"transformation: {content_type} {request_data}")
    data = request_data.decode("utf-8")

    input_dict = None

    if flask.request.content_type == JSON_TYPE:
        try:
            input_dict = json.loads(data)
        except json.JSONDecodeError:
            logger.exception(f"Unable to parse payload {data}")
            return flask.Response(
                response="Unable to parse payload", status=400, mimetype="text/plain"
            )
    else:
        return flask.Response(
            response="The predictor only supports application/json content type", status=415, mimetype="text/plain"
        )

    bucket_name = input_dict["bucket_name"]
    object_key = input_dict["object_key"]
    model = input_dict["model"]
    language = input_dict["language"]
    language = TO_LANGUAGE_CODE.get(language, language)
    if (language not in TO_LANGUAGE_CODE) and (language not in LANGUAGES):
        logger.error(f"Language {language} not supported. Supported languages: {TO_LANGUAGE_CODE}")
        return flask.Response(
            response=f"Language {language} not supported. Supported languages: {LANGUAGES}", status=400, mimetype="text/plain"
        )

    fd, filename = tempfile.mkstemp()
    try:
        logger.info(f"Downloading s3://{bucket_name}/{object_key} to {filename}")
        print()
        s3_client.download_file(bucket_name, object_key, "./fesf")
        os.close(fd)
        logger.info(f"Loading model {model}")
        model = whisper.load_model(model)
        logger.info(f"Transcribing {filename}")
        result = model.transcribe(filename, decode_options={"language": language})
        logger.info(f"Transcription of {filename} complete")
    finally:
        os.unlink(filename)

    payload = {
        **input_dict,
        "result": result
    }
    response = json.dumps(payload)
    return flask.Response(response=response, status=200, mimetype="application/json")
