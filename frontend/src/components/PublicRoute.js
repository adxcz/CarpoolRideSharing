import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../utils/authService';

const PublicRoute = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      // User is already logged in, redirect to their dashboard
      if (user.userType === 'DRIVER') {
        navigate('/driver/dashboard', { replace: true });
      } else if (user.userType === 'PASSENGER') {
        navigate('/passenger/dashboard', { replace: true });
      }
    }
  }, [navigate]);

  // Check if user is logged in before rendering
  const user = getCurrentUser();
  if (user) {
    // Return null while redirecting
    return null;
  }

  return children;
};

export default PublicRoute;

