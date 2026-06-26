import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import Input from '../../components/common/Input/Input';
import Button from '../../components/common/Button/Button';
import Card from '../../components/common/Card/Card';
import './Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated()) {
      navigate(user?.redirect_url || '/');
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      navigate(result.redirectUrl || '/');
    } else {
      setError(result.message);
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-split-layout">
        {/* Left Information Pane */}
        <div className="auth-info-pane">
          <div className="info-pane-content">
            <span className="info-seal">★</span>
            <h2 className="info-title">SUCCESS TOGETHER <span className="gold-text">ACADEMY</span></h2>
            <p className="info-motto">Dedicated to the Service of the Nation</p>
            
            <div className="info-quote-box">
              <p className="info-quote">"The best way to find yourself is to lose yourself in the service of others."</p>
              <span className="quote-author">— Mahatma Gandhi</span>
            </div>

            <div className="info-features-list">
              <div className="info-feature-item">
                <span className="feature-icon">🛡</span>
                <div>
                  <h4>1-on-1 Bureaucrat Mentorship</h4>
                  <p>Direct guidance from active IAS & IPS officers.</p>
                </div>
              </div>
              <div className="info-feature-item">
                <span className="feature-icon">✍</span>
                <div>
                  <h4>Real-time Mains Evaluation</h4>
                  <p>GS and Essay analysis feedback within 24 hours.</p>
                </div>
              </div>
              <div className="info-feature-item">
                <span className="feature-icon">🎯</span>
                <div>
                  <h4>Syllabus Smart Tracker</h4>
                  <p>Micro-topic curriculum coverage mapper.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Form Pane */}
        <div className="auth-form-pane">
          <div className="auth-wrapper">
            <Card className="auth-card">
              <div className="auth-header">
                <h1>Welcome Back</h1>
                <p>Sign in to your officer account to continue</p>
              </div>

              {error && (
                <div className="auth-error">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="auth-form">
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  fullWidth
                  required
                  disabled={loading}
                />

                <Input
                  label="Password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  fullWidth
                  required
                  disabled={loading}
                />

                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  disabled={loading}
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>

              <div className="auth-footer">
                <p>
                  Don't have an account?{' '}
                  <Link to="/register" className="auth-link">
                    Sign up here
                  </Link>
                </p>
                <p>
                  <Link to="/" className="auth-link">
                    Back to home
                  </Link>
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
