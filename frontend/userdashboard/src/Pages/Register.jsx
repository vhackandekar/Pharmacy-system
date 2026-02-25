import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';

const Register = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'User'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    
    setIsLoading(true);

    try {
      // Call backend registration
      await authAPI.register({
        name: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: formData.role.toUpperCase(), // Normalize to USER/ADMIN
        phone: "+91 98765 43210" // Default phone for now
      });

      // Prepare user data for context (though we might wait for login or OTP)
      const userData = {
        name: formData.fullName,
        role: formData.role,
        initials: formData.fullName.split(' ').map(name => name[0]).join('').toUpperCase()
      };
      
      // Notify user and navigate
      setShowPopup(true);
      setTimeout(() => {
        setIsLoading(false);
        navigate('/verify-otp');
      }, 2000);
    } catch (error) {
      console.error("Registration failed:", error);
      const msg = error.response?.data?.error || error.response?.data?.message || error.message || "Registration failed. Please try again.";
      alert(msg);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B0A14] p-8 overflow-hidden relative">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-purple-900/20 blur-[100px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-purple-900/20 blur-[100px] rounded-full"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md bg-white/5 backdrop-blur-lg p-8 rounded-2xl border border-purple-500/20 shadow-[0_0_50px_-12px_rgba(124,58,237,0.3)] space-y-5 relative z-10"
      >
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
            Create Account
          </h1>
          <p className="text-purple-300/60 text-sm font-medium tracking-wide">
            Join AI Pharmacy Platform
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-purple-300/70 ml-1">Full Name</label>
            <input
              type="text"
              required
              autoComplete="off"
              placeholder="John Doe"
              className="w-full bg-[#141225] border border-purple-800 text-white rounded-lg px-4 py-3 text-sm focus:border-purple-400 focus:ring-2 focus:ring-purple-500/40 outline-none transition-all duration-300 placeholder:text-purple-300/20"
              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-purple-300/70 ml-1">Email Address</label>
            <input
              type="email"
              required
              autoComplete="off"
              placeholder="example@gmail.com"
              className="w-full bg-[#141225] border border-purple-800 text-white rounded-lg px-4 py-3 text-sm focus:border-purple-400 focus:ring-2 focus:ring-purple-500/40 outline-none transition-all duration-300 placeholder:text-purple-300/20"
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-purple-300/70 ml-1">Password</label>
              <input
                type="password"
                required
                autoComplete="new-password"
                placeholder="••••••••"
                className="w-full bg-[#141225] border border-purple-800 text-white rounded-lg px-4 py-3 text-sm focus:border-purple-400 focus:ring-2 focus:ring-purple-500/40 outline-none transition-all duration-300 placeholder:text-purple-300/20"
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-purple-300/70 ml-1">Confirm</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                className="w-full bg-[#141225] border border-purple-800 text-white rounded-lg px-4 py-3 text-sm focus:border-purple-400 focus:ring-2 focus:ring-purple-500/40 outline-none transition-all duration-300 placeholder:text-purple-300/20"
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-purple-300/70 ml-1">Select Role</label>
            <select
              className="w-full bg-[#141225] border border-purple-800 text-white rounded-lg px-4 py-3 text-sm focus:border-purple-400 focus:ring-2 focus:ring-purple-500/40 outline-none transition-all duration-300 appearance-none cursor-pointer"
              onChange={(e) => setFormData({...formData, role: e.target.value})}
              value={formData.role}
            >
              <option value="User">User</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-purple-600 to-purple-800 text-white font-bold py-3 rounded-lg mt-2 hover:scale-[1.03] hover:shadow-[0_0_20px_rgba(124,58,237,0.4)] active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <p className="text-center text-xs text-purple-300/40 pt-2">
          Already have an account?{' '}
          <button 
            onClick={() => navigate('/')}
            className="text-purple-400 font-semibold hover:text-purple-300 transition-colors ml-1"
          >
            Login
          </button>
        </p>
      </motion.div>

      {/* OTP Sent Popup */}
      <AnimatePresence>
        {showPopup && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="absolute bottom-10 z-50 bg-[#141225] border border-purple-500/30 px-6 py-4 rounded-xl shadow-[0_0_30px_rgba(124,58,237,0.2)] flex items-center space-x-4 backdrop-blur-md"
          >
            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
              <Activity className="w-6 h-6 text-purple-400 animate-pulse" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm">OTP Sent!</h4>
              <p className="text-purple-300/60 text-xs text-nowrap">Verification code sent to your email.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Register;
