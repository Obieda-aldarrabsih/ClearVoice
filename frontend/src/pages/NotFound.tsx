import { Link } from 'react-router-dom';
import { FileQuestion, ArrowLeft } from 'lucide-react';

export function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-24 h-24 bg-primary-100 rounded-3xl flex items-center justify-center mx-auto transform rotate-12">
          <FileQuestion className="w-12 h-12 text-primary-600 transform -rotate-12" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-8xl font-black text-slate-900 tracking-tighter">404</h1>
          <h2 className="text-2xl font-semibold text-slate-700">Page not found</h2>
          <p className="text-slate-500">
            We couldn't find the page you were looking for. It might have been moved or doesn't exist.
          </p>
        </div>

        <Link
          to="/"
          className="inline-flex items-center gap-2 justify-center px-6 py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors focus:ring-4 focus:ring-slate-200"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </Link>
      </div>
    </div>
  );
}
