import express from 'express';
import pool from '../config/db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Get user's notes
router.get('/', requireAuth, async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM notes WHERE userId = ? ORDER BY createdAt DESC', [req.user.id]);
  res.json(rows);
});

// Create note
router.post('/', requireAuth, async (req, res) => {
  const { title, content, tag } = req.body;
  if (!title || !content || !tag) return res.status(400).json({ message: 'Missing fields' });

  const [result] = await pool.query(
    'INSERT INTO notes (userId, title, content, tag, pinned, createdAt) VALUES (?, ?, ?, ?, ?, ?)',
    [req.user.id, title, content, tag, 0, new Date()]
  );
  const [rows] = await pool.query('SELECT * FROM notes WHERE id = ?', [result.insertId]);
  res.status(201).json(rows[0]);
});

// Update note
router.put('/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const { title, content, tag, pinned } = req.body;
  await pool.query('UPDATE notes SET title=?, content=?, tag=?, pinned=? WHERE id=? AND userId=?',
    [title, content, tag, pinned ? 1 : 0, id, req.user.id]);
  const [rows] = await pool.query('SELECT * FROM notes WHERE id = ? AND userId = ?', [id, req.user.id]);
  res.json(rows[0] || null);
});

// Delete note
router.delete('/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  await pool.query('DELETE FROM notes WHERE id = ? AND userId = ?', [id, req.user.id]);
  res.json({ success: true });
});

export default router;