#!/usr/bin/env bash
set -euo pipefail

# Skip cleanly when credentials are missing (e.g., PRs from forks).
if [[ -z "${COMPANYCAM_API_KEY:-}" ]]; then
  echo "SKIP: COMPANYCAM_API_KEY not set"
  exit 0
fi
if [[ -z "${COMPANYCAM_TEST_PROJECT_ID:-}" ]]; then
  echo "SKIP: COMPANYCAM_TEST_PROJECT_ID not set"
  exit 0
fi

CLI="node dist/index.js"
PASS=0
FAIL=0

GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

run_test() {
  local label="$1"
  local args="$2"
  local jq_check="$3"

  printf "  %-50s" "$label"
  local output
  output=$($CLI $args 2>/dev/null) || true

  local check_result
  check_result=$(echo "$output" | jq -r "$jq_check" 2>/dev/null) || check_result="false"

  if [[ "$check_result" == "true" ]]; then
    echo -e "${GREEN}PASS${NC}"
    PASS=$((PASS + 1))
  else
    echo -e "${RED}FAIL${NC}"
    echo "    output: $output"
    FAIL=$((FAIL + 1))
  fi
}

echo "Integration tests against live CompanyCam API:"
run_test "projects list (default)"          "projects list --limit 5"                  "type == \"array\""
run_test "projects get <id>"                "projects get $COMPANYCAM_TEST_PROJECT_ID" ".id == ($COMPANYCAM_TEST_PROJECT_ID | tonumber)"
run_test "projects photos <id>"             "projects photos $COMPANYCAM_TEST_PROJECT_ID --limit 1" "type == \"array\""

echo ""
echo "Passed: $PASS  Failed: $FAIL"
[[ $FAIL -eq 0 ]]
