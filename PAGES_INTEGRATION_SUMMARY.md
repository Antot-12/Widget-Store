# Pages Integration Summary

This document details how the existing frontend pages have been connected to the Spring Boot backend.

## Overview

The frontend pages now fetch data from the backend API with automatic fallback to local data if the backend is unavailable.

## Files Modified

### Core Integration Files

1. **`Widget-Store-Anton/src/lib/widgetAdapter.ts`** (NEW)
   - Adapts backend WidgetDTO format to frontend Widget format
   - Provides default values for fields not available in backend
   - Functions: `adaptWidgetDTO()`, `adaptWidgetListDTO()`, `adaptWidgetList()`

2. **`Widget-Store-Anton/src/lib/api.ts`** (UPDATED)
   - Complete API client with widget and auth operations
   - JWT token management
   - Type definitions for API responses

3. **`Widget-Store-Anton/src/lib/useBackendWidgets.ts`** (NEW)
   - Custom React hooks for fetching widgets and categories
   - `useBackendWidgets()` - Fetch paginated widgets
   - `useBackendCategories()` - Fetch categories

### Page Updates

#### 1. Main Page (`src/app/page.tsx`)

**Changes:**
- Added backend widget fetching with pagination
- Fetches categories from backend API
- Implements automatic fallback to local data
- Shows loading skeletons during data fetch
- Displays warning banner when using fallback data

**Features:**
- Fetches up to 100 widgets from backend on page load
- Dynamic category filtering using backend categories
- Search functionality works with backend data
- Featured widgets carousel uses backend data
- Loading states with skeleton components

**API Calls:**
```typescript
// Fetch widgets
const response = await widgetApi.getAllWidgets(0, 100);

// Fetch categories
const backendCategories = await widgetApi.getAllCategories();
```

#### 2. Widget Detail Page (`src/app/widget/[id]/page.tsx`)

**Changes:**
- Fetches individual widget details from backend by ID
- Implements loading state with skeletons
- Automatic fallback to local data
- Shows warning banner when using fallback data

**Features:**
- Converts string ID to numeric ID for backend API
- Adapts backend response to frontend Widget format
- Maintains existing functionality (install status, comments, etc.)
- Shows loading skeleton while fetching

**API Call:**
```typescript
const backendWidget = await widgetApi.getWidgetById(numericId);
const adaptedWidget = adaptWidgetDTO(backendWidget);
```

## Data Flow

### Main Page Flow
```
User loads page
    ↓
Component mounts
    ↓
Fetch widgets from backend (widgetApi.getAllWidgets)
    ↓
Success? → Adapt data → Display backend widgets
    ↓ (if fails)
Fallback to ALL_WIDGETS (local data)
    ↓
Show warning banner
```

### Widget Detail Flow
```
User clicks widget
    ↓
Navigate to /widget/[id]
    ↓
Component mounts with ID
    ↓
Fetch widget from backend (widgetApi.getWidgetById)
    ↓
Success? → Adapt data → Display widget
    ↓ (if fails)
Fallback to ALL_WIDGETS.find(id)
    ↓
Show warning banner
```

## Fallback Strategy

Both pages implement a graceful degradation strategy:

1. **Primary:** Try to fetch from backend API
2. **Fallback:** Use local data from `ALL_WIDGETS`
3. **User Feedback:** Show warning banner when using fallback
4. **Console Logging:** Log errors for debugging

## Data Adaptation

The adapter converts backend data to match frontend expectations:

### Backend → Frontend Mapping

| Backend Field | Frontend Field | Notes |
|--------------|----------------|-------|
| `id` (number) | `id` (string) | Converted to string |
| `name` | `name` | Direct mapping |
| `description` | `description` | Direct mapping |
| `iconUrl` | `imageUrl` | Backend uses iconUrl |
| `category` | `category` | Direct mapping |
| `screenshotUrls` | (unused) | Not displayed on list |
| - | `imageHint` | Default: category name |
| - | `tags` | Default: [category] |
| - | `keyFeatures` | Default feature list |
| - | `whatsNew` | Default changelog |
| - | `moreInfo` | Default metadata |

## Loading States

Both pages implement loading states:

