resource "aws_ecs_cluster" "app_server" {
  name = "voxtir-app-server-${var.environment}"
  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

resource "aws_ecr_repository" "voxtir_app_backend" {
  name                 = "voxtir-app-backend"
  image_tag_mutability = "MUTABLE"
  image_scanning_configuration {
    scan_on_push = true
  }
}
