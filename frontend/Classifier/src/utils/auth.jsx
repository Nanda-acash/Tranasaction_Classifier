import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function RequireAuth({ children }) {
  const isAuthenticated = localStorage.getItem('walletwise_user') !== null;
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  return isAuthenticated ? children : null;
}

export { RequireAuth };
