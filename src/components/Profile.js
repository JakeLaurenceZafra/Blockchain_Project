// Updated Profile.js without Cardano-address in the profile section
import React, { useState, useEffect } from 'react';
import './Profile.css';
import { useWallet } from '../contexts/WalletContext';
import { getAvailableWallets, areWalletsAvailable } from '../utils/blockchain';

const Profile = ({ user, show, onClose, onLogout }) => {
  const {
    isConnected,
    walletType,
    walletAddress,
    connectWallet,
    disconnectWallet
  } = useWallet();

  const [showWalletConnect, setShowWalletConnect] = useState(false);
  const [selectedWalletType, setSelectedWalletType] = useState('');
  const [availableWallets, setAvailableWallets] = useState([]);
  const [connectionError, setConnectionError] = useState('');

  useEffect(() => {
    const checkWallets = () => {
      if (areWalletsAvailable()) {
        setAvailableWallets(getAvailableWallets());
      } else {
        setAvailableWallets([]);
      }
    };
    checkWallets();
    const interval = setInterval(checkWallets, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleConnectWallet = async () => {
    if (!selectedWalletType) {
      alert('Please select a wallet type');
      return;
    }

    setConnectionError('');

    try {
      if (!window.cardano || !window.cardano[selectedWalletType]) {
        throw new Error(`${selectedWalletType} wallet not found. Please install the wallet extension.`);
      }

      const api = await window.cardano[selectedWalletType].enable();

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

      const bech32Address = typeof address === 'string' ? address : address.toString();
      await connectWallet(selectedWalletType, api, bech32Address);

      setShowWalletConnect(false);
      setConnectionError('');
      alert('Wallet connected successfully!');
    } catch (error) {
      console.error('Error connecting to wallet:', error);
      setConnectionError(error.message || 'Failed to connect to wallet');
    }
  };

  if (!show || !user) return null;

  return (
    <div className="profile_modal" onClick={(event) => {
      if (event.target.classList.contains('profile_modal')) {
        onClose();
      }
    }}>
      <div className="profile_content" onClick={(event) => event.stopPropagation()}>
        <span className="close_profile" onClick={onClose}>&times;</span>
        <h2 className="profile_title">My Profile</h2>

        <div className="profile_info">
          <div className="profile_field">
            <label>Name:</label>
            <div className="profile_value">{user.name}</div>
          </div>

          <div className="profile_field">
            <label>Username:</label>
            <div className="profile_value">{user.username}</div>
          </div>

          {/* Removed Cardano Address (Profile) section */}

          <div className="profile_field">
            <label>Connected Wallet:</label>
            {isConnected ? (
              <div className="profile_value">
                <div style={{ color: '#4ecdc4', fontWeight: '600' }}>● Connected</div>
                <div style={{ fontSize: '0.85rem', marginTop: '5px' }}>
                  <strong>Type:</strong> {walletType}
                </div>
                <div style={{ fontSize: '0.75rem', marginTop: '5px', wordBreak: 'break-all', fontFamily: 'monospace' }}>
                  <strong>Address:</strong> {walletAddress}
                </div>
                <button
                  className="btn_secondary"
                  onClick={disconnectWallet}
                  style={{ marginTop: '10px', fontSize: '0.85rem', padding: '5px 10px' }}
                >
                  Disconnect Wallet
                </button>
              </div>
            ) : (
              <div className="profile_value">
                <div style={{ color: '#ff6b6b', fontWeight: '600' }}>● Not Connected</div>
                <button
                  className="btn_primary"
                  onClick={() => setShowWalletConnect(true)}
                  style={{ marginTop: '10px', fontSize: '0.85rem', padding: '5px 10px' }}
                >
                  Connect Wallet
                </button>
              </div>
            )}
          </div>
        </div>

        {showWalletConnect && (
          <div className="wallet_connect_section" style={{
            marginTop: '20px',
            padding: '15px',
            background: '#fef9e7',
            borderRadius: '4px',
            border: '1px solid #e8d5b7'
          }}>
            <h3 style={{ marginTop: 0, marginBottom: '15px', color: '#8b6914' }}>Connect Cardano Wallet</h3>
            {!areWalletsAvailable() && (
              <div style={{
                background: '#ff6b6b',
                color: '#fff',
                padding: '10px',
                borderRadius: '4px',
                marginBottom: '15px',
                fontSize: '0.85rem'
              }}>
                No Cardano wallets detected. Please install a wallet extension.
              </div>
            )}
            {connectionError && (
              <div style={{
                background: '#ff6b6b',
                color: '#fff',
                padding: '10px',
                borderRadius: '4px',
                marginBottom: '15px',
                fontSize: '0.85rem'
              }}>
                {connectionError}
              </div>
            )}
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#8b6914', fontWeight: '600' }}>
                Select Wallet:
              </label>
              <select
                value={selectedWalletType}
                onChange={(e) => setSelectedWalletType(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '2px solid #d4af37',
                  borderRadius: '2px',
                  fontSize: '0.9rem'
                }}
              >
                <option value="">Choose a wallet</option>
                {availableWallets.length > 0 ? (
                  availableWallets.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))
                ) : (
                  ['Nami', 'Eternl', 'Flint', 'Yoroi', 'Gero', 'Typhon'].map(type => (
                    <option key={type} value={type}>{type} (not detected)</option>
                  ))
                )}
              </select>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                className="btn_primary"
                onClick={handleConnectWallet}
                disabled={!selectedWalletType || !areWalletsAvailable()}
                style={{ flex: 1 }}
              >
                Connect
              </button>
              <button
                className="btn_secondary"
                onClick={() => {
                  setShowWalletConnect(false);
                  setSelectedWalletType('');
                  setConnectionError('');
                }}
                style={{ flex: 1 }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="profile_actions">
          <button className="btn_danger" onClick={onLogout}>
            Logout
          </button>
          <button className="btn_secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;