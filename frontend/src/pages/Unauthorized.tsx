import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export function Unauthorized() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center space-y-6">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
          <ShieldAlert className="w-10 h-10 text-red-600" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Access Denied</h1>
          <p className="text-slate-500">
            You don't have the necessary permissions to view this page. If you believe this is a mistake, please contact your organization administrator.
          </p>
        </div>

        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 justify-center w-full px-4 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors focus:ring-4 focus:ring-primary-100"
        >
          <ArrowLeft className="w-5 h-5" />
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
