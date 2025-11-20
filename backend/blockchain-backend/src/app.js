import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import notesRoutes from './routes/notes.js';
import pool from './config/db.js';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Health
app.get('/api/ping', (req, res) => res.json({ ok: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/notes', notesRoutes);

// Start after DB ping
const PORT = process.env.PORT || 4000;
const start = async () => {
  try {
    await pool.getConnection().then(c => c.release());
    console.log('Connected to MySQL');
    app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
  } catch (err) {
    console.error('DB connection failed:', err.message);
    process.exit(1);
  }
};

start();