import express from 'express';
import pool from '../db.js';
import crypto from 'crypto';

const router = express.Router();

// Creating a new group
router.post('/', async (req, res) => {
    const user_id = req.user?.id;
    const { name } = req.body;

    if (!user_id) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const joinKey = crypto.randomBytes(3).toString('hex').toUpperCase();

    try {
        const result = await pool.query(
            `INSERT INTO groups (name, owner_id, join_key)
            VALUES ($1, $2, $3)
            RETURNING *`,
            [name, user_id, joinKey]
        );
        const group = result.rows[0];

        await pool.query(
            `INSERT INTO group_members (group_id, user_id)
            VALUES ($1, $2)
            RETURNING *`,
            [group.id, user_id]
        );
        res.status(201).json(group);
    } catch (err) {
        console.error('Error creating group:', err);
        res.status(500).json({ error: 'Failed to create group' });
    }
});

// Joining a group
router.post('/join', async (req, res) => {
    const user_id = req.user?.id;
    const { join_key } = req.body;

    if (!user_id || !join_key) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const groupResult = await pool.query(
            `SELECT * FROM groups WHERE join_key = $1`,
            [join_key]
        );

        if (groupResult.rows.length === 0) {
            return res.status(404).json({ error: 'Group not found' });
        }

        const group = groupResult.rows[0];

        // Check if user is already in the group
        const memberResult = await pool.query(
            `SELECT * FROM group_members WHERE group_id = $1 AND user_id = $2`,
            [group.id, user_id]
        );

        if (memberResult.rows.length > 0) {
            return res.status(400).json({ error: 'User already in group' });
        }

        await pool.query(
            `INSERT INTO group_members (group_id, user_id)
            VALUES ($1, $2)
            RETURNING *`,
            [group.id, user_id]
        );

        res.status(200).json({ message: 'Joined group successfully' });
    } catch (err) {
        console.error('Error joining group:', err);
        res.status(500).json({ error: 'Failed to join group' });
    }
});

router.get('/', async (req, res) => {
    const user_id = req.user?.id;

    if (!user_id) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const result = await pool.query(
            `SELECT g.id, g.name, g.join_key, g.owner_id
            FROM groups g
            JOIN group_members gm ON gm.group_id = g.id
            WHERE gm.user_id = $1`,
            [user_id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching groups:', err);
        res.status(500).json({ error: 'Failed to fetch groups' });
    }
});

// Get group members
router.get('/:group_id/members', async (req, res) => {
    const user_id = req.user?.id;
    const { group_id } = req.params;

    if (!user_id) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        // Check if user is a member of the group
        const memberCheck = await pool.query(
            `SELECT * FROM group_members WHERE group_id = $1 AND user_id = $2`,
            [group_id, user_id]
        );

        if (memberCheck.rows.length === 0) {
            return res.status(403).json({ error: 'Not a member of this group' });
        }

        const result = await pool.query(
            `SELECT u.id, u.username, u.email
            FROM users u
            JOIN group_members gm ON gm.user_id = u.id
            WHERE gm.group_id = $1`,
            [group_id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching group members:', err);
        res.status(500).json({ error: 'Failed to fetch group members' });
    }
});

// Rename group (owner only)
router.patch('/:group_id/rename', async (req, res) => {
    const user_id = req.user?.id;
    const { group_id } = req.params;
    const { name } = req.body;

    if (!user_id) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!name || name.trim().length === 0) {
        return res.status(400).json({ error: 'Group name is required' });
    }

    try {
        // Check if user is the owner of the group
        const groupResult = await pool.query(
            `SELECT * FROM groups WHERE id = $1 AND owner_id = $2`,
            [group_id, user_id]
        );

        if (groupResult.rows.length === 0) {
            return res.status(403).json({ error: 'Only group owner can rename the group' });
        }

        const result = await pool.query(
            `UPDATE groups SET name = $1 WHERE id = $2 RETURNING *`,
            [name.trim(), group_id]
        );

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error renaming group:', err);
        res.status(500).json({ error: 'Failed to rename group' });
    }
});

// Remove member from group (owner only)
router.delete('/:group_id/members/:user_id', async (req, res) => {
    const user_id = req.user?.id;
    const { group_id, user_id: member_id } = req.params;

    if (!user_id) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        // Check if user is the owner of the group
        const groupResult = await pool.query(
            `SELECT * FROM groups WHERE id = $1 AND owner_id = $2`,
            [group_id, user_id]
        );

        if (groupResult.rows.length === 0) {
            return res.status(403).json({ error: 'Only group owner can remove members' });
        }

        // Check if trying to remove the owner
        if (parseInt(member_id) === parseInt(user_id)) {
            return res.status(400).json({ error: 'Cannot remove yourself from the group' });
        }

        // Check if member exists in the group
        const memberResult = await pool.query(
            `SELECT * FROM group_members WHERE group_id = $1 AND user_id = $2`,
            [group_id, member_id]
        );

        if (memberResult.rows.length === 0) {
            return res.status(404).json({ error: 'Member not found in group' });
        }

        // Remove member
        await pool.query(
            `DELETE FROM group_members WHERE group_id = $1 AND user_id = $2`,
            [group_id, member_id]
        );

        res.json({ message: 'Member removed successfully' });
    } catch (err) {
        console.error('Error removing member:', err);
        res.status(500).json({ error: 'Failed to remove member' });
    }
});

export default router;