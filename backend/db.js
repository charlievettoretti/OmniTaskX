import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();
const { Pool } = pkg;

const isProduction = process.env.NODE_ENV === 'production';

const pool = new Pool ({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        require: true,
        rejectUnauthorized: false,
    }
});

// For LOCAL PostgreSQL Database

/*
const pool = new Pool ({
    host: process.env.PGHOST,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
    port: process.env.PGPORT,
    ssl: {                              // Added for Supabase
        rejectUnauthorized: false,
    },
});*/

// Supabase Error Response - stops from crashing
pool.on('error', (err, client) => {
    console.error('Unexpected error on idle client', err);
});

export default pool;