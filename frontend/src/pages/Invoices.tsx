import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Plus, Search, Filter, ChevronLeft, ChevronRight, FileText, ArrowUpDown, RefreshCcw } from 'lucide-react';
import { api } from '../lib/api';
import { useToast } from '../components/ui/ToastProvider';
import { Spinner } from '../components/ui/Spinner';

interface InvoiceListItem {
  id: string;
  externalRef: string;
  buyerName: string;
  issueDate: string;
  totalAmount: number;
  status: string;
}

interface Meta {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const Invoices = () => {
  const { t } = useTranslation();
  const [invoices, setInvoices] = useState<InvoiceListItem[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Filters & State
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('date');
  const [sortDesc, setSortDesc] = useState(true);

  const { error } = useToast();

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (status) params.append('status', status);
      params.append('page', page.toString());
      params.append('sortBy', sortBy);
      params.append('sortDesc', sortDesc.toString());

      const response = await api.get(`/api/v1/invoices?${params.toString()}`);
      setInvoices(response.data.data);
      setMeta(response.data.meta);
    } catch (err: any) {
      error(err.response?.data?.error || 'Failed to fetch invoices');
    } finally {
      setLoading(false);
    }
  }, [search, status, page, sortBy, sortDesc, error]);

  useEffect(() => {
    // Debounce search slightly
    const timer = setTimeout(() => {
      fetchInvoices();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchInvoices]);

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortDesc(!sortDesc);
    } else {
      setSortBy(column);
      setSortDesc(true);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-JO', {
      style: 'currency',
      currency: 'JOD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(dateString));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CLEARED': return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">{t('invoices.cleared')}</span>;
      case 'PENDING': return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">{t('invoices.pending')}</span>;
      case 'FAILED':
      case 'REJECTED': return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">{t('invoices.failed')}</span>;
      default: return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200">{status === 'SUBMITTED' ? t('invoices.submitted').toUpperCase() : status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{t('invoices.title')}</h1>
        <Link 
          to="/invoices/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          {t('invoices.create')}
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder={t("invoices.search")}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-shadow"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <Filter className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              className="w-full md:w-48 pl-9 pr-8 py-2 border border-slate-300 rounded-lg bg-white appearance-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-shadow"
            >
              <option value="">{t('invoices.all_statuses')}</option>
              <option value="CLEARED">{t('invoices.cleared')}</option>
              <option value="PENDING">{t('invoices.pending')}</option>
              <option value="FAILED">{t('invoices.failed')}</option>
              <option value="SUBMITTED">{t('invoices.submitted')}</option>
            </select>
          </div>
          <button 
            onClick={fetchInvoices}
            className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-600 transition-colors"
            title="Refresh"
          >
            <RefreshCcw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative min-h-[400px]">
        {loading && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
            <Spinner size="lg" />
          </div>
        )}
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('reference')}>
                  <div className="flex items-center gap-1">{t('invoices.reference')} <ArrowUpDown className="w-3 h-3" /></div>
                </th>
                <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('buyer')}>
                  <div className="flex items-center gap-1">{t('invoices.client')} <ArrowUpDown className="w-3 h-3" /></div>
                </th>
                <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('date')}>
                  <div className="flex items-center gap-1">{t('invoices.issue_date')} <ArrowUpDown className="w-3 h-3" /></div>
                </th>
                <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('amount')}>
                  <div className="flex items-center gap-1">{t('invoices.total_incl_tax')} <ArrowUpDown className="w-3 h-3" /></div>
                </th>
                <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('status')}>
                  <div className="flex items-center gap-1">{t('invoices.status')} <ArrowUpDown className="w-3 h-3" /></div>
                </th>
                <th className="px-6 py-4 text-right">{t('invoices.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {!loading && invoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-slate-900">{t('invoices.no_invoices')}</h3>
                    <p className="text-slate-500 mt-1">{t('invoices.try_adjusting')}</p>
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{inv.externalRef || t('invoices.draft')}</td>
                    <td className="px-6 py-4 text-slate-600">{inv.buyerName}</td>
                    <td className="px-6 py-4 text-slate-600">{formatDate(inv.issueDate)}</td>
                    <td className="px-6 py-4 font-medium text-slate-900">{formatCurrency(inv.totalAmount)}</td>
                    <td className="px-6 py-4">{getStatusBadge(inv.status)}</td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        to={`/invoices/${inv.id}`}
                        className="text-primary-600 font-medium hover:text-primary-800 transition-colors"
                      >
                        {t('invoices.view')}
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="text-sm text-slate-500">
              {t('invoices.showing')} <span className="font-medium">{(meta.page - 1) * meta.pageSize + 1}</span> {t('invoices.to')}{' '}
              <span className="font-medium">{Math.min(meta.page * meta.pageSize, meta.total)}</span> {t('invoices.of')}{' '}
              <span className="font-medium">{meta.total}</span> {t('invoices.results')}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={meta.page === 1}
                className="p-2 border border-slate-300 rounded-md bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="text-sm font-medium px-2">{t('invoices.page')} {meta.page} of {meta.totalPages}</div>
              <button
                onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                disabled={meta.page === meta.totalPages}
                className="p-2 border border-slate-300 rounded-md bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
