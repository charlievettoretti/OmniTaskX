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
                tasks.status, tasks.user_id, tasks.category_id, tasks.estimated_duration_minutes, 
                tasks.energy_level, tasks.location_type, tasks.flexibility, tasks.is_habit, 
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

    const user_id = req.user?.id;
    if (!user_id) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

   const { 
    name, 
    description, 
    due_date, 
    status, 
    urgency, 
    category_id, 
    estimated_duration_minutes, 
    energy_level, 
    location_type, 
    flexibility,
    is_habit,
   } = req.body;
   try {
        const result = await pool.query(
            `INSERT INTO tasks (
                user_id, 
                name, 
                description, 
                due_date, 
                status, 
                urgency, 
                category_id, 
                estimated_duration_minutes, 
                energy_level, 
                location_type, 
                flexibility, 
                is_habit
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            RETURNING *`,
            [
                user_id, 
                name, 
                description, 
                due_date, 
                status, 
                urgency, 
                category_id, 
                estimated_duration_minutes ?? null, 
                energy_level ?? null, 
                location_type ?? null, 
                flexibility ?? null, 
                is_habit ?? false
            ]
    );
    res.status(201).json(result.rows[0]);
   } catch (err) {
    console.error('Error creating task', err);
    res.status(500).send('Error creating task');
   }
});

