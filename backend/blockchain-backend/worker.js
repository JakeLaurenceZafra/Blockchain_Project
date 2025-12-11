// worker.js - MySQL version
import 'dotenv/config';
import axios from 'axios';
import pool from './config/db.js'; // your MySQL pool

const BLOCKFROST_PROJECT_ID = process.env.BLOCKFROST_PROJECT_ID; // add this to .env
const API_BASE_URL = 'https://cardano-preview.blockfrost.io/api/v0';

console.log('Background worker started. Checking pending transactions every 20 seconds...');

async function checkPendingTransactions() {
  try {
    // Get all pending notes
    const [pendingNotes] = await pool.query("SELECT * FROM notes WHERE status='Pending'");
    
    if (pendingNotes.length === 0) {
      console.log('No pending transactions at the moment.');
      return;
    }

    for (const note of pendingNotes) {
      try {
        const response = await axios.get(`${API_BASE_URL}/txs/${note.txHash}`, {
          headers: { project_id: BLOCKFROST_PROJECT_ID }
        });

        if (response.status === 200) {
          // Update note status to 'Confirmed'
          await pool.query("UPDATE notes SET status=? WHERE id=?", ['Confirmed', note.id]);
          console.log(`Transaction confirmed: ${note.txHash}`);
        }

      } catch (err) {
        if (err.response && err.response.status === 404) {
          console.log(`Transaction not yet confirmed: ${note.txHash}`);
        } else {
          console.error(`Error checking transaction ${note.txHash}:`, err.message);
        }
      }
    }
  } catch (err) {
    console.error('Error fetching pending notes:', err.message);
  }
}

// Run every 20 seconds
setInterval(checkPendingTransactions, 20000);
