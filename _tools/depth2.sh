#!/bin/bash
cd "$(dirname "$0")"
for r in /goal/score /completeness "/care/%EC%8B%9D%EB%8B%A8" /record/checkin /report /record/diet /record/diet/add /record/sleep/add /planet/allostar /my; do
  n=$(echo "$r" | tr -c 'A-Za-z0-9\n' '_')
  node crawl.js "$r" "graph$n.json" > "log$n.txt" 2>&1
done
echo done > depth2.done
