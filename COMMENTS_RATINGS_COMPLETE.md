# Comments and Ratings Feature - Complete Implementation

User comments and ratings have been successfully implemented for widgets, allowing authenticated users to rate widgets (1-5 stars) and leave comments with full CRUD operations.

## What Was Added

### Backend Implementation

#### 1. Database Entities

**Comment Entity** (`src/main/java/org/example/widgetstore/widget_service/entity/Comment.java`)
- Stores user comments on widgets
- Tracks creation and update timestamps
- Enforces user ownership for edit/delete operations
- Fields:
  - `id` - Primary key
  - `widget` - Many-to-One relationship with Widget
  - `user` - Many-to-One relationship with User
  - `content` - Comment text (max 2000 chars)
  - `createdAt` - Timestamp
  - `updatedAt` - Timestamp

**Rating Entity** (`src/main/java/org/example/widgetstore/widget_service/entity/Rating.java`)
- Stores user ratings (1-5 stars) for widgets
- One rating per user per widget (unique constraint)
- Fields:
  - `id` - Primary key
  - `widget` - Many-to-One relationship with Widget
  - `user` - Many-to-One relationship with User
  - `rating` - Integer (1-5)
  - `createdAt` - Timestamp
  - `updatedAt` - Timestamp

**Updated Widget Entity**
- Added rating statistics fields:
  - `averageRating` - Calculated average (Double)
  - `ratingCount` - Total number of ratings (Integer)
  - `commentCount` - Total number of comments (Integer)

#### 2. DTOs (Data Transfer Objects)

**CommentDTO** - For transferring comment data
```java
{
  id: Long
  widgetId: Long
  userId: Long
  username: String
  content: String
  createdAt: LocalDateTime
  updatedAt: LocalDateTime
}
```

**CreateCommentRequest** - For creating/updating comments
```java
{
  content: String
}
```

**RatingDTO** - For transferring rating data
```java
{
  id: Long
  widgetId: Long
  userId: Long
  username: String
  rating: Integer
  createdAt: LocalDateTime
  updatedAt: LocalDateTime
}
```

**CreateRatingRequest** - For creating/updating ratings
```java
{
  rating: Integer // 1-5
}
```

**RatingStatsDTO** - For aggregated rating statistics
```java
{
  averageRating: Double
  ratingCount: Integer
  userRating: Integer // Current user's rating (optional)
}
```

#### 3. Repositories

**CommentRepository** (`widget_service/repo/CommentRepository.java`)
- `findByWidgetOrderByCreatedAtDesc()` - Get comments sorted by date
- `countByWidget()` - Count comments for a widget

**RatingRepository** (`widget_service/repo/RatingRepository.java`)
- `findByWidgetAndUser()` - Get user's rating for a widget
- `getAverageRatingForWidget()` - Calculate average rating
- `countByWidget()` - Count ratings for a widget

#### 4. Service Layer

**CommentService** (`widget_service/service/CommentService.java`)

Features:
- Get paginated comments for a widget
- Create new comment (authenticated users only)
- Update comment (owner only)
- Delete comment (owner only)
- Automatically updates widget comment count

**RatingService** (`widget_service/service/RatingService.java`)

