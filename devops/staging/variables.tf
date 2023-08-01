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

variable "environment" {
  description = "Production or staging"
  type        = string
}

variable "node_env" {
  type        = string
  description = "Node enviroment variable"
}

variable "base_domain_name" {
  type        = string
  description = "The root domain"
}

variable "cloudflare_api_token" {
  type        = string
  description = "The api token to access cloudflare resources"
}

variable "cloudflare_zone_id" {
  type        = string
  description = "The zoneid to access cloudflare resources"
}

variable "random_string" {
  type        = string
  description = "Random string to use in resources"
}

variable "github_api_token" {
  type        = string
  description = "Github api token to access github resources"
}

variable "resend_domain_key" {
  type        = string
  description = "Resend domain key api token to access email services"
}
