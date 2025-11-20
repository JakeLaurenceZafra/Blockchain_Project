import { Wallet } from '../models/wallet'; // Assuming you have a Wallet model defined

export const connectWallet = async (req, res) => {
  const { walletType, walletAddress } = req.body;

  if (!walletType || !walletAddress) {
    return res.status(400).json({ message: 'Wallet type and address are required' });
  }

  try {
    // Logic to connect the wallet (e.g., save to database)
    const wallet = new Wallet({ walletType, walletAddress });
    await wallet.save();

    return res.status(200).json({ message: 'Wallet connected successfully', wallet });
  } catch (error) {
    return res.status(500).json({ message: 'Error connecting wallet', error });
  }
};

export const disconnectWallet = async (req, res) => {
  const { walletAddress } = req.body;

  if (!walletAddress) {
    return res.status(400).json({ message: 'Wallet address is required' });
  }

  try {
    // Logic to disconnect the wallet (e.g., remove from database)
    await Wallet.deleteOne({ walletAddress });

    return res.status(200).json({ message: 'Wallet disconnected successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Error disconnecting wallet', error });
  }
};