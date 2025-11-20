import React from 'react';
import './Profile.css';

const Profile = ({ user, show, onClose, onLogout }) => {
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
          
          <div className="profile_field">
            <label>Cardano Address:</label>
            <div className="profile_value cardano_address">{user.cardanoAddress}</div>
          </div>
        </div>

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
