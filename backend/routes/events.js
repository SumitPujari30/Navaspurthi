const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../config/supabase');

// GET /api/events - Get all events
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;

    let query = supabaseAdmin.from('events').select('*');
    
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    const { data, error } = await query.order('date', { ascending: true });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({
      success: true,
      events: data
    });

  } catch (error) {
    console.error('Events fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/events/:id - Get single event
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabaseAdmin
      .from('events')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json({
      success: true,
      event: data
    });

  } catch (error) {
    console.error('Event fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/events - Create new event (admin only)
router.post('/', async (req, res) => {
  try {
    // TODO: Add admin authentication middleware
    
    const {
      title,
      category,
      description,
      date,
      time,
      venue,
      teamSize,
      prize,
      rules,
      image
    } = req.body;

    const { data, error } = await supabaseAdmin
      .from('events')
      .insert([
        {
          title,
          category,
          description,
          date,
          time,
          venue,
          team_size: teamSize,
          prize,
          rules,
          image,
          is_active: true
        }
      ])
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json({
      success: true,
      event: data
    });

  } catch (error) {
    console.error('Event creation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/events/:id - Update event (admin only)
router.put('/:id', async (req, res) => {
  try {
    // TODO: Add admin authentication middleware
    
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabaseAdmin
      .from('events')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({
      success: true,
      event: data
    });

  } catch (error) {
    console.error('Event update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/events/:id - Delete event (admin only)
router.delete('/:id', async (req, res) => {
  try {
    // TODO: Add admin authentication middleware
    
    const { id } = req.params;

    const { error } = await supabaseAdmin
      .from('events')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({
      success: true,
      message: 'Event deleted successfully'
    });

  } catch (error) {
    console.error('Event deletion error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
