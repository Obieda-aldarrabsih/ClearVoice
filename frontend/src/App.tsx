import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { RequestAccess } from './pages/RequestAccess';
import { Landing } from './pages/Landing';
import { Dashboard } from './pages/Dashboard';
import { Invoices } from './pages/Invoices';
import { InvoiceDetail } from './pages/InvoiceDetail';
import { NewInvoice } from './pages/NewInvoice';
import { Settings } from './pages/Settings';
import { ProtectedRoute } from './components/ProtectedRoute';
import { SystemAdminRoute } from './components/SystemAdminRoute';
import { ToastProvider } from './components/ui/ToastProvider';
import { NotFound } from './pages/NotFound';
import { Unauthorized } from './pages/Unauthorized';
import { Onboarding } from './pages/Onboarding';
import { NeedsAttention } from './pages/NeedsAttention';
import { SystemAdmin } from './pages/SystemAdmin';

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/request-access" element={<RequestAccess />} />
          
          <Route element={<ProtectedRoute />}>
            <Route path="/onboarding" element={<Onboarding />} />
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/invoices" element={<Invoices />} />
              <Route path="/invoices/new" element={<NewInvoice />} />
              <Route path="/invoices/:id" element={<InvoiceDetail />} />
              <Route path="/attention" element={<NeedsAttention />} />
              <Route element={<SystemAdminRoute />}>
                <Route path="/system-admin" element={<SystemAdmin />} />
              </Route>
              <Route path="/settings" element={<Settings />} />
              <Route path="/unauthorized" element={<Unauthorized />} />
            </Route>
          </Route>

          {/* Catch all 404 route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;
