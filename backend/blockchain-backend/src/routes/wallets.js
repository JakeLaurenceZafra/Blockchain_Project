import express from 'express';
import { connectWallet, disconnectWallet } from '../controllers/walletController.js';

const router = express.Router();

// Route to connect a wallet
router.post('/connect', connectWallet);

// Route to disconnect a wallet
router.post('/disconnect', disconnectWallet);

export default router;