require('dotenv').config();
const axios = require('axios');
const mongoose = require('mongoose');
const Note = require('./models/Note'); // Make sure the path is correct

const BLOCKFROST_PROJECT_ID = process.env.BLOCKFROST_PROJECT_ID;
const API_BASE_URL = 'https://cardano-preview.blockfrost.io/api/v0';
const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('❌ MongoDB connection error:', err));

async function checkPendingTransactions() {
  try {
    const pendingNotes = await Note.find({ status: 'pending' });
    if (pendingNotes.length === 0) {
      console.log('No pending transactions at the moment.');
      return;
    }
    for (const note of pendingNotes) {
      try {
        const response = await axios.get(`${API_BASE_URL}/txs/${note.txhash}`, {
          headers: { project_id: BLOCKFROST_PROJECT_ID }
        });
        if (response.status === 200) {
          note.status = 'confirmed';
          await note.save();
          console.log(`Transaction confirmed: ${note.txhash}`);
        }
      } catch (err) {
        if (err.response && err.response.status === 404) {
          console.log(`Transaction not yet confirmed: ${note.txhash}`);
        } else {
          console.error(`Error checking transaction ${note.txhash}:`, err.message);
        }
      }
    }
  } catch (err) {
    console.error('Error fetching pending notes:', err.message);
  }
}

setInterval(checkPendingTransactions, 20000);
console.log('Background worker started. Checking pending transactions every 20 seconds...');
