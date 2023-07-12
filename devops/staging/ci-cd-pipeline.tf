data "aws_iam_policy_document" "codebuild_assume_role" {
  statement {
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["codebuild.amazonaws.com"]
    }

    actions = ["sts:AssumeRole"]
  }
}

data "aws_iam_policy_document" "code_build_iam_policy" {
  statement {
    effect = "Allow"
    actions = [
      "logs:CreateLogGroup",
      "logs:CreateLogStream",
      "logs:PutLogEvents",
    ]
    resources = ["*"]
  }
  statement {
    effect  = "Allow"
    actions = ["*"]
    resources = [
      aws_s3_bucket.voxtir_react_app_bucket.arn,
      "${aws_s3_bucket.voxtir_react_app_bucket.arn}:*",
      "${aws_s3_bucket.voxtir_react_app_bucket.arn}/*"
    ]
  }
  statement {
    effect  = "Allow"
    actions = ["*"]
    resources = [
      aws_ecr_repository.voxtir_whisper.arn,
      "${aws_ecr_repository.voxtir_whisper.arn}:*",
      "${aws_ecr_repository.voxtir_whisper.arn}/*"
    ]
  }
  statement {
    effect  = "Allow"
    actions = ["*"]
    resources = [
      aws_s3_bucket.build_cache_bucket.arn,
      "${aws_s3_bucket.build_cache_bucket.arn}:*",
      "${aws_s3_bucket.build_cache_bucket.arn}/*"
    ]
  }
  statement {
    effect = "Allow"
    actions = ["ecr:BatchCheckLayerAvailability",
      "ecr:CompleteLayerUpload",
      "ecr:GetAuthorizationToken",
      "ecr:InitiateLayerUpload",
      "ecr:PutImage",
    "ecr:UploadLayerPart"]
    resources = ["*"]
  }
}

resource "aws_iam_role_policy" "codebuild_policy" {
  name   = "voxtir-codebuild-iam-policy"
  role   = aws_iam_role.codebuild_role.name
  policy = data.aws_iam_policy_document.code_build_iam_policy.json
}

# Create IAM role for CodeBuild
resource "aws_iam_role" "codebuild_role" {
  name               = "voxtir-codebuild-iam-role"
  assume_role_policy = data.aws_iam_policy_document.codebuild_assume_role.json
}

resource "aws_codebuild_source_credential" "gsh" {
  auth_type   = "PERSONAL_ACCESS_TOKEN"
  server_type = "GITHUB"
  token       = var.github_api_token
}

resource "aws_s3_bucket" "build_cache_bucket" {
  bucket = "voxtir-build-cache-bucket"
}

resource "aws_codebuild_project" "staging_build" {
  name          = "voxtir-codebuild-staging"
  description   = "This is the primary ci/cd tool for the voxtir app"
  build_timeout = "60"
  service_role  = aws_iam_role.codebuild_role.arn



  artifacts {
    type = "NO_ARTIFACTS"
  }

  cache {
    type     = "S3"
    location = aws_s3_bucket.build_cache_bucket.bucket
  }

  environment {
    compute_type                = "BUILD_GENERAL1_SMALL"
    image                       = "aws/codebuild/standard:7.0"
    type                        = "LINUX_CONTAINER"
    image_pull_credentials_type = "CODEBUILD"
    privileged_mode             = true
  }

  logs_config {
    cloudwatch_logs {
      status = "ENABLED"
    }
  }

  source {
    buildspec = templatefile("./buildspec.yaml", {
      aws_s3_bucket       = aws_s3_bucket.voxtir_react_app_bucket.bucket
      ecr_repository_uri  = aws_ecr_repository.voxtir_whisper.repository_url
      whisper_image_tag   = "latest"
      build_master_tag    = "build-master"
      ecr_repository_base = split("/", aws_ecr_repository.voxtir_whisper.repository_url)[0]
      aws_region          = var.region
    })
    type            = "GITHUB"
    location        = "https://github.com/Voxtir/voxtir.git"
    git_clone_depth = 5

    git_submodules_config {
      fetch_submodules = false
    }

    report_build_status = true
  }
  depends_on = [aws_codebuild_source_credential.gsh]
}

resource "aws_codebuild_webhook" "codebuild_webhook" {
  project_name = aws_codebuild_project.staging_build.name
  build_type   = "BUILD"
  filter_group {
    filter {
      exclude_matched_pattern = false
      pattern                 = "PULL_REQUEST_CREATED, PUSH"
      type                    = "EVENT"
    }
  }

}

resource "github_repository_webhook" "codebuild_webhook" {
  active = true
  events = [
    "pull_request",
    "push",
  ]
  repository = "voxtir"

  configuration {
    content_type = "json"
    insecure_ssl = false
    url          = aws_codebuild_webhook.codebuild_webhook.payload_url
    secret       = aws_codebuild_webhook.codebuild_webhook.secret
  }
}
