import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Send, AlertCircle, Plus, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '../lib/api';

export const NewInvoice = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [buyerName, setBuyerName] = useState('');
  const [buyerTaxId, setBuyerTaxId] = useState('');
  const [externalRef, setExternalRef] = useState('');
  
  const [lines, setLines] = useState([
    { description: '', quantity: 1, unitPrice: 0, taxRate: 16 }
  ]);

  const handleAddLine = () => {
    setLines([...lines, { description: '', quantity: 1, unitPrice: 0, taxRate: 16 }]);
  };

  const handleRemoveLine = (index: number) => {
    setLines(lines.filter((_, i) => i !== index));
  };

  const handleLineChange = (index: number, field: string, value: string | number) => {
    const newLines = [...lines];
    newLines[index] = { ...newLines[index], [field]: value };
    setLines(newLines);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      await api.post('/api/v1/invoices', {
        buyerName,
        buyerTaxId,
        externalRef,
        currency: 'JOD',
        lines: lines.map(l => ({
          description: l.description,
          quantity: Number(l.quantity),
          unitPrice: Number(l.unitPrice),
          taxRate: Number(l.taxRate)
        }))
      });
      
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || err.response?.data?.error || 'Failed to submit invoice.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{t('new_invoice.create')}</h2>
            <p className="text-slate-500 mt-1">{t('new_invoice.desc')}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="btn-secondary gap-2">
            <Save className="w-4 h-4" /> Save Draft
          </button>
          <button onClick={handleSubmit} disabled={loading || lines.length === 0} className="btn-primary gap-2">
            {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
            Submit Invoice
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-lg flex items-start gap-3 text-red-700">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card">
        <form className="p-8 space-y-8" onSubmit={handleSubmit}>
          
          <div>
            <h3 className="text-lg font-medium text-slate-900 mb-4 border-b border-slate-100 pb-2">{t('new_invoice.client_details')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('new_invoice.client_name')}</label>
                <input 
                  type="text" 
                  required
                  value={buyerName}
                  onChange={e => setBuyerName(e.target.value)}
                  className="input-field" 
                  placeholder={t('new_invoice.placeholder_client')} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('new_invoice.tax_id')}</label>
                <input 
                  type="text" 
                  required
                  value={buyerTaxId}
                  onChange={e => setBuyerTaxId(e.target.value)}
                  className="input-field" 
                  placeholder="123456789" 
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('new_invoice.ext_ref')}</label>
                <input 
                  type="text" 
                  value={externalRef}
                  onChange={e => setExternalRef(e.target.value)}
                  className="input-field" 
                  placeholder={t('new_invoice.placeholder_ref')} 
                />
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2">
              <h3 className="text-lg font-medium text-slate-900">{t('new_invoice.line_items')}</h3>
            </div>
            
            <div className="space-y-4">
              {lines.map((line, index) => (
                <div key={index} className="grid grid-cols-12 gap-4 items-center bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <div className="col-span-5">
                    <label className="block text-xs font-medium text-slate-500 mb-1">{t('new_invoice.desc_label')}</label>
                    <input 
                      type="text" 
                      required
                      value={line.description}
                      onChange={e => handleLineChange(index, 'description', e.target.value)}
                      className="input-field py-1.5 text-sm" 
                      placeholder={t('new_invoice.placeholder_desc')} 
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-slate-500 mb-1">{t('new_invoice.qty')}</label>
                    <input 
                      type="number" 
                      required
                      min="1"
                      step="any"
                      value={line.quantity}
                      onChange={e => handleLineChange(index, 'quantity', e.target.value)}
                      className="input-field py-1.5 text-sm" 
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-slate-500 mb-1">{t('new_invoice.unit_price')}</label>
                    <input 
                      type="number" 
                      required
                      min="0"
                      step="0.01"
                      value={line.unitPrice}
                      onChange={e => handleLineChange(index, 'unitPrice', e.target.value)}
                      className="input-field py-1.5 text-sm" 
                      placeholder="0.00" 
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-slate-500 mb-1">{t('new_invoice.tax_rate')}</label>
                    <input 
                      type="number" 
                      required
                      min="0"
                      max="100"
                      value={line.taxRate}
                      onChange={e => handleLineChange(index, 'taxRate', e.target.value)}
                      className="input-field py-1.5 text-sm" 
                    />
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <button 
                      type="button" 
                      onClick={() => handleRemoveLine(index)}
                      className="text-slate-400 hover:text-red-500 mt-5"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
              <button 
                type="button" 
                onClick={handleAddLine}
                className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1"
              >
                <Plus className="w-4 h-4" /> {t('new_invoice.add_item')}
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

