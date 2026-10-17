import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FileCheck2, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { api } from '../lib/api';

export const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await api.post('/api/v1/auth/forgot-password', { email });
      setSuccess(true);
      // In dev mode, we log the token from the header if it exists
      if (response.headers['x-debug-reset-token']) {
        console.log('DEV RESET TOKEN:', response.headers['x-debug-reset-token']);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
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
          
          <h2 className="text-2xl font-semibold text-slate-800 mb-2">Reset Password</h2>
          <p className="text-slate-500 mb-8">Enter your email address to receive password reset instructions.</p>

          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-lg flex items-start gap-2 text-red-600 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-3 bg-green-50 border border-green-100 rounded-lg flex items-start gap-2 text-green-700 text-sm">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <p>If an account with that email exists, password reset instructions have been sent.</p>
            </div>
          )}

          {!success && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field" 
                  placeholder="name@company.com"
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="btn-primary w-full py-2.5 text-base mt-2 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Send Instructions <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </form>
          )}
        </div>
        <div className="bg-slate-50 px-8 py-4 border-t border-slate-100 text-center">
          <p className="text-sm text-slate-600">
            Remembered your password? <Link to="/login" className="font-medium text-primary-600 hover:text-primary-700">Back to Login</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};
