# Frontend-Backend Connection Guide

## Overview
This guide will help you connect the Next.js frontend to the Spring Boot backend and verify the layout management API is working correctly.

## Prerequisites

- Java 21 (for backend)
- Node.js 18+ (for frontend)
- PostgreSQL database running

---

## Step 1: Start the Backend

### 1.1 Navigate to Backend Directory
```bash
cd /home/reyand/vsCode/widget/WidgetStore
```

### 1.2 Configure Database
Ensure PostgreSQL is running and update `src/main/resources/application.yml`:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/widgetstoredb
    username: postgres
    password: your_password  # Set your PostgreSQL password
```

### 1.3 Start Backend
```bash
./mvnw spring-boot:run
```

### 1.4 Verify Backend is Running
You should see:
```
Started WidgetStoreApplication in X.XXX seconds
Tomcat started on port 8080 (http)
User layouts storage directory initialized at: data/users
Checking layout files for X users...
Initialized layout files for Y users (or "All users already have layout files")
```

**⭐ NEW: Automatic Layout Initialization**
The system automatically creates layout files for any users who don't have them on every startup!

### 1.5 Test Backend Endpoint
```bash
curl http://localhost:8080/api/auth/login
```

Should return 400 or 401 (endpoint is working, just needs credentials).

---

## Step 2: Start the Frontend

### 2.1 Navigate to Frontend Directory
```bash
cd /home/reyand/vsCode/widget/Widget-Store-Anton
```

### 2.2 Install Dependencies (if not already done)
```bash
npm install
```

### 2.3 Verify Environment Variables
Check `.env.local` file contains:
```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
```

### 2.4 Start Frontend
```bash
npm run dev
```

### 2.5 Verify Frontend is Running
You should see:
```
- Local:        http://localhost:3000
- Ready in X.Xs
```

---

## Step 3: Test the Connection

### 3.1 Open Browser
Navigate to: **http://localhost:3000/layout-test**

This is a special test page that verifies:
- ✅ Backend connectivity
- ✅ CORS configuration
- ✅ Authentication
- ✅ All layout API endpoints (GET, POST, PATCH, PUT, DELETE)

### 3.2 Register/Login

**Option A: Register New User**
1. Go to http://localhost:3000/auth/register
2. Create account with:
   - Username: `testuser`
   - Email: `test@example.com`
   - Password: `testpass123`

**Option B: Login Existing User**
1. Go to http://localhost:3000/auth/login
2. Enter credentials

### 3.3 Run Connection Tests
1. Return to http://localhost:3000/layout-test
2. Click **"Run All Tests"**
3. Verify all tests pass:
   - ✅ backend - Backend is online and accessible
   - ✅ getLayout - Layout fetched successfully
   - ✅ addWidget - Widget added successfully
   - ✅ updateComponent - Component updated successfully (PATCH)
   - ✅ setTemplateName - Template name set (PUT)
   - ✅ removeWidget - Widget removed successfully

### 3.4 Common Issues

**❌ Backend Offline**
- Check backend is running: `ps aux | grep java`
- Check port 8080 is not in use: `netstat -tuln | grep 8080`
- Restart backend: `./mvnw spring-boot:run`

**❌ CORS Error**
- Backend should have PATCH and OPTIONS in allowed methods
- Check browser console for specific CORS error
- Verify SecurityConfig.java includes: `"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"`

**❌ Authentication Required**
- Click "Login Page" link and login
- Check if token is stored: Open browser console → `localStorage.getItem('authToken')`

**❌ 404 Not Found**
- Verify backend endpoints are registered: Check backend logs
- Verify API base URL in `.env.local`

---

## Step 4: Use the Layout Manager

### 4.1 Navigate to Layout Manager
Go to: **http://localhost:3000/layout-manager**

### 4.2 Test All Features

**View Layout:**
- Current template name should be displayed
- All widgets (clock, weather, news, suggestion, calendar) should be listed

**Add Widget:**
- Click "Add clock" button
- Verify widget appears in component list
- Try adding same widget again (should be idempotent - no duplicates)

**Update Component:**
1. Select widget from dropdown
2. Enter position values (e.g., top: 100px, left: 50px)
3. Enter color (e.g., red, blue, #ff0000)
4. Toggle enabled checkbox
5. Click "Update Component"
6. Verify changes in component list

**Set Template Name:**
1. Enter new name (e.g., "My Custom Layout")
2. Click "Set Name"
3. Verify template name updates

**Remove Widget:**
- Click "Remove" button on any widget
- Confirm deletion
- Verify widget is removed from list

**Refresh Layout:**
- Click "Refresh Layout" button
- Verify layout reloads from backend

---

## Step 5: Verify Backend Storage

### 5.1 Check File System
```bash
ls -la /home/reyand/vsCode/widget/WidgetStore/data/users/
```

You should see user directories:
```
drwxr-xr-x  2 reyand reyand 4096 ... testuser/
```

### 5.2 View Layout File
```bash
cat /home/reyand/vsCode/widget/WidgetStore/data/users/testuser/layout.json
```

Should show pretty-printed JSON:
```json
{
  "templateName": "My Custom Layout",
  "components": [
    {
      "api": "clock",
      "state": true,
      "position": {
        "top": "100px",
        "left": "50px"
      },
      "style": {
        "fontSize": "4rem",
        "fontWeight": "bold"
      },
      "color": "red"
    },
    ...
  ]
}
```

### 5.3 Check Backend Logs
Watch for log entries:
```
INFO ... UserLayoutService : Updated component clock for user testuser
INFO ... UserLayoutService : Set template name to 'My Custom Layout' for user testuser
INFO ... UserLayoutService : Uninstalled widget suggestion from user testuser layout
```

---

## API Endpoint Reference

All endpoints require `Authorization: Bearer <token>` header (except auth endpoints).

### Authentication Endpoints

**POST /api/auth/register**
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "testpass123"
  }'
```

