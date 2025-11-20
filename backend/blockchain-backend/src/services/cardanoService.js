import axios from 'axios';

const CARDANO_API_URL = process.env.CARDANO_API_URL; // Set your Cardano API URL in the environment variables

export const getWalletBalance = async (walletAddress) => {
  try {
    const response = await axios.get(`${CARDANO_API_URL}/wallets/${walletAddress}/balance`);
    return response.data;
  } catch (error) {
    throw new Error('Error fetching wallet balance: ' + error.message);
  }
};

export const sendTransaction = async (transactionData) => {
  try {
    const response = await axios.post(`${CARDANO_API_URL}/transactions`, transactionData);
    return response.data;
  } catch (error) {
    throw new Error('Error sending transaction: ' + error.message);
  }
};

// Additional Cardano-related functions can be added here as needed.