Features:
- Get rating statistics (with user's rating if authenticated)
- Create or update rating (authenticated users only)
- Delete rating (authenticated users only)
- Automatically recalculates widget average rating

#### 5. REST Controllers

**CommentController** (`widget_service/controller/CommentController.java`)

Endpoints:
- `GET /api/widget/{widgetId}/comments` - Get comments (paginated)
  - Query params: `page` (default: 0), `size` (default: 10)
  - Public access
- `POST /api/widget/{widgetId}/comments` - Create comment
  - Requires authentication
- `PUT /api/widget/{widgetId}/comments/{commentId}` - Update comment
  - Requires authentication + ownership
- `DELETE /api/widget/{widgetId}/comments/{commentId}` - Delete comment
  - Requires authentication + ownership

**RatingController** (`widget_service/controller/RatingController.java`)

Endpoints:
- `GET /api/widget/{widgetId}/rating` - Get rating stats
  - Public access (includes user's rating if authenticated)
- `POST /api/widget/{widgetId}/rating` - Create/update rating
  - Requires authentication
- `DELETE /api/widget/{widgetId}/rating` - Delete rating
  - Requires authentication

#### 6. Security Configuration

The existing SecurityConfig already permits public access to all `/api/widget/**` endpoints, which includes:
- Reading comments and ratings (anyone)
- Writing comments and ratings (authenticated users only, enforced at service level)

### Frontend Implementation

#### 1. API Functions (`src/lib/api.ts`)

**Type Definitions:**
```typescript
export type CommentDTO = {
  id: number;
  widgetId: number;
  userId: number;
  username: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

export type RatingStatsDTO = {
  averageRating: number;
  ratingCount: number;
  userRating?: number;
};
```

**Comment API:**
```typescript
commentApi.getComments(widgetId, page?, size?)
commentApi.createComment(widgetId, content)
commentApi.updateComment(widgetId, commentId, content)
commentApi.deleteComment(widgetId, commentId)
```

**Rating API:**
```typescript
ratingApi.getRatingStats(widgetId)
ratingApi.createOrUpdateRating(widgetId, rating)
ratingApi.deleteRating(widgetId)
```

#### 2. RatingDisplay Component (`src/components/rating-display.tsx`)

**Purpose:** Interactive star rating display with statistics

**Features:**
- 5-star rating display
- Shows average rating and count
- Interactive star selection (hover effects)
- Displays current user's rating
- Login prompt for unauthenticated users
- Real-time updates after rating
- Toast notifications

**Props:**
```typescript
{
  widgetId: number;
  initialStats?: RatingStatsDTO;
}
```

**UI:**
- Yellow stars (filled for rating, empty for no rating)
- Hover effects on stars
- Average rating displayed as decimal (e.g., 4.2)
- Rating count (e.g., "23 ratings")
- User's current rating (e.g., "Your rating: 4 stars")

#### 3. CommentSection Component (`src/components/comment-section.tsx`)

**Purpose:** Full-featured comment section with CRUD operations

**Features:**
- Paginated comment list (newest first)
- Create new comments (authenticated)
- Edit own comments (inline editing)
- Delete own comments (with confirmation)
- Relative timestamps (e.g., "2 hours ago")
- "Edited" indicator for modified comments
- Loading states
- Empty state messages
- Toast notifications

**Props:**
```typescript
{
  widgetId: number;
}
```

**UI:**
- Card-based layout
- Textarea for new comments
- Comment list with user avatars
- Edit/Delete buttons (owner only)
- Inline editing mode
- Responsive design

#### 4. Widget Detail Page Integration (`src/app/widget/[id]/page.tsx`)

**Changes Made:**
- Removed old Appwrite-based `CommentsSection`
- Removed old comment-based rating calculation
- Added `RatingDisplay` component
- Added `CommentSection` component
- Only shows ratings/comments for backend widgets (numeric IDs)
- Separated rating and comments sections with dividers

**Layout:**
```
Widget Details
  ├─ Widget Image
  ├─ Name, Category, Install Button
  ├─ Description
  ├─ Tags
  ├─ Key Features (if available)
  ├─ What's New (if available)
  ├─ More Information (if available)
  ├─ Rating Section (new)
  │   └─ Interactive star rating
  └─ Comments Section (new)
      ├─ New comment form
      └─ Comment list
```

## User Flows

### Rating Flow

**Unauthenticated User:**
```
1. User views widget detail page
2. Sees average rating and rating count
3. Sees message: "Login to rate this widget"
4. Stars are not clickable
```

**Authenticated User (First Rating):**
```
1. User views widget detail page
2. Sees average rating and rating count
3. Hovers over stars → stars fill up to hover position
4. Clicks on star (e.g., 4th star)
5. Backend saves rating
6. Statistics update automatically
7. Toast notification: "Your rating has been saved"
8. Shows "Your rating: 4 stars"
```

**Authenticated User (Update Rating):**
```
1. User returns to widget they already rated
2. Sees their previous rating highlighted
3. Clicks different star to change rating
4. Backend updates existing rating
5. Statistics recalculate
6. Toast notification confirms update
```

### Comment Flow

**Create Comment:**
```
1. User scrolls to comment section
2. Types comment in textarea
3. Clicks "Post Comment"
4. Comment appears at top of list
5. Comment count increments
6. Toast notification: "Your comment has been posted"
```

**Edit Comment:**
```
1. User sees their own comment
2. Clicks edit icon (pencil)
3. Comment switches to edit mode (textarea)
4. User modifies content
5. Clicks "Save"
6. Comment updates with "(edited)" indicator
7. Toast notification: "Comment updated"
```

**Delete Comment:**
```
1. User clicks delete icon (trash)
2. Confirmation dialog: "Are you sure?"
3. User confirms
4. Comment removed from list
5. Comment count decrements
6. Toast notification: "Comment deleted"
```

## API Endpoints Summary

### Comments

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/api/widget/{id}/comments` | No | Get paginated comments |
| POST | `/api/widget/{id}/comments` | Yes | Create comment |
| PUT | `/api/widget/{id}/comments/{commentId}` | Yes (owner) | Update comment |
| DELETE | `/api/widget/{id}/comments/{commentId}` | Yes (owner) | Delete comment |

### Ratings

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/api/widget/{id}/rating` | No* | Get rating stats (*includes user rating if authenticated) |
| POST | `/api/widget/{id}/rating` | Yes | Create/update rating |
| DELETE | `/api/widget/{id}/rating` | Yes | Delete rating |

## Database Schema

### Comments Table
```sql
CREATE TABLE comments (
    id BIGSERIAL PRIMARY KEY,
    widget_id BIGINT NOT NULL REFERENCES widget(id),
    user_id BIGINT NOT NULL REFERENCES users(id),
    content VARCHAR(2000) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_comments_widget ON comments(widget_id);
CREATE INDEX idx_comments_created ON comments(created_at DESC);
```

### Ratings Table
```sql
CREATE TABLE ratings (
    id BIGSERIAL PRIMARY KEY,
    widget_id BIGINT NOT NULL REFERENCES widget(id),
    user_id BIGINT NOT NULL REFERENCES users(id),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    UNIQUE(widget_id, user_id)
);

CREATE INDEX idx_ratings_widget ON ratings(widget_id);
```

### Widget Table Updates
```sql
ALTER TABLE widget
ADD COLUMN average_rating DOUBLE PRECISION NOT NULL DEFAULT 0.0,
ADD COLUMN rating_count INTEGER NOT NULL DEFAULT 0,
ADD COLUMN comment_count INTEGER NOT NULL DEFAULT 0;
```

## Features

### ✅ Implemented Features

**Ratings:**
- 5-star rating system
- One rating per user per widget
- Update/delete own rating
- Real-time average calculation
- Rating count display
- User-specific rating display
- Anonymous viewing of ratings
- Login prompt for unauthenticated users

**Comments:**
- Create comments (authenticated)
- Read comments (public)
- Update own comments
- Delete own comments
- Paginated comment list
- Relative timestamps
- Edit indicator
- Comment count tracking
- Empty state handling
- Inline editing

**Security:**
- JWT authentication for write operations
- Ownership verification for edit/delete
- Public read access
- SQL injection protection (JPA/Hibernate)
- XSS protection (content escaping)

**UX:**
- Loading states
- Toast notifications
- Confirmation dialogs
- Hover effects
- Responsive design
- Error handling
- Optimistic UI updates

### 🔜 Future Enhancements

**Ratings:**
- Rating distribution chart (1-star: 5%, 2-star: 10%, etc.)
- "Helpful" votes on ratings
- Rating with review text
- Sort by highest/lowest rated

**Comments:**
- Reply to comments (nested threads)
- Like/upvote comments
- Sort comments (newest, oldest, most liked)
- Mention users (@username)
- Rich text formatting
- Image attachments
- Report inappropriate comments
- Moderator tools

**General:**
- Email notifications for replies
- Activity feed
- User profile showing all ratings/comments
- Export reviews as CSV
- API rate limiting
- Spam detection
- Sentiment analysis

## Testing the Integration

### 1. Start Backend
```bash
cd WidgetStore
./mvnw spring-boot:run
```

### 2. Start Frontend
```bash
cd Widget-Store-Anton
npm run dev
```

### 3. Test Rating

**As Guest:**
1. Navigate to http://localhost:3000
2. Click any widget to view details
3. Scroll to "Rating" section
4. Observe you can see ratings but can't click stars
5. See message "Login to rate this widget"

**As Authenticated User:**
1. Click "Login" and sign in
2. Navigate to a widget detail page
3. Click on a star (e.g., 4th star)
4. See toast notification "Your rating has been saved"
5. See "Your rating: 4 stars" displayed
6. Click different star to update rating
7. Refresh page → rating persists

### 4. Test Comments

**Create Comment:**
1. While logged in, scroll to "Comments" section
2. Type a comment in the textarea
3. Click "Post Comment"
4. Comment appears at top of list
5. See toast notification

**Edit Comment:**
1. Find your comment in the list
2. Click the edit icon (pencil)
3. Modify the text
4. Click "Save"
5. Comment updates with "(edited)" label

**Delete Comment:**
1. Find your comment
2. Click delete icon (trash)
3. Confirm deletion
4. Comment disappears
5. See toast notification

### 5. Test Statistics

**Rating Statistics:**
1. Create multiple accounts
2. Rate the same widget with different ratings
3. Observe average rating updates automatically
4. Check rating count increments

**Comment Count:**
1. Post multiple comments
2. Check widget detail page shows correct count
3. Delete a comment
4. Count decrements

## Security Considerations

### Current Implementation

**Backend:**
- ✅ JWT token validation
- ✅ User authentication for write operations
- ✅ Ownership verification (users can only edit/delete own content)
- ✅ Input validation (rating 1-5, content max length)
- ✅ SQL injection protection (JPA/Hibernate)
- ✅ CORS configured for frontend origin
- ✅ One rating per user per widget constraint

**Frontend:**
- ✅ Token stored in localStorage
- ✅ Automatic token inclusion in requests
- ✅ Content escaping (React default)
- ✅ User feedback for errors
- ✅ Client-side validation

### Production Recommendations

**Backend:**
- Add rate limiting (e.g., max 10 comments per hour)
- Implement content moderation queue
- Add profanity filter
- Implement comment flagging system
- Add CAPTCHA for anonymous comments
- Log suspicious activity
- Implement soft delete for comments (audit trail)

**Frontend:**
- Add debouncing for rating clicks
- Implement optimistic updates
- Add content length warnings
- Improve error messages
- Add markdown support for comments
- Implement infinite scroll for comments

## Troubleshooting

### Issue: "Login required" but I'm logged in

**Solution:**
1. Check localStorage for `authToken`
2. Verify token in browser DevTools → Application → Local Storage
3. Check browser console for authentication errors
4. Try logging out and back in
5. Clear localStorage and login again

### Issue: Comments not loading

**Solution:**
1. Check backend is running on port 8080
2. Check browser console for API errors
3. Verify widget ID is numeric (backend widgets only)
4. Check backend logs for errors
5. Ensure database tables exist

### Issue: Rating not saving

**Solution:**
1. Verify you're logged in
2. Check rating is between 1-5
3. Check browser console for errors
4. Verify backend authentication is working
5. Check database connection

### Issue: Can't edit/delete comments

**Solution:**
1. Verify you're the comment owner
2. Check username matches exactly
3. Look for error in toast notification
4. Check backend logs for authorization errors
5. Verify JWT token is valid

### Issue: Average rating not updating

**Solution:**
1. Check backend logs for calculation errors
2. Verify rating was actually saved
3. Try refreshing the page
4. Check database for rating records
5. Verify `RatingService.updateWidgetRatingStats()` is called

## Files Added/Modified

### Backend Files Added

```
WidgetStore/src/main/java/org/example/widgetstore/widget_service/
├── entity/
│   ├── Comment.java (NEW)
│   └── Rating.java (NEW)
├── dto/
│   ├── CommentDTO.java (NEW)
│   ├── CreateCommentRequest.java (NEW)
│   ├── RatingDTO.java (NEW)
│   ├── CreateRatingRequest.java (NEW)
│   └── RatingStatsDTO.java (NEW)
├── repo/
│   ├── CommentRepository.java (NEW)
│   └── RatingRepository.java (NEW)
├── service/
│   ├── CommentService.java (NEW)
│   └── RatingService.java (NEW)
└── controller/
    ├── CommentController.java (NEW)
    └── RatingController.java (NEW)
```

### Backend Files Modified

```
WidgetStore/src/main/java/org/example/widgetstore/widget_service/
├── entity/
│   └── Widget.java (MODIFIED - added rating/comment statistics)
├── dto/
│   ├── WidgetDTO.java (MODIFIED - added rating/comment fields)
│   ├── WidgetListDTO.java (MODIFIED - added rating fields)
│   └── WidgetMapper.java (MODIFIED - updated mapping)
```

### Frontend Files Added

```
Widget-Store-Anton/src/
├── components/
│   ├── rating-display.tsx (NEW)
│   └── comment-section.tsx (NEW)
```

### Frontend Files Modified

```
Widget-Store-Anton/src/
├── lib/
│   └── api.ts (MODIFIED - added comment/rating APIs)
└── app/
    └── widget/[id]/
        └── page.tsx (MODIFIED - integrated new components)
```

## Summary

The comments and ratings system is now fully integrated:

✅ **Complete Backend** - Entities, DTOs, Services, Controllers, Repositories
✅ **Complete Frontend** - React components with full interactivity
✅ **Authentication** - JWT-based security for write operations
✅ **Statistics** - Real-time average rating and counts
✅ **CRUD Operations** - Create, Read, Update, Delete for comments
✅ **User Ownership** - Only owners can edit/delete their content
✅ **Responsive UI** - Works on mobile and desktop
✅ **Error Handling** - Clear user feedback with toasts
✅ **Security** - Input validation, authentication, authorization

Users can now:
1. Rate widgets on a 5-star scale
2. Update their ratings anytime
3. View aggregate rating statistics
4. Post comments on widgets
5. Edit their own comments
6. Delete their own comments
7. View all comments with timestamps
8. See who posted each comment

The foundation is set for adding advanced features like nested replies, comment voting, and moderation tools!