**POST /api/auth/login**
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "testpass123"
  }'
```

Response: `{ "token": "eyJhbGc..." }`

### Layout Endpoints

**GET /api/user-layout**
```bash
curl -X GET http://localhost:8080/api/user-layout \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**POST /api/user-layout/widget**
```bash
curl -X POST http://localhost:8080/api/user-layout/widget \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"api": "clock"}'
```

**PATCH /api/user-layout/widget/{api}**
```bash
curl -X PATCH http://localhost:8080/api/user-layout/widget/clock \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "position": {"top": "100px", "left": "50px"},
    "color": "red"
  }'
```

**PUT /api/user-layout/template-name**
```bash
curl -X PUT http://localhost:8080/api/user-layout/template-name \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '"My Custom Layout"'
```

**DELETE /api/user-layout/widget/{api}**
```bash
curl -X DELETE http://localhost:8080/api/user-layout/widget/clock \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Network Flow

```
┌─────────────────┐         HTTP          ┌─────────────────┐
│   Next.js       │ ─────────────────────> │   Spring Boot   │
│   Frontend      │   localhost:3000       │   Backend       │
│                 │                        │                 │
│ - React UI      │ <───────────────────── │ - REST API      │
│ - API calls     │      JSON Response     │ - Database      │
│ - JWT token     │                        │ - File Storage  │
└─────────────────┘                        └─────────────────┘
                                                    │
                                                    v
                                           ┌─────────────────┐
                                           │  PostgreSQL     │
                                           │  Database       │
                                           └─────────────────┘
                                                    │
                                                    v
                                           ┌─────────────────┐
                                           │  File System    │
                                           │  data/users/    │
                                           │  └─{userId}/    │
                                           │    layout.json  │
                                           └─────────────────┘
```

---

## CORS Configuration

Backend `SecurityConfig.java` allows:
- **Origins:** All (`*`)
- **Methods:** GET, POST, PUT, PATCH, DELETE, OPTIONS
- **Headers:** All (`*`)
- **Credentials:** True (allows Authorization header)

---

## Troubleshooting

### Issue: "Cannot connect to backend"

**Check:**
```bash
# Is backend running?
curl http://localhost:8080/api/auth/login

# Check backend logs
cd /home/reyand/vsCode/widget/WidgetStore
./mvnw spring-boot:run
```

### Issue: "Authentication required"

**Solution:**
1. Login at http://localhost:3000/auth/login
2. Check token: `localStorage.getItem('authToken')` in browser console
3. If token expired, login again

### Issue: "CORS policy error"

**Check backend logs for:**
```
Access-Control-Allow-Origin header
```

**Verify SecurityConfig.java has:**
```java
configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
```

### Issue: "404 Not Found"

**Verify endpoint exists:**
```bash
# Check backend logs for registered endpoints
grep "Mapped.*user-layout" backend.log
```

**Should see:**
```
Mapped [GET] /api/user-layout
Mapped [POST] /api/user-layout/widget
Mapped [PATCH] /api/user-layout/widget/{api}
Mapped [PUT] /api/user-layout/template-name
Mapped [DELETE] /api/user-layout/widget/{api}
```

### Issue: Database connection error

**Check PostgreSQL:**
```bash
sudo systemctl status postgresql
psql -U postgres -d widgetstoredb -c "SELECT 1;"
```

**Update application.yml with correct credentials.**

---

## Quick Start Checklist

- [ ] Backend running on port 8080
- [ ] Frontend running on port 3000
- [ ] PostgreSQL database accessible
- [ ] `.env.local` has correct API URL
- [ ] User registered/logged in
- [ ] Test page shows "Backend Online"
- [ ] All API tests pass
- [ ] Layout manager loads successfully
- [ ] Can add/remove/update widgets
- [ ] Layout file created in `data/users/{username}/layout.json`

---

## Production Deployment

### Environment Variables

**Frontend (.env.production):**
```bash
NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com/api
```

**Backend (application-prod.yml):**
```yaml
user:
  layout:
    storage:
      path: /data/users  # Absolute path with proper permissions

spring:
  datasource:
    url: jdbc:postgresql://db-server:5432/widgetstoredb
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}
```

### CORS Security

For production, update CORS to specific domains:

```java
configuration.setAllowedOriginPatterns(
  List.of("https://yourdomain.com", "https://www.yourdomain.com")
);
```

---

## Support

**Test Page:** http://localhost:3000/layout-test
**Layout Manager:** http://localhost:3000/layout-manager
**Backend Logs:** `./mvnw spring-boot:run` output
**Frontend Logs:** Browser console (F12)

**Common Commands:**
```bash
# Backend
cd /home/reyand/vsCode/widget/WidgetStore
./mvnw spring-boot:run

# Frontend
cd /home/reyand/vsCode/widget/Widget-Store-Anton
npm run dev

# Database
psql -U postgres -d widgetstoredb

# Check layout files
ls -la data/users/*/layout.json
cat data/users/testuser/layout.json
```

---

## Success Criteria

✅ Backend starts without errors
✅ Frontend connects to backend
✅ User can register/login
✅ Test page shows all tests passing
✅ Layout manager displays current layout
✅ Can add widgets (POST works)
✅ Can update widgets (PATCH works)
✅ Can set template name (PUT works)
✅ Can remove widgets (DELETE works)
✅ Layout persists to file system
✅ File is pretty-printed JSON with 2-space indentation
✅ Backend logs show all operations

**You're all set! The frontend and backend are now connected and working together.** 🎉
