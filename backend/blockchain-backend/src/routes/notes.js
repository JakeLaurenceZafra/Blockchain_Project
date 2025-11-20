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
  const { title, content, tag, transactionId } = req.body;
  if (!title || !content || !tag) return res.status(400).json({ message: 'Missing fields' });

  const [result] = await pool.query(
    'INSERT INTO notes (userId, title, content, tag, pinned, transactionId, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [req.user.id, title, content, tag, 0, transactionId || null, new Date()]
  );
  const [rows] = await pool.query('SELECT * FROM notes WHERE id = ?', [result.insertId]);
  res.status(201).json(rows[0]);
});

// Update note
router.put('/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const { title, content, tag, pinned, transactionId } = req.body;
  
  console.log('Update note request:', { id, userId: req.user.id, body: req.body });
  
  // Build update query dynamically based on provided fields
  const updates = [];
  const values = [];
  
  if (title !== undefined) {
    updates.push('title=?');
    values.push(title);
  }
  if (content !== undefined) {
    updates.push('content=?');
    values.push(content);
  }
  if (tag !== undefined) {
    updates.push('tag=?');
    values.push(tag);
  }
  if (pinned !== undefined) {
    updates.push('pinned=?');
    values.push(pinned ? 1 : 0);
  }
  if (transactionId !== undefined) {
    updates.push('transactionId=?');
    values.push(transactionId);
    console.log('Adding transactionId to update:', transactionId);
  }
  
  if (updates.length === 0) {
    console.log('No fields to update');
    return res.status(400).json({ message: 'No fields to update' });
  }
  
  values.push(id, req.user.id);
  console.log('Executing update query:', `UPDATE notes SET ${updates.join(', ')} WHERE id=? AND userId=?`, values);
  
  try {
    await pool.query(`UPDATE notes SET ${updates.join(', ')} WHERE id=? AND userId=?`, values);
    const [rows] = await pool.query('SELECT * FROM notes WHERE id = ? AND userId = ?', [id, req.user.id]);
    console.log('Note updated successfully:', rows[0]);
    res.json(rows[0] || null);
  } catch (error) {
    console.error('Error updating note:', error);
    res.status(500).json({ message: 'Error updating note', error: error.message });
  }
});

// Delete note
router.delete('/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  await pool.query('DELETE FROM notes WHERE id = ? AND userId = ?', [id, req.user.id]);
  res.json({ success: true });
});

export default router;