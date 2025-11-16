const express = require('express');
const { supabaseAdmin } = require('../config/supabase');
const { registrationQueue } = require('../workers/registrationWorker');
const router = express.Router();

// GET /admin/registrations - Get all registrations
router.get('/registrations', async (req, res) => {
  try {
    const { page = 1, limit = 50, status, search } = req.query;
    const offset = (page - 1) * limit;

    let query = supabaseAdmin
      .from('new_registrations')
      .select('*', { count: 'exact' });

    // Apply filters
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%,registration_id.ilike.%${search}%`);
    }

    // Apply pagination and ordering
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: registrations, error, count } = await query;

    if (error) throw error;

    // Get signed URLs for images
    const registrationsWithUrls = await Promise.all(
      registrations.map(async (reg) => {
        const urls = {};

        if (reg.profile_image_path) {
          const { data: profileUrl } = await supabaseAdmin.storage
            .from('profiles')
            .createSignedUrl(reg.profile_image_path, 3600);
          urls.profile_image_url = profileUrl?.signedUrl;
        }

        if (reg.ai_image_path) {
          const { data: aiUrl } = await supabaseAdmin.storage
            .from('ai-images')
            .createSignedUrl(reg.ai_image_path, 3600);
          urls.ai_image_url = aiUrl?.signedUrl;
        }

        if (reg.id_card_path) {
          const { data: cardUrl } = await supabaseAdmin.storage
            .from('id-cards')
            .createSignedUrl(reg.id_card_path, 3600);
          urls.id_card_url = cardUrl?.signedUrl;
        }

        return { ...reg, ...urls };
      })
    );

    res.json({
      success: true,
      registrations: registrationsWithUrls,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });

  } catch (error) {
    console.error('❌ Admin registrations error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch registrations'
    });
  }
});

// POST /admin/reprocess/:id - Reprocess failed registration
router.post('/reprocess/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Get registration
    const { data: registration, error } = await supabaseAdmin
      .from('new_registrations')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !registration) {
      return res.status(404).json({
        success: false,
        error: 'Registration not found'
      });
    }

    // Reset status to processing
    await supabaseAdmin
      .from('new_registrations')
      .update({ 
        status: 'processing',
        error_message: null
      })
      .eq('id', id);

    // Add job to queue
    await registrationQueue.add('processRegistration', {
      registrationId: id,
      registration: registration
    }, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000,
      }
    });

    res.json({
      success: true,
      message: 'Registration queued for reprocessing'
    });

  } catch (error) {
    console.error('❌ Admin reprocess error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to reprocess registration'
    });
  }
});

// GET /admin/export - Export registrations as CSV
router.get('/export', async (req, res) => {
  try {
    const { status, event } = req.query;

    let query = supabaseAdmin
      .from('new_registrations')
      .select('*');

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    if (event) {
      query = query.eq('event_name', event);
    }

    query = query.order('created_at', { ascending: false });

    const { data: registrations, error } = await query;

    if (error) throw error;

    // Generate CSV
    const headers = [
      'Registration ID',
      'Name',
      'Email',
      'Phone',
      'College',
      'Age Group',
      'Event',
      'Status',
      'Created At'
    ];

    const csvRows = [
      headers.join(','),
      ...registrations.map(reg => [
        reg.registration_id,
        `"${reg.full_name}"`,
        reg.email,
        reg.phone,
        `"${reg.college}"`,
        reg.age_group,
        `"${reg.event_name}"`,
        reg.status,
        new Date(reg.created_at).toISOString()
      ].join(','))
    ];

    const csv = csvRows.join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="navaspurthi-registrations-${Date.now()}.csv"`);
    res.send(csv);

  } catch (error) {
    console.error('❌ Admin export error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to export registrations'
    });
  }
});

// GET /admin/stats - Get registration statistics
router.get('/stats', async (req, res) => {
  try {
    // Get overall stats
    const { data: stats, error: statsError } = await supabaseAdmin
      .from('new_registrations')
      .select('status, event_name, age_group, created_at');

    if (statsError) throw statsError;

    // Calculate statistics
    const totalRegistrations = stats.length;
    const statusCounts = stats.reduce((acc, reg) => {
      acc[reg.status] = (acc[reg.status] || 0) + 1;
      return acc;
    }, {});

    const eventCounts = stats.reduce((acc, reg) => {
      acc[reg.event_name] = (acc[reg.event_name] || 0) + 1;
      return acc;
    }, {});

    const ageGroupCounts = stats.reduce((acc, reg) => {
      acc[reg.age_group] = (acc[reg.age_group] || 0) + 1;
      return acc;
    }, {});

    // Daily registrations for the last 7 days
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    const dailyRegistrations = last7Days.map(date => {
      const count = stats.filter(reg => 
        reg.created_at.startsWith(date)
      ).length;
      return { date, count };
    });

    res.json({
      success: true,
      stats: {
        total: totalRegistrations,
        byStatus: statusCounts,
        byEvent: eventCounts,
        byAgeGroup: ageGroupCounts,
        dailyRegistrations
      }
    });

  } catch (error) {
    console.error('❌ Admin stats error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch statistics'
    });
  }
});

module.exports = router;
