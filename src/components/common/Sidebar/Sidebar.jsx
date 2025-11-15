import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = ({
  items = [],
  collapsed = false,
  onToggleCollapse,
  className = '',
}) => {
  return (
    <aside className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''} ${className}`}>
      <div className="sidebar-content">
        <nav className="sidebar-nav">
          {items.map((item, index) => {
            if (item.divider) {
              return <div key={index} className="sidebar-divider" />;
            }

            if (item.submenu) {
              return (
                <div key={index} className="sidebar-group">
                  {!collapsed && item.label && (
                    <div className="sidebar-group-label">{item.label}</div>
                  )}
                  {item.submenu.map((subItem, subIndex) => (
                    <NavLink
                      key={subIndex}
                      to={subItem.path}
                      className={({ isActive }) =>
                        `sidebar-item ${isActive ? 'sidebar-item--active' : ''}`
                      }
                      title={collapsed ? subItem.label : ''}
                    >
                      {subItem.icon && (
                        <span className="sidebar-icon">{subItem.icon}</span>
                      )}
                      {!collapsed && <span className="sidebar-label">{subItem.label}</span>}
                      {subItem.badge && !collapsed && (
                        <span className="sidebar-badge">{subItem.badge}</span>
                      )}
                    </NavLink>
                  ))}
                </div>
              );
            }

            return (
              <NavLink
                key={index}
                to={item.path}
                className={({ isActive }) =>
                  `sidebar-item ${isActive ? 'sidebar-item--active' : ''}`
                }
                title={collapsed ? item.label : ''}
              >
                {item.icon && <span className="sidebar-icon">{item.icon}</span>}
                {!collapsed && <span className="sidebar-label">{item.label}</span>}
                {item.badge && !collapsed && (
                  <span className="sidebar-badge">{item.badge}</span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>
      {onToggleCollapse && (
        <button className="sidebar-toggle" onClick={onToggleCollapse}>
          {collapsed ? '→' : '←'}
        </button>
      )}
    </aside>
  );
};

export default Sidebar;

