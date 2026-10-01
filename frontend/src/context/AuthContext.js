import React, { createContext, useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginUser, registerUser, logoutUser } from '../services/authService';
import { setUnauthorizedHandler } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } catch (e) {
      console.warn('Failed to clear stored session', e);
    } finally {
      setUserToken(null);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(logout);
    (async () => {
      try {
        const [[, token], [, userData]] = await AsyncStorage.multiGet(['userToken', 'userData']);
        if (token && userData) {
          setUserToken(token);
          setUser(JSON.parse(userData));
        }
      } catch (e) {
        console.error('Failed to load auth state', e);
      } finally {
        setIsLoading(false);
      }
    })();
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  const login = async (email, password) => {
    const { token, user: userData } = await loginUser(email, password);
    setUserToken(token);
    setUser(userData);
  };

  const register = async (details) => {
    const { token, user: userData } = await registerUser(details);
    setUserToken(token);
    setUser(userData);
  };

  return (
    <AuthContext.Provider value={{ userToken, user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
