import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../utils/authService';

const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      // User is logged in, redirect to their dashboard
      if (user.userType === 'DRIVER') {
        navigate('/driver/dashboard', { replace: true });
      } else if (user.userType === 'PASSENGER') {
        navigate('/passenger/dashboard', { replace: true });
      }
    } else {
      // User is not logged in, redirect to passenger login
      navigate('/login/passenger', { replace: true });
    }
  }, [navigate]);

  return null; // This component only handles redirects
};

export default Home;

