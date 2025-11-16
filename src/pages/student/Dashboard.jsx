import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [allMenus, setAllMenus] = useState([]);
  const [purchasedMenus, setPurchasedMenus] = useState([]);
  const [currentlyLearning, setCurrentlyLearning] = useState(null);
  const [activeMembership, setActiveMembership] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalMenus: 0,
    purchasedMenus: 0,
    activeCourses: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all menus
      const menusResponse = await apiService.getMenus({ limit: 100, status: 'active' });
      const menus = menusResponse.data || [];
      setAllMenus(menus);
      setStats(prev => ({ ...prev, totalMenus: menus.length }));

      // Fetch user's active membership
      if (user?.id) {
        const membershipResponse = await apiService.getUserActiveMembership(user.id);
        if (membershipResponse.data) {
          setActiveMembership(membershipResponse.data);
          
          // Get purchased menus based on membership package
          if (membershipResponse.data.package_id) {
            try {
              const packageResponse = await apiService.getPackageById(membershipResponse.data.package_id);
              if (packageResponse.data?.menu_id) {
                const purchasedMenu = menus.find(m => m.id === packageResponse.data.menu_id);
                if (purchasedMenu) {
                  setPurchasedMenus([purchasedMenu]);
                  setCurrentlyLearning(purchasedMenu);
                  setStats(prev => ({ ...prev, purchasedMenus: 1 }));
                }
              }
            } catch (err) {
              console.error('Error fetching package:', err);
            }
          }
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch data');
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMenuClick = (menuId) => {
    navigate(`/student/menu/${menuId}`);
  };

  if (loading) {
    return (
      <div className="student-dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="student-dashboard">
        <div className="error-container">
          <p>{error}</p>
          <button onClick={fetchData} className="retry-btn">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="student-dashboard">
      {/* Hero Section */}
      <div className="dashboard-hero">
        <div className="hero-content">
          <h1 className="hero-title">Welcome back, {user?.name || 'Student'}! 👋</h1>
          <p className="hero-subtitle">Continue your learning journey and unlock new skills</p>
        </div>
        {activeMembership && (
          <div className="membership-card-hero">
            <div className="membership-icon">🎫</div>
            <div className="membership-info">
              <div className="membership-label">Active Membership</div>
              <div className="membership-date">
                Expires: {new Date(activeMembership.end_date).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stats Section */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalMenus}</div>
            <div className="stat-label">Total Menus</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-value">{stats.purchasedMenus}</div>
            <div className="stat-label">Purchased</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📖</div>
          <div className="stat-content">
            <div className="stat-value">{currentlyLearning ? 1 : 0}</div>
            <div className="stat-label">Currently Learning</div>
          </div>
        </div>
      </div>

      {/* Currently Learning Section */}
      {currentlyLearning && (
        <section className="dashboard-section">
          <div className="section-header">
            <h2 className="section-title">
              <span className="section-icon">🔥</span>
              Continue Learning
            </h2>
            <p className="section-subtitle">Pick up where you left off</p>
          </div>
          <div className="menus-grid-featured">
            <div 
              className="menu-card-featured"
              onClick={() => handleMenuClick(currentlyLearning.id)}
            >
              <div className="menu-card-gradient"></div>
              <div className="menu-card-content">
                <div className="menu-card-header-featured">
                  <h3 className="menu-card-title-featured">{currentlyLearning.title}</h3>
                  <span className="purchased-badge-featured">✓ Active</span>
                </div>
                {currentlyLearning.description && (
                  <p className="menu-card-description-featured">{currentlyLearning.description}</p>
                )}
                <div className="menu-card-footer">
                  <button className="continue-btn">
                    Continue Learning →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Purchased Menus Section */}
      {purchasedMenus.length > 0 && (
        <section className="dashboard-section">
          <div className="section-header">
            <h2 className="section-title">
              <span className="section-icon">✅</span>
              My Purchased Menus
            </h2>
            <p className="section-subtitle">Your learning resources</p>
          </div>
          <div className="menus-grid">
            {purchasedMenus.map((menu) => (
              <div 
                key={menu.id} 
                className="menu-card-modern"
                onClick={() => handleMenuClick(menu.id)}
              >
                <div className="menu-card-image">
                  <div className="menu-card-icon">📚</div>
                </div>
                <div className="menu-card-body">
                  <div className="menu-card-header-modern">
                    <h3 className="menu-card-title-modern">{menu.title}</h3>
                    <span className="purchased-badge-modern">✓</span>
                  </div>
                  {menu.description && (
                    <p className="menu-card-description-modern">
                      {menu.description.length > 100 
                        ? `${menu.description.substring(0, 100)}...` 
                        : menu.description}
                    </p>
                  )}
                  <div className="menu-card-action">
                    <span className="view-text">View Courses →</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* All Menus Section */}
      <section className="dashboard-section">
        <div className="section-header">
          <h2 className="section-title">
            <span className="section-icon">📚</span>
            All Available Menus
          </h2>
          <p className="section-subtitle">Explore our complete course catalog</p>
        </div>
        <div className="menus-grid">
          {allMenus.map((menu) => {
            const isPurchased = purchasedMenus.some(pm => pm.id === menu.id);
            return (
              <div 
                key={menu.id} 
                className={`menu-card-modern ${isPurchased ? 'purchased' : ''}`}
                onClick={() => handleMenuClick(menu.id)}
              >
                <div className="menu-card-image">
                  <div className="menu-card-icon">📚</div>
                  {isPurchased && <div className="purchased-overlay">✓</div>}
                </div>
                <div className="menu-card-body">
                  <div className="menu-card-header-modern">
                    <h3 className="menu-card-title-modern">{menu.title}</h3>
                    {isPurchased && (
                      <span className="purchased-badge-modern">✓</span>
                    )}
                  </div>
                  {menu.description && (
                    <p className="menu-card-description-modern">
                      {menu.description.length > 100 
                        ? `${menu.description.substring(0, 100)}...` 
                        : menu.description}
                    </p>
                  )}
                  <div className="menu-card-action">
                    <span className="view-text">
                      {isPurchased ? 'Continue Learning →' : 'Explore →'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
