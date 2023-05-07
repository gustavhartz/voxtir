terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.0"
    }
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 3.0"
    }
  }
}

# Configure the AWS Provider
provider "aws" {
  region = var.region
}
# Configure cloudflare
provider "cloudflare" {
  api_token = var.cloudflare_api_token
}

# Domain and certificate
resource "aws_acm_certificate" "api_certficate" {
  domain_name       = "${var.api_prefix}.${var.base_domain_name}"
  validation_method = "DNS"
  validation_option {
    validation_domain = var.base_domain_name
    domain_name       = "${var.api_prefix}.${var.base_domain_name}"
  }
}

resource "cloudflare_record" "api_certificate_validation_record" {
  for_each = {
    for dvo in aws_acm_certificate.api_certficate.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  allow_overwrite = true
  name            = each.value.name
  value           = each.value.record
  ttl             = 60
  type            = each.value.type
  zone_id         = var.cloudflare_zone_id
}

resource "aws_acm_certificate_validation" "api_validation" {
  certificate_arn         = aws_acm_certificate.api_certficate.arn
  validation_record_fqdns = [for record in cloudflare_record.api_certificate_validation_record : record.hostname]
  depends_on              = [cloudflare_record.api_certificate_validation_record]
}


# Create a VPC
resource "aws_vpc" "api_vpc" {
  cidr_block = "10.0.0.0/16"
}

# and subnets
resource "aws_subnet" "api_public" {
  vpc_id            = aws_vpc.api_vpc.id
  cidr_block        = "10.0.1.0/24"
  availability_zone = var.availability_zone_public_subnet
}

resource "aws_subnet" "api_private" {
  vpc_id            = aws_vpc.api_vpc.id
  cidr_block        = "10.0.2.0/24"
  availability_zone = var.availability_zone_private_subnet
}

# Connect to the internet
resource "aws_internet_gateway" "gw" {
  vpc_id = aws_vpc.api_vpc.id
}

# Compute
resource "aws_ecs_cluster" "fargate_cluster" {
  name = "fargate_cluster"
}

# Load balancer
resource "aws_security_group" "lb_sg" {
  name_prefix = "lb_sg_"
  description = "Security group for load balancer"

}

resource "aws_lb" "test" {
  name               = "test-lb-tf"
  internal           = false
  load_balancer_type = "application"
  subnets            = [aws_subnet.api_public.id, aws_subnet.api_private.id]
  depends_on         = [aws_internet_gateway.gw]
}

# only allow https
resource "aws_lb_listener" "front_end" {
  load_balancer_arn = aws_lb.test.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type = "redirect"

    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }
}

resource "aws_lb_target_group" "tg" {
  name_prefix = "tg"
  port        = 443
  protocol    = "HTTPS"
  target_type = "ip"
  vpc_id      = aws_vpc.api_vpc.id

  health_check {
    healthy_threshold   = 2
    unhealthy_threshold = 2
    timeout             = 3
    interval            = 30
    path                = "/"
  }
}

resource "aws_lb_listener" "https_listner" {
  load_balancer_arn = aws_lb.test.arn
  protocol          = "HTTPS"
  port              = 443

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.tg.arn
  }
  certificate_arn = aws_acm_certificate_validation.api_validation.certificate_arn
}

resource "aws_lb_listener_certificate" "api_certificate" {
  listener_arn    = aws_lb_listener.https_listner.arn
  certificate_arn = aws_acm_certificate.api_certficate.arn
}

# lb send data to cognito
resource "aws_vpc_security_group_egress_rule" "example" {
  security_group_id = aws_security_group.lb_sg.id
  from_port         = 443
  to_port           = 443
  ip_protocol       = "tcp"
  description       = "Outbound HTTPS traffic to get to Cognito"
  cidr_ipv4         = "0.0.0.0/0"
}

resource "aws_lb_listener_rule" "authenticate_rule" {
  listener_arn = aws_lb_listener.https_listner.arn
  priority     = 1000

  condition {
    host_header {
      values = [aws_lb.test.dns_name]
    }
  }

  action {
    type = "authenticate-cognito"

    authenticate_cognito {
      user_pool_arn       = aws_cognito_user_pool.UserPool.arn
      user_pool_client_id = aws_cognito_user_pool_client.AppClient.id
      user_pool_domain    = aws_cognito_user_pool_domain.CustomDomain.domain
    }

  }

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.tg.arn
  }
}


# Cognito
resource "aws_cognito_user_pool" "UserPool" {
  name = "FargateDemoUserPoolExamplegs"
}

resource "aws_cognito_user_pool_domain" "CustomDomain" {
  domain       = "example-domainfaesvjkhvf"
  user_pool_id = aws_cognito_user_pool.UserPool.id
}

resource "aws_cognito_user_pool_client" "AppClient" {
  name                                 = "AlbAuthentication"
  user_pool_id                         = aws_cognito_user_pool.UserPool.id
  generate_secret                      = true
  allowed_oauth_flows                  = ["code"]
  allowed_oauth_scopes                 = ["email", "openid"]
  callback_urls                        = ["http://localhost/callback"]
  default_redirect_uri                 = "http://localhost/callback"
  logout_urls                          = ["http://localhost/logout"]
  supported_identity_providers         = ["COGNITO"]
  allowed_oauth_flows_user_pool_client = true

}


# Fargate
resource "aws_ecs_task_definition" "td" {
  family = "my-app"
  container_definitions = jsonencode([{
    name      = "my-app"
    image     = "gustavhartz/testrepo:latest"
    essential = true
    portMappings = [{
      containerPort = 443
      hostPort      = 443
    }]
    environment = [{
      name  = "PORT"
      value = "80"
      }, {
      name  = "LOGOUT_URL"
      value = "https://localhost/logout?client_id=${aws_cognito_user_pool_client.AppClient.id}&redirect_uri=${urlencode("http://${aws_lb.test.dns_name}")}&response_type=code&state=STATE&scope=openid"
    }]
  }])

  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
}

resource "aws_ecs_service" "app" {
  name                 = "my-app"
  cluster              = aws_ecs_cluster.fargate_cluster.id
  task_definition      = aws_ecs_task_definition.td.arn
  desired_count        = 1
  launch_type          = "FARGATE"
  force_new_deployment = true


  load_balancer {
    target_group_arn = aws_lb_target_group.tg.arn
    container_name   = "my-app"
    container_port   = 443
  }
  network_configuration {
    subnets          = [aws_subnet.api_private.id]
    assign_public_ip = false
  }
}
