#!/bin/sh
set -eu

cat > /usr/share/nginx/html/config.js <<EOF
window.__TUNDRA_ADMIN_CONFIG__ = {
  API_BASE_URL: '${API_BASE_URL:-/api/v1}',
};
EOF
