import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '../components/ui/LanguageSwitcher';
import { motion } from 'framer-motion';
import { 
  FileCheck2, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  Code2, 
  BarChart3, 
  Globe2, 
  Lock, 
  CheckCircle2,
  Terminal,
  Activity
} from 'lucide-react';

export const Landing = () => {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Navigation */}
      <header className="sticky top-0 z-50 px-6 py-4 flex items-center justify-between bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="flex items-center overflow-hidden h-12 w-48 relative">
          <img src="/logo.jpg" alt="ClearVoice" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-none mix-blend-multiply" />
        </div>
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">{t('landing.features')}</a>
          <a href="#developers" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">{t('landing.developers')}</a>
          <a href="#security" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">{t('landing.security')}</a>
        </div>
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          <Link to="/login" className="text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors">{t('landing.sign_in')}</Link>
          <Link to="/register" className="bg-slate-900 hover:bg-slate-800 text-white py-2 px-5 rounded-lg text-sm font-semibold transition-all shadow-md hover:shadow-lg">
            {t('landing.start_free')}
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-20 pb-32 lg:pt-32 lg:pb-40">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary-500 opacity-20 blur-[100px]"></div>
          
          <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-4xl mx-auto space-y-8"
            >
              <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 tracking-tight leading-tight">
                {t('landing.hero_title_pt1')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-600">{t('landing.hero_title_pt2')}</span>
              </h1>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
                {t('landing.hero_desc')}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
                <Link to="/register" className="w-full sm:w-auto bg-primary-600 hover:bg-primary-700 text-white text-lg font-semibold px-8 py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary-600/20 hover:shadow-primary-600/40">
                  {t('landing.start_integrating')} <ArrowRight className="w-5 h-5" />
                </Link>
                <Link to="/request-access" className="w-full sm:w-auto bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 text-lg font-semibold px-8 py-4 rounded-xl transition-all shadow-sm">
                  {t('landing.contact_sales')}
                </Link>
              </div>
            </motion.div>

            {/* Dashboard Preview */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="mt-20 mx-auto max-w-5xl rounded-2xl border border-slate-200/60 bg-white/50 p-2 shadow-2xl backdrop-blur-xl"
            >
              <div className="rounded-xl border border-slate-100 bg-white overflow-hidden shadow-sm">
                {/* Mock UI Header */}
                <div className="h-12 border-b border-slate-100 bg-slate-50/50 flex items-center px-4 gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                </div>
                {/* Mock UI Body */}
                <div className="p-8 grid grid-cols-3 gap-6 text-left">
                  <div className="col-span-3 lg:col-span-1 space-y-6">
                    <div className="p-5 border border-slate-100 rounded-xl bg-slate-50/50">
                      <h3 className="text-sm font-medium text-slate-500 mb-1">{t('landing.mock_total_cleared')}</h3>
                      <p className="text-3xl font-bold text-slate-900">{t('landing.mock_cleared_value')}</p>
                      <div className="mt-2 flex items-center text-sm text-green-600">
                        <Activity className="w-4 h-4 mr-1" /> {t('landing.mock_increase')}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="h-2 bg-slate-100 rounded-full w-full"></div>
                      <div className="h-2 bg-slate-100 rounded-full w-4/5"></div>
                      <div className="h-2 bg-slate-100 rounded-full w-full"></div>
                      <div className="h-2 bg-slate-100 rounded-full w-3/4"></div>
                    </div>
                  </div>
                  <div className="col-span-3 lg:col-span-2 border border-slate-100 rounded-xl p-6 bg-white shadow-sm">
                     <div className="flex justify-between items-center mb-6">
                       <h3 className="font-semibold text-slate-900">{t('landing.mock_recent_invoices')}</h3>
                       <div className="h-8 w-24 bg-slate-100 rounded-md"></div>
                     </div>
                     <div className="space-y-4">
                       {[1,2,3].map(i => (
                         <div key={i} className="flex items-center justify-between border-b border-slate-50 pb-4 last:border-0 last:pb-0">
                           <div className="flex items-center gap-4">
                             <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
                               <FileCheck2 className="w-5 h-5 text-primary-600" />
                             </div>
                             <div>
                               <div className="font-medium text-slate-900">INV-2026-00{i}</div>
                               <div className="text-sm text-slate-500">Acme Corp</div>
                             </div>
                           </div>
                           <div className="text-right">
                             <div className="font-medium text-slate-900">${(Math.random() * 10000).toFixed(2)}</div>
                             <div className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full inline-block mt-1">{t('landing.mock_cleared')}</div>
                           </div>
                         </div>
                       ))}
                     </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* {t('landing.features')} Section */}
        <section id="features" className="py-24 bg-slate-50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">{t('landing.features_title')}</h2>
              <p className="text-lg text-slate-600">{t('landing.features_desc')}</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: <Globe2 className="w-6 h-6 text-primary-600" />,
                  title: t('landing.feat1_title'),
                  desc: t('landing.feat1_desc')
                },
                {
                  icon: <Zap className="w-6 h-6 text-amber-500" />,
                  title: t('landing.feat2_title'),
                  desc: t('landing.feat2_desc')
                },
                {
                  icon: <BarChart3 className="w-6 h-6 text-primary-600" />,
                  title: t('landing.feat3_title'),
                  desc: t('landing.feat3_desc')
                }
              ].map((feature, i) => (
                <div key={i} className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mb-6">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* API Section */}
        <section id="developers" className="py-24 bg-slate-900 text-white overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/10 text-primary-400 text-sm font-medium">
                <Code2 className="w-4 h-4" /> Built for {t('landing.developers')}
              </div>
              <h2 className="text-4xl font-bold tracking-tight">{t('landing.api_title')}</h2>
              <p className="text-lg text-slate-400 leading-relaxed">
                {t('landing.api_desc')}
              </p>
              <ul className="space-y-4">
                {[t('landing.api_item1'), t('landing.api_item2'), t('landing.api_item3'), t('landing.api_item4')].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-300">
                    <CheckCircle2 className="w-5 h-5 text-primary-500 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary-600/20 to-purple-600/20 blur-2xl"></div>
              <div className="relative bg-[#0d1117] rounded-2xl border border-slate-800 p-6 font-mono text-sm shadow-2xl">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-4 mb-4">
                  <Terminal className="w-4 h-4 text-slate-500" />
                  <span className="text-slate-500">POST /api/v1/invoices</span>
                </div>
                <pre className="text-slate-300 overflow-x-auto">
                  <code>
{`{
  "externalRef": "INV-2026-001",
  "buyerName": "Acme Corp",
  "buyerTaxId": "123456789",
  "lines": [
    {
      "description": "Software License",
      "quantity": 1,
      "unitPrice": 1000.00,
      "taxRate": 16.0
    }
  ]
}`}
                  </code>
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* {t('landing.security')} & Compliance */}
        <section id="security" className="py-24 bg-white border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <ShieldCheck className="w-12 h-12 text-primary-600 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-slate-900 mb-6">Enterprise-Grade {t('landing.security')}</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-12">
              {t('landing.sec_desc')}
            </p>
            <div className="flex flex-wrap justify-center gap-8 opacity-70 grayscale">
              {/* Security & Compliance Badges */}
              <div className="flex items-center gap-2 font-bold text-xl text-slate-400"><Lock className="w-6 h-6"/> SOC 2 Type II</div>
              <div className="flex items-center gap-2 font-bold text-xl text-slate-400"><ShieldCheck className="w-6 h-6"/> GDPR Ready</div>
              <div className="flex items-center gap-2 font-bold text-xl text-slate-400"><FileCheck2 className="w-6 h-6"/> ISO 27001</div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 bg-primary-600 text-center">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-4xl font-bold text-white mb-6">{t('landing.cta_title')}</h2>
            <p className="text-primary-100 text-lg mb-10 max-w-2xl mx-auto">
              {t('landing.cta_desc')}
            </p>
            <Link to="/register" className="inline-flex items-center gap-2 bg-white text-primary-600 text-lg font-semibold px-8 py-4 rounded-xl hover:bg-primary-50 transition-colors shadow-lg">
              {t('landing.cta_btn')} <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-50 py-12 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          <div className="col-span-2 lg:col-span-2 space-y-4">
            <div className="flex items-center overflow-hidden h-12 w-48 relative rtl:right-4 ltr:-left-4">
              <img src="/logo.jpg" alt="ClearVoice" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-none mix-blend-multiply" />
            </div>
            <p className="text-sm text-slate-500 max-w-xs">
              {t('landing.footer_desc')}
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 mb-4">{t('landing.footer_product')}</h4>
            <ul className="space-y-3 text-sm text-slate-500">
              <li><a href="#" className="hover:text-primary-600">{t('landing.footer_invoicing')}</a></li>
              <li><a href="#" className="hover:text-primary-600">{t('landing.footer_compliance')}</a></li>
              <li><a href="#" className="hover:text-primary-600">{t('landing.footer_reporting')}</a></li>
              <li><a href="#" className="hover:text-primary-600">{t('landing.footer_pricing')}</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 mb-4">{t('landing.developers')}</h4>
            <ul className="space-y-3 text-sm text-slate-500">
              <li><a href="#" className="hover:text-primary-600">{t('landing.footer_docs')}</a></li>
              <li><a href="#" className="hover:text-primary-600">{t('landing.footer_api_ref')}</a></li>
              <li><a href="#" className="hover:text-primary-600">{t('landing.footer_webhooks')}</a></li>
              <li><a href="#" className="hover:text-primary-600">{t('landing.footer_status')}</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 mb-4">{t('landing.footer_company')}</h4>
            <ul className="space-y-3 text-sm text-slate-500">
              <li><a href="#" className="hover:text-primary-600">{t('landing.footer_about')}</a></li>
              <li><a href="#" className="hover:text-primary-600">{t('landing.security')}</a></li>
              <li><a href="#" className="hover:text-primary-600">{t('landing.footer_privacy')}</a></li>
              <li><a href="#" className="hover:text-primary-600">{t('landing.footer_terms')}</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-slate-200 text-sm text-slate-400 flex justify-between items-center">
          <p>© {new Date().getFullYear()} {t('landing.footer_rights')}</p>
          <div className="flex gap-4">
             {/* Social icons can go here */}
          </div>
        </div>
      </footer>
    </div>
  );
};
