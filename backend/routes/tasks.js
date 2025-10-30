import express from 'express';
import pool from '../db.js';

const router = express.Router();

// Get all tasks
router.get('/', async (req, res) => {
    const user_id = req.user?.id;
    if (!user_id) {
        return res.status(401).json({ error: 'Unauthorized '});
    }
    try {
        /*
        const result = await pool.query(
            'SELECT * FROM tasks WHERE user_id = $1',
            [user_id]
        );*/
        const result = await pool.query(
            `SELECT tasks.id, tasks.name, tasks.description, tasks.due_date, tasks.urgency,
                tasks.status, tasks.user_id, tasks.category_id,
                categories.name AS category_name, categories.color AS category_color
            FROM tasks
            LEFT JOIN categories ON tasks.category_id = categories.id
            WHERE tasks.user_id = $1`,
            [user_id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching tasks');
    }
});

// Create task
router.post('/', async (req, res) => {
    // NEED TO IMPLEMENT USER_ID INTO FRONT END
    /*
    const { user_id, name, description, due_date, status, urgency, catagory } = req.body;*/
    const user_id = req.user?.id;
    if (!user_id) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    /*
    const { name, description, due_date, status, urgency, catagory } = req.body;

    try {
        const result = await pool.query(
            'INSERT INTO tasks (user_id, name, description, due_date, status, urgency, catagory) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [user_id, name, description, due_date, status, urgency, catagory]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error creating task', err);
        res.status(500).send('Error creating task');
    }*/
   const { name, description, due_date, status, urgency, category_id } = req.body;
   try {
        const result = await pool.query(
            `INSERT INTO tasks (user_id, name, description, due_date, status, urgency, category_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *`,
            [user_id, name, description, due_date, status, urgency, category_id]
    );
    res.status(201).json(result.rows[0]);
   } catch (err) {
    console.error('Error creating task', err);
    res.status(500).send('Error creating task');
   }
});

router.put('/:id', async (req, res) => {
    const task_id = req.params.id;
    const user_id = req.user?.id;

    if (!user_id) {
        return res.status(401).json({ error: 'Unauthorized'});
    }
    const { name, description, due_date, status, urgency, category_id } = req.body;
    try {
        const result = await pool.query(        // CHANGED catagory to category_id
            `UPDATE tasks
             SET name = $1,
                category_id = $2,
                description = $3,
                due_date = $4,
                status = $5,
                urgency = $6
            WHERE id = $7 AND user_id = $8
            RETURNING *`,
            [name, category_id, description, due_date, status, urgency, task_id, user_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Task not found or not authorized'});
        }

        // Fetch the updated task with category information
        const updatedTask = await pool.query(
            `SELECT tasks.id, tasks.name, tasks.description, tasks.due_date, tasks.urgency,
                tasks.status, tasks.user_id, tasks.category_id,
                categories.name AS category_name, categories.color AS category_color
            FROM tasks
            LEFT JOIN categories ON tasks.category_id = categories.id
            WHERE tasks.id = $1 AND tasks.user_id = $2`,
            [task_id, user_id]
        );

        res.json(updatedTask.rows[0]);
    } catch (err) {
        console.error('Error updating task', err);
        res.status(500).send('Error updating task');
    }
});

router.patch('/:id/status', async (req, res) => {
    const task_id = req.params.id;
    const user_id = req.user?.id;
    const { status } = req.body;

    if (!user_id) {
        return res.status(401).json({ error: 'Unauthorized'});
    }
    try {
        const result = await pool.query(
            `UPDATE tasks
            SET status = $1
            WHERE id = $2 AND user_id = $3
            RETURNING *`,
            [status, task_id, user_id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Task not found or not authorized'});
        }

        // Fetch the updated task with category information
        const updatedTask = await pool.query(
            `SELECT tasks.id, tasks.name, tasks.description, tasks.due_date, tasks.urgency,
                tasks.status, tasks.user_id, tasks.category_id,
                categories.name AS category_name, categories.color AS category_color
            FROM tasks
            LEFT JOIN categories ON tasks.category_id = categories.id
            WHERE tasks.id = $1 AND tasks.user_id = $2`,
            [task_id, user_id]
        );

        res.json(updatedTask.rows[0]);
    } catch (err) {
        console.error('Error updating task status', err);
        res.status(500).send('Error updating task status');
    }
});

export default router;



// (name, description, due_date, status, urgency) 