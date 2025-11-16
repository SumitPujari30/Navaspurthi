const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../config/supabase');

// GET /api/schedules - Get all schedules
router.get('/', async (req, res) => {
  try {
    const { day } = req.query;

    let query = supabaseAdmin.from('schedules').select('*');
    
    if (day) {
      query = query.eq('day', day);
    }

    const { data, error } = await query.order('time', { ascending: true });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Group schedules by day
    const groupedSchedules = data?.reduce((acc, schedule) => {
      if (!acc[schedule.day]) {
        acc[schedule.day] = [];
      }
      acc[schedule.day].push(schedule);
      return acc;
    }, {});

    res.json({
      success: true,
      schedules: groupedSchedules || {}
    });

  } catch (error) {
    console.error('Schedules fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/schedules/:id - Get single schedule item
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabaseAdmin
      .from('schedules')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return res.status(404).json({ error: 'Schedule item not found' });
    }

    res.json({
      success: true,
      schedule: data
    });

  } catch (error) {
    console.error('Schedule fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/schedules - Create new schedule item (admin only)
router.post('/', async (req, res) => {
  try {
    // TODO: Add admin authentication middleware
    
    const {
      day,
      time,
      event,
      venue,
      type,
      description,
      speaker
    } = req.body;

    const { data, error } = await supabaseAdmin
      .from('schedules')
      .insert([
        {
          day,
          time,
          event,
          venue,
          type,
          description,
          speaker
        }
      ])
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json({
      success: true,
      schedule: data
    });

  } catch (error) {
    console.error('Schedule creation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/schedules/:id - Update schedule item (admin only)
router.put('/:id', async (req, res) => {
  try {
    // TODO: Add admin authentication middleware
    
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabaseAdmin
      .from('schedules')
      .update({
        ...updates,
        updated_at: new Date()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({
      success: true,
      schedule: data
    });

  } catch (error) {
    console.error('Schedule update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/schedules/:id - Delete schedule item (admin only)
router.delete('/:id', async (req, res) => {
  try {
    // TODO: Add admin authentication middleware
    
    const { id } = req.params;

    const { error } = await supabaseAdmin
      .from('schedules')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({
      success: true,
      message: 'Schedule item deleted successfully'
    });

  } catch (error) {
    console.error('Schedule deletion error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/schedules/bulk-update - Bulk update schedules (admin only)
router.post('/bulk-update', async (req, res) => {
  try {
    // TODO: Add admin authentication middleware
    
    const { schedules } = req.body;

    if (!schedules || !Array.isArray(schedules)) {
      return res.status(400).json({ error: 'Schedules array is required' });
    }

    // Process each schedule update
    const results = [];
    for (const schedule of schedules) {
      if (schedule.id) {
        // Update existing
        const { data, error } = await supabaseAdmin
          .from('schedules')
          .update(schedule)
          .eq('id', schedule.id)
          .select()
          .single();
        
        if (!error) {
          results.push({ action: 'updated', data });
        }
      } else {
        // Create new
        const { data, error } = await supabaseAdmin
          .from('schedules')
          .insert([schedule])
          .select()
          .single();
        
        if (!error) {
          results.push({ action: 'created', data });
        }
      }
    }

    res.json({
      success: true,
      message: `Processed ${results.length} schedule items`,
      results
    });

  } catch (error) {
    console.error('Bulk update error:', error);
    res.status(500).json({ error: 'Bulk update failed' });
  }
});

module.exports = router;
