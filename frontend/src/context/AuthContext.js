import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if token exists in localStorage
    const savedToken = localStorage.getItem('admin_token');
    console.log('🔐 AuthContext: Checking token on mount...', savedToken ? 'Token found' : 'No token');
    if (savedToken) {
      setToken(savedToken);
      setIsAuthenticated(true);
      // Set default authorization header
      axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
      console.log('✅ AuthContext: User authenticated');
    } else {
      console.log('❌ AuthContext: No token, user not authenticated');
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      console.log('🔐 Attempting login for:', username);
      const response = await axios.post(`${API}/admin/login`, {
        username,
        password
      });

      const { access_token } = response.data;
      console.log('✅ Login successful, token received');
      
      // Save token
      localStorage.setItem('admin_token', access_token);
      setToken(access_token);
      setIsAuthenticated(true);
      
      // Set default authorization header
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      console.log('✅ Token saved to localStorage and state updated');
      return { success: true };
    } catch (error) {
      console.error('❌ Login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.detail || 'فشل تسجيل الدخول'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    setToken(null);
    setIsAuthenticated(false);
    delete axios.defaults.headers.common['Authorization'];
  };

  const value = {
    isAuthenticated,
    token,
    loading,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
