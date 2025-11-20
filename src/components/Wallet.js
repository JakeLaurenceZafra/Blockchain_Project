import React, { useState, useEffect } from 'react';
import './Wallet.css';

const Wallet = () => {
  const [is_connected, setIsConnected] = useState(false);
  const [wallet_type, setWalletType] = useState('');
  const [wallet_address, setWalletAddress] = useState('');
  const [show_connect_form, setShowConnectForm] = useState(false);
  const [selected_wallet_type, setSelectedWalletType] = useState('');
  const [show_success, setShowSuccess] = useState(false);
  const [recipient_address, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState('');

  const wallet_types = ['Nami', 'Eternl', 'Flint', 'Yoroi', 'Gero', 'Typhon'];

  // Load wallet state from localStorage on mount
  useEffect(() => {
    const saved_wallet = localStorage.getItem('wallet');
    if (saved_wallet) {
      const wallet = JSON.parse(saved_wallet);
      setIsConnected(wallet.isConnected);
      setWalletType(wallet.walletType);
      setWalletAddress(wallet.walletAddress);
    }
  }, []);

  const handleConnectClick = () => {
    if (is_connected) {
      // Show wallet view
      setShowConnectForm(false);
    } else {
      // Show connect form
      setShowConnectForm(true);
    }
  };

  const handleConnectWallet = () => {
    if (!selected_wallet_type) {
      alert('Please select a wallet type');
      return;
    }

    // Simulate wallet connection
    // In a real app, this would connect to the actual wallet
    const mock_address = `addr1${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    
    const wallet_data = {
      isConnected: true,
      walletType: selected_wallet_type,
      walletAddress: mock_address
    };

    localStorage.setItem('wallet', JSON.stringify(wallet_data));
    setIsConnected(true);
    setWalletType(selected_wallet_type);
    setWalletAddress(mock_address);
    setShowSuccess(true);
    setShowConnectForm(false);

    // Hide success message after 3 seconds
    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  };

  const handleDisconnect = () => {
    localStorage.removeItem('wallet');
    setIsConnected(false);
    setWalletType('');
    setWalletAddress('');
    setShowConnectForm(false);
    setShowSuccess(false);
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
            <div className="form_group">
              <label htmlFor="wallet_type">Select Wallet Type:</label>
              <select
                id="wallet_type"
                value={selected_wallet_type}
                onChange={(event) => setSelectedWalletType(event.target.value)}
                required
              >
                <option value="">Choose a wallet</option>
                {wallet_types.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <button className="btn_primary" onClick={handleConnectWallet}>
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
