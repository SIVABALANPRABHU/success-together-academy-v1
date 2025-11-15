import React, { useState } from 'react';
import './TopNavBar.css';

const TopNavBar = ({
  logo,
  logoText = 'Admin Dashboard',
  user,
  onLogout,
  notifications = [],
  menuItems = [],
  className = '',
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <nav className={`top-navbar ${className}`}>
      <div className="top-navbar-container">
        <div className="top-navbar-left">
          {logo && <img src={logo} alt="Logo" className="top-navbar-logo" />}
          <h1 className="top-navbar-title">{logoText}</h1>
        </div>

        <div className="top-navbar-right">
          {menuItems.length > 0 && (
            <div className="top-navbar-menu">
              {menuItems.map((item, index) => (
                <a
                  key={index}
                  href={item.href}
                  className="top-navbar-menu-item"
                  onClick={item.onClick}
                >
                  {item.icon && <span className="top-navbar-icon">{item.icon}</span>}
                  {item.label}
                </a>
              ))}
            </div>
          )}

          {notifications.length > 0 && (
            <div className="top-navbar-notifications">
              <button
                className="top-navbar-notification-btn"
                onClick={() => setShowNotifications(!showNotifications)}
                aria-label="Notifications"
              >
                <span className="top-navbar-icon">🔔</span>
                {notifications.filter((n) => !n.read).length > 0 && (
                  <span className="top-navbar-badge">
                    {notifications.filter((n) => !n.read).length}
                  </span>
                )}
              </button>
              {showNotifications && (
                <div className="top-navbar-notification-dropdown">
                  {notifications.map((notification, index) => (
                    <div
                      key={index}
                      className={`top-navbar-notification-item ${!notification.read ? 'top-navbar-notification-item--unread' : ''}`}
                    >
                      <p className="top-navbar-notification-title">{notification.title}</p>
                      <p className="top-navbar-notification-message">{notification.message}</p>
                      <span className="top-navbar-notification-time">{notification.time}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {user && (
            <div className="top-navbar-user">
              <button
                className="top-navbar-user-btn"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                {user.avatar && (
                  <img src={user.avatar} alt={user.name} className="top-navbar-avatar" />
                )}
                <span className="top-navbar-user-name">{user.name}</span>
                <span className="top-navbar-user-arrow">▼</span>
              </button>
              {showUserMenu && (
                <div className="top-navbar-user-menu">
                  {user.email && (
                    <div className="top-navbar-user-info">
                      <p className="top-navbar-user-email">{user.email}</p>
                    </div>
                  )}
                  {onLogout && (
                    <button className="top-navbar-user-menu-item" onClick={onLogout}>
                      Logout
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default TopNavBar;

