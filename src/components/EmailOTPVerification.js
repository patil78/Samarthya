import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const EmailOTPVerification = ({ email, onVerificationSuccess, onBack }) => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [timer, setTimer] = useState(600); // 10 minutes
  const [canResend, setCanResend] = useState(false);

  // Countdown timer
  useEffect(() => {
    if (timer <= 0) {
      setCanResend(true);
      return;
    }
    
    const interval = setInterval(() => {
      setTimer(t => t - 1);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [timer]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    
    if (!otp || otp.length !== 6) {
      setError('Please enter a 6-digit OTP');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const formData = new FormData();
      formData.append('email', email);
      formData.append('otp', otp);

      const response = await fetch(
        'http://127.0.0.1:8000/verify-email-otp',
        {
          method: 'POST',
          body: formData
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'OTP verification failed');
      }

      if (data.success) {
        setSuccess('✅ Email verified successfully!');
        setTimeout(() => {
          console.log(`✅ Email verified for user_id: ${data.user_id}`);
          
          // Call the callback if provided
          if (onVerificationSuccess) {
            onVerificationSuccess(data.user_id);
          }
          
          // Redirect to onboarding
          const redirectUrl = data.redirect_url || `/onboarding/${data.user_id}`;
          console.log(`Redirecting to: ${redirectUrl}`);
          navigate(redirectUrl, { replace: true });
        }, 1500);
      }
    } catch (err) {
      setError(err.message);
      setOtp('');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      setLoading(true);
      setError('');
      
      const formData = new FormData();
      formData.append('email', email);

      const response = await fetch(
        'http://127.0.0.1:8000/resend-email-otp',
        {
          method: 'POST',
          body: formData
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to resend OTP');
      }

      setSuccess('✅ OTP resent to your email');
      setTimer(600); // Reset timer
      setCanResend(false);
      setOtp('');
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block bg-blue-100 p-3 rounded-full mb-4">
            <span className="text-3xl">📧</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Email</h2>
          <p className="text-gray-600">We sent an OTP to</p>
          <p className="text-blue-600 font-semibold">{email}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleVerifyOTP} className="space-y-6">
          {/* OTP Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter OTP
            </label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              maxLength="6"
              className="w-full px-4 py-3 text-center text-2xl tracking-widest border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-2">Enter the 6-digit code sent to your email</p>
          </div>

          {/* Timer */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              OTP expires in: <span className={`font-bold ${timer < 60 ? 'text-red-600' : 'text-blue-600'}`}>
                {formatTime(timer)}
              </span>
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded">
              <p className="font-semibold">⚠️ Error</p>
              <p>{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded">
              <p className="font-semibold">{success}</p>
            </div>
          )}

          {/* Verify Button */}
          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
          >
            {loading ? '⏳ Verifying...' : '✓ Verify Email'}
          </button>
        </form>

        {/* Resend Section */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-600 text-center mb-4">Didn't receive the code?</p>
          <button
            onClick={handleResendOTP}
            disabled={!canResend || loading}
            className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed transition"
          >
            {canResend ? '🔄 Resend OTP' : `⏱️ Resend in ${formatTime(timer)}`}
          </button>
        </div>

        {/* Back Button */}
        <button
          onClick={onBack}
          className="w-full mt-4 text-gray-600 py-2 rounded-lg font-semibold hover:bg-gray-100 transition"
        >
          ← Back to Sign Up
        </button>
      </div>
    </div>
  );
};

export default EmailOTPVerification;
