import express from 'express';
import pool from '../db.js';

const router = express.Router();

router.get('/', async (req, res) => {
    const user_id = req.user?.id;
    if (!user_id) {
        return res.status(401).json({ error: 'Unauthorized'});
    }
    try {
        const result = await pool.query(
            'SELECT * FROM categories WHERE user_id = $1',
            [user_id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching categories', err);
        res.status(500).send('Error fetching categories');
    }
});

router.post('/', async (req, res) => {
    const user_id = req.user?.id;
    if (!user_id) {
        return res.status(401).json({ error: 'Unauthorized'});
    }
    const { name, color } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO categories (user_id, name, color)
            VALUES ($1, $2, $3)
            RETURNING *`,
            [user_id, name, color]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error creating category', err);
        res.status(500).send('Error creating category');
    }
});

router.put('/:id', async (req, res) => {
    const category_id = req.params.id;
    const user_id = req.user?.id;

    if (!user_id) {
        return res.status(401).json({ error: 'Unauthorized'});
    }
    const { name, color } = req.body;
    try {
        const result = await pool.query(
            `UPDATE categories
            SET name = $1,
                color = $2
            WHERE id = $3 AND user_id = $4
            RETURNING *`,
            [name, color, category_id, user_id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Category not found or not authorized'});
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating category', err);
        res.status(500).send('Error updating category');
    }
});

export default router;