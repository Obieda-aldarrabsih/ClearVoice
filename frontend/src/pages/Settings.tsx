import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { 
  User, Building2, Users, Key, Webhook, 
  Save, Plus, Trash2, ShieldAlert
} from 'lucide-react';
import { api } from '../lib/api';
import { useToast } from '../components/ui/ToastProvider';
import { Spinner } from '../components/ui/Spinner';

export const Settings = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const { success, error } = useToast();

  const tabs = [
    { id: 'profile', label: t('settings_tab.personal_info'), icon: <User className="w-4 h-4" /> },
    { id: 'organization', label: t('settings_tab.org_profile'), icon: <Building2 className="w-4 h-4" /> },
    { id: 'team', label: t('settings_tab.team_desc').split(' ')[0] + ' ' + t('settings_tab.team_desc').split(' ')[1], icon: <Users className="w-4 h-4" /> },
    { id: 'api', label: t('settings_tab.api_desc').split(' ')[0], icon: <Key className="w-4 h-4" /> },
    { id: 'webhooks', label: 'Webhooks', icon: <Webhook className="w-4 h-4" /> },
  ];

  // Global Load
  useEffect(() => {
    // Initial fetch to ensure auth is good before rendering specific tabs
    setLoading(false);
  }, []);

  if (loading) return <div className="flex justify-center p-12"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{t('settings_tab.title')}</h1>
        <p className="text-slate-500 mt-1">{t('settings_tab.desc')}</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-64 shrink-0">
          <nav className="flex flex-col gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex-1 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          {activeTab === 'profile' && <ProfileTab onSuccess={success} onError={error} />}
          {activeTab === 'organization' && <OrganizationTab onSuccess={success} onError={error} />}
          {activeTab === 'team' && <TeamTab onSuccess={success} onError={error} />}
          {activeTab === 'api' && <ApiKeysTab onSuccess={success} onError={error} />}
          {activeTab === 'webhooks' && <WebhooksTab onSuccess={success} onError={error} />}
        </div>
      </div>
    </div>
  );
};

// --- Profile Tab ---
const ProfileTab = ({ onSuccess, onError }: any) => {
  const { t } = useTranslation();
  const [data, setData] = useState({ fullName: '', email: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/v1/users/me')
      .then(res => { setData({ fullName: res.data.data.fullName, email: res.data.data.email }); })
      .catch(() => onError('Failed to load profile'))
      .finally(() => setLoading(false));
  }, [onError]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put('/api/v1/users/me', { fullName: data.fullName });
      onSuccess('Profile updated');
    } catch (err) {
      onError('Failed to update profile');
    }
  };

  if (loading) return <div className="p-8 flex justify-center"><Spinner /></div>;

  return (
    <form onSubmit={handleSave} className="p-8 space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">{t('settings_tab.personal_info')}</h3>
        <p className="text-sm text-slate-500">{t('settings_tab.personal_desc')}</p>
      </div>
      <div className="space-y-4 max-w-md">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">{t('settings_tab.email')}</label>
          <input type="email" disabled value={data.email} className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">{t('settings_tab.full_name')}</label>
          <input 
            type="text" 
            value={data.fullName || ''} 
            onChange={e => setData({...data, fullName: e.target.value})} 
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" 
          />
        </div>
      </div>
      <div className="pt-4 border-t border-slate-100 flex justify-end">
        <button type="submit" className="btn-primary flex items-center gap-2">
          <Save className="w-4 h-4" /> Save Changes
        </button>
      </div>
    </form>
  );
};

