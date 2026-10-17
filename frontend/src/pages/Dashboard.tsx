import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FileText, CheckCircle2, AlertCircle, Activity, ArrowUpRight } from 'lucide-react';
import { api } from '../lib/api';
import { Skeleton } from '../components/ui/Skeleton';
import { useTranslation } from 'react-i18next';
import { useToast } from '../components/ui/ToastProvider';
import { Link } from 'react-router-dom';

interface DashboardStats {
  totalInvoices: number;
  totalCleared: number;
  pending: number;
  failed: number;
  totalVolume: number;
  chartData: { date: string; volume: number }[];
  recentInvoices: {
    id: string;
    internalReference: string;
    buyerName: string;
    issueDate: string;
    totalAmount: number;
    status: string;
  }[];
}

export const Dashboard = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('30d');
  const { error } = useToast();

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/api/v1/dashboard/stats?range=${range}`);
        setStats(response.data.data);
      } catch (err: any) {
        error(err.response?.data?.error || 'Failed to load dashboard statistics.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [range, error]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-JO', {
      style: 'currency',
      currency: 'JOD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date(dateString));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CLEARED': return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">{t('dashboard.badge_cleared')}</span>;
      case 'PENDING': return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">{t('dashboard.badge_pending')}</span>;
      case 'FAILED':
      case 'REJECTED': return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">{t('dashboard.badge_failed')}</span>;
      case 'SUBMITTED': return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">{t('invoices.submitted').toUpperCase()}</span>;
      default: return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{t('dashboard.overview')}</h1>
        
        <div className="flex items-center bg-white border border-slate-200 rounded-lg shadow-sm p-1">
          {['7d', '30d', '90d', 'ytd', 'all'].map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${range === r ? 'bg-primary-50 text-primary-700' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
            >
              {r.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-500">{t('dashboard.total_volume')}</h3>
            <div className="p-2 bg-primary-50 rounded-lg"><Activity className="w-5 h-5 text-primary-600" /></div>
          </div>
          {loading ? <Skeleton className="h-8 w-24" /> : <p className="text-3xl font-bold text-slate-900">{formatCurrency(stats?.totalVolume || 0)}</p>}
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-500">{t('dashboard.total_invoices')}</h3>
            <div className="p-2 bg-slate-50 rounded-lg"><FileText className="w-5 h-5 text-slate-600" /></div>
          </div>
          {loading ? <Skeleton className="h-8 w-16" /> : <p className="text-3xl font-bold text-slate-900">{stats?.totalInvoices}</p>}
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-500">{t('dashboard.badge_cleared')}</h3>
            <div className="p-2 bg-green-50 rounded-lg"><CheckCircle2 className="w-5 h-5 text-green-600" /></div>
          </div>
          {loading ? <Skeleton className="h-8 w-16" /> : <p className="text-3xl font-bold text-slate-900">{stats?.totalCleared}</p>}
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-500">{t('dashboard.action_required')}</h3>
            <div className="p-2 bg-red-50 rounded-lg"><AlertCircle className="w-5 h-5 text-red-600" /></div>
          </div>
          {loading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-slate-900">{(stats?.failed || 0) + (stats?.pending || 0)}</p>
              <span className="text-sm text-slate-500">
                ({stats?.failed} {t('dashboard.failed')}, {stats?.pending} {t('dashboard.pending')})
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-lg font-semibold text-slate-900">{t('dashboard.chart_title')}</h3>
          </div>
          <div className="p-6 flex-1 min-h-[300px]">
            {loading ? (
              <Skeleton className="w-full h-full" />
            ) : stats?.chartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-500">{t('dashboard.no_data')}</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats?.chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#16a34a" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="date" tickFormatter={(v) => formatDate(v)} stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v/1000}k`} />
                  <Tooltip 
                    formatter={(value: any) => [formatCurrency(value as number), 'Volume']}
                    labelFormatter={(label) => formatDate(label as string)}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="volume" stroke="#16a34a" strokeWidth={2} fillOpacity={1} fill="url(#colorVolume)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Recent Invoices */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">{t('dashboard.recent_invoices')}</h3>
            <Link to="/invoices" className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center">
              {t('dashboard.view_all')} <ArrowUpRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <div className="flex-1 p-0 overflow-y-auto">
            {loading ? (
              <div className="p-6 space-y-4">
                {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-14 w-full" />)}
              </div>
            ) : stats?.recentInvoices.length === 0 ? (
              <div className="p-6 flex flex-col items-center justify-center h-full text-center">
                <FileText className="w-10 h-10 text-slate-300 mb-3" />
                <p className="text-sm text-slate-500">{t('dashboard.no_recent_invoices')}</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-50">
                {stats?.recentInvoices.map((inv) => (
                  <li key={inv.id}>
                    <Link to={`/invoices/${inv.id}`} className="block hover:bg-slate-50 p-4 transition-colors">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-900">{inv.internalReference || t('dashboard.draft')}</p>
                          <p className="text-sm text-slate-500">{inv.buyerName}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-slate-900">{formatCurrency(inv.totalAmount)}</p>
                          <div className="mt-1">{getStatusBadge(inv.status)}</div>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
