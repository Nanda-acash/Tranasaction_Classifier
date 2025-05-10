import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../utils/ThemeContext';

function Navbar({ onLogout, activePage }) {
  const [loginMessage, setLoginMessage] = useState('');
  const location = useLocation();
  const { darkMode, toggleTheme } = useTheme();
  
  // Determine active page from either prop or current location
  const currentPage = activePage || location.pathname.split('/')[1] || 'home';

  useEffect(() => {
    let timer;
    if (loginMessage) {
      timer = setTimeout(() => {
        setLoginMessage('');
      }, 2000);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [loginMessage]);

  return (
    <div className="navbar-container">
      <nav className="navbar">
        <Link to="/home" className="navbar-brand">WalletWise</Link>
        <div className="navbar-menu">
          <Link 
            to="/home" 
            className={`navbar-item ${currentPage === 'home' ? 'active' : ''}`}
          >
            Home
          </Link>
          <Link 
            to="/dashboard" 
            className={`navbar-item ${currentPage === 'dashboard' ? 'active' : ''}`}
          >
            Dashboard
          </Link>
          <Link 
            to="/transactions" 
            className={`navbar-item ${currentPage === 'transactions' ? 'active' : ''}`}
          >
            Transactions
          </Link>

          <div className="theme-toggle-container">
            <label className="theme-toggle">
              <input 
                type="checkbox" 
                checked={darkMode} 
                onChange={toggleTheme} 
              />
              <span className="theme-slider">
                <span className="theme-icon">{darkMode ? '🌙' : '☀️'}</span>
              </span>
            </label>
          </div>
          <button onClick={onLogout} className="login-btn">Logout</button>
        </div>
      </nav>
      {loginMessage && <div className="login-message">{loginMessage}</div>}
    </div>
  );
}

export default Navbar;
