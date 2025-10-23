# Layout Template Update - Correct Default Values

## Changes Made

Updated the default layout template to match the official specification.

### Files Modified

1. **WidgetDefaultsRegistry.java** - Widget defaults
2. **STARTUP_INITIALIZATION.md** - Documentation
3. **AUTOMATIC_INITIALIZATION_SUMMARY.md** - Documentation

---

## What Changed

### Suggestion Widget

**Before:**
```json
{
  "api": "suggestion",
  "position": { "bottom": "20px", "left": "50%", "transform": "translateX(-50%)" },
  "style": { "fontSize": "2rem", "fontStyle": "italic" },
  "color": "cyan"
}
```

**After:**
```json
{
  "api": "suggestion",
  "position": { "bottom": "bottom", "left": "50%", "transform": "translateX(-50%)" },
  "style": { "fontSize": "2rem", "fontStyle": "italic" },
  "color": "green"
}
```

**Changes:**
- ✅ `position.bottom`: `"20px"` → `"bottom"`
- ✅ `color`: `"cyan"` → `"green"`

---

### Calendar Widget

**Before:**
```json
{
  "api": "calendar",
  "position": { "bottom": "100px", "right": "20px" },
  "style": { "fontSize": "1rem", "maxWidth": "400px" },
  "color": "cyan"
}
```

**After:**
```json
{
  "api": "calendar",
  "position": { "bottom": "100px", "right": "20px" },
  "style": { "fontSize": "1.5rem", "maxWidth": "400px" },
  "color": "cyan"
}
```

**Changes:**
- ✅ `style.fontSize`: `"1rem"` → `"1.5rem"`

---

## Complete Default Layout

The default layout now matches the official template exactly:

```json
{
  "templateName": "Default Morning",
  "components": [
    {
      "api": "clock",
      "state": true,
      "position": { "top": "20px", "right": "20px" },
      "style": { "fontSize": "4rem", "fontWeight": "bold" },
      "color": "cyan"
    },
    {
      "api": "weather",
      "state": true,
      "position": { "top": "20px", "left": "20px" },
      "style": {},
      "color": "cyan"
    },
    {
      "api": "news",
      "state": true,
      "position": { "bottom": "100px", "left": "20px" },
      "style": { "fontSize": "1rem", "maxWidth": "400px" },
      "color": "cyan"
    },
    {
      "api": "suggestion",
      "state": true,
      "position": { "bottom": "bottom", "left": "50%", "transform": "translateX(-50%)" },
      "style": { "fontSize": "2rem", "fontStyle": "italic" },
      "color": "green"
    },
    {
      "api": "calendar",
      "state": true,
      "position": { "bottom": "100px", "right": "20px" },
      "style": { "fontSize": "1.5rem", "maxWidth": "400px" },
      "color": "cyan"
    }
  ]
}
```

---

## Impact

### New Layouts
All new layouts created (via startup initialization, first access, or API) will use the correct values.

### Existing Layouts
**NOT affected** - Existing layout files remain unchanged. This is intentional to preserve user customizations.

### To Update Existing Layouts

**Option 1: Delete and Recreate**
```bash
# Delete layout file
rm data/users/{username}/layout.json

# Restart backend (will recreate with new defaults)
./mvnw spring-boot:run
```

**Option 2: Manual Edit**
Edit `data/users/{username}/layout.json` and change values manually.

**Option 3: Via API**
```bash
# Update suggestion widget
curl -X PATCH http://localhost:8080/api/user-layout/widget/suggestion \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "position": {"bottom": "bottom"},
    "color": "green"
  }'

# Update calendar widget
curl -X PATCH http://localhost:8080/api/user-layout/widget/calendar \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "style": {"fontSize": "1.5rem"}
  }'
```

---

## Testing

### Verify New Defaults

1. **Create new user:**
   ```bash
   curl -X POST http://localhost:8080/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"username":"newuser","email":"new@test.com","password":"pass123"}'
   ```

2. **Restart backend** (to trigger startup initialization)

3. **Check layout file:**
   ```bash
   cat data/users/newuser/layout.json
   ```

4. **Verify values:**
   - Suggestion: `"bottom": "bottom"` and `"color": "green"`
   - Calendar: `"fontSize": "1.5rem"`

### Verify Via API

```bash
# Login
TOKEN=$(curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"newuser","password":"pass123"}' \
  | jq -r '.token')

# Get layout
curl http://localhost:8080/api/user-layout \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.'
```

Expected output should match the template above.

---

## Visual Differences

### Suggestion Widget
- **Position Change:** `bottom: 20px` → `bottom: bottom`
  - Visual: Moves from "20px from bottom" to "at the very bottom"
- **Color Change:** `cyan` → `green`
  - Visual: Changes text color from cyan to green

### Calendar Widget
- **Font Size Change:** `1rem` → `1.5rem`
  - Visual: Text appears 50% larger (more readable)

---

## Code Changes

### WidgetDefaultsRegistry.java

**Location:** Lines 46-62

**Before:**
```java
// Suggestion widget
suggestion.setPosition(Map.of("bottom", "20px", "left", "50%", "transform", "translateX(-50%)"));
suggestion.setColor("cyan");

// Calendar widget
calendar.setStyle(Map.of("fontSize", "1rem", "maxWidth", "400px"));
```

**After:**
```java
// Suggestion widget
suggestion.setPosition(Map.of("bottom", "bottom", "left", "50%", "transform", "translateX(-50%)"));
suggestion.setColor("green");

// Calendar widget
calendar.setStyle(Map.of("fontSize", "1.5rem", "maxWidth", "400px"));
```

---

## Migration Guide

### For Development

If you have test users with old defaults:

```bash
# Remove all layout files
rm -rf data/users/*/layout.json

# Restart backend
./mvnw spring-boot:run

# All users will get new defaults on startup
```

### For Production

**Recommended Approach:** Don't force update existing users

Users may have customized their layouts. The changes are cosmetic and users can update manually if desired.

**If you need to force update:**

```sql
-- Option 1: SQL script to update via database
-- (Only if you store layouts in database)

-- Option 2: Backup and delete files
mv data/users data/users.backup
# Restart backend - will recreate all layouts
```

---

## Summary

✅ **Updated:** Suggestion widget position and color
✅ **Updated:** Calendar widget font size
✅ **Verified:** All new layouts use correct template
✅ **Preserved:** Existing user layouts unchanged
✅ **Documented:** All changes tracked

The default layout template now exactly matches the official specification from `/home/reyand/Downloads/Telegram Desktop/layout.json`.

---

## Checklist

- [x] Update WidgetDefaultsRegistry.java
- [x] Update documentation
- [x] Test new user creation
- [x] Verify startup initialization
- [x] Confirm JSON output format
- [x] Update all markdown files

**Changes are complete and ready for use!** ✅
