import React, { createContext, useContext, useState, useEffect } from 'react';

const WalletContext = createContext();

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

export const WalletProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [walletType, setWalletType] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [walletApi, setWalletApi] = useState(null);

  // Load wallet state from localStorage on mount
  useEffect(() => {
    const savedWallet = localStorage.getItem('wallet');
    if (savedWallet) {
      const wallet = JSON.parse(savedWallet);
      setIsConnected(wallet.isConnected);
      setWalletType(wallet.walletType);
      setWalletAddress(wallet.walletAddress);
      // Note: wallet API needs to be reconnected when needed
    }
  }, []);

  // Reconnect wallet API when needed
  const reconnectWallet = async () => {
    if (!walletType || !window.cardano || !window.cardano[walletType]) {
      return null;
    }

    try {
      const api = await window.cardano[walletType].enable();
      setWalletApi(api);
      return api;
    } catch (error) {
      console.error('Error reconnecting wallet:', error);
      return null;
    }
  };

  const connectWallet = async (walletName, api, address) => {
    setWalletType(walletName);
    setWalletAddress(address);
    setWalletApi(api);
    setIsConnected(true);
    
    const walletData = {
      isConnected: true,
      walletType: walletName,
      walletAddress: address
    };
    localStorage.setItem('wallet', JSON.stringify(walletData));
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setWalletType('');
    setWalletAddress('');
    setWalletApi(null);
    localStorage.removeItem('wallet');
  };

  const getWalletApi = async () => {
    if (walletApi) {
      return walletApi;
    }
    // Try to reconnect if API is not available
    return await reconnectWallet();
  };

  const value = {
    isConnected,
    walletType,
    walletAddress,
    walletApi,
    connectWallet,
    disconnectWallet,
    getWalletApi,
    reconnectWallet
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};

