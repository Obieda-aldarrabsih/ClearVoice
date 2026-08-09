import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { NewInvoice } from './pages/NewInvoice';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/invoices" element={<Dashboard />} /> {/* Placeholder until Invoice List page */}
          <Route path="/invoices/new" element={<NewInvoice />} />
          <Route path="/settings" element={<div className="p-8 text-slate-500">Settings Page (Coming soon)</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
