#!/bin/bash

# Test script to verify JSON formatting matches the template

echo "=========================================="
echo "JSON Format Verification Test"
echo "=========================================="
echo

TEMPLATE_FILE="/home/reyand/Downloads/Telegram Desktop/layout.json"
TEST_USER="format_test_user_$(date +%s)"
BACKEND_DIR="/home/reyand/vsCode/widget/WidgetStore"
OUTPUT_FILE=""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if template file exists
if [ ! -f "$TEMPLATE_FILE" ]; then
    echo -e "${RED}✗ Template file not found: $TEMPLATE_FILE${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} Template file found"
echo

# Check if backend is running
echo "Checking if backend is running..."
if ! curl -s http://localhost:8080/api/auth/login > /dev/null 2>&1; then
    echo -e "${RED}✗ Backend is not running${NC}"
    echo "Please start the backend:"
    echo "  cd $BACKEND_DIR"
    echo "  ./mvnw spring-boot:run"
    exit 1
fi
echo -e "${GREEN}✓${NC} Backend is running"
echo

# Register test user
echo "Creating test user: $TEST_USER"
REGISTER_RESPONSE=$(curl -s -X POST http://localhost:8080/api/auth/register \
    -H "Content-Type: application/json" \
    -d "{\"username\":\"$TEST_USER\",\"email\":\"$TEST_USER@test.com\",\"password\":\"testpass123\"}")

TOKEN=$(echo $REGISTER_RESPONSE | jq -r '.token // empty')

if [ -z "$TOKEN" ]; then
    echo -e "${RED}✗ Failed to create test user${NC}"
    echo "Response: $REGISTER_RESPONSE"
    exit 1
fi

echo -e "${GREEN}✓${NC} Test user created"
echo

# Wait for layout file to be created
echo "Waiting for layout file creation..."
sleep 2

# Find the created layout file
OUTPUT_FILE="$BACKEND_DIR/data/users/$TEST_USER/layout.json"

if [ ! -f "$OUTPUT_FILE" ]; then
    echo -e "${YELLOW}⚠${NC} Layout file not found, triggering creation..."

    # Trigger layout creation via API
    curl -s -X GET http://localhost:8080/api/user-layout \
        -H "Authorization: Bearer $TOKEN" > /dev/null

    sleep 1

    if [ ! -f "$OUTPUT_FILE" ]; then
        echo -e "${RED}✗ Layout file not created: $OUTPUT_FILE${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}✓${NC} Layout file found: $OUTPUT_FILE"
echo

# Compare files
echo "=========================================="
echo "FORMATTING COMPARISON"
echo "=========================================="
echo

echo "Template file:"
echo "----------------------------------------"
cat "$TEMPLATE_FILE"
echo
echo "=========================================="
echo

echo "Generated file:"
echo "----------------------------------------"
cat "$OUTPUT_FILE"
echo
echo "=========================================="
echo

# Check if files match exactly
if diff -w "$TEMPLATE_FILE" "$OUTPUT_FILE" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ FILES MATCH EXACTLY (ignoring whitespace)${NC}"
else
    echo -e "${YELLOW}⚠ Files differ (showing differences):${NC}"
    echo
    diff --side-by-side --width=160 "$TEMPLATE_FILE" "$OUTPUT_FILE" || true
    echo
fi

# Check specific formatting requirements
echo
echo "=========================================="
echo "FORMATTING CHECKS"
echo "=========================================="
echo

CHECKS_PASSED=0
CHECKS_TOTAL=0

# Check 1: Root level indentation (2 spaces)
CHECKS_TOTAL=$((CHECKS_TOTAL + 1))
if grep -q '^  "templateName"' "$OUTPUT_FILE"; then
    echo -e "${GREEN}✓${NC} Root level uses 2-space indentation"
    CHECKS_PASSED=$((CHECKS_PASSED + 1))
