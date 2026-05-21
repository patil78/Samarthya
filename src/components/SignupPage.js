import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import EmailOTPVerification from './EmailOTPVerification';

const SignupPage = () => {
  const [step, setStep] = useState('signup'); // 'signup' or 'verify_email'
  const [formData, setFormData] = useState({
    name: '', // For company name
    email: '',
    mobile: '', // For student mobile
    password: '',
    confirmPassword: '',
  });
  const [userType, setUserType] = useState('student');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    // Validation
    if (userType === 'student' && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Determine the correct endpoint and request body based on user type
    const isStudent = userType === 'student';
    const endpoint = isStudent ? '/student/signup' : '/organization/signup';
    
    const body = new FormData();
    body.append('email', formData.email);
    body.append('password', formData.password);
    
    if (isStudent) {
      body.append('mobile', formData.mobile);
    } else {
      body.append('name', formData.name);
    }

    try {
      setLoading(true);
      const response = await fetch(`http://127.0.0.1:8000${endpoint}`, {
        method: 'POST',
        body: body,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Signup failed.');
      }
      
      // For students, move to email verification step
      if (isStudent && data.success && data.step === 'email_verification') {
        setStep('verify_email');
      } else {
        // For organizations, just show success and redirect
        setMessage(data.message);
        alert('Signup successful! Please log in.');
        navigate('/login');
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationSuccess = (userId) => {
    console.log(`✅ Verification callback triggered with user_id: ${userId}`);
    // Navigation is handled by EmailOTPVerification component
    // This callback can be used for any additional logic if needed
  };

  // Step 1: Signup Form
  if (step === 'signup') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Create an Account</h1>
          </div>

          <div className="flex justify-center space-x-6 mb-6 border-b pb-4">
            <label className="flex items-center cursor-pointer">
              <input type="radio" name="userType" value="student" checked={userType === 'student'} onChange={() => setUserType('student')} className="h-4 w-4 text-indigo-600"/>
              <span className="ml-2 text-gray-700 font-medium">Student</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input type="radio" name="userType" value="organization" checked={userType === 'organization'} onChange={() => setUserType('organization')} className="h-4 w-4 text-indigo-600"/>
              <span className="ml-2 text-gray-700 font-medium">Company</span>
            </label>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Conditionally render Name or Mobile field based on user type */}
            {userType === 'organization' && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Company Name</label>
                <input type="text" id="name" name="name" value={formData.name} onChange={handleFormChange} required className="mt-1 block w-full px-3 py-2 border rounded-md" />
              </div>
            )}
            {userType === 'student' && (
              <div>
                <label htmlFor="mobile" className="block text-sm font-medium text-gray-700">Mobile Number</label>
                <input type="tel" id="mobile" name="mobile" value={formData.mobile} onChange={handleFormChange} required className="mt-1 block w-full px-3 py-2 border rounded-md" />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
              <input type="email" id="email" name="email" value={formData.email} onChange={handleFormChange} required className="mt-1 block w-full px-3 py-2 border rounded-md" />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
              <input type="password" id="password" name="password" value={formData.password} onChange={handleFormChange} required className="mt-1 block w-full px-3 py-2 border rounded-md" />
            </div>

            {/* Show Confirm Password only for students */}
            {userType === 'student' && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
                <input type="password" id="confirmPassword" name="confirmPassword" value={formData.confirmPassword} onChange={handleFormChange} required className="mt-1 block w-full px-3 py-2 border rounded-md" />
              </div>
            )}

            <div>
              <button 
                type="submit" 
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border rounded-md shadow-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
              >
                {loading ? '⏳ Creating Account...' : (userType === 'student' ? '📧 Continue to Email Verification' : 'Create Account')}
              </button>
            </div>
          </form>

          {message && <p className="mt-4 text-center text-sm text-green-600">{message}</p>}
          {error && <p className="mt-4 text-center text-sm text-red-600">{error}</p>}
          
          <p className="mt-6 text-center text-sm text-gray-600">Already have an account?{' '} <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">Login</Link></p>
        </div>
      </div>
    );
  }

  // Step 2: Email OTP Verification (only for students)
  if (step === 'verify_email' && userType === 'student') {
    return (
      <EmailOTPVerification
        email={formData.email}
        onVerificationSuccess={handleVerificationSuccess}
        onBack={() => {
          setStep('signup');
          setError('');
          setMessage('');
        }}
      />
    );
  }
};

export default SignupPage;
