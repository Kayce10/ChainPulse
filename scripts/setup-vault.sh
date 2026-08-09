#!/bin/bash

# Initialize and configure Vault for Stellar Insights
# Usage: ./scripts/setup-vault.sh

set -e

VAULT_ADDR="${VAULT_ADDR:-http://127.0.0.1:8200}"
VAULT_TOKEN="${VAULT_TOKEN:-}"

echo "Vault Setup for Stellar Insights"
echo "================================"
echo "Vault Address: $VAULT_ADDR"

# Check if Vault is running
if ! curl -s "$VAULT_ADDR/v1/sys/health" > /dev/null; then
  echo "Error: Vault is not running at $VAULT_ADDR"
  echo "Start Vault with: vault server -config=backend/vault/config.hcl"
  exit 1
fi

# Check if already initialized
if curl -s "$VAULT_ADDR/v1/sys/health" | grep -q '"initialized":true'; then
  echo "✓ Vault is already initialized"
else
  echo "Initializing Vault..."
  INIT_OUTPUT=$(curl -s -X POST "$VAULT_ADDR/v1/sys/init" \
    -d '{"key_shares":5,"key_threshold":3}')
  
  echo "$INIT_OUTPUT" | jq .
  echo ""
  echo "⚠️  Save the unseal keys and root token in a secure location!"
  exit 1
fi

# Authenticate
if [ -z "$VAULT_TOKEN" ]; then
  echo "Error: VAULT_TOKEN not set"
  echo "Set with: export VAULT_TOKEN=<your-root-token>"
  exit 1
fi

export VAULT_ADDR
export VAULT_TOKEN

echo ""
echo "Setting up Vault..."

# Enable KV secrets engine
echo "Enabling KV secrets engine..."
vault secrets enable -path=secret kv-v2 2>/dev/null || echo "✓ KV secrets engine already enabled"

# Create policy for application
echo "Creating application policy..."
vault policy write stellar-insights-app - <<'EOF'
# Database secrets
path "secret/data/database/*" {
  capabilities = ["read", "list"]
}

# API keys
path "secret/data/api/*" {
  capabilities = ["read", "list"]
}

# Encryption keys
path "secret/data/encryption/*" {
  capabilities = ["read"]
}

# Audit log access
path "sys/audit" {
  capabilities = ["read"]
}
EOF

# Create policy for admin
echo "Creating admin policy..."
vault policy write stellar-insights-admin - <<'EOF'
# Full access to secrets
path "secret/*" {
  capabilities = ["create", "read", "update", "delete", "list"]
}

# Audit log access
path "sys/audit" {
  capabilities = ["read", "list"]
}

# Audit log viewing
path "sys/audit-backend" {
  capabilities = ["read"]
}
EOF

# Store example secrets
echo "Storing example secrets..."

# Database credentials
vault kv put secret/database/postgres \
  username=postgres \
  password=change-me-in-production \
  host=localhost \
  port=5432 \
  database=stellar_insights

# API keys
vault kv put secret/api/stellar \
  rpc_url=https://rpc.stellar.org \
  api_key=your-api-key-here

# Encryption keys
vault kv put secret/encryption \
  master_key=your-master-key-here \
  jwt_secret=your-jwt-secret-here

# Enable audit logging
echo "Enabling audit logging..."
vault audit enable file file_path=/vault/logs/audit.log 2>/dev/null || echo "✓ Audit logging already enabled"

# Create service token for application
echo "Creating service token for application..."
APP_TOKEN=$(vault token create \
  -policy=stellar-insights-app \
  -ttl=24h \
  -format=json | jq -r '.auth.client_token')

echo ""
echo "✓ Vault setup complete!"
echo ""
echo "Application Token: $APP_TOKEN"
echo "Set in environment: export VAULT_TOKEN=$APP_TOKEN"
echo ""
echo "Next steps:"
echo "1. Update database credentials in Vault:"
echo "   vault kv put secret/database/postgres username=... password=..."
echo "2. Update API keys in Vault:"
echo "   vault kv put secret/api/stellar rpc_url=... api_key=..."
echo "3. Update encryption keys in Vault:"
echo "   vault kv put secret/encryption master_key=... jwt_secret=..."
echo "4. Configure application to use Vault:"
echo "   export VAULT_ADDR=$VAULT_ADDR"
echo "   export VAULT_TOKEN=$APP_TOKEN"
echo ""
echo "View secrets:"
echo "  vault kv list secret/"
echo "  vault kv get secret/database/postgres"
echo ""
echo "View audit logs:"
echo "  tail -f /vault/logs/audit.log"
