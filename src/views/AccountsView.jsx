import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Receipt, Plus, Search, CheckCircle2, DollarSign, Wallet, CreditCard } from 'lucide-react';

export default function AccountsView() {
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [salesOrders, setSalesOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('invoices'); // 'invoices' or 'payments'
  const [search, setSearch] = useState('');
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const [invFormData, setInvFormData] = useState({
    sales_order_id: '',
    invoice_date: new Date().toISOString().split('T')[0],
    due_date: ''
  });

  const [payFormData, setPayFormData] = useState({
    invoice_id: '',
    payment_date: new Date().toISOString().split('T')[0],
    amount: 0,
    payment_mode: 'Bank Transfer (NEFT/RTGS)',
    reference_number: 'UTR-2026-99120',
    notes: ''
  });

  const fetchData = async () => {
    try {
      const [iRes, pRes, soRes] = await Promise.all([
        axios.get('/api/invoices'),
        axios.get('/api/payments'),
        axios.get('/api/sales-orders')
      ]);
      setInvoices(iRes.data);
      setPayments(pRes.data);
      setSalesOrders(soRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/invoices', invFormData);
      setShowInvoiceModal(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Error generating invoice');
    }
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/payments', payFormData);
      setShowPaymentModal(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Error recording payment');
    }
  };

  const handleOpenPaymentForInvoice = (inv) => {
    const remaining = inv.total_amount - (inv.paid_amount || 0);
    setPayFormData({
      invoice_id: inv.id,
      payment_date: new Date().toISOString().split('T')[0],
      amount: remaining > 0 ? remaining : inv.total_amount,
      payment_mode: 'Bank Transfer (NEFT/RTGS)',
      reference_number: '',
      notes: `Payment for ${inv.invoice_number}`
    });
    setShowPaymentModal(true);
  };

  // Financial Summaries
  const totalInvoiced = invoices.reduce((sum, i) => sum + (i.total_amount || 0), 0);
  const totalPaid = invoices.reduce((sum, i) => sum + (i.paid_amount || 0), 0);
  const totalOutstanding = Math.max(0, totalInvoiced - totalPaid);

  const filteredInvoices = invoices.filter(i =>
    i.invoice_number.toLowerCase().includes(search.toLowerCase()) ||
    (i.customer_name && i.customer_name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Receipt className="w-5 h-5 text-emerald-400" />
            Simple Accounts & Invoicing
          </h2>
          <p className="text-xs text-slate-400">Generate sales tax invoices, track customer payment receipts & outstanding balances</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPaymentModal(true)}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3 py-2 rounded-xl flex items-center gap-1.5 border border-slate-700 transition-colors"
          >
            <CreditCard className="w-3.5 h-3.5 text-blue-400" /> Record Payment
          </button>
          <button
            onClick={() => setShowInvoiceModal(true)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-lg shadow-emerald-600/30"
          >
            <Plus className="w-4 h-4" /> Generate Invoice
          </button>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-semibold block">Total Revenue Invoiced</span>
            <span className="text-xl font-black text-white font-mono mt-1 block">₹{totalInvoiced.toLocaleString()}</span>
          </div>
          <div className="p-3 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-xl">
            <Receipt className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-semibold block">Payments Collected</span>
            <span className="text-xl font-black text-emerald-400 font-mono mt-1 block">₹{totalPaid.toLocaleString()}</span>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl">
            <Wallet className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-semibold block">Customer Outstanding</span>
            <span className="text-xl font-black text-rose-400 font-mono mt-1 block">₹{totalOutstanding.toLocaleString()}</span>
          </div>
          <div className="p-3 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-xl">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-4 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('invoices')}
          className={`text-xs font-bold pb-2 border-b-2 transition-all ${
            activeTab === 'invoices' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Sales Invoices ({invoices.length})
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`text-xs font-bold pb-2 border-b-2 transition-all ${
            activeTab === 'payments' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Payment Collections Log ({payments.length})
        </button>
      </div>

      {/* Invoices List */}
      {activeTab === 'invoices' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase font-semibold">
                <tr>
                  <th className="p-3.5">Invoice #</th>
                  <th className="p-3.5">Customer</th>
                  <th className="p-3.5">Invoice Date</th>
                  <th className="p-3.5">Total Amount (inc GST)</th>
                  <th className="p-3.5">Paid Amount</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredInvoices.map(inv => {
                  const pending = inv.total_amount - (inv.paid_amount || 0);
                  return (
                    <tr key={inv.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3.5 font-bold font-mono text-emerald-400">{inv.invoice_number}</td>
                      <td className="p-3.5 font-medium text-white">{inv.customer_name}</td>
                      <td className="p-3.5 text-slate-400">{inv.invoice_date}</td>
                      <td className="p-3.5 font-mono font-bold text-white">₹{inv.total_amount?.toLocaleString()}</td>
                      <td className="p-3.5 font-mono text-emerald-400 font-semibold">₹{(inv.paid_amount || 0).toLocaleString()}</td>
                      <td className="p-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                          inv.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          inv.status === 'Partially Paid' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                          'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        {inv.status !== 'Paid' && (
                          <button
                            onClick={() => handleOpenPaymentForInvoice(inv)}
                            className="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/30 rounded-lg text-[11px] font-semibold"
                          >
                            Receive Payment
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payments Log */}
      {activeTab === 'payments' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase font-semibold">
                <tr>
                  <th className="p-3.5">Payment #</th>
                  <th className="p-3.5">Customer & Invoice</th>
                  <th className="p-3.5">Payment Date</th>
                  <th className="p-3.5">Mode & Reference</th>
                  <th className="p-3.5 text-right">Amount Collected</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {payments.map(p => (
                  <tr key={p.id} className="hover:bg-slate-800/40">
                    <td className="p-3.5 font-bold font-mono text-emerald-400">{p.payment_number}</td>
                    <td className="p-3.5">
                      <div className="font-bold text-white">{p.customer_name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">Invoice: {p.invoice_number}</div>
                    </td>
                    <td className="p-3.5 text-slate-400">{p.payment_date}</td>
                    <td className="p-3.5 text-slate-300">
                      <div className="font-semibold">{p.payment_mode}</div>
                      <div className="text-[10px] text-amber-400 font-mono">{p.reference_number || 'N/A'}</div>
                    </td>
                    <td className="p-3.5 text-right font-mono font-black text-sm text-emerald-400">
                      +₹{p.amount?.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Generate Invoice Modal */}
      {showInvoiceModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">Generate Sales Invoice</h3>
            <form onSubmit={handleCreateInvoice} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Select Sales Order *</label>
                <select
                  required
                  value={invFormData.sales_order_id}
                  onChange={(e) => setInvFormData({ ...invFormData, sales_order_id: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-2.5"
                >
                  <option value="">-- Choose Sales Order --</option>
                  {salesOrders.map(so => <option key={so.id} value={so.id}>{so.order_number} ({so.customer_name} - ₹{so.total_amount?.toLocaleString()})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Invoice Date</label>
                  <input
                    type="date"
                    required
                    value={invFormData.invoice_date}
                    onChange={(e) => setInvFormData({ ...invFormData, invoice_date: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-2.5"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Payment Due Date</label>
                  <input
                    type="date"
                    value={invFormData.due_date}
                    onChange={(e) => setInvFormData({ ...invFormData, due_date: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-2.5"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowInvoiceModal(false)} className="px-4 py-2 text-xs text-slate-400">Cancel</button>
                <button type="submit" className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl">Generate Invoice</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">Record Customer Payment</h3>
            <form onSubmit={handleRecordPayment} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Select Sales Invoice *</label>
                <select
                  required
                  value={payFormData.invoice_id}
                  onChange={(e) => setPayFormData({ ...payFormData, invoice_id: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-2.5"
                >
                  <option value="">-- Choose Invoice --</option>
                  {invoices.map(inv => <option key={inv.id} value={inv.id}>{inv.invoice_number} ({inv.customer_name} - Total: ₹{inv.total_amount})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Payment Date</label>
                  <input
                    type="date"
                    required
                    value={payFormData.payment_date}
                    onChange={(e) => setPayFormData({ ...payFormData, payment_date: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-2.5"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Amount Collected (₹) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={payFormData.amount}
                    onChange={(e) => setPayFormData({ ...payFormData, amount: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-2.5 font-mono"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Payment Mode</label>
                  <select
                    value={payFormData.payment_mode}
                    onChange={(e) => setPayFormData({ ...payFormData, payment_mode: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-2.5"
                  >
                    <option value="Bank Transfer (NEFT/RTGS)">Bank Transfer (NEFT/RTGS)</option>
                    <option value="Cheque">Cheque</option>
                    <option value="UPI">UPI / Online</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">UTR / Cheque Ref Number</label>
                  <input
                    type="text"
                    value={payFormData.reference_number}
                    onChange={(e) => setPayFormData({ ...payFormData, reference_number: e.target.value })}
                    placeholder="UTR-88912"
                    className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-2.5 font-mono"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowPaymentModal(false)} className="px-4 py-2 text-xs text-slate-400">Cancel</button>
                <button type="submit" className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl">Save Payment Record</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
