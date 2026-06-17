/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../config/api.js';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [rider, setRider] = useState(null);
  const [token, setToken] = useState(null);
  const [userType, setUserType] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUserType = localStorage.getItem('userType');
    const storedUser = localStorage.getItem('user');
    const storedRider = localStorage.getItem('rider');

    if (storedToken) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setToken(storedToken);
      setUserType(storedUserType);
      if (storedUserType === 'rider' && storedRider) {
        setRider(JSON.parse(storedRider));
      } else if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    }
    setLoading(false);
  }, []);

  const login = async (phone) => {
    const response = await api.auth.login({ phone });
    setToken(response.token);
    setUser(response.user);
    setRider(null);
    setUserType('user');
    localStorage.setItem('token', response.token);
    localStorage.setItem('userType', 'user');
    localStorage.setItem('user', JSON.stringify(response.user));
    return response;
  };

  const register = async (data) => {
    const response = await api.auth.register(data);
    setToken(response.token);
    setUser(response.user);
    setRider(null);
    setUserType('user');
    localStorage.setItem('token', response.token);
    localStorage.setItem('userType', 'user');
    localStorage.setItem('user', JSON.stringify(response.user));
    return response;
  };

  const riderLogin = async (phone) => {
    const response = await api.riderAuth.login({ phone });
    setToken(response.token);
    setRider(response.rider);
    setUser(null);
    setUserType('rider');
    localStorage.setItem('token', response.token);
    localStorage.setItem('userType', 'rider');
    localStorage.setItem('rider', JSON.stringify(response.rider));
    return response;
  };

  const riderRegister = async (data) => {
    const response = await api.riderAuth.register(data);
    setToken(response.token);
    setRider(response.rider);
    setUser(null);
    setUserType('rider');
    localStorage.setItem('token', response.token);
    localStorage.setItem('userType', 'rider');
    localStorage.setItem('rider', JSON.stringify(response.rider));
    return response;
  };

  const logout = () => {
    setUser(null);
    setRider(null);
    setToken(null);
    setUserType(null);
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    localStorage.removeItem('user');
    localStorage.removeItem('rider');
  };

  const updateUser = (userData) => {
    setUser(prev => ({ ...prev, ...userData }));
    localStorage.setItem('user', JSON.stringify({ ...user, ...userData }));
  };

  const value = {
    user,
    rider,
    token,
    userType,
    loading,
    login,
    register,
    riderLogin,
    riderRegister,
    logout,
    updateUser,
    isAuthenticated: !!token
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
