import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, AlertCircle } from 'lucide-react';
import { api } from '../lib/api';

export const Register = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    legalName: '',
    taxId: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // 1. Register the user
      await api.post('/api/v1/auth/register', formData);
      
      // 2. Automatically log them in after registration
      const loginResponse = await api.post('/api/v1/auth/login', {
        email: formData.email,
        password: formData.password
      });
      
      const { accessToken } = loginResponse.data;
      localStorage.setItem('accessToken', accessToken);
      
      navigate('/onboarding');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden"
      >
        <div className="p-8">
          <div className="flex items-center justify-center mb-8 overflow-hidden h-16 relative">
            <img src="/logo.jpg" alt="ClearVoice" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] max-w-none mix-blend-multiply" />
          </div>
          
          <h2 className="text-2xl font-semibold text-slate-800 mb-2">Create your account</h2>
          <p className="text-slate-500 mb-8">Set up your organization to start sending e-invoices.</p>

          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-lg flex items-start gap-2 text-red-600 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Organization Legal Name</label>
              <input 
                type="text" 
                name="legalName"
                required
                value={formData.legalName}
                onChange={handleChange}
                className="input-field" 
                placeholder="Acme Corp"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Tax ID</label>
              <input 
                type="text" 
                name="taxId"
                required
                value={formData.taxId}
                onChange={handleChange}
                className="input-field" 
                placeholder="123456789"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
              <input 
                type="email" 
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="input-field" 
                placeholder="admin@company.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('auth.password')}</label>
              <input 
                type="password" 
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="input-field" 
                placeholder="••••••••"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="btn-primary w-full py-2.5 text-base mt-4 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Sign Up <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>
        </div>
        <div className="bg-slate-50 px-8 py-4 border-t border-slate-100 text-center">
          <p className="text-sm text-slate-600">
            {t('auth.already_have')} <Link to="/login" className="font-medium text-primary-600 hover:text-primary-700">{t('auth.sign_in_link')}</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};
