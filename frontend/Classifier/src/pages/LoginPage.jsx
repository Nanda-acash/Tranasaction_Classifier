import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    let timer;
    if (error) {
      timer = setTimeout(() => {
        setError('');
      }, 2000);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [error]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }
    
    if (username && password) {
      localStorage.setItem('walletwise_user', username);
      navigate('/home');
    } else {
      setError('Backend is down currently');
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h1>WalletWise</h1>
        <h2>Login to your account</h2>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input 
              type="text" 
              id="username" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input 
              type="password" 
              id="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
          </div>
          
          <button type="submit" className="login-submit-btn">Login</button>
        </form>
        
        {error && <div className="login-error">{error}</div>}
      </div>
    </div>
  );
}

export default LoginPage;
