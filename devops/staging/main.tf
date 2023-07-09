terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "5.5.0"
    }
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "4.9.0"
    }
    github = {
      source  = "integrations/github"
      version = "5.29.0"
    }
  }
  backend "s3" {
    bucket = "voxtir-general-terraform-backend"
    key    = "staging/terraform.tfstate"
    region = "eu-north-1"
  }
}

# Configure the AWS Provider
provider "aws" {
  region = var.region
  default_tags {
    tags = {
      enviroment = var.environment
    }
  }
}
# Configure cloudflare
provider "cloudflare" {
  api_token = var.cloudflare_api_token
}

provider "github" {
  token = var.github_api_token # or `GITHUB_TOKEN`
  owner = "Voxtir"
}

# ECR
resource "aws_ecr_repository" "voxtir_staging" {
  name                 = "voxtir-staging"
  image_tag_mutability = "MUTABLE"
  image_scanning_configuration {
    scan_on_push = true
  }
}
