ARG TARGETPLATFORM=linux/amd64
FROM nvidia/cuda:12.2.0-base-ubuntu20.04

ENV DEBIAN_FRONTEND=noninteractive
ENV TZ=Etc/UTC 

RUN apt-get -qq update && apt-get install -qq --no-install-recommends \
    wget \
    python3-dev \
    gcc \
    python3-pip \
    python3-setuptools \
    nginx \
    ffmpeg \
    git \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# RUN pip --no-cache-dir install numpy==1.16.2 scipy==1.2.1 scikit-learn==0.20.2 pandas flask gunicorn

# Set some environment variables. PYTHONUNBUFFERED keeps Python from buffering our standard
# output stream, which means that logs can be delivered to the user quickly. PYTHONDONTWRITEBYTECODE
# keeps Python from writing the .pyc files which are unnecessary in this case. We also update
# PATH so that the train and serve programs are found when the container is invoked.
ENV PYTHONUNBUFFERED=TRUE
ENV PYTHONDONTWRITEBYTECODE=TRUE
ENV PATH="/app:${PATH}"
RUN mkdir /app
WORKDIR /app
RUN pip3 install --upgrade pip
RUN pip install git+https://github.com/openai/whisper.git
# Pyannote
RUN pip install -qq https://github.com/pyannote/pyannote-audio/archive/refs/heads/develop.zip
#TODO: Download pyannote model save time
COPY requirements.txt /app
RUN pip3 install -r requirements.txt
COPY app /app

# Add Whipser image and set env to determine which model is available
RUN mkdir /whisper_image
RUN wget -P /whisper_image https://openaipublic.azureedge.net/main/whisper/models/345ae4da62f9b3d59415adc60127b97c714f32e89e936602e85993674d08dcb1/medium.pt
ENV AVAILABLE_WHISPER_MODELS='["medium"]'