### Main Page Loading
- Grid of 6-9 skeleton cards
- Skeleton for categories dropdown
- Skeleton for widget of the day

### Detail Page Loading
- Skeleton for back button
- Skeleton for hero image
- Skeleton for title and description
- Skeleton for content sections

## Error Handling

### Network Errors
```typescript
try {
  const response = await widgetApi.getAllWidgets(0, 100);
  setBackendWidgets(adaptWidgetList(response.content));
  setUseBackend(true);
} catch (error) {
  console.error('Failed to fetch widgets from backend:', error);
  setBackendWidgets(ALL_WIDGETS);
  setUseBackend(false);
}
```

### Invalid Widget IDs
- Widget detail page validates numeric IDs
- Falls back to local data for string IDs
- Shows "Widget not found" for missing widgets

## User Experience Features

### Visual Feedback
1. **Loading States:** Skeleton loaders during data fetch
2. **Warning Banners:** Yellow banners when using fallback data
3. **Error Messages:** Console logs for debugging
4. **Smooth Transitions:** No flash of empty content

### Responsive Behavior
- All loading states match grid layouts
- Skeletons adapt to screen size
- Warning banners are dismissible by design

## Testing the Integration

### Test Main Page
1. Start backend: `cd WidgetStore && ./mvnw spring-boot:run`
2. Start frontend: `cd Widget-Store-Anton && npm run dev`
3. Navigate to `http://localhost:3000`
4. Expected: See widgets from backend
5. Stop backend to test fallback

### Test Widget Detail
1. With backend running, click any widget card
2. Expected: Loading skeleton → Widget details
3. Stop backend and refresh
4. Expected: Warning banner + local data

### Test Categories
1. With backend running, open category dropdown
2. Expected: Categories from backend database
3. Select a category
4. Expected: Filtered widgets from backend

## Performance Considerations

### Optimization Strategies
1. **Single Fetch:** Main page fetches 100 widgets once
2. **Client-side Filtering:** Search and category filter work on cached data
3. **No Store Cache:** API calls use `cache: 'no-store'` for fresh data
4. **Conditional Rendering:** Only render when data is ready

### Future Improvements
1. Implement pagination for large widget lists
2. Add data caching with SWR or React Query
3. Implement optimistic UI updates
4. Add search API endpoint for better performance

## Known Limitations

1. **Widget Details:** Backend doesn't store keyFeatures, whatsNew, moreInfo
   - Solution: Adapter provides defaults

2. **ID Format:** Backend uses numbers, frontend expects strings
   - Solution: Adapter converts automatically

3. **Image URLs:** Backend uses iconUrl, frontend expects imageUrl
   - Solution: Adapter maps iconUrl to imageUrl

4. **Tags:** Backend doesn't store tags
   - Solution: Adapter generates tags from category

## Next Steps

1. ✅ Connect main page to backend
2. ✅ Connect widget detail page to backend
3. ✅ Implement category filtering
4. ✅ Add loading states
5. ✅ Add error handling
6. 🔜 Add authentication UI
7. 🔜 Add widget management UI (create/edit/delete)
8. 🔜 Implement pagination
9. 🔜 Add search API endpoint

## Configuration

### Environment Variables
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
```

### Backend Requirements
- Spring Boot backend running on port 8080
- CORS configured to allow frontend origin
- Widget endpoints accessible without authentication
- Categories endpoint accessible without authentication

## Troubleshooting

### Widgets not loading
1. Check backend is running: `curl http://localhost:8080/api/widget`
2. Check browser console for errors
3. Verify CORS settings in backend
4. Check network tab in DevTools

### Categories not loading
1. Verify categories exist in database
2. Check API endpoint: `curl http://localhost:8080/api/widget/categories`
3. Check console for error messages

### Widget detail not loading
1. Verify widget ID is numeric
2. Check if widget exists in backend
3. Verify API endpoint: `curl http://localhost:8080/api/widget/1`
4. Check fallback data in ALL_WIDGETS

## Summary

All main pages have been successfully connected to the backend with:
- ✅ Automatic data fetching
- ✅ Graceful fallback to local data
- ✅ Loading states
- ✅ Error handling
- ✅ User feedback
- ✅ Data adaptation layer

The integration maintains backward compatibility while enabling full backend functionality when available.
