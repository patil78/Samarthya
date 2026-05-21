import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // On initial load, check if user data exists in localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Updated login function to call the real backend
  const login = async (email, password, userType) => { 
    try {
      let endpoint, role, idField;
      
      if (userType === 'student') {
        endpoint = '/student/login';
        role = 'student';
        idField = 'user_id';
      } else if (userType === 'admin') {
        endpoint = '/admin/login';
        role = 'admin';
        idField = 'admin_id';
      } else {
        endpoint = '/organization/login';
        role = 'company';
        idField = 'organization_id';
      }
      
      const body = new URLSearchParams();
      body.append('email', email);
      body.append('password', password);

      const response = await fetch(`http://127.0.0.1:8000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Login failed');
      }

      const id = data[idField];
      const name = data.name || '';
      const mobile = data.mobile || "";
      
      const userData = { token: 'real-token', role: role, id: id, email: email, name: name };
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('mobile', mobile);   // ✅ IMPORTANT

      setUser(userData);

      // Redirect based on role
      switch (role) {
        case 'student':
          navigate('/student/dashboard');
          break;
        case 'company':
          navigate('/company/dashboard');
          break;
        case 'admin':
          navigate('/admin/dashboard');
          break;
        default:
          navigate('/login');
      }
    } catch (error) {
      console.error("Login failed:", error);
      alert(error.message); 
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

