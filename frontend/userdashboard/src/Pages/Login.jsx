import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ShieldCheck, ChevronDown, Activity } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('User');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate login and redirect based on role
    setTimeout(() => {
      setIsLoading(false);
      if (role === 'Admin') {
        navigate('/admin-panel');
      } else {
        navigate('/dashboard');
      }
    }, 2000);
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-deep-black flex items-center justify-center p-6">
      {/* Background Animated Shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ x: [0, 50, 0], y: [0, -30, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="bg-shape w-72 h-72 bg-neon-purple top-[-5%] left-[-5%]" 
        />
        <motion.div 
          animate={{ x: [0, -50, 0], y: [0, 30, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="bg-shape w-96 h-96 bg-electric-purple bottom-[-10%] right-[-5%]" 
        />
      </div>

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="glass-card w-full max-w-[400px] p-7 rounded-2xl relative z-10"
      >
        {/* Header Section */}
        <div className="text-center mb-7">
          <div className="inline-flex items-center justify-center p-2.5 mb-3 rounded-lg bg-neon-purple/10 ring-1 ring-neon-purple/20 animate-glow-pulse">
            <Activity className="w-7 h-7 text-neon-purple" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white neon-glow-text mb-1">
            AI Pharmacy
          </h1>
          <p className="text-white/40 font-medium tracking-widest uppercase text-[10px]">
            Secure Access Portal
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          {/* Email Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-white/60 ml-1">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-white/30 group-focus-within:text-neon-purple transition-colors" />
              <input
                type="email"
                required
                autoComplete="off"
                name="email_hidden"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@gmail.com"
                className="w-full bg-black/30 border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-white/20 neon-border-focus"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-white/60 ml-1">Password</label>
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-white/30 group-focus-within:text-neon-purple transition-colors" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-black/30 border border-white/5 rounded-xl py-2.5 pl-10 pr-10 text-sm text-white placeholder:text-white/20 neon-border-focus"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
              </button>
            </div>
          </div>

          {/* Role Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-white/60 ml-1">Access Role</label>
            <div className="relative group">
              <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-white/30 group-focus-within:text-neon-purple transition-colors" />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-black/30 border border-white/5 rounded-xl py-2.5 pl-10 pr-10 text-sm text-white appearance-none neon-border-focus cursor-pointer"
              >
                <option value="User" className="bg-deep-black text-white">User</option>
                <option value="Admin" className="bg-deep-black text-white">Admin</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none group-focus-within:text-neon-purple transition-all" />
            </div>
          </div>

          {/* Additional Links */}
          <div className="flex items-center justify-end text-[11px] px-1">
            <button 
              type="button"
              onClick={() => navigate('/forgot-password')}
              className="text-white/40 hover:text-neon-purple transition-colors neon-underline pb-0.5"
            >
              Forgot Password?
            </button>
          </div>

          {/* Login Button */}
          <motion.button
            whileHover={{ scale: 1.01, boxShadow: '0 0 20px rgba(168, 85, 247, 0.3)' }}
            whileTap={{ scale: 0.99 }}
            disabled={isLoading || !email || !password}
            type="submit"
            className="w-full bg-gradient-to-r from-neon-purple to-electric-purple text-white text-sm font-bold py-3 rounded-xl flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-neon-purple/10"
          >
            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Activity className="w-4.5 h-4.5" />
              </motion.div>
            ) : (
              <span>Login</span>
            )}
          </motion.button>

          {/* Sign Up Link */}
          <p className="text-center text-[11px] text-white/30">
            Don't have an account?{' '}
            <button 
              onClick={() => navigate('/register')}
              className="text-neon-purple font-semibold hover:text-electric-purple transition-colors ml-0.5"
            >
              Create Account
            </button>
          </p>
        </form>
      </motion.div>

      {/* Footer Branding */}
      
    </div>
  );
};

export default Login;
