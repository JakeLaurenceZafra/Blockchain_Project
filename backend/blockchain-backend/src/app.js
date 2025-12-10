import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import notesRoutes from './routes/notes.js';
import pool from './config/db.js';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Ensure tables have the columns we rely on (idempotent)
const ensureNotesSchema = async () => {
  const [columns] = await pool.query(
    `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'notes'`
  );
  const existing = new Set(columns.map((c) => c.COLUMN_NAME));
  const alters = [];
  if (!existing.has('status')) alters.push(`ADD COLUMN status VARCHAR(32) DEFAULT 'Pending'`);
  if (!existing.has('txHash')) alters.push(`ADD COLUMN txHash VARCHAR(128) NULL`);
  if (!existing.has('walletAddress')) alters.push(`ADD COLUMN walletAddress VARCHAR(255) NULL`);
  if (alters.length > 0) {
    await pool.query(`ALTER TABLE notes ${alters.join(', ')}`);
    console.log('notes table altered to include:', alters.join(', '));
  }
};

// Health
app.get('/api/ping', (req, res) => res.json({ ok: true }));

// Routes
app.use('/api/notes', notesRoutes);

// Start after DB ping
const PORT = process.env.PORT || 4000;
const start = async () => {
  try {
    await pool.getConnection().then(c => c.release());
    console.log('Connected to MySQL');
    await ensureNotesSchema();
    app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
  } catch (err) {
    console.error('DB connection failed:', err.message);
    process.exit(1);
  }
};

start();