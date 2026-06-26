import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import Input from '../../components/common/Input/Input';
import Button from '../../components/common/Button/Button';
import Card from '../../components/common/Card/Card';
import './Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    thumbnail: '',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { register, isAuthenticated, user } = useAuth();
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

    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    const userData = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      thumbnail: formData.thumbnail || undefined,
    };

    const result = await register(userData);
    
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
                <h1>Create Account</h1>
                <p className="subtitle-desc">Sign up to get started with Success Together Academy</p>
              </div>

              {error && (
                <div className="auth-error">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="auth-form">
                <Input
                  label="Full Name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  fullWidth
                  required
                  disabled={loading}
                />

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
                  placeholder="Enter your password (min 6 characters)"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  fullWidth
                  required
                  disabled={loading}
                />

                <Input
                  label="Confirm Password"
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  fullWidth
                  required
                  disabled={loading}
                />

                <Input
                  label="Profile Picture URL (Optional)"
                  type="url"
                  placeholder="https://example.com/avatar.jpg"
                  value={formData.thumbnail}
                  onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                  fullWidth
                  disabled={loading}
                />

                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  disabled={loading}
                >
                  {loading ? 'Creating account...' : 'Sign Up'}
                </Button>
              </form>

              <div className="auth-footer">
                <p>
                  Already have an account?{' '}
                  <Link to="/login" className="auth-link">
                    Sign in here
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

export default Register;
