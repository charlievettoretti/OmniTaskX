import express from 'express';
import bcrypt from 'bcrypt';
import passport from 'passport';
import pool from '../db.js';

const router = express.Router();
const SECRET = process.env.SESSION_SECRET || 'dev-secret-' + Math.random().toString(36).slice(2);

router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    

    try {
        const userExists = await pool.query(
            'SELECT * FROM users WHERE username = $1 or email = $2',
            [username, email]
        );

        if (userExists.rows.length > 0) {
            return res.status(400).json({ error: 'Username or email already in use' });
        }

        const hashedPass = await bcrypt.hash(password, 10);

        const result = await pool.query(
            'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING *',
            [username, email, hashedPass]
        );

        req.login(result.rows[0], (err) => {
            if (err) return res.status(500).json({ error: 'Login after registration failed' });
            res.status(201).json({ user: result.rows[0] });
        })

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Registration failed' });
    }
});
/*
router.post('/login', passport.authenticate('local'), (req, res) => {
    res.json({ message: 'Login Successful', user: req.user });
});*/
router.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            return res.status(500).json({ error: 'Internal server error' });
        }

        if (!user) {
            return res.status(401).json({ error: info.message || 'Incorrect email or password' });
        }

        req.logIn(user, (err) => {
            if (err) {
                return res.status(500).json({ error: 'Session save failed' });
            }
            return res.json({ message: 'Login successful', user });
        });
    })(req, res, next);
});


router.post('/logout', (req, res) => {
    req.logout((err) => {
        if (err) return res.status(500).json({ error: 'Logout Failed' });
        res.json({ message: 'Logout Successful' });
    });
});

router.get('/me', (req, res) => {
    if (req.isAuthenticated()) {
        res.json(req.user);
    } else {
        res.status(401).json({ error: 'Not authenticated' });
    }
});
/*

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = userResult.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id }, SECRET, { expiresIn: '1hr' });
    res.json({ token, userId: user.id });
});
*/

export default router;