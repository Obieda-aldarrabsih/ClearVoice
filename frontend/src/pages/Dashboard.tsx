import React from 'react';
import { motion } from 'framer-motion';
import { Plus, ArrowUpRight, ArrowDownRight, Clock, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StatCard = ({ title, value, change, trend, icon: Icon, delay }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="card p-6"
  >
    <div className="flex items-center justify-between mb-4">
      <div className="w-12 h-12 rounded-full bg-primary-50 flex items-center justify-center">
        <Icon className="w-6 h-6 text-primary-600" />
      </div>
      <div className={cn("flex items-center gap-1 text-sm font-medium", trend === 'up' ? "text-primary-600" : "text-red-600")}>
        {trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
        {change}
      </div>
    </div>
    <h3 className="text-slate-500 text-sm font-medium mb-1">{title}</h3>
    <p className="text-2xl font-bold text-slate-900">{value}</p>
  </motion.div>
);

const InvoiceRow = ({ id, client, amount, status, date }: any) => (
  <tr className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
    <td className="py-4 px-6 text-sm font-medium text-slate-900">{id}</td>
    <td className="py-4 px-6 text-sm text-slate-600">{client}</td>
    <td className="py-4 px-6 text-sm font-medium text-slate-900">{amount}</td>
    <td className="py-4 px-6 text-sm">
      <span className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
        status === 'Cleared' ? "bg-primary-50 text-primary-700" : "bg-amber-50 text-amber-700"
      )}>
        {status === 'Cleared' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
        {status}
      </span>
    </td>
    <td className="py-4 px-6 text-sm text-slate-500">{date}</td>
  </tr>
);

import { cn } from '../../lib/utils';

export const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Dashboard</h2>
          <p className="text-slate-500 mt-1">Overview of your e-invoicing activities</p>
        </div>
        <button onClick={() => navigate('/invoices/new')} className="btn-primary gap-2">
          <Plus className="w-4 h-4" /> New Invoice
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Cleared Invoices" value="1,248" change="+12.5%" trend="up" icon={CheckCircle2} delay={0.1} />
        <StatCard title="Pending Clearance" value="12" change="-2.4%" trend="down" icon={Clock} delay={0.2} />
        <StatCard title="Total Volume (JOD)" value="JD 48,250" change="+18.2%" trend="up" icon={ArrowUpRight} delay={0.3} />
      </div>

      <div className="card">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Recent Invoices</h3>
          <button onClick={() => navigate('/invoices')} className="text-sm font-medium text-primary-600 hover:text-primary-700">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="py-3 px-6 text-xs font-medium text-slate-500 uppercase tracking-wider">Invoice ID</th>
                <th className="py-3 px-6 text-xs font-medium text-slate-500 uppercase tracking-wider">Client</th>
                <th className="py-3 px-6 text-xs font-medium text-slate-500 uppercase tracking-wider">Amount</th>
                <th className="py-3 px-6 text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th className="py-3 px-6 text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody>
              <InvoiceRow id="INV-2023-001" client="Acme Corp" amount="JD 1,500.00" status="Cleared" date="Oct 24, 2023" />
              <InvoiceRow id="INV-2023-002" client="TechStart Inc" amount="JD 3,250.00" status="Pending" date="Oct 24, 2023" />
              <InvoiceRow id="INV-2023-003" client="Global Industries" amount="JD 840.50" status="Cleared" date="Oct 23, 2023" />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
