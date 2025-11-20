import React, { useState } from 'react';
import './Login.css';

const Registration = ({ onRegister, onBackToLogin }) => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [cardano_address, setCardanoAddress] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    setError('');

    // Validate fields
    if (!name.trim() || !username.trim() || !password.trim() || !cardano_address.trim()) {
      setError('All fields are required');
      return;
    }

    // Check if username already exists
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const existing_user = users.find(u => u.username === username.trim());
    
    if (existing_user) {
      setError('Username already exists. Please choose a different username.');
      return;
    }

    // Create new user
    const new_user = {
      name: name.trim(),
      username: username.trim(),
      password: password.trim(),
      cardanoAddress: cardano_address.trim(),
      createdAt: new Date().toISOString()
    };

    // Save user to localStorage
    users.push(new_user);
    localStorage.setItem('users', JSON.stringify(users));

    // Show success message
    setSuccess(true);
    
    // Auto redirect to login after 2 seconds
    setTimeout(() => {
      onBackToLogin();
    }, 2000);
  };

  if (success) {
    return (
      <div className="login_container">
        <div className="login_box">
          <h1 className="login_title">Registration Successful!</h1>
          <p className="login_subtitle">Redirecting to login page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="login_container">
      <div className="login_box">
        <h1 className="login_title">Register</h1>
        <p className="login_subtitle">Create a new account</p>
        <form onSubmit={handleSubmit} className="login_form">
          <div className="form_group">
            <label htmlFor="name">Name:</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              placeholder="Enter your name"
            />
          </div>
          <div className="form_group">
            <label htmlFor="reg_username">Username:</label>
            <input
              type="text"
              id="reg_username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              required
              placeholder="Choose a username"
            />
          </div>
          <div className="form_group">
            <label htmlFor="reg_password">Password:</label>
            <input
              type="password"
              id="reg_password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              placeholder="Choose a password"
            />
          </div>
          <div className="form_group">
            <label htmlFor="cardano_address">Cardano Address:</label>
            <input
              type="text"
              id="cardano_address"
              value={cardano_address}
              onChange={(event) => setCardanoAddress(event.target.value)}
              required
              placeholder="Enter your Cardano address"
            />
          </div>
          {error && <div className="error_message">{error}</div>}
          <button type="submit" className="btn_primary login_btn">
            Register
          </button>
          <button 
            type="button" 
            className="btn_secondary login_btn" 
            onClick={onBackToLogin}
            style={{ marginTop: '10px' }}
          >
            Back to Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Registration;
