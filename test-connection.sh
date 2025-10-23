#!/bin/bash

echo "====================================="
echo "Backend-Frontend Connection Test"
echo "====================================="
echo ""

# Test if backend is running
echo "1. Testing Backend Connection..."
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/api/widget 2>/dev/null)

if [ "$BACKEND_STATUS" == "200" ] || [ "$BACKEND_STATUS" == "401" ]; then
    echo "   ✓ Backend is running on http://localhost:8080"
else
    echo "   ✗ Backend is not responding (Status: $BACKEND_STATUS)"
    echo "   Please start the backend with: cd WidgetStore && ./mvnw spring-boot:run"
fi

echo ""
echo "2. Testing Widget API Endpoint..."
curl -s http://localhost:8080/api/widget?page=0&size=5 | jq '.' 2>/dev/null || echo "   Note: Install 'jq' for formatted JSON output"

echo ""
echo "3. Testing Categories Endpoint..."
curl -s http://localhost:8080/api/widget/categories | jq '.' 2>/dev/null || curl -s http://localhost:8080/api/widget/categories

echo ""
echo "4. Frontend Configuration..."
if [ -f "Widget-Store-Anton/.env.local" ]; then
    echo "   ✓ .env.local exists"
    echo "   Configuration:"
    cat Widget-Store-Anton/.env.local
else
    echo "   ✗ .env.local not found"
fi

echo ""
echo "====================================="
echo "Test Complete!"
echo "====================================="
