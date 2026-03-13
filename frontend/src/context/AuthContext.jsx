import { createContext, useState, useEffect } from 'react';
import { loginCall, registerCall, logoutCall, googleLoginCall } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loggedInUser = localStorage.getItem('user');
    if (loggedInUser) {
      setUser(JSON.parse(loggedInUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const data = await loginCall(email, password);
    setUser(data);
    return data;
  };

  const register = async (name, email, password, role) => {
    const data = await registerCall(name, email, password, role);
    setUser(data);
    return data;
  };

  const googleLogin = async (token, role) => {
    const data = await googleLoginCall(token, role);
    setUser(data);
    return data;
  };

  const logout = () => {
    logoutCall();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, googleLogin, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
