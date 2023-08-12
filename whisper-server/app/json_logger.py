import logging
from pythonjsonlogger import jsonlogger
import os

LOG_LEVEL = os.environ.get("LOG_LEVEL", "INFO")


def setup_logging(log_level=logging.INFO):
    logger = logging.getLogger()
    logger.setLevel(log_level)

    # Set up the console handler with JSON formatter
    console_handler = logging.StreamHandler()
    formatter = jsonlogger.JsonFormatter(
        "%(asctime)s %(levelname)s %(name)s %(message)s", datefmt="%Y-%m-%d %H:%M:%S"
    )
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)

    # Add additional handlers here if needed (e.g., file handler)

    return logger


logger = setup_logging(LOG_LEVEL)
