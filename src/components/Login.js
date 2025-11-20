import React, { useState } from 'react';
import './Login.css';
import { loginUser } from '../api';

const Login = ({ onLogin, onShowRegistration }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    // Check default credentials first (keep local dev fallback)
    const default_username = 'TestUsername';
    const default_password = '12345';

    if (username === default_username && password === default_password) {
      const default_user = {
        name: 'Test User',
        username: default_username,
        cardanoAddress: 'Default Address'
      };
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('currentUser', JSON.stringify(default_user));
      onLogin(true);
      return;
    }

    try {
      const data = await loginUser({ username, password });
      // loginUser stores token and currentUser in localStorage
      localStorage.setItem('isLoggedIn', 'true');
      onLogin(true);
    } catch (err) {
      // fallback to previous localStorage auth (if user registered locally)
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const user = users.find(u => u.username === username && u.password === password);

      if (user) {
        const user_data = {
          name: user.name,
          username: user.username,
          cardanoAddress: user.cardanoAddress
        };
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('currentUser', JSON.stringify(user_data));
        onLogin(true);
      } else {
        setError(err.message || 'Invalid username or password');
      }
    }
  };

  return (
    <div className="login_container">
      <div className="login_box">
        <h1 className="login_title">My Notes</h1>
        <p className="login_subtitle">Please log in to continue</p>
        <form onSubmit={handleSubmit} className="login_form">
          <div className="form_group">
            <label htmlFor="username">Username:</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              required
              placeholder="Enter username"
              autoComplete="username"
            />
          </div>
          <div className="form_group">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              placeholder="Enter password"
              autoComplete="current-password"
            />
          </div>
          {error && <div className="error_message">{error}</div>}
          <button type="submit" className="btn_primary login_btn">
            Login
          </button>
          <button 
            type="button" 
            className="btn_secondary login_btn" 
            onClick={onShowRegistration}
            style={{ marginTop: '10px' }}
          >
            Register
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
