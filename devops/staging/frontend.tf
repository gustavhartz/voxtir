
# Bucket for static website
resource "aws_s3_bucket" "voxtir_react_app_bucket" {
  bucket = "voxtir-react-app-bucket-${var.random_string}" # Replace with your desired bucket name
  tags = {
    environment = var.environment
  }
}

resource "aws_s3_bucket_public_access_block" "s3_bucket_public_access_block" {
  bucket = aws_s3_bucket.voxtir_react_app_bucket.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}


# Configure S3 bucket for static website hosting
resource "aws_s3_bucket_website_configuration" "voxtir_react_app_website" {
  bucket = aws_s3_bucket.voxtir_react_app_bucket.bucket

  index_document {
    suffix = "index.html"
  }
  error_document {
    key = "error.html"
  }
  depends_on = [aws_s3_bucket.voxtir_react_app_bucket]
}

resource "aws_s3_bucket_ownership_controls" "ownership" {
  bucket = aws_s3_bucket.voxtir_react_app_bucket.id
  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

resource "aws_s3_bucket_acl" "app_bucket_acl" {
  bucket     = aws_s3_bucket.voxtir_react_app_bucket.id
  acl        = "public-read"
  depends_on = [aws_s3_bucket_ownership_controls.ownership]
}

resource "aws_s3_bucket_policy" "site_policy" {
  bucket = aws_s3_bucket.voxtir_react_app_bucket.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "PublicReadGetObject"
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource = [
          aws_s3_bucket.voxtir_react_app_bucket.arn,
          "${aws_s3_bucket.voxtir_react_app_bucket.arn}/*",
        ]
      },
    ]
  })
  depends_on = [aws_s3_bucket_public_access_block.s3_bucket_public_access_block]
}
