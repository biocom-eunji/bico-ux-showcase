#!/bin/bash
# 비코 UX 개선안을 로컬 서버로 열어요. 이 창을 닫으면 서버도 꺼져요.
cd "$(dirname "$0")"
(sleep 1; open -a "Google Chrome" "http://localhost:8775/index.html" 2>/dev/null || open "http://localhost:8775/index.html") &
echo "http://localhost:8775/index.html 에서 열려 있어요. 끝내려면 이 창을 닫으세요."
python3 서버.py
