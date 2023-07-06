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
    actions = ["s3:*"]
    resources = [
      aws_s3_bucket.voxtir_react_app_bucket.arn,
      "${aws_s3_bucket.voxtir_react_app_bucket.arn}:*",
    ]
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

resource "aws_codebuild_project" "staging_build" {
  name           = "voxtir-codebuild-staging"
  description    = "This is the primary ci/cd tool for the voxtir app"
  build_timeout  = "60"
  service_role   = aws_iam_role.codebuild_role.arn
  source_version = "main"



  artifacts {
    type = "NO_ARTIFACTS"
  }

  cache {
    type = "NO_CACHE"
  }

  environment {
    compute_type                = "BUILD_GENERAL1_SMALL"
    image                       = "aws/codebuild/standard:7.0"
    type                        = "LINUX_CONTAINER"
    image_pull_credentials_type = "CODEBUILD"
  }

  logs_config {
    cloudwatch_logs {
      status = "ENABLED"
    }
  }

  source {
    buildspec = templatefile("./buildspec.yaml", {
      aws_s3_bucket = aws_s3_bucket.voxtir_react_app_bucket.bucket
    })
    type            = "GITHUB"
    location        = "https://github.com/Voxtir/voxtir.git"
    git_clone_depth = 1

    git_submodules_config {
      fetch_submodules = false
    }

    report_build_status = true
  }
  depends_on = [aws_codebuild_source_credential.gsh]
}
