# Database Setup Instructions

## Quick Setup (5 minutes)

Your backend is running but the database tables haven't been created yet. Follow these simple steps:

### Step 1: Open Supabase Dashboard
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project: **Navaspurthi 2025**

### Step 2: Open SQL Editor
1. Click on **SQL Editor** in the left sidebar
2. Click **New query** button

### Step 3: Run the Schema
1. Open the file: `backend/database/schema.sql`
2. **Copy ALL the contents** of that file (Ctrl+A, then Ctrl+C)
3. **Paste** into the Supabase SQL Editor
4. Click the **RUN** button (or press Ctrl+Enter)

### Step 4: Verify Tables Created
1. Click on **Table Editor** in the left sidebar
2. You should now see these tables:
   - ✅ registrations
   - ✅ events
   - ✅ admins
   - ✅ schedules
   - ✅ event_registrations
   - ✅ gallery
   - ✅ chatbot_logs
   - ✅ feedback
   - ✅ sponsors

### Step 5: Restart Backend
1. Go back to your terminal
2. Stop the backend (Ctrl+C if needed)
3. Run: `npm run dev`
4. You should see: **✅ Database connection verified!**

## Troubleshooting

### Error: "relation already exists"
- This is OK! It means some tables were already created
- The script will skip existing tables automatically

### Error: "permission denied"
- Make sure you're using the **service_role** key in your `.env` file
- Check that `SUPABASE_SERVICE_KEY` is set correctly

### Tables still not showing
1. Refresh the Supabase dashboard
2. Make sure you're looking at the **public** schema
3. Check the SQL Editor for any error messages

## What Gets Created

The schema creates:
- **8 tables** for storing all application data
- **Indexes** for faster queries
- **Row Level Security (RLS)** policies for data protection
- **Triggers** for automatic timestamp updates
- **Sample data** for testing (optional)

## Need Help?

If you're still having issues:
1. Check the backend console for specific error messages
2. Verify your Supabase credentials in `.env`
3. Make sure your Supabase project is active and not paused
