import { Blaze, Blockfrost, Core, WebWallet } from '@blaze-cardano/sdk';

// Create Blockfrost provider instance
export const createProvider = () => {
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
// Helper: format metadata string respecting 64-byte Cardano limit
const formatContent = (content) => {
  if ((content || '').length <= 64) {
    return Core.Metadatum.newText(content || '');
  }
  const chunks = (content || '').match(/.{1,64}/g) || [];
  const list = new Core.MetadatumList();
  chunks.forEach((chunk) => list.add(Core.Metadatum.newText(chunk)));
  return Core.Metadatum.newList(list);
};

/**
 * Build / sign / submit a transaction with metadata that captures note info.
 * The note is also persisted in the local DB for instant UX.
 */

const toErrorMessage = (err) => {
  if (!err) return 'Unknown error';
  if (typeof err === 'string') return err;
  if (err.message) return err.message;
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
};

export const sendTransaction = async ({
  provider,
  walletApi,
  targetAddress,
  lovelaceAmount = 4_000_000n, // 4 ADA to comfortably satisfy min-ADA/fees on preview
  noteContent,
  noteTitle,
  noteTag,
  noteId,
  action
}) => {
  if (!walletApi) throw new Error('Wallet not connected');
  if (!targetAddress) throw new Error('Wallet address not available');
  if (!action) throw new Error('Missing action for metadata');

  const buildAndSubmit = async () => {
    const wallet = new WebWallet(walletApi);
    const blaze = await Blaze.from(provider, wallet);

    // CIP-30 wallets expose getUtxos; WebWallet may not proxy it, so call the raw api
    const utxoList = typeof walletApi.getUtxos === 'function' ? await walletApi.getUtxos() : [];
    if (!utxoList || utxoList.length === 0) {
      throw new Error('No UTxOs available in wallet. Fund your preview address first.');
    }

    const recipientAddress = targetAddress.startsWith('addr')
      ? Core.Address.fromBech32(targetAddress)
      : Core.Address.fromBytes(Buffer.from(targetAddress, 'hex'));

    // Begin tx
    let tx = blaze.newTransaction().payLovelace(recipientAddress, lovelaceAmount);
    // Prefer using the wallet's change address to avoid change to a different addr
    if (typeof walletApi.getChangeAddress === 'function') {
      const changeAddrHex = await walletApi.getChangeAddress();
      const changeAddr = Core.Address.fromBytes(Buffer.from(changeAddrHex, 'hex'));
      tx = tx.setChangeAddress(changeAddr);
    }

    // --- Metadata construction ---
    const metadata = new Map();
    const label = 42819n; // app-specific label
    const metadatumMap = new Core.MetadatumMap();

    metadatumMap.insert(Core.Metadatum.newText('action'), Core.Metadatum.newText(action));
    metadatumMap.insert(Core.Metadatum.newText('note'), formatContent(noteContent || ''));
    if (noteTitle) {
      metadatumMap.insert(Core.Metadatum.newText('title'), formatContent(noteTitle));
    }
    if (noteTag) {
      metadatumMap.insert(Core.Metadatum.newText('tag'), Core.Metadatum.newText(noteTag));
    }
    metadatumMap.insert(Core.Metadatum.newText('created_at'), Core.Metadatum.newText(new Date().toISOString()));
    if (noteId) {
      metadatumMap.insert(Core.Metadatum.newText('note_id'), Core.Metadatum.newText(String(noteId)));
    }

    const metadatum = Core.Metadatum.newMap(metadatumMap);
    metadata.set(label, metadatum);
    const finalMetadata = new Core.Metadata(metadata);
    tx.setMetadata(finalMetadata);

    const completedTx = await tx.complete();
    const signedTx = await blaze.signTransaction(completedTx);
    const txId = await blaze.provider.postTransactionToChain(signedTx);
    return txId;
  };

  // Retry loop: keep to a single attempt to avoid repeated signing prompts.
  // If you want auto-retry, raise this, but wallets will prompt to sign each time.
  const maxAttempts = 1;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await buildAndSubmit();
    } catch (err) {
      const message = toErrorMessage(err);
      const isSignError =
        message.includes('TxSignError') ||
        message.includes('user declined') ||
        message.includes('"code":2');
      const isUtxoError =
        message.includes('BadInputsUTxO') ||
        message.includes('ValueNotConservedUTxO') ||
        message.includes('TxValidationError');
      const isLast = attempt === maxAttempts;
      // Do not retry on signing errors, and limit retries to avoid multiple prompts.
      if (isSignError || !isUtxoError || isLast) {
        const friendly = isUtxoError ? `UTxO/validation error: ${message}` : message;
        throw new Error(friendly);
      }
      // brief delay to allow pending txs to confirm, then retry with fresh UTxOs
      await new Promise(res => setTimeout(res, 5000));
    }
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