// --- Organization Tab ---
const OrganizationTab = ({ onError }: any) => {
  const { t } = useTranslation();
  const [data, setData] = useState({ legalName: '', taxId: '', address: '', city: '', country: '', phone: '', website: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/v1/tenant/settings')
      .then(res => { setData(res.data.data); })
      .catch(() => onError('Failed to load org details'))
      .finally(() => setLoading(false));
  }, [onError]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put('/api/v1/tenant/settings', data);
      
    } catch (err) {
      onError('Failed to update organization');
    }
  };

  if (loading) return <div className="p-8 flex justify-center"><Spinner /></div>;

  return (
    <form onSubmit={handleSave} className="p-8 space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">{t('settings_tab.org_profile')}</h3>
        <p className="text-sm text-slate-500">{t('settings_tab.org_desc')}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">{t('settings_tab.legal_name')}</label>
          <input type="text" value={data.legalName || ''} onChange={e => setData({...data, legalName: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">{t('settings_tab.tax_id')}</label>
          <input type="text" value={data.taxId || ''} onChange={e => setData({...data, taxId: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">{t('settings_tab.address')}</label>
          <input type="text" value={data.address || ''} onChange={e => setData({...data, address: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">{t('settings_tab.city')}</label>
          <input type="text" value={data.city || ''} onChange={e => setData({...data, city: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">{t('settings_tab.country')}</label>
          <input type="text" value={data.country || ''} onChange={e => setData({...data, country: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">{t('settings_tab.phone')}</label>
          <input type="text" value={data.phone || ''} onChange={e => setData({...data, phone: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">{t('settings_tab.website')}</label>
          <input type="url" value={data.website || ''} onChange={e => setData({...data, website: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
        </div>
      </div>
      <div className="pt-4 border-t border-slate-100 flex justify-end">
        <button type="submit" className="btn-primary flex items-center gap-2">
          <Save className="w-4 h-4" /> Save Changes
        </button>
      </div>
    </form>
  );
};

// --- Team Tab ---
const TeamTab = ({ onSuccess, onError }: any) => {
  const { t } = useTranslation();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTeam = async () => {
    try {
      const res = await api.get('/api/v1/users');
      setUsers(res.data.data);
    } catch (err: any) {
      if (err.response?.status === 403) {
        onError('You do not have permission to view team members.');
      } else {
        onError('Failed to load team members.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTeam(); }, []);

  if (loading) return <div className="p-8 flex justify-center"><Spinner /></div>;

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Team Members</h3>
          <p className="text-sm text-slate-500">{t('settings_tab.team_desc')}</p>
        </div>
        <button onClick={() => alert('Invite flow coming soon')} className="btn-secondary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Invite
        </button>
      </div>

      <div className="border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
            <tr>
              <th className="px-6 py-3">{t('settings_tab.name')}</th>
              <th className="px-6 py-3">{t('settings_tab.role')}</th>
              <th className="px-6 py-3">{t('settings_tab.status')}</th>
              <th className="px-6 py-3 text-right">{t('settings_tab.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-slate-50">
                <td className="px-6 py-4">
                  <div className="font-medium text-slate-900">{u.fullName || t('settings_tab.no_name')}</div>
                  <div className="text-slate-500">{u.email}</div>
                </td>
                <td className="px-6 py-4">{u.role}</td>
                <td className="px-6 py-4 capitalize">{u.status}</td>
                <td className="px-6 py-4 text-right">
                  <button className="text-red-600 hover:text-red-800"><Trash2 className="w-4 h-4 inline" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- API Keys Tab ---
const ApiKeysTab = ({ onError }: any) => {
  const { t } = useTranslation();
  const [keys, setKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchKeys = async () => {
    try {
      const res = await api.get('/api/v1/apikeys');
      setKeys(res.data.data);
    } catch {
      onError('Failed to load API keys');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchKeys(); }, []);

  if (loading) return <div className="p-8 flex justify-center"><Spinner /></div>;

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">API Keys</h3>
          <p className="text-sm text-slate-500">{t('settings_tab.api_desc')}</p>
        </div>
        <button onClick={() => alert('Create key flow coming soon')} className="btn-secondary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Create Key
        </button>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl flex gap-3 text-yellow-800 text-sm">
        <ShieldAlert className="w-5 h-5 shrink-0" />
        <p>{t('settings_tab.api_warning')}</p>
      </div>

      <div className="border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
            <tr>
              <th className="px-6 py-3">{t('settings_tab.name')}</th>
              <th className="px-6 py-3">{t('settings_tab.key_prefix')}</th>
              <th className="px-6 py-3">{t('settings_tab.created')}</th>
              <th className="px-6 py-3 text-right">{t('settings_tab.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {keys.length === 0 ? (
               <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500">{t('settings_tab.no_keys')}</td></tr>
            ) : keys.map(k => (
              <tr key={k.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-medium text-slate-900">{k.name}</td>
                <td className="px-6 py-4 font-mono text-slate-500">{k.prefix}...</td>
                <td className="px-6 py-4 text-slate-500">{new Date(k.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-right">
                  <button className="text-red-600 hover:text-red-800">{t('settings_tab.revoke')}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- Webhooks Tab ---
const WebhooksTab = ({ onSuccess, onError }: any) => {
  const { t } = useTranslation();
  const [webhooks, setWebhooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHooks = async () => {
    try {
      const res = await api.get('/api/v1/webhooks');
      setWebhooks(res.data.data);
    } catch {
      onError('Failed to load webhooks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHooks(); }, []);

  if (loading) return <div className="p-8 flex justify-center"><Spinner /></div>;

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{t('settings_tab.webhook_title')}</h3>
          <p className="text-sm text-slate-500">{t('settings_tab.webhook_desc')}</p>
        </div>
        <button onClick={() => alert('Add webhook flow coming soon')} className="btn-secondary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Endpoint
        </button>
      </div>

      <div className="border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
            <tr>
              <th className="px-6 py-3">{t('settings_tab.url')}</th>
              <th className="px-6 py-3">{t('settings_tab.events')}</th>
              <th className="px-6 py-3">{t('settings_tab.status')}</th>
              <th className="px-6 py-3 text-right">{t('settings_tab.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {webhooks.length === 0 ? (
               <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500">{t('settings_tab.no_webhooks')}</td></tr>
            ) : webhooks.map(w => (
              <tr key={w.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-medium text-slate-900 font-mono text-xs">{w.url}</td>
                <td className="px-6 py-4 text-slate-500">
                  <span className="bg-slate-100 px-2 py-1 rounded text-xs">{(w.events || []).join(', ')}</span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${w.active ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'}`}>
                    {w.active ? t('settings_tab.active') : t('settings_tab.disabled')}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-red-600 hover:text-red-800"><Trash2 className="w-4 h-4 inline" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
