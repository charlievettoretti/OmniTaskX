import express from 'express';
import dotenv from 'dotenv';
import pool from './db.js';
import cors from 'cors';
import taskRoutes from './routes/tasks.js';
import authRoutes from './routes/auth.js';
import session from 'express-session';
import passport from 'passport';
import pgSession from 'connect-pg-simple';
import './passportConfig.js';
import catagoryRoutes from './routes/catagories.js';
import eventRoutes from './routes/events.js';
import groupRoutes from './routes/groups.js';
import groupTaskRoutes from './routes/groupTasks.js';
import aiRoutes from './routes/ai.js';


dotenv.config();

const app = express();
const PgSession = pgSession(session);
/*
const FRONTEND_WHITELIST = [
    'http://localhost:3000',
    'https://r08lxx6d-3000.use.devtunnels.ms/',
    'https://omnitaskx.com'
];*/

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());

app.use(
    session({
        store: new PgSession({ 
            pool,
            createTableIfMissing: true  // ONLY FOR DEV (TEMP?)
         }),
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 1000 * 60 * 60 * 24, // 1 day
            httpOnly: true,
            secure: false, // SET TO TRUE WHEN USING HTTPS
            sameSite: 'lax'
        }
    })
);
/*
app.use(cors({
    origin(origin, cb) {
      if (!origin || FRONTEND_WHITELIST.includes(origin)) return cb(null, true);
      return cb(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));

app.set('trust proxy', 1);

app.use(express.json());

app.use(
    session({
        store: new PgSession({ 
            pool,
            createTableIfMissing: true
         }),
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 1000 * 60 * 60 * 24, // 1 day
            httpOnly: true,
            secure: true,
            sameSite: 'none'
        }
    })
);
*/

app.use(passport.initialize());
app.use(passport.session());

app.use('/tasks', taskRoutes);
app.use('/auth', authRoutes);
app.use('/categories', catagoryRoutes);
app.use('/events', eventRoutes);
app.use('/groups', groupRoutes);
app.use('/group-tasks', groupTaskRoutes);
app.use('/ai', aiRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});