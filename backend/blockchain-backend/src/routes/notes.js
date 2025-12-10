import express from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import pool from '../config/db.js';

const router = express.Router();

/**
 * Use the connected wallet address as the identity for note ownership.
 * We keep using the existing users table so notes remain scoped by a numeric userId.
 * If a wallet has not been seen before, a lightweight user record is created on the fly.
 */
const getOrCreateWalletUser = async (walletAddress) => {
  const [existing] = await pool.query('SELECT id FROM users WHERE cardanoAddress = ?', [walletAddress]);
  if (existing.length > 0) {
    return existing[0].id;
  }

  const randomSecret = crypto.randomBytes(16).toString('hex');
  const hashed = await bcrypt.hash(randomSecret, 10);
  const username = `wallet_${walletAddress.slice(0, 8)}_${Date.now().toString(36)}`;
  const name = 'Wallet User';

  const [result] = await pool.query(
    'INSERT INTO users (name, username, password, cardanoAddress, createdAt) VALUES (?, ?, ?, ?, ?)',
    [name, username, hashed, walletAddress, new Date()]
  );

  return result.insertId;
};

// Require a wallet address on every notes request
router.use(async (req, res, next) => {
  const walletAddress =
    req.header('x-wallet-address') ||
    req.body?.walletAddress ||
    req.query?.walletAddress;

  if (!walletAddress) {
    return res.status(400).json({ message: 'Wallet address is required' });
  }

  try {
    const userId = await getOrCreateWalletUser(walletAddress);
    req.walletUserId = userId;
    req.walletAddress = walletAddress;
    next();
  } catch (error) {
    console.error('Failed to resolve wallet user:', error);
    res.status(500).json({ message: 'Unable to use wallet for authentication' });
  }
});

// Get wallet owner's notes
router.get('/', async (req, res) => {
  const [rows] = await pool.query(
    'SELECT * FROM notes WHERE userId = ? ORDER BY createdAt DESC',
    [req.walletUserId]
  );
  res.json(rows);
});

// Create note
router.post('/', async (req, res) => {
  const { title, content, tag, transactionId } = req.body;
  if (!title || !content || !tag) return res.status(400).json({ message: 'Missing fields' });

  const [result] = await pool.query(
    'INSERT INTO notes (userId, title, content, tag, pinned, transactionId, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [req.walletUserId, title, content, tag, 0, transactionId || null, new Date()]
  );
  const [rows] = await pool.query('SELECT * FROM notes WHERE id = ?', [result.insertId]);
  res.status(201).json(rows[0]);
});

// Update note
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { title, content, tag, pinned, transactionId } = req.body;
  
  console.log('Update note request:', { id, userId: req.walletUserId, body: req.body });
  
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
  
  values.push(id, req.walletUserId);
  console.log('Executing update query:', `UPDATE notes SET ${updates.join(', ')} WHERE id=? AND userId=?`, values);
  
  try {
    await pool.query(`UPDATE notes SET ${updates.join(', ')} WHERE id=? AND userId=?`, values);
    const [rows] = await pool.query('SELECT * FROM notes WHERE id = ? AND userId = ?', [id, req.walletUserId]);
    console.log('Note updated successfully:', rows[0]);
    res.json(rows[0] || null);
  } catch (error) {
    console.error('Error updating note:', error);
    res.status(500).json({ message: 'Error updating note', error: error.message });
  }
});

// Delete note
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  await pool.query('DELETE FROM notes WHERE id = ? AND userId = ?', [id, req.walletUserId]);
  res.json({ success: true });
});

export default router;