else
    echo -e "${RED}✗${NC} Root level indentation incorrect"
fi

# Check 2: Component level indentation (4 spaces)
CHECKS_TOTAL=$((CHECKS_TOTAL + 1))
if grep -q '^    {' "$OUTPUT_FILE"; then
    echo -e "${GREEN}✓${NC} Component level uses 4-space indentation"
    CHECKS_PASSED=$((CHECKS_PASSED + 1))
else
    echo -e "${RED}✗${NC} Component level indentation incorrect"
fi

# Check 3: Component fields indentation (6 spaces)
CHECKS_TOTAL=$((CHECKS_TOTAL + 1))
if grep -q '^      "api":' "$OUTPUT_FILE"; then
    echo -e "${GREEN}✓${NC} Component fields use 6-space indentation"
    CHECKS_PASSED=$((CHECKS_PASSED + 1))
else
    echo -e "${RED}✗${NC} Component fields indentation incorrect"
fi

# Check 4: Position is compact (single line)
CHECKS_TOTAL=$((CHECKS_TOTAL + 1))
if grep -q '"position": { .* }' "$OUTPUT_FILE"; then
    echo -e "${GREEN}✓${NC} Position objects are compact (single line)"
    CHECKS_PASSED=$((CHECKS_PASSED + 1))
else
    echo -e "${RED}✗${NC} Position objects are not compact"
fi

# Check 5: Style is compact (single line)
CHECKS_TOTAL=$((CHECKS_TOTAL + 1))
if grep -q '"style": { .* }' "$OUTPUT_FILE" || grep -q '"style": {}' "$OUTPUT_FILE"; then
    echo -e "${GREEN}✓${NC} Style objects are compact (single line)"
    CHECKS_PASSED=$((CHECKS_PASSED + 1))
else
    echo -e "${RED}✗${NC} Style objects are not compact"
fi

# Check 6: Suggestion widget color is green
CHECKS_TOTAL=$((CHECKS_TOTAL + 1))
if grep -A 5 '"api": "suggestion"' "$OUTPUT_FILE" | grep -q '"color": "green"'; then
    echo -e "${GREEN}✓${NC} Suggestion widget has green color"
    CHECKS_PASSED=$((CHECKS_PASSED + 1))
else
    echo -e "${RED}✗${NC} Suggestion widget color is not green"
fi

# Check 7: Suggestion widget bottom position
CHECKS_TOTAL=$((CHECKS_TOTAL + 1))
if grep -A 5 '"api": "suggestion"' "$OUTPUT_FILE" | grep -q '"bottom": "bottom"'; then
    echo -e "${GREEN}✓${NC} Suggestion widget has correct bottom position"
    CHECKS_PASSED=$((CHECKS_PASSED + 1))
else
    echo -e "${RED}✗${NC} Suggestion widget bottom position is incorrect"
fi

# Check 8: Calendar widget font size
CHECKS_TOTAL=$((CHECKS_TOTAL + 1))
if grep -A 5 '"api": "calendar"' "$OUTPUT_FILE" | grep -q '"fontSize": "1.5rem"'; then
    echo -e "${GREEN}✓${NC} Calendar widget has correct font size (1.5rem)"
    CHECKS_PASSED=$((CHECKS_PASSED + 1))
else
    echo -e "${RED}✗${NC} Calendar widget font size is incorrect"
fi

echo
echo "=========================================="
echo "RESULTS"
echo "=========================================="
echo

if [ $CHECKS_PASSED -eq $CHECKS_TOTAL ]; then
    echo -e "${GREEN}✓ ALL CHECKS PASSED ($CHECKS_PASSED/$CHECKS_TOTAL)${NC}"
    echo
    echo -e "${GREEN}JSON formatting is correct!${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠ SOME CHECKS FAILED ($CHECKS_PASSED/$CHECKS_TOTAL passed)${NC}"
    echo
    echo "Please review the differences above."
    exit 1
fi
