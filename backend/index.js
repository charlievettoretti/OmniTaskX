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

// For Deployment
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const PgSession = pgSession(session);

// for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

// FROM CODECADEMY - if (process.env.NODE_ENV) === 'development' ->

/*
app.use(cors({
    origin: true,     // For Deployment - same Origin
    credentials: true
}));*/



app.use(express.json());

const isProduction = process.env.NODE_ENV === 'production'; // Changes based on production or not

app.set('trust proxy', 1);              // Allows secure cookies behind Render proxy

app.use(
    session({
        store: new PgSession({ 
            pool,
            //createTableIfMissing: true  // ONLY FOR DEV (TEMP?)
            createTableIfMissing: !isProduction
         }),
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 1000 * 60 * 60 * 24, // 1 day
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'none' : 'lax',
            //secure: false, // SET TO TRUE WHEN USING HTTPS
            //sameSite: 'lax'
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

if (isProduction) {
    const buildPath = path.join(__dirname, '..', 'build');

    app.use(express.static(buildPath));

    app.get('*', (req, res) => {
        res.sendFile(path.join(buildPath, 'index.html'));
    });
}

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});