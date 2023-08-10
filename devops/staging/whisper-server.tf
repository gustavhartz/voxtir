# Whisper image ECR
resource "aws_ecr_repository" "voxtir_whisper" {
  name                 = "voxtir-whisper"
  image_tag_mutability = "MUTABLE"
  image_scanning_configuration {
    scan_on_push = true
  }
}

data "aws_iam_policy_document" "sagemaker_assume_policy" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["sagemaker.amazonaws.com"]
    }
  }
}

resource "aws_iam_role_policy_attachment" "sagemaker_managed_policy" {
  role       = aws_iam_role.sagemaker_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSageMakerFullAccess"
}

resource "aws_iam_role" "sagemaker_role" {
  name               = "voxtir-whisper-pyannote-role-${var.environment}"
  assume_role_policy = data.aws_iam_policy_document.sagemaker_assume_policy.json
}

resource "aws_sagemaker_model" "transcription_model" {
  name               = "voxtir-whisper-pyannote-model-${var.environment}"
  execution_role_arn = aws_iam_role.sagemaker_role.arn

  container {
    // See the cicd pipeline for where the tag originates from
    image = "${aws_ecr_repository.voxtir_whisper.repository_url}:build-master"
    environment = {
      HF_AUTH_TOKEN            = var.hf_auth_token
      AVAILABLE_WHISPER_MODELS = "[${"medium"}]"
      ENVIRONMENT              = var.environment
      LOG_LEVEL                = "INFO"
    }
  }
}
