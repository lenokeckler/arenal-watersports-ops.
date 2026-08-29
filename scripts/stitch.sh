#!/usr/bin/env bash
# Llama al MCP de Stitch por HTTP directo.
#   ./scripts/stitch.sh <tool> '<json de argumentos>'
# La llave sale de .mcp.json, que esta en .gitignore.
set -euo pipefail
KEY=$(grep -o 'AQ\.[A-Za-z0-9_-]*' "$(dirname "$0")/../.mcp.json" | head -1)
curl -s -X POST https://stitch.googleapis.com/mcp \
  -H "X-Goog-Api-Key: $KEY" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d "{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"tools/call\",\"params\":{\"name\":\"$1\",\"arguments\":$2}}"
