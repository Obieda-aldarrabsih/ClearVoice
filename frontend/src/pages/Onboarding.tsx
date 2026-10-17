import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../lib/api';
import { 
  Code, 
  LayoutDashboard, 
  CheckCircle2, 
  Loader2, 
  ArrowRight,
  KeyRound
} from 'lucide-react';
import { useToast } from '../components/ui/ToastProvider';

export function Onboarding() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Step 1 State
  const [companyData, setCompanyData] = useState({
    legalName: '',
    taxId: '',
    address: '',
    city: '',
    country: 'Jordan'
  });

  // Step 2 State
  const [apiKey, setApiKey] = useState<string | null>(null);

  const handleCompanySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put('/api/v1/tenant/settings', companyData);
      setStep(2);
    } catch (err: any) {
      showToast(err.response?.data?.message || t('common.error_occurred'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleIntegrationChoice = async (choice: 'developer' | 'dashboard') => {
    setLoading(true);
    try {
      if (choice === 'developer') {
        const res = await api.post('/api/v1/apikeys', { name: 'Production Key' });
        setApiKey(res.data.clearTextKey);
        setStep(3);
      } else {
        // Create a mock invoice for dashboard experience
        await api.post('/api/v1/invoices', {
          externalRef: `DEMO-${Date.now()}`,
          buyerName: 'Sample Customer',
          buyerTaxId: '123456789',
          currency: 'JOD',
          lines: [
            {
              description: 'Consulting Services',
              quantity: 1,
              unitPrice: 100,
              taxRate: 16
            }
          ]
        });
        setStep(3);
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || t('common.error_occurred'), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      {/* Brand Header */}
      <div className="mb-8">
        <img src="/logo.jpg" alt="ClearVoice" className="h-10 mix-blend-multiply object-contain scale-[1.5]" />
      </div>

      <div className="w-full max-w-2xl bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Progress Indicator */}
        <div className="bg-slate-50 border-b border-slate-100 px-8 py-6">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 rounded-full z-0"></div>
            <div 
              className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary-600 rounded-full z-0 transition-all duration-300"
              style={{ width: `${((step - 1) / 2) * 100}%` }}
            ></div>
            
            {[1, 2, 3].map((num) => (
              <div 
                key={num} 
                className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm transition-colors ${
                  step >= num 
                    ? 'bg-primary-600 text-white shadow-md' 
                    : 'bg-white text-slate-400 border-2 border-slate-200'
                }`}
              >
                {step > num ? <CheckCircle2 className="w-6 h-6" /> : num}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-3 text-xs font-medium text-slate-500">
            <span>{t('onboarding.step1')}</span>
            <span>{t('onboarding.step2')}</span>
            <span>{t('onboarding.step3')}</span>
          </div>
        </div>

        {/* Step 1: Company Details */}
        {step === 1 && (
          <div className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">{t('onboarding.welcome_title')}</h2>
              <p className="text-slate-500">{t('onboarding.welcome_desc')}</p>
            </div>

            <form onSubmit={handleCompanySubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('onboarding.legal_name')}</label>
                  <input 
                    required
                    type="text" 
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                    value={companyData.legalName}
                    onChange={e => setCompanyData({...companyData, legalName: e.target.value})}
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('onboarding.tax_id')}</label>
                  <input 
                    required
                    type="text" 
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                    value={companyData.taxId}
                    onChange={e => setCompanyData({...companyData, taxId: e.target.value})}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('onboarding.address')}</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                    value={companyData.address}
                    onChange={e => setCompanyData({...companyData, address: e.target.value})}
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('onboarding.city')}</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                    value={companyData.city}
                    onChange={e => setCompanyData({...companyData, city: e.target.value})}
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('onboarding.country')}</label>
                  <input 
                    disabled
                    type="text" 
                    className="w-full px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed"
                    value={companyData.country}
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors disabled:opacity-70 flex items-center gap-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {t('common.continue')}
                  <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Step 2: Integration Mode */}
        {step === 2 && (
          <div className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">{t('onboarding.integration_title')}</h2>
              <p className="text-slate-500">{t('onboarding.integration_desc')}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Option 1: Developer */}
              <button
                onClick={() => handleIntegrationChoice('developer')}
                disabled={loading}
                className="group text-start p-6 border-2 border-slate-100 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition-all focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                <div className="w-12 h-12 bg-slate-100 group-hover:bg-white rounded-lg flex items-center justify-center mb-4 transition-colors">
                  <Code className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{t('onboarding.opt_developer')}</h3>
                <p className="text-sm text-slate-500">{t('onboarding.opt_developer_desc')}</p>
              </button>

              {/* Option 2: Dashboard */}
              <button
                onClick={() => handleIntegrationChoice('dashboard')}
                disabled={loading}
                className="group text-start p-6 border-2 border-slate-100 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition-all focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                <div className="w-12 h-12 bg-slate-100 group-hover:bg-white rounded-lg flex items-center justify-center mb-4 transition-colors">
                  <LayoutDashboard className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{t('onboarding.opt_dashboard')}</h3>
                <p className="text-sm text-slate-500">{t('onboarding.opt_dashboard_desc')}</p>
              </button>
            </div>

            {loading && (
              <div className="mt-8 flex justify-center text-primary-600">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            )}
          </div>
        )}

        {/* Step 3: Success State */}
        {step === 3 && (
          <div className="p-8 text-center">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">{t('onboarding.success_title')}</h2>
            <p className="text-slate-500 mb-8 max-w-md mx-auto">{t('onboarding.success_desc')}</p>

            {apiKey && (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 mb-8 text-start max-w-md mx-auto">
                <div className="flex items-center gap-2 mb-2">
                  <KeyRound className="w-5 h-5 text-accent-600" />
                  <span className="font-bold text-slate-800">{t('onboarding.your_api_key')}</span>
                </div>
                <p className="text-xs text-slate-500 mb-4">{t('onboarding.save_key_warning')}</p>
                <div className="bg-slate-800 rounded p-3 text-emerald-400 font-mono text-sm break-all select-all">
                  {apiKey}
                </div>
              </div>
            )}

            <button 
              onClick={() => navigate('/dashboard')}
              className="px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 mx-auto"
            >
              {t('onboarding.go_to_dashboard')}
              <ArrowRight className="w-5 h-5 rtl:rotate-180" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
