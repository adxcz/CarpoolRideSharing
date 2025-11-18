import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaLock, FaCar, FaArrowLeft } from 'react-icons/fa';
import { loginUser, getCurrentUser } from '../../utils/authService';
import useToast from '../../hooks/useToast';
import ToastContainer from '../../components/ToastContainer';
import '../../styles/auth/driver-login.css';

const DriverLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const navigate = useNavigate();
  const { toasts, showSuccess, showError, removeToast } = useToast();

  const { email, password } = formData;

  // Redirect if already logged in as driver
  useEffect(() => {
    const user = getCurrentUser();
    if (user && user.userType === 'DRIVER') {
      navigate('/driver/dashboard', { replace: true });
    } else if (user && user.userType === 'PASSENGER') {
      // If logged in as passenger, redirect to passenger dashboard
      navigate('/passenger/dashboard', { replace: true });
    } else {
      setCheckingAuth(false);
    }
  }, [navigate]);

  // Don't render form if checking auth or redirecting
  if (checkingAuth) {
    return null;
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await loginUser(email, password, 'driver');

      // Save user data to localStorage (already done in authService, but keeping for compatibility)
      localStorage.setItem('user', JSON.stringify(data.user));
      
      showSuccess('Login successful! Welcome back!');
      
      // Navigate to driver dashboard after a short delay
      setTimeout(() => {
        navigate('/driver/dashboard');
      }, 1000);
    } catch (err) {
      const errorMessage = err.message || 'Failed to log in. Please check your credentials.';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div className="auth-container driver-auth">
        <div className="auth-card">
        <Link to="/" className="back-button">
          <FaArrowLeft /> Back to Home
        </Link>
        
        <div className="auth-header">
          <div className="driver-icon">
            <FaCar />
          </div>
          <h2>Driver Login</h2>
          <p>Sign in to manage your rides</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <div className="input-group">
              <span className="input-icon"><FaUser /></span>
              <input
                type="email"
                name="email"
                value={email}
                onChange={handleChange}
                placeholder="Email address"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <div className="input-group">
              <span className="input-icon"><FaLock /></span>
              <input
                type="password"
                name="password"
                value={password}
                onChange={handleChange}
                placeholder="Password"
                required
              />
            </div>
          </div>

          <div className="form-options">
            <div className="remember-me">
              <input type="checkbox" id="remember" />
              <label htmlFor="remember">Remember me</label>
            </div>
            <Link to="/forgot-password" className="forgot-password">
              Forgot password?
            </Link>
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In as Driver'}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account?{' '}
          <Link to="/register" className="auth-link">
            Sign Up
          </Link>
        </div>
        <p className="switch-role">
          Are you a passenger? <Link to="/login/passenger">Passenger Login</Link>
        </p>
      </div>
    </div>
    </>
  );
};

export default DriverLogin;
