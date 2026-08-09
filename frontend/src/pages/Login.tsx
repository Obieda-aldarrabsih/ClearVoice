import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FileCheck2, ArrowRight } from 'lucide-react';

export const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate login
    setTimeout(() => {
      setLoading(false);
      navigate('/dashboard');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden"
      >
        <div className="p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-primary-600 p-2.5 rounded-xl shadow-sm">
              <FileCheck2 className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-slate-900 tracking-tight">ClearVoice</span>
          </div>
          
          <h2 className="text-2xl font-semibold text-slate-800 mb-2">Welcome back</h2>
          <p className="text-slate-500 mb-8">Sign in to your ClearVoice portal to manage e-invoicing compliance.</p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
              <input 
                type="email" 
                required
                className="input-field" 
                placeholder="admin@company.com"
                defaultValue="admin@company.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <input 
                type="password" 
                required
                className="input-field" 
                placeholder="••••••••"
                defaultValue="password123"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded border-slate-300 text-primary-600 focus:ring-primary-500" />
                <span className="text-sm text-slate-600">Remember me</span>
              </label>
              <a href="#" className="text-sm font-medium text-primary-600 hover:text-primary-700">Forgot password?</a>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="btn-primary w-full py-2.5 text-base mt-2 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Sign In <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>
        </div>
        <div className="bg-slate-50 px-8 py-4 border-t border-slate-100 text-center">
          <p className="text-sm text-slate-600">
            Don't have an account? <a href="#" className="font-medium text-primary-600 hover:text-primary-700">Request access</a>
          </p>
        </div>
      </motion.div>
    </div>
  );
};
