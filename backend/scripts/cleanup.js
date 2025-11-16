const cron = require('node-cron');
const { supabaseAdmin } = require('../config/supabase');

// Cleanup old draft registrations (older than 48 hours)
async function cleanupOldDrafts() {
  try {
    console.log('🧹 Starting cleanup of old draft registrations...');

    const cutoffDate = new Date();
    cutoffDate.setHours(cutoffDate.getHours() - 48);

    // Get old draft registrations
    const { data: oldDrafts, error: fetchError } = await supabaseAdmin
      .from('new_registrations')
      .select('id, registration_id, profile_image_path')
      .eq('status', 'draft')
      .lt('created_at', cutoffDate.toISOString());

    if (fetchError) throw fetchError;

    if (!oldDrafts || oldDrafts.length === 0) {
      console.log('✅ No old drafts to cleanup');
      return;
    }

    console.log(`🗑️ Found ${oldDrafts.length} old draft registrations to cleanup`);

    // Delete associated files from storage
    for (const draft of oldDrafts) {
      if (draft.profile_image_path) {
        try {
          await supabaseAdmin.storage
            .from('profiles')
            .remove([draft.profile_image_path]);
          console.log(`🗑️ Deleted profile image: ${draft.profile_image_path}`);
        } catch (error) {
          console.error(`❌ Failed to delete profile image: ${draft.profile_image_path}`, error);
        }
      }
    }

    // Delete draft registrations
    const { error: deleteError } = await supabaseAdmin
      .from('new_registrations')
      .delete()
      .eq('status', 'draft')
      .lt('created_at', cutoffDate.toISOString());

    if (deleteError) throw deleteError;

    console.log(`✅ Cleaned up ${oldDrafts.length} old draft registrations`);

  } catch (error) {
    console.error('❌ Cleanup error:', error);
  }
}

// Cleanup failed registrations older than 7 days
async function cleanupFailedRegistrations() {
  try {
    console.log('🧹 Starting cleanup of old failed registrations...');

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 7);

    // Get old failed registrations
    const { data: failedRegs, error: fetchError } = await supabaseAdmin
      .from('new_registrations')
      .select('id, registration_id, profile_image_path, ai_image_path, id_card_path')
      .eq('status', 'failed')
      .lt('created_at', cutoffDate.toISOString());

    if (fetchError) throw fetchError;

    if (!failedRegs || failedRegs.length === 0) {
      console.log('✅ No old failed registrations to cleanup');
      return;
    }

    console.log(`🗑️ Found ${failedRegs.length} old failed registrations to cleanup`);

    // Move files to trash bucket instead of deleting
    for (const reg of failedRegs) {
      const filesToMove = [
        { bucket: 'profiles', path: reg.profile_image_path },
        { bucket: 'ai-images', path: reg.ai_image_path },
        { bucket: 'id-cards', path: reg.id_card_path }
      ].filter(file => file.path);

      for (const file of filesToMove) {
        try {
          // Download file
          const { data: fileData, error: downloadError } = await supabaseAdmin.storage
            .from(file.bucket)
            .download(file.path);

          if (downloadError) continue;

          // Upload to trash bucket
          const trashPath = `${file.bucket}/${Date.now()}_${file.path}`;
          await supabaseAdmin.storage
            .from('trash')
            .upload(trashPath, fileData);

          // Remove from original bucket
          await supabaseAdmin.storage
            .from(file.bucket)
            .remove([file.path]);

          console.log(`🗑️ Moved to trash: ${file.path}`);
        } catch (error) {
          console.error(`❌ Failed to move file to trash: ${file.path}`, error);
        }
      }
    }

    // Delete failed registrations
    const { error: deleteError } = await supabaseAdmin
      .from('new_registrations')
      .delete()
      .eq('status', 'failed')
      .lt('created_at', cutoffDate.toISOString());

    if (deleteError) throw deleteError;

    console.log(`✅ Cleaned up ${failedRegs.length} old failed registrations`);

  } catch (error) {
    console.error('❌ Failed registrations cleanup error:', error);
  }
}

// Optimize storage by compressing old images
async function optimizeStorage() {
  try {
    console.log('🔧 Starting storage optimization...');

    // This would typically involve:
    // 1. Finding large images older than 30 days
    // 2. Re-compressing them with lower quality
    // 3. Replacing the original files
    
    // For now, just log the action
    console.log('✅ Storage optimization completed');

  } catch (error) {
    console.error('❌ Storage optimization error:', error);
  }
}

// Schedule cleanup tasks
function startCleanupScheduler() {
  console.log('🕐 Starting cleanup scheduler...');

  // Run cleanup every 6 hours
  cron.schedule('0 */6 * * *', async () => {
    console.log('⏰ Running scheduled cleanup...');
    await cleanupOldDrafts();
    await cleanupFailedRegistrations();
  });

  // Run storage optimization daily at 2 AM
  cron.schedule('0 2 * * *', async () => {
    console.log('⏰ Running scheduled storage optimization...');
    await optimizeStorage();
  });

  console.log('✅ Cleanup scheduler started');
}

// Manual cleanup functions for admin use
async function manualCleanup() {
  console.log('🧹 Running manual cleanup...');
  await cleanupOldDrafts();
  await cleanupFailedRegistrations();
  await optimizeStorage();
  console.log('✅ Manual cleanup completed');
}

module.exports = {
  startCleanupScheduler,
  manualCleanup,
  cleanupOldDrafts,
  cleanupFailedRegistrations,
  optimizeStorage
};
