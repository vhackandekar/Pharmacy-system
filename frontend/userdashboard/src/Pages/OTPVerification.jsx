import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, Activity } from 'lucide-react';

const OTPVerification = () => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef([]);

  const handleChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Move to next input if value is entered
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Focus previous input on backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleVerify = (e) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate verification
    setTimeout(() => {
      setIsLoading(false);
      navigate('/');
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B0A14] p-8 overflow-hidden relative">
      <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-purple-900/20 blur-[100px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-purple-900/20 blur-[100px] rounded-full"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white/5 backdrop-blur-lg p-10 rounded-2xl border border-purple-500/20 shadow-[0_0_50px_-12px_rgba(124,58,237,0.3)] space-y-7 relative z-10 text-center"
      >
        <div className="space-y-3">
          <div className="inline-flex items-center justify-center p-3 rounded-full bg-purple-500/10 mb-2">
            <ShieldCheck className="w-8 h-8 text-purple-400" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
            Verify Email
          </h1>
          <p className="text-purple-300/60 text-sm">
            Please enter the 6-digit code sent to your email
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-8">
          <div className="flex justify-center gap-3">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                maxLength="1"
                value={digit}
                autoComplete="off"
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-14 bg-[#141225] border border-purple-800 text-white rounded-lg text-center text-xl font-bold focus:border-purple-400 focus:ring-2 focus:ring-purple-500/40 outline-none transition-all duration-300"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={isLoading || otp.some(d => !d)}
            className="w-full bg-gradient-to-r from-purple-600 to-purple-800 text-white font-bold py-3.5 rounded-lg hover:scale-[1.03] hover:shadow-[0_0_20px_rgba(124,58,237,0.4)] active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isLoading ? (
               <>
                 <Activity className="w-5 h-5 animate-spin" />
                 <span>Verifying...</span>
               </>
            ) : "Verify & Create Account"}
          </button>
        </form>

        <div className="space-y-4 pt-4 border-t border-white/5">
          <p className="text-xs text-purple-300/40">
            Didn't receive the code?{' '}
            <button className="text-purple-400 font-semibold hover:text-purple-300 transition-colors">
              Resend Code
            </button>
          </p>
          <button 
            onClick={() => navigate('/register')}
            className="text-xs text-purple-300/40 hover:text-purple-300 transition-colors"
          >
            Back to Registration
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default OTPVerification;
