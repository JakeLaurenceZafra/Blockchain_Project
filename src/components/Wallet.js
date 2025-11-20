import React, { useState, useEffect } from 'react';
import './Wallet.css';
import { getAvailableWallets, areWalletsAvailable } from '../utils/blockchain';
import { useWallet } from '../contexts/WalletContext';

const Wallet = () => {
  const { 
    isConnected: is_connected, 
    walletType: wallet_type, 
    walletAddress: wallet_address,
    connectWallet,
    disconnectWallet: handleDisconnectContext
  } = useWallet();
  
  const [show_connect_form, setShowConnectForm] = useState(false);
  const [selected_wallet_type, setSelectedWalletType] = useState('');
  const [show_success, setShowSuccess] = useState(false);
  const [recipient_address, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [available_wallets, setAvailableWallets] = useState([]);
  const [connection_error, setConnectionError] = useState('');

  // Check for available wallets on mount and when window.cardano changes
  useEffect(() => {
    const checkWallets = () => {
      if (areWalletsAvailable()) {
        const wallets = getAvailableWallets();
        setAvailableWallets(wallets);
      } else {
        setAvailableWallets([]);
      }
    };

    checkWallets();
    
    // Check periodically in case wallet extension loads later
    const interval = setInterval(checkWallets, 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Update local state when wallet context changes
  useEffect(() => {
    if (is_connected) {
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    }
  }, [is_connected]);

  const handleConnectClick = () => {
    if (is_connected) {
      // Show wallet view
      setShowConnectForm(false);
    } else {
      // Show connect form
      setShowConnectForm(true);
    }
  };

  const handleConnectWallet = async () => {
    if (!selected_wallet_type) {
      alert('Please select a wallet type');
      return;
    }

    setConnectionError('');
    
    try {
      // Check if wallet is available
      if (!window.cardano || !window.cardano[selected_wallet_type]) {
        throw new Error(`${selected_wallet_type} wallet not found. Please install the wallet extension.`);
      }

      // Enable wallet connection
      const api = await window.cardano[selected_wallet_type].enable();

      // Get wallet address
      // Try getChangeAddress first (most common), then getAddresses
      let address;
      try {
        address = await api.getChangeAddress();
      } catch (e) {
        try {
          const addresses = await api.getAddresses();
          address = addresses[0];
        } catch (e2) {
          throw new Error('Could not retrieve wallet address');
        }
      }
      
      // Cardano wallet APIs typically return bech32 addresses directly
      // Store the address as-is (should be bech32 format)
      const bech32Address = typeof address === 'string' ? address : address.toString();

      // Use context to connect wallet
      await connectWallet(selected_wallet_type, api, bech32Address);
      
      setShowSuccess(true);
      setShowConnectForm(false);
      setConnectionError('');

      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error connecting to wallet:', error);
      setConnectionError(error.message || 'Failed to connect to wallet');
      alert(`Failed to connect to wallet: ${error.message}`);
    }
  };

  const handleDisconnect = () => {
    handleDisconnectContext();
    setShowConnectForm(false);
    setShowSuccess(false);
    setConnectionError('');
  };

  const handleMakeTransaction = (event) => {
    event.preventDefault();
    if (!recipient_address.trim() || !amount.trim()) {
      alert('Please fill in all fields');
      return;
    }
    alert(`Transaction initiated!\nTo: ${recipient_address}\nAmount: ${amount} ADA`);
    // In a real app, this would initiate the actual transaction
  };

  return (
    <div className="wallet_container">
      <div className="wallet_box">
        <h1 className="wallet_title">Wallet</h1>
        
        {/* Status Section */}
        <div className="wallet_status">
          <div className={`status_indicator ${is_connected ? 'connected' : 'disconnected'}`}>
            {is_connected ? '● Connected' : '● Disconnected'}
          </div>
        </div>

        {/* Success Message */}
        {show_success && (
          <div className="success_message">
            Successfully connected a wallet!
            <div className="wallet_address_display">{wallet_address}</div>
          </div>
        )}

        {/* Connect Wallet Form */}
        {show_connect_form && !is_connected && (
          <div className="connect_wallet_form">
            {!areWalletsAvailable() && (
              <div style={{ 
                background: '#ff6b6b', 
                color: '#fff', 
                padding: '15px', 
                borderRadius: '4px', 
                marginBottom: '20px',
                textAlign: 'center'
              }}>
                No Cardano wallets detected. Please install a Cardano wallet extension (Nami, Eternl, Flint, etc.)
              </div>
            )}
            {connection_error && (
              <div style={{ 
                background: '#ff6b6b', 
                color: '#fff', 
                padding: '15px', 
                borderRadius: '4px', 
                marginBottom: '20px',
                textAlign: 'center'
              }}>
                {connection_error}
              </div>
            )}
            <div className="form_group">
              <label htmlFor="wallet_type">Select Wallet Type:</label>
              <select
                id="wallet_type"
                value={selected_wallet_type}
                onChange={(event) => setSelectedWalletType(event.target.value)}
                required
              >
                <option value="">Choose a wallet</option>
                {available_wallets.length > 0 ? (
                  available_wallets.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))
                ) : (
                  ['Nami', 'Eternl', 'Flint', 'Yoroi', 'Gero', 'Typhon'].map(type => (
                    <option key={type} value={type}>{type} (not detected)</option>
                  ))
                )}
              </select>
            </div>
            <button 
              className="btn_primary" 
              onClick={handleConnectWallet}
              disabled={!selected_wallet_type || !areWalletsAvailable()}
            >
              Connect Wallet
            </button>
          </div>
        )}

        {/* View Wallet / Transaction Form */}
        {is_connected && !show_connect_form && (
          <div className="wallet_view">
            <div className="wallet_info_row">
              <label>Wallet Type:</label>
              <div className="wallet_value">{wallet_type}</div>
            </div>
            
            <div className="wallet_info_row">
              <label>Wallet Address:</label>
              <div className="wallet_value address_value">{wallet_address}</div>
            </div>

            <form onSubmit={handleMakeTransaction} className="transaction_form">
              <div className="form_group">
                <label htmlFor="recipient_address">Recipient Address:</label>
                <input
                  type="text"
                  id="recipient_address"
                  value={recipient_address}
                  onChange={(event) => setRecipientAddress(event.target.value)}
                  required
                  placeholder="Enter recipient address"
                />
              </div>
              
              <div className="form_group">
                <label htmlFor="amount">Amount:</label>
                <input
                  type="number"
                  id="amount"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  required
                  placeholder="Enter amount"
                  step="0.000001"
                  min="0"
                />
              </div>

              <div className="transaction_actions">
                <button type="submit" className="btn_primary">
                  Make Transaction
                </button>
                <button 
                  type="button" 
                  className="btn_secondary" 
                  onClick={handleDisconnect}
                >
                  Disconnect
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Main Action Button - Only show when not connected */}
        {!show_connect_form && !is_connected && (
          <div className="wallet_action">
            <button 
              className="btn_primary btn_connect"
              onClick={handleConnectClick}
            >
              Connect Wallet
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wallet;
