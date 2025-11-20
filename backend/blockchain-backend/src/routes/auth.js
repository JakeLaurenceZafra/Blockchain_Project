import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  const { name, username, password, cardanoAddress } = req.body;
  if (!name || !username || !password) return res.status(400).json({ message: 'Missing fields' });

  const [rows] = await pool.query('SELECT id FROM users WHERE username = ?', [username]);
  if (rows.length) return res.status(409).json({ message: 'Username exists' });

  const hashed = await bcrypt.hash(password, 10);
  const [result] = await pool.query(
    'INSERT INTO users (name, username, password, cardanoAddress, createdAt) VALUES (?, ?, ?, ?, ?)',
    [name, username, hashed, cardanoAddress || '', new Date()]
  );

  res.status(201).json({ id: result.insertId, username });
});

// Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: 'Missing fields' });

  const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
  const user = rows[0];
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

  const token = jwt.sign({ id: user.id, username: user.username, name: user.name }, process.env.JWT_SECRET, { expiresIn: '7d' });

  res.json({
    token,
    user: { id: user.id, username: user.username, name: user.name, cardanoAddress: user.cardanoAddress }
  });
});

export default router;