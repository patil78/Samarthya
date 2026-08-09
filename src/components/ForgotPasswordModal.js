import React, { useState } from 'react';

const ForgotPasswordModal = ({ isOpen, onClose, initialUserType = 'student' }) => {
  const [step, setStep] = useState(1); // Step 1: Request OTP, Step 2: Reset Password
  const [userType, setUserType] = useState(initialUserType);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [devOtp, setDevOtp] = useState('');

  if (!isOpen) return null;

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    setDevOtp('');

    try {
      let response = await fetch('http://localhost:8000/forgot-password/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), user_type: userType }),
      });

      if (response.status === 404) {
        // Fallback to /auth/forgot-password
        response = await fetch('http://localhost:8000/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim(), user_type: userType }),
        });
      }

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to request reset OTP.');
      }

      setMessage(data.message || 'OTP sent successfully!');
      if (data.otp) {
        setDevOtp(data.otp);
      }
      setStep(2); // Proceed to OTP + New Password step
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("New password and confirm password do not match.");
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      let response = await fetch('http://localhost:8000/forgot-password/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          user_type: userType,
          otp: otp.trim(),
          new_password: newPassword,
        }),
      });

      if (response.status === 404) {
        // Fallback to /auth/reset-password
        response = await fetch('http://localhost:8000/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email.trim(),
            user_type: userType,
            otp: otp.trim(),
            new_password: newPassword,
          }),
        });
      }

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to reset password.');
      }

      setMessage(data.message || 'Password reset successfully!');
      setTimeout(() => {
        onClose();
        setStep(1);
        setEmail('');
        setOtp('');
        setNewPassword('');
        setConfirmPassword('');
        setMessage('');
        setError('');
      }, 2000);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
        {/* Header */}
        <div className="bg-indigo-600 px-6 py-4 flex justify-between items-center text-white">
          <h2 className="text-xl font-bold">Forgot Password</h2>
          <button onClick={onClose} className="text-indigo-200 hover:text-white text-2xl font-bold">
            &times;
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-3 text-red-700 text-sm rounded">
              {error}
            </div>
          )}
          {message && (
            <div className="mb-4 bg-green-50 border-l-4 border-green-500 p-3 text-green-700 text-sm rounded">
              {message}
            </div>
          )}

          {step === 1 ? (
            /* STEP 1: Enter Email & Request OTP */
            <form onSubmit={handleRequestOtp} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Account Type</label>
                <div className="flex space-x-4 border rounded-lg p-2 bg-gray-50">
                  <label className="flex items-center text-sm font-medium cursor-pointer">
                    <input
                      type="radio"
                      name="modalUserType"
                      value="student"
                      checked={userType === 'student'}
                      onChange={() => setUserType('student')}
                      className="text-indigo-600 focus:ring-indigo-500 mr-1.5"
                    />
                    Student
                  </label>
                  <label className="flex items-center text-sm font-medium cursor-pointer">
                    <input
                      type="radio"
                      name="modalUserType"
                      value="organization"
                      checked={userType === 'organization'}
                      onChange={() => setUserType('organization')}
                      className="text-indigo-600 focus:ring-indigo-500 mr-1.5"
                    />
                    Company
                  </label>
                  <label className="flex items-center text-sm font-medium cursor-pointer">
                    <input
                      type="radio"
                      name="modalUserType"
                      value="admin"
                      checked={userType === 'admin'}
                      onChange={() => setUserType('admin')}
                      className="text-red-600 focus:ring-red-500 mr-1.5"
                    />
                    Admin
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Registered Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="Enter your registered email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 text-sm text-white font-semibold bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400"
                >
                  {loading ? 'Sending OTP...' : 'Send Reset OTP'}
                </button>
              </div>
            </form>
          ) : (
            /* STEP 2: Enter OTP & New Password */
            <form onSubmit={handleResetPassword} className="space-y-4">
              {devOtp && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
                  💡 <strong>Development Mode OTP:</strong> <span className="font-mono text-base font-bold text-amber-900 tracking-wider">{devOtp}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">6-Digit Verification OTP</label>
                <input
                  type="text"
                  required
                  maxLength="6"
                  placeholder="Enter 6-digit OTP code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-center font-mono text-lg font-bold tracking-widest"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">New Password</label>
                <input
                  type="password"
                  required
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Confirm New Password</label>
                <input
                  type="password"
                  required
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs text-indigo-600 hover:underline font-medium"
                >
                  ← Change Email
                </button>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2 text-sm text-white font-semibold bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400"
                  >
                    {loading ? 'Resetting Password...' : 'Reset Password'}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
