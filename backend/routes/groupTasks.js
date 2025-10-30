import express from 'express';
import pool from '../db.js';

const router = express.Router();

// Get all group tasks for the current user across all their groups (used in TaskList)
router.get('/user/all', async (req, res) => {
    const user_id = req.user?.id;

    if (!user_id) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const result = await pool.query(
            `SELECT gt.*, json_agg(u.username) AS assigned_users,
                creator.username AS created_by_username,
                g.name AS group_name
            FROM group_tasks gt
            LEFT JOIN group_task_assignments gta ON gt.id = gta.task_id
            LEFT JOIN users u ON gta.user_id = u.id
            LEFT JOIN users creator ON gt.created_by = creator.id
            LEFT JOIN groups g ON gt.group_id = g.id
            WHERE gt.group_id IN (
                SELECT group_id FROM group_members WHERE user_id = $1
            )
            GROUP BY gt.id, creator.username, g.name
            ORDER BY gt.due_date ASC`,
            [user_id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching all group tasks:', err);
        res.status(500).json({ error: 'Failed to fetch group tasks' });
    }
});

router.get('/:group_id', async (req, res) => {
    const user_id = req.user?.id;
    const { group_id } = req.params;

    if (!user_id) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const result = await pool.query(
            `SELECT gt.*, json_agg(u.username) AS assigned_users,
                creator.username AS created_by_username
            FROM group_tasks gt
            LEFT JOIN group_task_assignments gta ON gt.id = gta.task_id
            LEFT JOIN users u ON gta.user_id = u.id
            LEFT JOIN users creator ON gt.created_by = creator.id
            WHERE gt.group_id = $1
            GROUP BY gt.id, creator.username
            ORDER BY gt.due_date ASC`,
            [group_id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching group tasks:', err);
        res.status(500).json({ error: 'Failed to fetch group tasks' });
    }
});

router.post('/:group_id', async (req, res) => {
    const user_id = req.user?.id;
    const { group_id } = req.params;
    const { name, description, due_date, urgency, assigned_user_ids } = req.body;

    if (!user_id) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const taskResult = await pool.query(
            `INSERT INTO group_tasks (group_id, name, description, due_date, urgency, created_by)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *`,
            [group_id, name, description, due_date, urgency, user_id]
        );

        const task = taskResult.rows[0];

        if (assigned_user_ids?.length) {
            const values = assigned_user_ids.map(uid => `(${task.id}, ${uid})`).join(',');
            await pool.query(
                `INSERT INTO group_task_assignments (task_id, user_id)
                VALUES ${values}`
            );
        }
        res.status(201).json(task);
    } catch (err) {
        console.error('Error creating group task:', err);
        res.status(500).json({ error: 'Failed to create group task' });
    }
});

router.patch('/:id/status', async (req, res) => {
    const groupTask_id = req.params.id;
    const user_id = req.user?.id;
    const { status } = req.body;

    if (!user_id) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const result = await pool.query(
            `UPDATE group_tasks
            SET status = $1
            WHERE id = $2
            RETURNING *`,
            [status, groupTask_id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Group task not found or not authorized' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating group task status:', err);
        res.status(500).json({ error: 'Failed to update group task status' });
    }
});

export default router;