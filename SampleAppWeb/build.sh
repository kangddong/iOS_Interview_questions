#!/usr/bin/env bash
# SampleApp → WebAssembly 빌드 스크립트.
# Swift 코드를 wasm으로 컴파일하고 JavaScriptKit 글루/런타임을 dist/에 생성한 뒤,
# www/의 정적 자산(index.html 등)을 dist/에 덮어쓴다.
set -euo pipefail

cd "$(dirname "$0")"
export PATH="$HOME/.swiftly/bin:$PATH"
hash -r

SDK="swift-6.2.4-RELEASE_wasm"

echo "▶ wasm 빌드 + JS 번들 (CDN 의존성)…"
swift package --swift-sdk "$SDK" --allow-writing-to-package-directory js --use-cdn --output dist

echo "▶ 정적 자산 복사 (www → dist)…"
cp -R www/. dist/

echo "✅ 완료. 서빙: (cd dist && python3 -m http.server 8099) → http://localhost:8099/"
