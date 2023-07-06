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
