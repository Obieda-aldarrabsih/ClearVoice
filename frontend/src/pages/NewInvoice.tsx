import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Send } from 'lucide-react';
import { motion } from 'framer-motion';

export const NewInvoice = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate('/dashboard');
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Create Invoice</h2>
            <p className="text-slate-500 mt-1">Submit a new e-invoice to JoSEC</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="btn-secondary gap-2">
            <Save className="w-4 h-4" /> Save Draft
          </button>
          <button onClick={handleSubmit} disabled={loading} className="btn-primary gap-2">
            {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
            Submit Invoice
          </button>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card">
        <form className="p-8 space-y-8">
          
          <div>
            <h3 className="text-lg font-medium text-slate-900 mb-4 border-b border-slate-100 pb-2">Client Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Client Name</label>
                <input type="text" className="input-field" placeholder="E.g. Acme Corp" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Tax Identification Number (TIN)</label>
                <input type="text" className="input-field" placeholder="123456789" />
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2">
              <h3 className="text-lg font-medium text-slate-900">Line Items</h3>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-12 gap-4 items-center bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div className="col-span-5">
                  <label className="block text-xs font-medium text-slate-500 mb-1">Description</label>
                  <input type="text" className="input-field py-1.5 text-sm" placeholder="Consulting Services" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-slate-500 mb-1">Quantity</label>
                  <input type="number" className="input-field py-1.5 text-sm" placeholder="1" defaultValue="1" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-slate-500 mb-1">Unit Price</label>
                  <input type="number" className="input-field py-1.5 text-sm" placeholder="0.00" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-slate-500 mb-1">Tax Rate (%)</label>
                  <input type="number" className="input-field py-1.5 text-sm" placeholder="16" defaultValue="16" />
                </div>
                <div className="col-span-1 flex justify-end">
                  <button type="button" className="text-slate-400 hover:text-red-500 mt-5">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  </button>
                </div>
              </div>
              <button type="button" className="text-sm font-medium text-primary-600 hover:text-primary-700">+ Add another item</button>
            </div>
          </div>

        </form>
      </motion.div>
    </div>
  );
};
