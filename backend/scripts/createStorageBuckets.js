const { supabaseAdmin } = require('../config/supabase');

async function createStorageBuckets() {
  console.log('🪣 Creating Supabase Storage Buckets...\n');

  const buckets = [
    { name: 'profiles', public: true, description: 'Profile images for registrations' },
    { name: 'ai-images', public: true, description: 'AI-generated portrait images' },
    { name: 'id-cards', public: true, description: 'Generated ID cards' },
    { name: 'trash', public: false, description: 'Deleted files (private)' }
  ];

  for (const bucket of buckets) {
    try {
      // Check if bucket exists
      const { data: existingBuckets, error: listError } = await supabaseAdmin.storage.listBuckets();
      
      if (listError) {
        console.error(`❌ Error listing buckets: ${listError.message}`);
        continue;
      }

      const bucketExists = existingBuckets.some(b => b.name === bucket.name);
      
      if (bucketExists) {
        console.log(`✅ Bucket '${bucket.name}' already exists`);
        continue;
      }

      // Create bucket
      const { data, error } = await supabaseAdmin.storage.createBucket(bucket.name, {
        public: bucket.public,
        allowedMimeTypes: bucket.name === 'trash' ? null : ['image/*'],
        fileSizeLimit: 10485760 // 10MB
      });

      if (error) {
        console.error(`❌ Failed to create bucket '${bucket.name}': ${error.message}`);
      } else {
        console.log(`✅ Created bucket '${bucket.name}' (${bucket.public ? 'public' : 'private'})`);
      }

    } catch (error) {
      console.error(`❌ Error creating bucket '${bucket.name}': ${error.message}`);
    }
  }

  console.log('\n🎉 Storage bucket setup complete!');
}

// Run if called directly
if (require.main === module) {
  createStorageBuckets()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('❌ Storage setup failed:', error);
      process.exit(1);
    });
}

module.exports = { createStorageBuckets };
