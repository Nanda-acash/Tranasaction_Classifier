import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, signup } from '../utils/auth';
import './LoginPage.css';
import loginIllustration from '../assets/finance-illustration.svg';

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

  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="login-page">
      <div className="login-illustration">
        <div className="illustration-container">
          <img src={loginIllustration} alt="Financial analytics illustration" />
        </div>
      </div>
      
      <div className="login-form-container">
        <div className="login-form-wrapper">
          <div className="login-branding">
            <h1 className="app-name">WalletWise</h1>
          </div>
          
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
              <div className="password-field">
                <input 
                  type={showPassword ? "text" : "password"} 
                  id="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  disabled={isLoading}
                />
                <button 
                  type="button" 
                  className="password-toggle" 
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
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
              className="submit-button"
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : isSignup ? 'Sign Up' : 'Sign In'}
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
                {isSignup ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
          </div>
          
          {error && <div className="message error-message">{error}</div>}
          {success && <div className="message success-message">{success}</div>}
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
