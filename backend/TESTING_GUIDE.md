# Testing Guide - Registration Flow

## Prerequisites

Before testing, ensure:
1. ✅ Backend is running (`npm run dev`)
2. ✅ Frontend is running (`npm run dev` in frontend folder)
3. ✅ Database tables are created in Supabase
4. ✅ Environment variables are configured

## Step-by-Step Testing

### 1. Setup Database (One-time)

```bash
# In backend folder
npm run show-schema
```

Copy the displayed SQL and run it in Supabase SQL Editor.

### 2. Start Backend

```bash
cd backend
npm run dev
```

**Expected Output:**
```
============================================================
🚀 Starting Navaspurthi 2025 Backend Server
============================================================

🔧 Initializing database schema...
✅ Database tables already exist. Skipping initialization.
============================================================
✅ Server running on port 5000
🌟 Environment: development
🔗 API Base URL: http://localhost:5000
============================================================

✅ Database connection verified!
✅ All systems operational!
```

### 3. Start Frontend

```bash
cd frontend
npm run dev
```

### 4. Test Registration Flow

#### A. Navigate to Registration Page
- Open browser: `http://localhost:5173/registration`

#### B. Fill Step 1 - Personal Information
- Full Name: `Test User`
- Email: `test@example.com`
- Phone: `9876543210`
- College: `Test College`
- Department: `Computer Science`
- Year: `3rd Year`
- Upload a profile image (JPG/PNG)
- Click **Next**

#### C. Fill Step 2 - Select Events
- Select at least one event (e.g., "AI Challenge")
- Click **Complete Registration**

#### D. Verify Success (Step 3)
- Should see registration ID (format: `NAVAS-YYYYMMDD-XXXX`)
- Should see success message
- Profile image should be uploaded

### 5. Verify in Admin Dashboard

#### A. Navigate to Admin Page
- Open: `http://localhost:5173/admin`

#### B. Check Registrations Tab
- Click **Registrations** in sidebar
- Should see the new registration in the table
- Verify all details are correct:
  - Name
  - Email
  - Phone
  - College
  - Events (as JSON array)
  - Status: `pending`
  - Registration date/time

#### C. Check Overview Stats
- Click **Overview** in sidebar
- Total Registrations should increment
- Active Events count should update
- Pending Approvals should show new registration

### 6. Verify in Supabase

#### A. Check Database
1. Go to Supabase Dashboard → Table Editor
2. Open `registrations` table
3. Find your test registration
4. Verify columns:
   - `registration_id`
   - `full_name`
   - `email`
   - `phone`
   - `college`
   - `department`
   - `year`
   - `events` (JSONB array)
   - `profile_image_path`
   - `status` = 'pending'
   - `created_at` timestamp

#### B. Check Storage
1. Go to Supabase Dashboard → Storage
2. Open `profiles` bucket
3. Should see uploaded profile image with filename: `NAVAS-YYYYMMDD-XXXX_timestamp.jpg`

## API Endpoints Testing

### Test with cURL or Postman

#### 1. Get All Registrations
```bash
curl http://localhost:5000/api/registrations
```

**Expected Response:**
```json
{
  "success": true,
  "count": 1,
  "registrations": [
    {
      "id": "uuid",
      "registration_id": "NAVAS-20250115-0001",
      "full_name": "Test User",
      "email": "test@example.com",
      "phone": "9876543210",
      "college": "Test College",
      "department": "Computer Science",
      "year": "3rd Year",
      "events": ["ai-challenge"],
      "profile_image_url": "https://...",
      "status": "pending",
      "created_at": "2025-01-15T..."
    }
  ]
}
```

#### 2. Create Registration (with file)
```bash
curl -X POST http://localhost:5000/api/registrations \
  -F "fullName=Test User 2" \
  -F "email=test2@example.com" \
  -F "phone=9876543211" \
  -F "college=Test College 2" \
  -F "department=IT" \
  -F "year=2nd Year" \
  -F "events=[\"hackathon\",\"dance-battle\"]" \
  -F "profileImage=@/path/to/image.jpg"
```

**Expected Response:**
```json
{
  "success": true,
  "registrationId": "NAVAS-20250115-0002",
  "data": { ... },
  "profileImageUrl": "https://...",
  "message": "Registration successful! Your AI profile is being generated."
}
```

## Common Issues & Solutions

### Issue 1: Tables Not Found
**Error:** `Could not find the table 'public.registrations'`

**Solution:**
1. Run `npm run show-schema`
2. Copy SQL and run in Supabase SQL Editor
3. Restart backend

### Issue 2: Profile Upload Fails
**Error:** `Failed to upload profile image`

**Solution:**
1. Check Supabase Storage → `profiles` bucket exists
2. Verify bucket is public or has proper policies
3. Check `SUPABASE_SERVICE_KEY` in `.env`

### Issue 3: Admin Dashboard Empty
**Error:** No registrations showing

**Solution:**
1. Check browser console for errors
2. Verify API call: `http://localhost:5000/api/registrations`
3. Check CORS settings in backend
4. Verify `VITE_API_URL` in frontend `.env`

### Issue 4: Registration ID Not Generated
**Error:** Registration succeeds but no ID shown

**Solution:**
1. Check backend console for errors
2. Verify response structure in Network tab
3. Check frontend `Registration.jsx` line ~94-95

## Success Criteria

✅ Backend starts without errors
✅ Database connection verified
✅ Registration form submits successfully
✅ Profile image uploads to Supabase Storage
✅ Data appears in Supabase `registrations` table
✅ Admin dashboard shows new registration
✅ Stats update correctly
✅ No console errors in browser or backend

## Next Steps After Testing

1. **Add Authentication** for admin routes
2. **Implement AI Image Generation** (currently placeholder)
3. **Add Email Notifications** for successful registrations
4. **Create ID Card Generation** feature
5. **Add Payment Integration** if needed
6. **Implement Registration Approval** workflow
