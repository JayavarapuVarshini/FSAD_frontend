// components/Header.js
import React from 'react';

const Header = () => {
  return (
    <header className="header">
      <div className="header-title">
        <h1>Welcome back, Admin</h1>
      </div>
      <div className="header-actions">
        <div className="notification-badge">
          <i>🔔</i>
          <span className="badge">3</span>
        </div>
        <div className="user-profile">
          <img src="https://via.placeholder.com/40" alt="Profile" />
          <span>John Doe</span>
        </div>
      </div>
    </header>
  );
};

export default Header;