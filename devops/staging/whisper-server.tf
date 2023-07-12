# Whisper image ECR
resource "aws_ecr_repository" "voxtir_whisper" {
  name                 = "voxtir-whisper"
  image_tag_mutability = "MUTABLE"
  image_scanning_configuration {
    scan_on_push = true
  }
}
