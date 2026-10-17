import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FileCheck2, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { api } from '../lib/api';

export const RequestAccess = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    organizationName: '',
    message: ''
  });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await api.post('/api/v1/access-requests', formData);
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.error || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl w-full bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden my-8"
      >
        <div className="p-8 md:p-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-primary-600 p-2.5 rounded-xl shadow-sm">
              <FileCheck2 className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-slate-900 tracking-tight">ClearVoice</span>
          </div>
          
          <h2 className="text-2xl font-semibold text-slate-800 mb-2">{t('auth.req_access_title')}</h2>
          <p className="text-slate-500 mb-8">{t('auth.req_access_desc')}</p>

          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-lg flex items-start gap-2 text-red-600 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-6 bg-green-50 border border-green-100 rounded-lg flex flex-col items-center gap-4 text-center">
              <div className="bg-green-100 p-3 rounded-full">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-green-800 mb-1">{t('auth.req_success')}</h3>
                <p className="text-sm text-green-700">
                  Your request has been sent to the organization administrator. You will be notified by email once approved.
                </p>
              </div>
            </div>
          )}

          {!success && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('auth.full_name')}</label>
                  <input 
                    type="text" 
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleChange}
                    className="input-field" 
                    placeholder="John Doe"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('auth.work_email')}</label>
                  <input 
                    type="email" 
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="input-field" 
                    placeholder="john@company.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('auth.org_name')}</label>
                <input 
                  type="text" 
                  name="organizationName"
                  required
                  value={formData.organizationName}
                  onChange={handleChange}
                  className="input-field" 
                  placeholder="Acme Corp"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('auth.message_opt')}</label>
                <textarea 
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  className="input-field min-h-[100px] resize-y" 
                  placeholder="Please grant me access to submit invoices..."
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="btn-primary w-full py-3 text-base mt-4 flex items-center justify-center gap-2 shadow-sm"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>{t('auth.submit_req')} <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </form>
          )}
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
