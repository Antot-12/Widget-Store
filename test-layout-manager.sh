#!/bin/bash

# Test script for per-user smart-mirror layout file generator
# This script tests all layout operations: getLayout, installWidget, uninstallWidget, updateComponent, setTemplateName

set -e  # Exit on any error

BASE_URL="http://localhost:8080/api"
TEST_USER="testuser"
TEST_PASSWORD="testpass123"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}Layout Manager Test Suite${NC}"
echo -e "${YELLOW}========================================${NC}\n"

# Function to print test results
print_test() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $2"
    else
        echo -e "${RED}✗${NC} $2"
        exit 1
    fi
}

# Step 1: Register/Login user
echo -e "\n${YELLOW}Step 1: Authenticate user${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"username\":\"$TEST_USER\",\"password\":\"$TEST_PASSWORD\"}")

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.token // empty')

if [ -z "$TOKEN" ]; then
    echo -e "${YELLOW}User not found, attempting registration...${NC}"
    REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
        -H "Content-Type: application/json" \
        -d "{\"username\":\"$TEST_USER\",\"password\":\"$TEST_PASSWORD\",\"email\":\"test@example.com\"}")

    TOKEN=$(echo $REGISTER_RESPONSE | jq -r '.token // empty')
fi

if [ -z "$TOKEN" ]; then
    print_test 1 "Failed to authenticate"
else
    print_test 0 "User authenticated successfully"
fi

# Step 2: Get initial layout (should create default)
echo -e "\n${YELLOW}Step 2: Get initial layout (should create default)${NC}"
LAYOUT=$(curl -s -X GET "$BASE_URL/user-layout" \
    -H "Authorization: Bearer $TOKEN")

TEMPLATE_NAME=$(echo $LAYOUT | jq -r '.templateName')
COMPONENT_COUNT=$(echo $LAYOUT | jq '.components | length')

[ "$TEMPLATE_NAME" = "Default Morning" ] && print_test 0 "Default template name is correct" || print_test 1 "Default template name is incorrect"
[ "$COMPONENT_COUNT" -eq 5 ] && print_test 0 "Default has 5 components" || print_test 1 "Default component count is incorrect (expected 5, got $COMPONENT_COUNT)"

echo -e "\n${YELLOW}Initial Layout:${NC}"
echo $LAYOUT | jq '.'

# Step 3: Install a new widget (test)
echo -e "\n${YELLOW}Step 3: Install new widget 'test'${NC}"
INSTALL_RESPONSE=$(curl -s -X POST "$BASE_URL/user-layout/widget" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"api":"test"}')

TEST_WIDGET=$(echo $INSTALL_RESPONSE | jq '.components[] | select(.api=="test")')
[ ! -z "$TEST_WIDGET" ] && print_test 0 "Widget 'test' installed successfully" || print_test 1 "Failed to install widget 'test'"

# Step 4: Install duplicate widget (should update, not duplicate)
echo -e "\n${YELLOW}Step 4: Install duplicate widget 'clock' (should be idempotent)${NC}"
DUPLICATE_RESPONSE=$(curl -s -X POST "$BASE_URL/user-layout/widget" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"api":"clock"}')

CLOCK_COUNT=$(echo $DUPLICATE_RESPONSE | jq '[.components[] | select(.api=="clock")] | length')
[ "$CLOCK_COUNT" -eq 1 ] && print_test 0 "No duplicate 'clock' widgets (count: 1)" || print_test 1 "Duplicate widgets found (count: $CLOCK_COUNT)"

# Step 5: Update component
echo -e "\n${YELLOW}Step 5: Update 'clock' widget position and color${NC}"
UPDATE_RESPONSE=$(curl -s -X PATCH "$BASE_URL/user-layout/widget/clock" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
        "position": {"top": "50px", "right": "30px"},
        "color": "red"
    }')

CLOCK_TOP=$(echo $UPDATE_RESPONSE | jq -r '.components[] | select(.api=="clock") | .position.top')
CLOCK_COLOR=$(echo $UPDATE_RESPONSE | jq -r '.components[] | select(.api=="clock") | .color')

[ "$CLOCK_TOP" = "50px" ] && print_test 0 "Clock position.top updated to 50px" || print_test 1 "Clock position.top not updated (got: $CLOCK_TOP)"
[ "$CLOCK_COLOR" = "red" ] && print_test 0 "Clock color updated to red" || print_test 1 "Clock color not updated (got: $CLOCK_COLOR)"

# Step 6: Set template name
echo -e "\n${YELLOW}Step 6: Set template name${NC}"
TEMPLATE_RESPONSE=$(curl -s -X PUT "$BASE_URL/user-layout/template-name" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '"Evening Dashboard"')

NEW_TEMPLATE=$(echo $TEMPLATE_RESPONSE | jq -r '.templateName')
[ "$NEW_TEMPLATE" = "Evening Dashboard" ] && print_test 0 "Template name set to 'Evening Dashboard'" || print_test 1 "Template name not set correctly (got: $NEW_TEMPLATE)"

# Step 7: Uninstall widget
echo -e "\n${YELLOW}Step 7: Uninstall 'test' widget${NC}"
UNINSTALL_RESPONSE=$(curl -s -X DELETE "$BASE_URL/user-layout/widget/test" \
    -H "Authorization: Bearer $TOKEN")

TEST_WIDGET_AFTER=$(echo $UNINSTALL_RESPONSE | jq '.components[] | select(.api=="test")')
[ -z "$TEST_WIDGET_AFTER" ] && print_test 0 "Widget 'test' uninstalled successfully" || print_test 1 "Failed to uninstall widget 'test'"

# Step 8: Verify final state
echo -e "\n${YELLOW}Step 8: Verify final layout state${NC}"
FINAL_LAYOUT=$(curl -s -X GET "$BASE_URL/user-layout" \
    -H "Authorization: Bearer $TOKEN")

echo -e "\n${YELLOW}Final Layout:${NC}"
echo $FINAL_LAYOUT | jq '.'

FINAL_COUNT=$(echo $FINAL_LAYOUT | jq '.components | length')
FINAL_TEMPLATE=$(echo $FINAL_LAYOUT | jq -r '.templateName')

[ "$FINAL_TEMPLATE" = "Evening Dashboard" ] && print_test 0 "Final template name persisted" || print_test 1 "Template name not persisted"
[ "$FINAL_COUNT" -eq 5 ] && print_test 0 "Final component count is correct (5)" || print_test 1 "Final component count is incorrect (got: $FINAL_COUNT)"

# Step 9: Check file system
echo -e "\n${YELLOW}Step 9: Verify file system storage${NC}"
LAYOUT_FILE="/data/users/$TEST_USER/layout.json"

if [ -f "$LAYOUT_FILE" ]; then
    print_test 0 "Layout file exists at $LAYOUT_FILE"
    echo -e "\n${YELLOW}File contents:${NC}"
    cat "$LAYOUT_FILE" | jq '.'

    # Verify JSON is pretty-printed
    if grep -q "^  \"" "$LAYOUT_FILE"; then
        print_test 0 "JSON is pretty-printed with 2-space indentation"
    else
        print_test 1 "JSON is not properly formatted"
    fi
else
    print_test 1 "Layout file not found at expected path"
fi

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}All tests passed!${NC}"
echo -e "${GREEN}========================================${NC}\n"
