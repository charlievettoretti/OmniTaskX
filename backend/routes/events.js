import express from 'express';
import pool from '../db.js';

const router = express.Router();

router.get('/', async (req, res) => {
    const user_id = req.user?.id;
    if (!user_id) {
        return res.status(401).json({ error: 'Unauthorized'});
    }
    try {
        /*
        const result = await pool.query(
            'SELECT * FROM events WHERE user_id = $1',
            [user_id]
        )*/
       const result = await pool.query(
            `SELECT events.id, events.name, events.description, events.start_time, events.end_time, 
            events.status, events.user_id, events.category_id, categories.name AS category_name, 
            categories.color AS category_color
            FROM events
            LEFT JOIN categories ON events.category_id = categories.id
            WHERE events.user_id = $1`,
            [user_id]
       );
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching events', err);
        res.status(500).send('Error fetching events');
    }
});

router.post('/', async (req, res) => {
    const user_id = req.user?.id;
    if (!user_id) {
        return res.status(401).json({ error: 'Unauthorized'});
    }
    const { name, description, start_time, end_time, category_id, status } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO events (user_id, name, description, start_time, end_time, category_id, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *`,
            [user_id, name, description, start_time, end_time, category_id, status]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error creating event', err);
        res.status(500).send('Error creating event');
    }
});

router.put('/:id', async (req, res) => {
    const event_id = req.params.id;
    const user_id = req.user?.id;
    
    //console.log('user_id:', user_id, 'event_id:', event_id);

    if (!user_id) {
        return res.status(401).json({ error: 'Unauthorized'});
    }
    const { name, description, start_time, end_time, category_id, status } = req.body;
    try {
        
        const result = await pool.query(
            `UPDATE events
            SET name = $1,
                description = $2,
                start_time = $3,
                end_time = $4,
                category_id = $5,
                status = $6
            WHERE id = $7 AND user_id = $8
            RETURNING *`,
            [name, description, start_time, end_time, category_id, status, event_id, user_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Event not found or not authorized'});
        }

        // Fetch the updated event with category information
        const updatedEvent = await pool.query(
            `SELECT events.id, events.name, events.description, events.start_time, events.end_time, 
            events.status, events.user_id, events.category_id, categories.name AS category_name, 
            categories.color AS category_color
            FROM events
            LEFT JOIN categories ON events.category_id = categories.id
            WHERE events.id = $1 AND events.user_id = $2`,
            [event_id, user_id]
        );

        res.json(updatedEvent.rows[0]);
    } catch (err) {
        console.error('Error updating event', err);
        res.status(500).send('Error updating event');
    }
});

router.patch('/:id/status', async (req, res) => {
    const event_id = req.params.id;
    const user_id = req.user?.id;
    const { status } = req.body;

    if (!user_id) {
        return res.status(401).json({ error: 'Unauthorized'});
    }
    try {
        const result = await pool.query(
            `UPDATE events
            SET status = $1
            WHERE id = $2 AND user_id = $3
            RETURNING *`,
            [status, event_id, user_id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Event not found or not authorized'});
        }

        // Fetch the updated event with category information
        const updatedEvent = await pool.query(
            `SELECT events.id, events.name, events.description, events.start_time, events.end_time, 
            events.status, events.user_id, events.category_id, categories.name AS category_name, 
            categories.color AS category_color
            FROM events
            LEFT JOIN categories ON events.category_id = categories.id
            WHERE events.id = $1 AND events.user_id = $2`,
            [event_id, user_id]
        );

        res.json(updatedEvent.rows[0]);
    } catch (err) {
        console.error('Error updating event status', err);
        res.status(500).send('Error updating event status');
    }
})

export default router;