// UPDATE TASK
router.put('/:id', async (req, res) => {
    const task_id = req.params.id;
    const user_id = req.user?.id;

    if (!user_id) {
        return res.status(401).json({ error: 'Unauthorized'});
    }
    const { name, description, due_date, status, urgency, category_id, 
        estimated_duration_minutes, energy_level, location_type, flexibility, is_habit, 
    } = req.body;

    try {
        const result = await pool.query(        // CHANGED catagory to category_id
            `UPDATE tasks
             SET name = $1,
                category_id = $2,
                description = $3,
                due_date = $4,
                status = $5,
                urgency = $6,
                estimated_duration_minutes = $7, 
                energy_level = $8, 
                location_type = $9, 
                flexibility = $10, 
                is_habit = $11 
            WHERE id = $12 AND user_id = $13
            RETURNING *`,
            [name, category_id, description, due_date, status, urgency, 
                estimated_duration_minutes ?? null,
                energy_level ?? null,
                location_type ?? null, 
                flexibility ?? null, 
                is_habit ?? false, 
                task_id, user_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Task not found or not authorized'});
        }

        // Fetch the updated task with category information
        const updatedTask = await pool.query(
            `SELECT tasks.id, tasks.name, tasks.description, tasks.due_date, tasks.urgency,
                tasks.status, tasks.user_id, tasks.category_id, tasks.estimated_duration_minutes, 
                tasks.energy_level, tasks.location_type, tasks.flexibility, tasks.is_habit, 
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
                tasks.status, tasks.user_id, tasks.category_id, tasks.estimated_duration_minutes, 
                tasks.energy_level, tasks.location_type, tasks.flexibility, tasks.is_habit, 
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

// SCHEDULE GENERAL TASKS
router.post('/:id/schedule', async (req, res) => {
    const task_id = req.params.id;
    const user_id = req.user?.id;
  
    if (!user_id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  
    try {
      // Load the task we want to schedule
      const taskResult = await pool.query(
        `SELECT *
         FROM tasks
         WHERE id = $1 AND user_id = $2`,
        [task_id, user_id]
      );
  
      if (taskResult.rows.length === 0) {
        return res.status(404).json({ error: 'Task not found' });
      }
  
      const task = taskResult.rows[0];
  
      // Duration: default 30 min if missing
      const durationMinutes = task.estimated_duration_minutes || 30;
      const bufferMinutes = 30; // Buffer between blocks
      const msPerMinute = 60 * 1000;
  
      const now = new Date();
  
      // Decide target day: today if still before 8pm, otherwise tomorrow
      const cutoffHour = 20; // 8 PM
      const targetDay = new Date(now);
      if (now.getHours() >= cutoffHour) {
        targetDay.setDate(targetDay.getDate() + 1);
      }
      targetDay.setHours(0, 0, 0, 0); // midnight of target day
  
      // START OF DAY (when to start scheduling)
      const startOfDay = new Date(targetDay);
      startOfDay.setHours(9, 0, 0, 0); // 9:00 AM local time
  
      // END OF DAY (when to stop scheduling)
      const endOfDay = new Date(targetDay);
      endOfDay.setHours(18, 0, 0, 0); // 6:00 PM local time
  
      // Helper to format JS Date → 'YYYY-MM-DD HH:MM:SS' for DB
      const formatForDB = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      };
  
      const dayStr = formatForDB(startOfDay);
  
      //  Fetch busy blocks: scheduled tasks + events for that day
      //  pull them as strings (local) and durations in minutes
      const busyResult = await pool.query(
        `
        SELECT 
          to_char(due_date, 'YYYY-MM-DD HH24:MI:SS') AS start_str,
          COALESCE(estimated_duration_minutes, 30) AS duration_minutes
        FROM tasks
        WHERE user_id = $1
          AND due_date IS NOT NULL
          AND due_date::date = $2::date
        
        UNION ALL
        
        SELECT 
          to_char(start_time, 'YYYY-MM-DD HH24:MI:SS') AS start_str,
          EXTRACT(EPOCH FROM (end_time - start_time)) / 60 AS duration_minutes
        FROM events
        WHERE user_id = $1
          AND start_time::date = $2::date
        
        ORDER BY start_str ASC
        `,
        [user_id, dayStr]
      );
  
      // Parse busy blocks into local Date ranges
      const busyBlocks = busyResult.rows.map(row => {
        const [datePart, timePart] = row.start_str.split(' ');
        const [year, month, day] = datePart.split('-').map(Number);
        const [hours, minutes, seconds] = timePart.split(':').map(Number);
  
        const start = new Date(year, month - 1, day, hours, minutes, seconds);
        const duration = row.duration_minutes || 30;
        const end = new Date(start.getTime() + duration * msPerMinute);
  
        return { start, end };
      });
  
      //  Find earliest available slot (between 9:00–18:00)
      let candidateStart = new Date(startOfDay);
      const neededMs = durationMinutes * msPerMinute;
      const bufferMs = bufferMinutes * msPerMinute;
  
      for (const block of busyBlocks) {
        // If this busy block ends before our candidateStart, skip it
        if (block.end.getTime() <= candidateStart.getTime()) {
          continue;
        }
  
        // Check gap between candidateStart and this block's start
        const gapMs = block.start.getTime() - candidateStart.getTime();
  
        if (gapMs >= neededMs) {
          // enough free room before this block, we're good
          break;
        }
  
        // Otherwise, move candidateStart to after this block + buffer
        candidateStart = new Date(block.end.getTime() + bufferMs);
      }
  
      const candidateEnd = new Date(candidateStart.getTime() + neededMs);
  
      // If this would overflow the work day, bail (for now)
      if (candidateEnd > endOfDay) {
        return res.status(400).json({
          error: 'No free time slot available in work hours for this day',
        });
      }
  
      const formattedDate = formatForDB(candidateStart);
      console.log('Scheduling task at:', formattedDate);
  
      // Update the task's due_date to the scheduled time
      const updateResult = await pool.query(
        `
        UPDATE tasks
        SET due_date = $1
        WHERE id = $2 AND user_id = $3
        RETURNING *
        `,
        [formattedDate, task_id, user_id]
      );
  
      if (updateResult.rows.length === 0) {
        return res.status(404).json({ error: 'Task not found after update' });
      }
  
      // Return the updated task with category info
      const joined = await pool.query(
        `SELECT 
            tasks.id,
            tasks.name,
            tasks.description,
            tasks.due_date,
            tasks.urgency,
            tasks.status,
            tasks.user_id,
            tasks.category_id,
            tasks.estimated_duration_minutes,
            tasks.energy_level,
            tasks.location_type,
            tasks.flexibility,
            tasks.is_habit,
            categories.name  AS category_name,
            categories.color AS category_color
         FROM tasks
         LEFT JOIN categories ON tasks.category_id = categories.id
         WHERE tasks.id = $1 AND tasks.user_id = $2`,
        [task_id, user_id]
      );
  
      res.json(joined.rows[0]);
    } catch (err) {
      console.error('Error scheduling task', err);
      res.status(500).json({ error: 'Error scheduling task' });
    }
  });
  