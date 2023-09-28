import logging
import os

log_format = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
logger = logging.getLogger(__name__)
# Get the log level from the environment variable
log_level = os.environ.get("LOG_LEVEL", "INFO").upper()

# Define a dictionary to map log level strings to their corresponding constants
log_level_mapping = {
    "DEBUG": logging.DEBUG,
    "INFO": logging.INFO,
    "WARNING": logging.WARNING,
    "ERROR": logging.ERROR,
    "CRITICAL": logging.CRITICAL,
}

# Check if the provided log level is valid, default to INFO if not
if log_level not in log_level_mapping:
    log_level = "INFO"

logging.basicConfig(level=log_level_mapping[log_level], format=log_format)
