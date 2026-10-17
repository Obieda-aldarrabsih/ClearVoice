import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../lib/api';
import { Shield, Check, X, Building2, Users, Loader2 } from 'lucide-react';
import { useToast } from '../components/ui/ToastProvider';

interface Tenant {
  id: string;
  legalName: string;
  taxId: string;
  industry: string;
  country: string;
  createdAt: string;
  userCount: number;
  invoiceCount: number;
}

interface AccessRequest {
  id: string;
  fullName: string;
  email: string;
  organizationName: string;
  message: string;
  status: string;
  createdAt: string;
}

export const SystemAdmin = () => {
  const { t } = useTranslation();
  const { success, error } = useToast();
  
  const [activeTab, setActiveTab] = useState<'tenants' | 'requests'>('tenants');
  
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTenants = async () => {
    try {
      const response = await api.get('/api/v1/admin/tenants');
      setTenants(response.data.data);
    } catch (err: any) {
      error(err.response?.data?.error || t('common.error_occurred'));
    }
  };

  const fetchRequests = async () => {
    try {
      const response = await api.get('/api/v1/admin/access-requests');
      setRequests(response.data.data);
    } catch (err: any) {
      error(err.response?.data?.error || t('common.error_occurred'));
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      if (activeTab === 'tenants') {
        await fetchTenants();
      } else {
        await fetchRequests();
      }
      setLoading(false);
    };
    loadData();
  }, [activeTab]);

  const handleRequestAction = async (id: string, action: 'approve' | 'reject') => {
    try {
      await api.post(`/api/v1/admin/access-requests/${id}/${action}`);
      success(t(`admin.${action}_success`, `Request ${action}d successfully.`));
      fetchRequests();
    } catch (err: any) {
      error(err.response?.data?.error || t('common.error_occurred'));
    }
  };

  return (
    <div className="flex-1 overflow-auto bg-surface-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-indigo-100 rounded-xl">
            <Shield className="w-6 h-6 text-indigo-700" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{t('admin.title', 'System Administration')}</h1>
            <p className="text-slate-500">{t('admin.desc', 'Global view and management of platform resources.')}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 rtl:space-x-reverse bg-slate-100 p-1 rounded-xl w-fit mb-8">
          <button
            onClick={() => setActiveTab('tenants')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'tenants' 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <Building2 className="w-4 h-4" />
            {t('admin.tab_tenants', 'Tenants')}
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'requests' 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <Users className="w-4 h-4" />
            {t('admin.tab_requests', 'Access Requests')}
            {requests.filter(r => r.status === 'Pending').length > 0 && (
              <span className="bg-red-100 text-red-600 py-0.5 px-2 rounded-full text-xs">
                {requests.filter(r => r.status === 'Pending').length}
              </span>
            )}
          </button>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[400px]">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 text-slate-300 animate-spin" />
            </div>
          ) : activeTab === 'tenants' ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">{t('admin.legal_name', 'Legal Name')}</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">{t('admin.tax_id', 'Tax ID')}</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">{t('admin.users', 'Users')}</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">{t('admin.invoices', 'Invoices')}</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">{t('admin.joined', 'Joined Date')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tenants.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 font-medium text-slate-900">{t.legalName}</td>
                      <td className="px-6 py-4 text-slate-500 text-sm">{t.taxId}</td>
                      <td className="px-6 py-4 text-slate-600">{t.userCount}</td>
                      <td className="px-6 py-4 text-slate-600">{t.invoiceCount}</td>
                      <td className="px-6 py-4 text-slate-500 text-sm">
                        {new Date(t.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                  {tenants.length === 0 && (
                    <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500">{t('common.no_data', 'No records found.')}</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">{t('admin.org_name', 'Organization')}</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">{t('admin.contact', 'Contact')}</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">{t('admin.status', 'Status')}</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-end">{t('admin.actions', 'Actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {requests.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">{r.organizationName}</div>
                        <div className="text-xs text-slate-500 mt-1 max-w-xs truncate" title={r.message}>{r.message || '-'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-slate-900">{r.fullName}</div>
                        <div className="text-sm text-slate-500">{r.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                          r.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          r.status === 'Rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                          'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {t(`admin.status_${r.status.toLowerCase()}`, r.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-end">
                        {r.status === 'Pending' && (
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => handleRequestAction(r.id, 'approve')}
                              className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg transition-colors"
                              title={t('admin.approve', 'Approve')}
                            >
                              <Check className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => handleRequestAction(r.id, 'reject')}
                              className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                              title={t('admin.reject', 'Reject')}
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  {requests.length === 0 && (
                    <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-500">{t('common.no_data', 'No records found.')}</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
