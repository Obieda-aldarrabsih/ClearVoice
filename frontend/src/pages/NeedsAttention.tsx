import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { 
  AlertTriangle, 
  RotateCw, 
  RefreshCcw, 
  AlertCircle,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { useToast } from '../components/ui/ToastProvider';
import { Link } from 'react-router-dom';

interface Invoice {
  id: string;
  externalRef: string;
  buyerName: string;
  issueDate: string;
  totalAmount: number;
  status: string;
  rejectionReason?: string;
}

export const NeedsAttention = () => {
  const { t } = useTranslation();
  const { success, error } = useToast();
  
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [resubmittingAll, setResubmittingAll] = useState(false);
  const [resubmittingId, setResubmittingId] = useState<string | null>(null);

  const fetchInvoices = async () => {
    try {
      const response = await api.get('/api/v1/invoices?status=NEEDS_ATTENTION&pageSize=50');
      setInvoices(response.data.data);
    } catch (err: any) {
      error(t('common.error_occurred'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleResubmit = async (id: string) => {
    setResubmittingId(id);
    try {
      await api.post(`/api/v1/invoices/${id}/resubmit`);
      success(t('attention.resubmit_success', 'Invoice queued for resubmission'));
      fetchInvoices(); // Refresh list
    } catch (err: any) {
      error(err.response?.data?.message || t('common.error_occurred'));
    } finally {
      setResubmittingId(null);
    }
  };

  const handleResubmitAll = async () => {
    if (invoices.length === 0) return;
    
    setResubmittingAll(true);
    let successCount = 0;
    
    try {
      for (const invoice of invoices) {
        await api.post(`/api/v1/invoices/${invoice.id}/resubmit`);
        successCount++;
      }
      success(t('attention.resubmit_all_success', { count: successCount, defaultValue: `Successfully queued ${successCount} invoices` }));
      fetchInvoices();
    } catch (err: any) {
      error(t('common.error_occurred'));
    } finally {
      setResubmittingAll(false);
    }
  };

  return (
    <div className="flex-1 overflow-auto bg-surface-50 p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-1 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-red-500" />
              {t('attention.title', 'Needs Attention')}
            </h1>
            <p className="text-slate-500">{t('attention.desc', 'Invoices that failed clearance after maximum retries.')}</p>
          </div>
          
          <button
            onClick={handleResubmitAll}
            disabled={resubmittingAll || invoices.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            <RefreshCcw className={`w-4 h-4 ${resubmittingAll ? 'animate-spin' : ''}`} />
            {t('attention.resubmit_all', 'Resubmit All')}
          </button>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="p-12 flex justify-center">
              <RotateCw className="w-8 h-8 text-slate-300 animate-spin" />
            </div>
          ) : invoices.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">{t('attention.empty_title', 'All clear!')}</h3>
              <p className="text-slate-500 max-w-sm mx-auto">
                {t('attention.empty_desc', 'No invoices require your attention right now.')}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('invoices.invoice_number')}</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('invoices.buyer')}</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('attention.rejection_reason', 'Rejection Reason')}</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-end">{t('invoices.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link to={`/invoices/${invoice.id}`} className="font-medium text-slate-900 hover:text-primary-600">
                          {invoice.externalRef || invoice.id.substring(0, 8)}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {invoice.buyerName || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-start gap-2 text-red-600 bg-red-50 px-3 py-2 rounded border border-red-100 max-w-md">
                          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                          <span className="break-words line-clamp-2" title={invoice.rejectionReason}>
                            {invoice.rejectionReason || 'Unknown error'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-end text-sm">
                        <div className="flex items-center justify-end gap-3">
                           <Link 
                            to={`/invoices/${invoice.id}`}
                            className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                            title={t('invoices.view')}
                          >
                            <FileText className="w-4 h-4" />
                          </Link>
                          <button 
                            onClick={() => handleResubmit(invoice.id)}
                            disabled={resubmittingId === invoice.id || resubmittingAll}
                            className="text-primary-600 hover:text-primary-700 font-medium px-3 py-1.5 hover:bg-primary-50 rounded transition-colors disabled:opacity-50 flex items-center gap-1"
                          >
                            {(resubmittingId === invoice.id) && <RotateCw className="w-3 h-3 animate-spin" />}
                            {t('invoices.resubmit')}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
