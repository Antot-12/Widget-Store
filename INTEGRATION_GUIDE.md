# Frontend-Backend Integration Guide

This guide explains how the Next.js frontend (Widget-Store-Anton) connects to the Spring Boot backend (WidgetStore).

## Architecture Overview

- **Frontend**: Next.js 15 application with TypeScript
- **Backend**: Spring Boot 3.5 with PostgreSQL database
- **Authentication**: JWT-based authentication
- **API Communication**: RESTful API with JSON

## Setup Instructions

### 1. Backend Setup (WidgetStore)

#### Prerequisites
- Java 21
- PostgreSQL database
- Maven

#### Database Configuration
1. Create a PostgreSQL database named `widgetstoredb`
2. Update `WidgetStore/src/main/resources/application.yml` if needed:
   ```yaml
   spring:
     datasource:
       url: jdbc:postgresql://localhost:5432/widgetstoredb
       username: postgres
       password: your_password
   ```

#### Start the Backend
```bash
cd WidgetStore
./mvnw spring-boot:run
```

The backend will start on `http://localhost:8080`

### 2. Frontend Setup (Widget-Store-Anton)

#### Prerequisites
- Node.js 20+
- npm or yarn

#### Environment Configuration
The `.env.local` file has been created with the backend API URL:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
```

#### Install Dependencies
```bash
cd Widget-Store-Anton
npm install
```

#### Start the Frontend
```bash
npm run dev
```

The frontend will start on `http://localhost:3000`

## API Integration

### API Client (`src/lib/api.ts`)

The API client provides functions to interact with the backend:

#### Widget Operations
```typescript
import { widgetApi } from '@/lib/api';

// Get all widgets (paginated)
const widgets = await widgetApi.getAllWidgets(page, size);

// Get widgets by category
const categoryWidgets = await widgetApi.getWidgetsByCategory('Productivity', 0, 20);

// Get single widget
const widget = await widgetApi.getWidgetById(1);

// Get all categories
const categories = await widgetApi.getAllCategories();

// Create widget (requires authentication)
const widgetId = await widgetApi.createWidget({
  name: 'My Widget',
  description: 'Description',
  iconUrl: 'https://example.com/icon.png',
  fileUrl: 'https://example.com/file.zip',
  screenshotUrls: [],
  category: 'Productivity'
});

// Update widget (requires authentication)
await widgetApi.updateWidget(1, widgetData);

// Delete widget (requires authentication)
await widgetApi.deleteWidget(1);
```

#### Authentication Operations
```typescript
import { authApi } from '@/lib/api';

// Register new user
await authApi.register('username', 'password');

// Login
const response = await authApi.login('username', 'password');
// Token is automatically stored in localStorage

// Logout
authApi.logout();

// Check if authenticated
const isAuth = authApi.isAuthenticated();

// Get current token
const token = authApi.getToken();
```

### React Hooks (`src/lib/useBackendWidgets.ts`)

Custom hooks for easy integration in React components:

```typescript
import { useBackendWidgets, useBackendCategories } from '@/lib/useBackendWidgets';

function MyComponent() {
  const { widgets, loading, error, pageInfo } = useBackendWidgets(0, 20);
  const { categories, loading: catLoading, error: catError } = useBackendCategories();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {widgets.map(widget => (
        <div key={widget.id}>{widget.name}</div>
      ))}
    </div>
  );
}
```

## Backend API Endpoints

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token

### Widget Endpoints (Public Access)
- `GET /api/widget` - Get all widgets (paginated)
- `GET /api/widget/{id}` - Get widget by ID
- `GET /api/widget/categ/{category}` - Get widgets by category (paginated)
- `GET /api/widget/categories` - Get all categories

### Widget Management Endpoints (Requires Authentication)
- `POST /api/widget/create` - Create new widget
- `PUT /api/widget/edit/{id}` - Update widget
- `DELETE /api/widget/delete/{id}` - Delete widget
- `POST /api/widget/add/screens/{id}` - Add screenshots to widget

## Security Configuration

### CORS
The backend is configured to accept requests from any origin:
- Allowed methods: GET, POST, PUT, DELETE
- Allowed headers: All
- Credentials: Enabled

### Authentication
- JWT tokens are stored in browser localStorage
- Tokens are automatically included in API requests via Authorization header
- Public endpoints: `/api/auth/**` and `/api/widget/**`
- Protected endpoints require valid JWT token

## Testing the Connection

### 1. Start Both Services
```bash
# Terminal 1 - Backend
cd WidgetStore
./mvnw spring-boot:run

# Terminal 2 - Frontend
cd Widget-Store-Anton
npm run dev
```

### 2. Test API Connection
Open browser console and test:
```javascript
// Test fetching widgets
fetch('http://localhost:8080/api/widget?page=0&size=10')
  .then(r => r.json())
  .then(console.log);

// Test fetching categories
fetch('http://localhost:8080/api/widget/categories')
  .then(r => r.json())
  .then(console.log);
```

### 3. Test Authentication Flow
```javascript
// Register
fetch('http://localhost:8080/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'testuser', password: 'password123' })
})
  .then(r => r.text())
  .then(console.log);

// Login
fetch('http://localhost:8080/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'testuser', password: 'password123' })
})
  .then(r => r.json())
  .then(data => {
    console.log('Token:', data.token);
    localStorage.setItem('authToken', data.token);
  });
```

## Data Models

### WidgetDTO
```typescript
{
  id?: number;
  name: string;
  description: string;
  iconUrl: string;
  fileUrl: string;
  screenshotUrls: string[];
  category?: string;
}
```

### WidgetListDTO
```typescript
{
  id: number;
  name: string;
  iconUrl: string;
  description: string;
  category?: string;
}
```

### PageResponse
```typescript
{
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}
```

## Troubleshooting

### Backend not accessible
- Verify PostgreSQL is running
- Check database connection settings in `application.yml`
- Ensure port 8080 is not in use
- Check backend logs for errors

### CORS errors
- Verify backend is running
- Check SecurityConfig.java CORS configuration
- Clear browser cache and cookies

### Authentication issues
- Check JWT token in localStorage
- Verify token format in Authorization header
- Check backend security configuration
- Ensure user exists in database

### API call failures
- Check network tab in browser DevTools
- Verify API endpoint URLs
- Check request/response formats
- Verify authentication for protected endpoints

## Next Steps

1. **Integrate with existing components**: Update existing frontend components to use the backend API instead of mock data
2. **Add error handling**: Implement proper error handling and user feedback
3. **Add loading states**: Show loading indicators during API calls
4. **Implement pagination**: Add pagination controls for widget lists
5. **Add authentication UI**: Create login/register forms
6. **Add admin panel**: Create admin interface for widget management

## Files Modified/Created

### Frontend (Widget-Store-Anton)
- `.env.local` - Environment configuration
- `src/lib/api.ts` - API client functions
- `src/lib/useBackendWidgets.ts` - React hooks for API integration

### Backend (WidgetStore)
- `src/main/java/org/example/widgetstore/user_service/security/SecurityConfig.java` - Updated to allow public access to widget endpoints
