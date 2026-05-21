// src/components/AuthPage.jsx

import React from 'react';
import { Link } from 'react-router-dom'; // Import Link from react-router-dom

// ... (keep the Logo component as it was)
const Logo = () => (
  <svg height="48" viewBox="0 0 128 128" width="48" xmlns="http://www.w3.org/2000/svg">
    <path d="M64 128a64 64 0 1164-64 64.07 64.07 0 01-64 64zM64 4a60 60 0 1060 60A60.07 60.07 0 0064 4z" fill="#3f51b5"/>
    <path d="M64 100a36 36 0 1136-36 36 36 0 01-36 36zm0-68a32 32 0 1032 32 32 32 0 00-32-32z" fill="#3f51b5"/>
    <circle cx="64" cy="64" r="26" fill="#42a5f5"/>
  </svg>
);


const AuthPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <div className="bg-white p-8 md:p-12 rounded-2xl shadow-xl w-full max-w-md text-center">
        <div className="flex flex-col items-center mb-8">
          <Logo />
          <h1 className="text-3xl font-bold text-gray-800 mt-4">
            Welcome to Samarthya
          </h1>
          <p className="text-gray-500 mt-2">
            Let's get you set up.
          </p>
        </div>

        <div className="space-y-4">
          
          {/* Sign Up Link (styled as a button) */}
          <Link
            to="/signup"
            className="block w-full bg-indigo-600 text-white font-semibold py-3 rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-75 transition duration-300"
          >
            Signup
          </Link>
          
          {/* Login Link (styled as a button) */}
          <Link
            to="/login"
            className="block w-full bg-white text-indigo-600 font-semibold py-3 rounded-lg border-2 border-indigo-600 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-75 transition duration-300"
          >
            Login
          </Link>

        </div>
      </div>

      <footer className="mt-8 text-center text-gray-400 text-sm">
        <p>&copy; {new Date().getFullYear()} Your Company Inc. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default AuthPage;