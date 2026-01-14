import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // We'll use the updated login function from here

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // State to track if the user is a student or an organization
  const [userType, setUserType] = useState('student');
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Pass the selected userType to the login function
    await login(email, password, userType);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Login</h1>
        </div>

        {/* User Type Selector */}
        <div className="flex justify-center space-x-4 mb-6 border-b pb-4">
          <label className="flex items-center cursor-pointer">
            <input 
              type="radio" 
              name="userType" 
              value="student" 
              checked={userType === 'student'} 
              onChange={() => setUserType('student')} 
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="ml-2 text-gray-700 font-medium">Student</span>
          </label>
          <label className="flex items-center cursor-pointer">
            <input 
              type="radio" 
              name="userType" 
              value="organization" 
              checked={userType === 'organization'} 
              onChange={() => setUserType('organization')} 
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="ml-2 text-gray-700 font-medium">Company</span>
          </label>
          <label className="flex items-center cursor-pointer">
            <input 
              type="radio" 
              name="userType" 
              value="admin" 
              checked={userType === 'admin'} 
              onChange={() => setUserType('admin')} 
              className="h-4 w-4 text-red-600 focus:ring-red-500"
            />
            <span className="ml-2 text-gray-700 font-medium">Admin</span>
          </label>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
            <input
              type="email" id="email" value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password" id="password" value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <button type="submit" className="w-full flex justify-center py-3 px-4 border rounded-md shadow-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
              Sign In
            </button>
          </div>
        </form>
        <p className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link to="/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;

