import { useTranslation } from 'react-i18next';
import i18n from '../lib/i18n';
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Download, 
  Printer, 
  FileCode2, 
  Building2, 
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { api } from '../lib/api';
import { useToast } from '../components/ui/ToastProvider';
import { Skeleton } from '../components/ui/Skeleton';

interface InvoiceDetailType {
  id: string;
  internalReference: string;
  issueDate: string;
  buyerName: string;
  buyerTaxId: string;
  status: string;
  joSecInvoiceId: string | null;
  clearanceDate: string | null;
  subtotal: number;
  taxTotal: number;
  totalAmount: number;
  rejectionReason: string | null;
  lines: {
    itemName: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }[];
}

export const InvoiceDetail = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const [invoice, setInvoice] = useState<InvoiceDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const { error } = useToast();

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const response = await api.get(`/api/v1/invoices/${id}`);
        setInvoice(response.data.data);
      } catch (err: any) {
        error(err.response?.data?.error || 'Failed to load invoice details.');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchInvoice();
  }, [id, error]);

  const handleDownload = (type: 'pdf' | 'ubl') => {
    window.open(`http://localhost:5033/api/v1/invoices/${id}/${type}`, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-JO', {
      style: 'currency',
      currency: 'JOD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat(i18n.language === 'ar' ? 'ar-JO' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-[600px] w-full rounded-2xl" />
      </div>
    );
  }

  if (!invoice) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link 
          to="/invoices"
          className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Invoice {invoice.internalReference || t('invoices.draft')}</h1>
        <div className="ml-auto flex items-center gap-3">
          <button onClick={() => handleDownload('ubl')} className="btn-secondary px-4 py-2 flex items-center gap-2 text-sm bg-white">
            <FileCode2 className="w-4 h-4" /> UBL XML
          </button>
          <button onClick={() => handleDownload('pdf')} className="btn-secondary px-4 py-2 flex items-center gap-2 text-sm bg-white">
            <Download className="w-4 h-4" /> PDF
          </button>
          <button onClick={handlePrint} className="btn-primary px-4 py-2 flex items-center gap-2 text-sm">
            <Printer className="w-4 h-4" /> Print
          </button>
        </div>
      </div>

      {(invoice.status === 'FAILED' || invoice.status === 'REJECTED') && invoice.rejectionReason && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3">
          <AlertTriangle className="w-6 h-6 text-red-600 shrink-0" />
          <div>
            <h3 className="font-semibold text-red-800">Clearance Rejected</h3>
            <p className="text-red-700 mt-1 text-sm">{invoice.rejectionReason}</p>
          </div>
        </div>
      )}

      {invoice.status === 'CLEARED' && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0" />
            <div>
              <h3 className="font-semibold text-green-800">Successfully Cleared</h3>
              <p className="text-green-700 mt-0.5 text-sm font-mono">ID: {invoice.joSecInvoiceId}</p>
            </div>
          </div>
          {invoice.clearanceDate && (
             <div className="text-sm text-green-800 text-right">
               <div className="font-medium text-green-900">Cleared on</div>
               {formatDate(invoice.clearanceDate)}
             </div>
          )}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden print:shadow-none print:border-none">
        {/* Header Section */}
        <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start gap-8">
          <div className="space-y-6 flex-1">
             <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600">
                <Building2 className="w-8 h-8" />
             </div>
             <div>
               <h2 className="text-lg font-semibold text-slate-900">{t('invoice_detail.from_seller')}</h2>
               <p className="text-slate-600 mt-1">{t('invoice_detail.your_company')}</p>
               {/* In a real app, populate from tenant context */}
             </div>
          </div>
          <div className="space-y-6 flex-1 bg-slate-50 p-6 rounded-xl border border-slate-100">
             <div>
               <h2 className="text-lg font-semibold text-slate-900">{t('invoice_detail.to_buyer')}</h2>
               <p className="text-slate-900 font-medium mt-1">{invoice.buyerName}</p>
               <p className="text-slate-500 text-sm mt-1">{t('invoice_detail.tax_id')}: {invoice.buyerTaxId || 'N/A'}</p>
             </div>
          </div>
          <div className="space-y-4 flex-1 md:text-right">
            <div>
              <p className="text-sm text-slate-500">{t('invoice_detail.invoice_number')}</p>
              <p className="font-semibold text-slate-900 text-lg">{invoice.internalReference}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">{t('invoices.issue_date')}</p>
              <p className="font-medium text-slate-900">{formatDate(invoice.issueDate)}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">{t('invoices.status')}</p>
              <p className="font-medium text-slate-900 capitalize">{invoice.status === 'SUBMITTED' ? t('invoices.submitted') : invoice.status === 'DRAFT' ? t('invoices.draft') : invoice.status.toLowerCase()}</p>
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="p-8">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-slate-500">
              <tr>
                <th className="pb-4 font-medium">{t('invoice_detail.desc')}</th>
                <th className="pb-4 font-medium text-right">{t('invoice_detail.qty')}</th>
                <th className="pb-4 font-medium text-right">{t('invoice_detail.unit_price')}</th>
                <th className="pb-4 font-medium text-right">{t('invoice_detail.total')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {invoice.lines.map((line, idx) => (
                <tr key={idx}>
                  <td className="py-4 font-medium text-slate-900">{line.itemName}</td>
                  <td className="py-4 text-right text-slate-600">{line.quantity}</td>
                  <td className="py-4 text-right text-slate-600">{formatCurrency(line.unitPrice)}</td>
                  <td className="py-4 text-right font-medium text-slate-900">{formatCurrency(line.lineTotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end">
          <div className="w-full max-w-sm space-y-3">
            <div className="flex justify-between text-slate-600">
              <span>{t('invoice_detail.subtotal')}</span>
              <span>{formatCurrency(invoice.subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>{t('invoice_detail.tax_vat')}</span>
              <span>{formatCurrency(invoice.taxTotal)}</span>
            </div>
            <div className="flex justify-between text-xl font-bold text-slate-900 pt-3 border-t border-slate-200">
              <span>{t('invoice_detail.grand_total')}</span>
              <span>{formatCurrency(invoice.totalAmount)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
