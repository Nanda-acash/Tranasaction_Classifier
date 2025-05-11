import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from './api';

// Check if user is authenticated
export const isAuthenticated = () => {
  return localStorage.getItem('walletwise_token') !== null;
};

// Get the current user's username
export const getUsername = () => {
  return localStorage.getItem('walletwise_username');
};

// Get the authentication token
export const getToken = () => {
  return localStorage.getItem('walletwise_token');
};

// Login user and store token
export const login = async (username, password) => {
  try {
    const data = await authApi.login(username, password);
    localStorage.setItem('walletwise_token', data.access_token);
    localStorage.setItem('walletwise_username', username);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Register a new user
export const signup = async (username, password) => {
  try {
    await authApi.signup({ username, password });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Logout user
export const logout = () => {
  localStorage.removeItem('walletwise_token');
  localStorage.removeItem('walletwise_username');
};

function RequireAuth({ children }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
    }
  }, [navigate]);

  return isAuthenticated() ? children : null;
}

export { RequireAuth };
