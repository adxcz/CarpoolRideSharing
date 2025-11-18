import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaLock, FaCar, FaUserFriends } from 'react-icons/fa';
import { registerUser, getCurrentUser } from '../../utils/authService';
import useToast from '../../hooks/useToast';
import ToastContainer from '../../components/ToastContainer';
import '../../styles/auth/register.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'passenger', // 'passenger' or 'driver'
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const navigate = useNavigate();
  const { toasts, showSuccess, showError, removeToast } = useToast();

  const { name, email, password, confirmPassword, userType } = formData;

  // Redirect if already logged in
  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      if (user.userType === 'DRIVER') {
        navigate('/driver/dashboard', { replace: true });
      } else if (user.userType === 'PASSENGER') {
        navigate('/passenger/dashboard', { replace: true });
      }
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
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      showError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      showError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      await registerUser({ name, email, password, userType });
      
      showSuccess(`Account created successfully! Redirecting to ${userType} login...`);
      
      // On successful registration, navigate to the appropriate login after a short delay
      setTimeout(() => {
        navigate(`/login/${userType}`);
      }, 1500);
    } catch (err) {
      const errorMessage = err.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div className="auth-container">
        <div className="auth-card">
        <div className="auth-header">
          <h2>Create an Account</h2>
          <p>Join our carpooling community</p>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <div className="input-group">
              <FaUser className="input-icon" />
              <input
                type="text"
                name="name"
                value={name}
                onChange={handleChange}
                placeholder="Full Name"
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            <div className="input-group">
              <FaEnvelope className="input-icon" />
              <input
                type="email"
                name="email"
                value={email}
                onChange={handleChange}
                placeholder="Email Address"
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            <div className="input-group">
              <FaLock className="input-icon" />
              <input
                type="password"
                name="password"
                value={password}
                onChange={handleChange}
                placeholder="Password"
                minLength="6"
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            <div className="input-group">
              <FaLock className="input-icon" />
              <input
                type="password"
                name="confirmPassword"
                value={confirmPassword}
                onChange={handleChange}
                placeholder="Confirm Password"
                minLength="6"
                required
              />
            </div>
          </div>
          
          <div className="form-group user-type">
            <label>I want to register as:</label>
            <div className="user-type-options">
              <label className={`user-type-option ${userType === 'passenger' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="userType"
                  value="passenger"
                  checked={userType === 'passenger'}
                  onChange={handleChange}
                />
                <FaUserFriends className="user-type-icon" />
                <span>Passenger</span>
              </label>
              
              <label className={`user-type-option ${userType === 'driver' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="userType"
                  value="driver"
                  checked={userType === 'driver'}
                  onChange={handleChange}
                />
                <FaCar className="user-type-icon" />
                <span>Driver</span>
              </label>
            </div>
          </div>
          
          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        
        <div className="auth-footer">
          Already have an account?{' '}
          <Link to="/login/passenger" className="auth-link">
            Sign In
          </Link>
        </div>
      </div>
    </div>
    </>
  );
};

export default Register;
