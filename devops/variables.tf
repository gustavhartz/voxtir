# ---------------------------------------------------------------------------------------------------------------------
# AWS Project
# ---------------------------------------------------------------------------------------------------------------------

variable "region" {
  description = "AWS region"
  type        = string
}

variable "app_name" {
  description = "Name of app to deploy"
  type        = string
}

variable "env" {
  description = "Production or staging"
  type        = string
}

variable "availability_zone_public_subnet" {
  type        = string
  description = "The availability zone used. Must match the one defined in region"
}

variable "availability_zone_private_subnet" {
  type        = string
  description = "The availability zone used. Must match the one defined in region"
}

variable "node_env" {
  type        = string
  description = "Node enviroment variable"
}

variable "base_domain_name" {
  type        = string
  description = "The root domain"
}

variable "api_prefix" {
  type        = string
  description = "The prefix of the domain"
}

variable "cloudflare_api_token" {
  type        = string
  description = "The api token to access cloudflare resources"
}

variable "cloudflare_zone_id" {
  type        = string
  description = "The zoneid to access cloudflare resources"
}
