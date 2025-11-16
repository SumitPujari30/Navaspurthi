# Supabase Storage Buckets Setup

## Required Buckets

Your application needs 2 storage buckets in Supabase:

### 1. `profiles` bucket
- **Purpose:** Store user profile images uploaded during registration
- **Access:** Public (so images can be displayed)

### 2. `ai-images` bucket  
- **Purpose:** Store AI-generated profile images (future feature)
- **Access:** Public

## How to Create Buckets

### Step 1: Go to Storage
1. Open your Supabase project: https://supabase.com/dashboard
2. Click **Storage** in the left sidebar

### Step 2: Create `profiles` Bucket
1. Click **New bucket** button
2. Enter name: `profiles`
3. **IMPORTANT:** Toggle **Public bucket** to ON
4. Click **Create bucket**

### Step 3: Create `ai-images` Bucket
1. Click **New bucket** button again
2. Enter name: `ai-images`
3. **IMPORTANT:** Toggle **Public bucket** to ON
4. Click **Create bucket**

### Step 4: Verify Buckets
You should now see both buckets listed:
- ✅ profiles (Public)
- ✅ ai-images (Public)

## Alternative: Set Bucket Policies (If Not Public)

If you prefer to keep buckets private and use policies instead:

### For `profiles` bucket:
```sql
-- Allow service role to upload
CREATE POLICY "Service role can upload to profiles"
ON storage.objects FOR INSERT
TO service_role
WITH CHECK (bucket_id = 'profiles');

-- Allow public to view
CREATE POLICY "Public can view profiles"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'profiles');
```

### For `ai-images` bucket:
```sql
-- Allow service role to upload
CREATE POLICY "Service role can upload to ai-images"
ON storage.objects FOR INSERT
TO service_role
WITH CHECK (bucket_id = 'ai-images');

-- Allow public to view
CREATE POLICY "Public can view ai-images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'ai-images');
```

## Testing Storage

After creating buckets, test by:

1. Starting your backend: `npm run dev`
2. Submitting a registration with a profile image
3. Check Supabase Storage → `profiles` bucket
4. You should see the uploaded image file

## Troubleshooting

### Error: "Bucket not found"
- Make sure bucket names are exactly: `profiles` and `ai-images` (lowercase, no spaces)
- Refresh Supabase dashboard

### Error: "Permission denied"
- Make sure buckets are set to **Public**
- Or add the policies shown above

### Images not displaying
- Check that buckets are public
- Verify the signed URL is being generated correctly
- Check browser console for CORS errors
