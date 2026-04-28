// components/Sidebar.js
import React from 'react';

const Sidebar = ({ activeTab, setActiveTab }) => {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>EduFeedback</h2>
        <p>Admin Dashboard</p>
      </div>
      <nav className="sidebar-nav">
        <div
          className={`nav-item ${activeTab === 'feedback' ? 'active' : ''}`}
          onClick={() => setActiveTab('feedback')}
        >
          <span className="nav-icon">📋</span>
          <span>Feedback Forms</span>
        </div>
        <div
          className={`nav-item ${activeTab === 'create' ? 'active' : ''}`}
          onClick={() => setActiveTab('create')}
        >
          <span className="nav-icon">➕</span>
          <span>Create Form</span>
        </div>
        <div
          className={`nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          <span className="nav-icon">📊</span>
          <span>Analytics</span>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;