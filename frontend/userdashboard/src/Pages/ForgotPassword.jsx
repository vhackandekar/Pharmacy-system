import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { KeyRound, CheckCircle2, ArrowLeft } from 'lucide-react';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B0A14] p-8 overflow-hidden relative">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-purple-900/10 blur-[100px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-purple-900/10 blur-[100px] rounded-full"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md bg-white/5 backdrop-blur-lg p-8 rounded-2xl border border-purple-500/30 shadow-xl shadow-purple-500/20 space-y-5 relative z-10"
      >
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 rounded-full bg-purple-500/10 mb-2">
            <KeyRound className="w-8 h-8 text-purple-400" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
            Forgot Password
          </h1>
          <p className="text-purple-300/60 text-sm">
            Reset your account password securely
          </p>
        </div>

        <AnimatePresence mode="wait">
          {!isSubmitted ? (
            <motion.form 
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={handleSubmit} 
              className="space-y-5"
            >
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-purple-300/70 ml-1">Email Address</label>
                <input
                  type="email"
                  required
                  autoComplete="off"
                  placeholder="example@gmail.com"
                  className="w-full bg-[#141225] border border-purple-800 text-white rounded-lg px-4 py-3 text-sm focus:border-purple-400 focus:ring-2 focus:ring-purple-500/40 outline-none transition-all duration-300 placeholder:text-gray-400"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !email}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-800 text-white font-semibold py-3 rounded-lg hover:scale-105 hover:shadow-purple-500/40 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? "Sending..." : "Send Reset Link"}
              </button>
            </motion.form>
          ) : (
            <motion.div 
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-purple-500/10 border border-purple-500/30 p-4 rounded-xl flex items-start space-x-3"
            >
              <CheckCircle2 className="w-5 h-5 text-purple-400 mt-0.5 shrink-0" />
              <p className="text-purple-200 text-sm font-medium">
                Password reset link sent to your email. Please check your inbox.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <button 
          onClick={() => navigate('/')}
          className="w-full flex items-center justify-center space-x-2 text-xs text-purple-300/40 hover:text-purple-300 transition-colors pt-2 group"
        >
          <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Login</span>
        </button>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
