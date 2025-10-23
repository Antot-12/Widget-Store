#!/bin/bash

# Test script for user layout API
# Make sure backend is running on port 8080

BASE_URL="http://localhost:8080/api"

echo "=== User Layout API Test Script ==="
echo

# Step 1: Register a test user
echo "1. Registering test user..."
curl -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"username":"layoutuser","password":"password123"}' \
  -w "\nHTTP Status: %{http_code}\n"
echo
echo

# Step 2: Login and get token
echo "2. Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"layoutuser","password":"password123"}')

TOKEN=$(echo $LOGIN_RESPONSE | grep -oP '"token":"\K[^"]+')
echo "Token obtained: ${TOKEN:0:20}..."
echo

# Step 3: Get user layout (should create default)
echo "3. Getting user layout (will create default on first access)..."
curl -X GET "$BASE_URL/user-layout" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | python3 -m json.tool
echo

# Step 4: Add a widget to layout
echo "4. Adding 'clock' widget to layout..."
curl -X POST "$BASE_URL/user-layout/widget" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"api":"clock"}' | python3 -m json.tool
echo

# Step 5: Try adding same widget again (should be idempotent)
echo "5. Adding 'clock' widget again (should not duplicate)..."
curl -X POST "$BASE_URL/user-layout/widget" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"api":"clock"}' | python3 -m json.tool
echo

# Step 6: Install widget via widget/install endpoint
echo "6. Installing 'weather' widget via /api/widget/install..."
curl -X POST "$BASE_URL/widget/install" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"widgetId":1,"api":"weather"}' \
  -w "\nHTTP Status: %{http_code}\n"
echo
echo

# Step 7: Remove a widget
echo "7. Removing 'news' widget from layout..."
curl -X DELETE "$BASE_URL/user-layout/widget/news" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | python3 -m json.tool
echo

# Step 8: Try adding unknown widget (should fail)
echo "8. Trying to add unknown widget (should fail with 400)..."
curl -X POST "$BASE_URL/user-layout/widget" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"api":"unknown-widget"}' \
  -w "\nHTTP Status: %{http_code}\n"
echo

echo "=== Test complete ==="
echo "Check storage/user-layouts/ directory for the JSON file"
