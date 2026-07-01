#!/usr/bin/env bash
# dist/를 로컬 정적 서버로 서빙한다. (먼저 ./build.sh 로 빌드 필요)
set -euo pipefail
cd "$(dirname "$0")/dist"
PORT="${1:-8099}"
echo "▶ http://localhost:$PORT/  (Ctrl+C 로 종료)"
python3 -m http.server "$PORT"
