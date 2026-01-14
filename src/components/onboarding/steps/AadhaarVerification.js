import React, { useState, useEffect } from 'react';

// --- Captcha Component (same as before) ---
const SimulatedCaptcha = ({ onVerify }) => {
  const [captchaText, setCaptchaText] = useState('');
  const [userInput, setUserInput] = useState('');

  useEffect(() => {
    const randomText = Math.random().toString(36).substring(2, 8).toUpperCase();
    setCaptchaText(randomText);
  }, []);

  const handleChange = (e) => {
    setUserInput(e.target.value);
    onVerify(e.target.value.toUpperCase() === captchaText);
  };

  return (
    <div>
      <div className="bg-gray-200 p-2 rounded-md text-center my-2">
        <span className="text-2xl font-bold tracking-widest select-none italic">{captchaText}</span>
      </div>
      <input
        type="text"
        value={userInput}
        onChange={handleChange}
        placeholder="Enter captcha"
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
      />
    </div>
  );
};

// --- Aadhaar Verification Component ---
const AadhaarVerification = ({ data, handleChange, nextStep }) => {
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);
  const [otp, setOtp] = useState('');
  const [status, setStatus] = useState('');

  const sendOtp = async () => {
    setStatus("Sending OTP...");
    try {
      const res = await fetch("http://127.0.0.1:8000/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aadhaar: data.aadhaar }),
      });
      const result = await res.json();
      if (res.ok) {
        setStatus(result.message);
      } else {
        setStatus(`Error: ${result.detail || "Failed to send OTP"}`);
      }
    } catch (err) {
      console.error("Fetch Error:", err);
      setStatus("Network Error: Could not connect to the backend server.");
    }
  };

  const verifyOtp = async () => {
    setStatus("Verifying OTP...");
    try {
      const res = await fetch("http://127.0.0.1:8000/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aadhaar: data.aadhaar, otp }),
      });
      const result = await res.json();
      if (res.ok) {
        setStatus(result.message);
      } else {
        setStatus(`Error: ${result.detail || "Verification failed"}`);
      }
    } catch (err) {
      console.error("Fetch Error:", err);
      setStatus("Network Error: Could not connect to the backend server.");
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Aadhaar Verification</h2>
      <div className="space-y-4">
        <div>
          <label htmlFor="aadhaar" className="block text-sm font-medium text-gray-700">
            Aadhaar Number
          </label>
          <input
            type="text"
            name="aadhaar"
            id="aadhaar"
            value={data.aadhaar || ''}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            placeholder="XXXX XXXX XXXX"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Captcha</label>
          <SimulatedCaptcha onVerify={setIsCaptchaVerified} />
        </div>
        <div>
          <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
            OTP
          </label>
          <input
            type="text"
            id="otp"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter OTP received on your mobile"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
          />
        </div>
      </div>
      <div className="mt-6 flex gap-3">
        <button
          onClick={sendOtp}
          disabled={!data.aadhaar || !isCaptchaVerified}
          className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md shadow-sm hover:bg-blue-700 disabled:bg-gray-400"
        >
          Send OTP
        </button>
        <button
          onClick={verifyOtp}
          disabled={!otp}
          className="px-6 py-2 bg-green-600 text-white font-semibold rounded-md shadow-sm hover:bg-green-700 disabled:bg-gray-400"
        >
          Verify OTP
        </button>
        <button
          onClick={nextStep}
          // ✅ CORRECTED LOGIC: This now checks for both the success symbol AND the word "ELIGIBLE".
          disabled={!(status.includes("✅") && status.includes("ELIGIBLE"))}
          className="ml-auto px-6 py-2 bg-indigo-600 text-white font-semibold rounded-md shadow-sm hover:bg-indigo-700 disabled:bg-gray-400"
        >
          Next
        </button>
      </div>
      {status && <p className="mt-4 text-sm font-medium">{status}</p>}
    </div>
  );
};

export default AadhaarVerification;

