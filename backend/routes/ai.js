import express from 'express';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../db.js';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

router.post('/', async (req, res) => {
    const { userInput } = req.body;
    const user_id = req.user?.id;

    if (!userInput) {
        return res.status(400).json({ error: 'User input is required' });
    }

    if (!user_id) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        // Fetch all tasks for the user
        const tasksResult = await pool.query(
            `SELECT tasks.id, tasks.name, tasks.description, tasks.due_date, tasks.urgency,
                tasks.status, tasks.user_id, tasks.category_id,
                categories.name AS category_name, categories.color AS category_color
            FROM tasks
            LEFT JOIN categories ON tasks.category_id = categories.id
            WHERE tasks.user_id = $1`,
            [user_id]
        );

        // Fetch all events for the user
        const eventsResult = await pool.query(
            `SELECT events.id, events.name, events.description, events.start_time, events.end_time, 
            events.status, events.user_id, events.category_id, categories.name AS category_name, 
            categories.color AS category_color
            FROM events
            LEFT JOIN categories ON events.category_id = categories.id
            WHERE events.user_id = $1`,
            [user_id]
        );

        // Format the schedule data as JSON
        const scheduleData = {
            userInput: userInput,
            tasks: tasksResult.rows,
            events: eventsResult.rows
        };

        const aiScript = path.join(__dirname, '../ai/ai_agent_jess.py');
        const pythonProcess = spawn('python3', [aiScript]);

        let output = '';
        let errorOutput = '';

        // Send schedule data as JSON via stdin
        pythonProcess.stdin.write(JSON.stringify(scheduleData));
        pythonProcess.stdin.end();

        pythonProcess.stdout.on('data', (data) => {
            output += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            errorOutput += data.toString();
        });

        pythonProcess.on('close', (code) => {
            if (code === 0) {
                try {
                    const jsonResponse = JSON.parse(output);
                    res.json(jsonResponse);
                } catch (err) {
                    res.status(500).json({ 
                        error: 'Failed to parse AI response', 
                        raw: output,
                        details: err.message });
                }
            } else {
                res.status(500).json({ 
                    error: 'AI script error', 
                    details: errorOutput });
            }
        });
    } catch (err) {
        console.error('Error fetching schedule data:', err);
        res.status(500).json({ 
            error: 'Error fetching schedule data', 
            details: err.message });
    }
});

export default router;