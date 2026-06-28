#!/usr/bin/env bash
#
# destroy.sh — Tear down ALL AWS resources created by deploy.sh.
#
# Removes everything (ALB, ECS service + cluster, ECR + images, VPC, NAT
# Gateway, security groups, IAM, log group) so billing for this stack stops.
# This cannot be undone.
#
# Usage:
#   ./destroy.sh
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# --- prerequisites ----------------------------------------------------------
for cmd in terraform aws; do
  command -v "$cmd" >/dev/null 2>&1 || {
    echo "ERROR: '$cmd' is not installed or not in PATH." >&2; exit 1; }
done
aws sts get-caller-identity >/dev/null 2>&1 || {
  echo "ERROR: not authenticated to AWS." >&2; exit 1; }

# --- confirm (this is destructive) ------------------------------------------
echo "WARNING: this will destroy ALL Terraform-managed resources in:"
echo "  $SCRIPT_DIR"
echo
echo "That includes the ECR repository AND every image pushed to it."
echo "Nothing in AWS will remain. This CANNOT be undone."
echo
read -r -p "Type 'destroy' to confirm: " ans
[[ "$ans" == "destroy" ]] || { echo "Aborted. Nothing was destroyed."; exit 0; }

# --- destroy ----------------------------------------------------------------
echo "==> terraform destroy..."
terraform destroy -auto-approve

echo
echo "==> All resources destroyed. Billing for this stack has stopped."
