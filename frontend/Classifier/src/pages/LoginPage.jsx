import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, signup } from '../utils/auth';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let errorTimer, successTimer;
    
    if (error) {
      errorTimer = setTimeout(() => {
        setError('');
      }, 3000);
    }
    
    if (success) {
      successTimer = setTimeout(() => {
        setSuccess('');
      }, 3000);
    }
    
    return () => {
      if (errorTimer) clearTimeout(errorTimer);
      if (successTimer) clearTimeout(successTimer);
    };
  }, [error, success]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      if (isSignup) {
        // Signup form validation
        if (!username || !password || !confirmPassword) {
          setError('Please fill in all required fields');
          setIsLoading(false);
          return;
        }
        
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          setIsLoading(false);
          return;
        }
        
        if (password.length < 6) {
          setError('Password must be at least 6 characters long');
          setIsLoading(false);
          return;
        }
        
        // Register new user
        const result = await signup(username, password);
        if (result.success) {
          // Switch to login mode after successful signup
          setIsSignup(false);
          setPassword('');
          setSuccess('Signed up successfully! You can now log in.');
          setIsLoading(false);
        } else {
          setError(result.error || 'Failed to register. Please try again.');
          setIsLoading(false);
        }
      } else {
        // Login form validation
        if (!username || !password) {
          setError('Please enter both username and password');
          setIsLoading(false);
          return;
        }
        
        // Login user
        const result = await login(username, password);
        if (result.success) {
          navigate('/home');
        } else {
          setError(result.error || 'Invalid username or password');
          setIsLoading(false);
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Auth error:', err);
      setIsLoading(false);
    }
  };
  
  const toggleMode = () => {
    setIsSignup(!isSignup);
    setError('');
    setSuccess('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h1>WalletWise</h1>
        <h2>{isSignup ? 'Create an account' : 'Login to your account'}</h2>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input 
              type="text" 
              id="username" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              disabled={isLoading}
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
              disabled={isLoading}
            />
          </div>
          
          {isSignup && (
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input 
                type="password" 
                id="confirmPassword" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                disabled={isLoading}
              />
            </div>
          )}
          
          <button 
            type="submit" 
            className="login-submit-btn"
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : isSignup ? 'Sign Up' : 'Login'}
          </button>
        </form>
        
        <div className="auth-toggle">
          <p>
            {isSignup 
              ? 'Already have an account?' 
              : 'Don\'t have an account?'}
            <button 
              type="button" 
              className="toggle-btn" 
              onClick={toggleMode}
              disabled={isLoading}
            >
              {isSignup ? 'Login' : 'Sign Up'}
            </button>
          </p>
        </div>
        
        {error && <div className="login-error">{error}</div>}
        {success && <div className="login-success">{success}</div>}
      </div>
    </div>
  );
}

export default LoginPage;
