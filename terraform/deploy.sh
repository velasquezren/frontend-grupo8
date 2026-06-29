#!/usr/bin/env bash
#
# deploy.sh — Build the Next.js static export and deploy to S3 static website.
#
# What it does (in order):
#   1. terraform apply  → creates/updates S3 bucket for website hosting
#   2. npm run build    → generates the static export in out/
#   3. aws s3 sync      → uploads the static files to S3
#   4. prints the website URL
#
# Usage:
#   ./deploy.sh                       # default region from AWS config
#   AWS_REGION=us-east-2 ./deploy.sh  # override region
#
set -euo pipefail

# --- paths & config ---------------------------------------------------------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$SCRIPT_DIR"

# --- prerequisites ----------------------------------------------------------
echo "==> Checking prerequisites..."
for cmd in terraform aws node npm; do
  command -v "$cmd" >/dev/null 2>&1 || {
    echo "ERROR: '$cmd' is not installed or not in PATH." >&2; exit 1; }
done
ACCOUNT_ID="$(aws sts get-caller-identity --query Account --output text 2>/dev/null)" || {
  echo "ERROR: not authenticated to AWS. Run 'aws configure' or set credentials." >&2; exit 1; }

REGION="$(aws configure get region 2>/dev/null || echo 'us-east-1')"

# --- confirm ----------------------------------------------------------------
echo
echo "Account: $ACCOUNT_ID | Region: $REGION"
echo "This will create a public S3 bucket static website."
echo "Estimated cost while up: ~USD 0.02 - 0.10/month (extremely cheap)."
echo
read -r -p "Continue? [y/N] " ans
[[ "$ans" =~ ^[Yy]$ ]] || { echo "Aborted. Nothing was created."; exit 0; }

# --- 1. terraform apply -----------------------------------------------------
echo "==> terraform init + apply..."
terraform init -input=false
terraform apply -auto-approve

# --- 2. build the Next.js static export -------------------------------------
BUCKET="$(terraform output -raw s3_bucket_name)"
WEBSITE_URL="$(terraform output -raw website_url)"

echo "==> Building Next.js static export (npm run build)..."
cd "$ROOT_DIR"
npm run build

# Verify the out/ directory was created
if [ ! -d "out" ]; then
  echo "ERROR: 'out/' directory not found. Make sure next.config has output: 'export'." >&2
  exit 1
fi

# --- 3. sync to S3 ----------------------------------------------------------
echo "==> Uploading static files to s3://$BUCKET..."
aws s3 sync out/ "s3://$BUCKET" \
  --delete \
  --cache-control "public, max-age=31536000, immutable" \
  --exclude "*.html" \
  --exclude "_next/data/*"

# HTML files get shorter cache (so new deploys are picked up faster)
aws s3 sync out/ "s3://$BUCKET" \
  --delete \
  --cache-control "public, max-age=0, must-revalidate" \
  --exclude "*" \
  --include "*.html"

# _next/data JSON files also get short cache
if [ -d "out/_next/data" ]; then
  aws s3 sync out/_next/data/ "s3://$BUCKET/_next/data/" \
    --cache-control "public, max-age=0, must-revalidate"
fi

# --- 4. done ----------------------------------------------------------------
echo
echo "==> Deployed successfully!"
echo "    URL: $WEBSITE_URL"
echo "    Run ./destroy.sh when you want to tear down."
