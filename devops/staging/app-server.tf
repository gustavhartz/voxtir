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

resource "aws_iam_role" "app_backend_fargate_role" {
  name = "voxtir-fargate-app-iam-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      },
    ]
  })
}

resource "aws_ecs_task_definition" "app_server" {
  container_definitions = jsonencode(
    [
      {
        cpu = 0
        environment = [
          {
            name  = "APP_PORT"
            value = "80"
          },
        ]
        essential = true
        image     = "${aws_ecr_repository.voxtir_app_backend.repository_url}:latest"
        name      = "app_backend"
        portMappings = [
          {
            containerPort = 80
            hostPort      = 80
          },
        ]
      },
    ]
  )
  cpu                = "512"
  execution_role_arn = aws_iam_role.app_backend_fargate_role.arn
  family             = "app_backend_service"
  memory             = "1024"
  network_mode       = "awsvpc"
  requires_compatibilities = [
    "FARGATE",
  ]
  task_role_arn = aws_iam_role.app_backend_fargate_role.arn
  runtime_platform {
    cpu_architecture        = "X86_64"
    operating_system_family = "LINUX"
  }
}

resource "aws_ecs_service" "app_backend_server" {
  cluster                            = aws_ecs_cluster.app_server.arn
  deployment_maximum_percent         = 200
  deployment_minimum_healthy_percent = 100
  desired_count                      = 1
  enable_ecs_managed_tags            = true
  enable_execute_command             = false
  health_check_grace_period_seconds  = 0
  iam_role                           = "/aws-service-role/ecs.amazonaws.com/AWSServiceRoleForECS"
  launch_type                        = "FARGATE"
  name                               = "app_backend_service_deployment"
  platform_version                   = "LATEST"
  scheduling_strategy                = "REPLICA"
  task_definition                    = aws_ecs_task_definition.app_server.arn

  deployment_circuit_breaker {
    enable   = true
    rollback = true
  }

  deployment_controller {
    type = "ECS"
  }

  network_configuration {
    assign_public_ip = true
    security_groups = [
      "sg-0a9f75e6ea33328ae",
    ]
    subnets = [
      "subnet-02e7398de78ea9b52",
      "subnet-08fc12bea26bcbb87",
      "subnet-092748f430f2e1614",
    ]
  }
}

// resend cname records
resource "cloudflare_record" "resend_bounce_mx" {
  zone_id  = var.cloudflare_zone_id
  name     = "bounces.staging"
  value    = "feedback-smtp.eu-west-1.amazonses.com"
  type     = "MX"
  priority = 10
}

resource "cloudflare_record" "resend_bounce_txt" {
  zone_id = var.cloudflare_zone_id
  name    = "bounces.staging"
  value   = "\"v=spf1 include:amazonses.com ~all\""
  type    = "TXT"
}

resource "cloudflare_record" "resend_domain_key_txt" {
  zone_id = var.cloudflare_zone_id
  name    = "resend._domainkey.staging"
  value   = var.resend_domain_key
  type    = "TXT"
}

#TODO: Add a load balancer to the app server
#TODO: Add VPC and subnets to the app server 
#TODO: Create a security group for the app server
#TODO: Add a custom iam_role
#TODO: Map the domain name to the load balancer
