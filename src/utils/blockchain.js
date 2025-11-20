import { Blaze, Blockfrost, Core, WebWallet } from '@blaze-cardano/sdk';

// Create Blockfrost provider instance
const createProvider = () => {
  // Create React App uses REACT_APP_ prefix for environment variables
  const projectId = process.env.REACT_APP_BLOCKFROST_PROJECT_ID || '';
  
  if (!projectId) {
    console.warn('Blockfrost Project ID not found. Please set REACT_APP_BLOCKFROST_PROJECT_ID in your .env file');
  }
  
  return new Blockfrost({
    network: 'cardano-preview',
    projectId: projectId,
  });
};

/**
 * Creates a blockchain transaction to record a note on the Cardano blockchain
 * Sends a minimal amount of ADA to the user's own wallet (only fees are paid)
 * 
 * @param {Object} walletApi - The Cardano wallet API from window.cardano[walletName].enable()
 * @param {string} walletAddress - The user's wallet address (bech32 format)
 * @param {Object} noteData - The note data to record (title, content, tag)
 * @returns {Promise<string>} Transaction hash
 */
export const createNoteTransaction = async (walletApi, walletAddress, noteData) => {
  try {
    if (!walletApi) {
      throw new Error('Wallet not connected');
    }

    if (!walletAddress) {
      throw new Error('Wallet address not available');
    }

    const provider = createProvider();
    const wallet = new WebWallet(walletApi);
    const blaze = await Blaze.from(provider, wallet);

    // Convert wallet address to bech32 if needed
    let recipientAddress;
    try {
      // Try to parse as bech32 first (most common format from wallet APIs)
      if (walletAddress.startsWith('addr')) {
        recipientAddress = Core.Address.fromBech32(walletAddress);
      } else {
        // If it's hex, convert it to bech32 (as in professor's code)
        recipientAddress = Core.Address.fromBytes(Buffer.from(walletAddress, 'hex'));
      }
    } catch (e) {
      // If bech32 parsing failed, try hex conversion
      try {
        recipientAddress = Core.Address.fromBytes(Buffer.from(walletAddress, 'hex'));
      } catch (e2) {
        throw new Error(`Invalid wallet address format: ${e.message}`);
      }
    }

    // Send minimal amount (1 lovelace = 0.000001 ADA) to own wallet
    // This ensures the transaction is recorded on blockchain with only fees paid
    const amount = 1n; // 1 lovelace (minimal amount)

    // Build transaction
    const tx = await blaze
      .newTransaction()
      .payLovelace(recipientAddress, amount)
      .complete();

    console.log('Transaction built for note:', noteData.title);

    // Sign transaction
    const signedTx = await blaze.signTransaction(tx);
    console.log('Transaction signed');

    // Submit to blockchain
    const txHash = await blaze.provider.postTransactionToChain(signedTx);
    console.log('Transaction submitted. Hash:', txHash);

    return txHash;
  } catch (error) {
    console.error('Error creating blockchain transaction:', error);
    throw error;
  }
};

/**
 * Checks if Cardano wallets are available in the browser
 * @returns {boolean}
 */
export const areWalletsAvailable = () => {
  return typeof window !== 'undefined' && window.cardano && Object.keys(window.cardano).length > 0;
};

/**
 * Gets list of available wallet names
 * @returns {string[]}
 */
export const getAvailableWallets = () => {
  if (!areWalletsAvailable()) {
    return [];
  }
  return Object.keys(window.cardano);
};

