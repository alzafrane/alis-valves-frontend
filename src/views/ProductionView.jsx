import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Wrench, Plus, Search, FlaskConical, CheckCircle2, Clock, User, ArrowRight } from 'lucide-react';

export default function ProductionView({ setActiveTab, setQcProdOrder }) {
  const [orders, setOrders] = useState([]);
  const [salesOrders, setSalesOrders] = useState([]);
  const [valveProducts, setValveProducts] = useState([]);
  const [boms, setBoms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [formData, setFormData] = useState({
    sales_order_id: '',
    valve_product_id: '',
    bom_id: '',
    quantity_required: 1,
    assigned_employee: 'Manoj Kumar',
    start_date: new Date().toISOString().split('T')[0],
    target_date: '',
    notes: ''
  });

  const fetchData = async () => {
    try {
      const [pRes, soRes, vRes, bRes] = await Promise.all([
        axios.get('/api/production'),
        axios.get('/api/sales-orders'),
        axios.get('/api/valve-products'),
        axios.get('/api/boms')
      ]);
      setOrders(pRes.data);
      setSalesOrders(soRes.data);
      setValveProducts(vRes.data);
      setBoms(bRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/production', formData);
      setShowModal(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Error creating production order');
    }
  };

  const handleUpdateStatus = async (id, newStatus, cQty = undefined) => {
    try {
      await axios.put(`/api/production/${id}/status`, {
        status: newStatus,
        completed_qty: cQty
      });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Error updating status');
    }
  };

  const handleSendToQC = (poOrder) => {
    if (setQcProdOrder) {
      setQcProdOrder(poOrder);
    }
    setActiveTab('qc');
  };

  const filtered = orders.filter(o =>
    o.production_number.toLowerCase().includes(search.toLowerCase()) ||
    (o.valve_name && o.valve_name.toLowerCase().includes(search.toLowerCase())) ||
    (o.order_number && o.order_number.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Wrench className="w-5 h-5 text-purple-400" />
            Production Floor & Assembly Orders
          </h2>
          <p className="text-xs text-slate-400">Track valve shop-floor manufacturing stages, assembly progress & technician assignments</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-purple-600/30"
        >
          <Plus className="w-4 h-4" />
          Create Production Order
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search by Production #, Valve design or SO #..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 text-white text-xs rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:border-purple-500"
        />
      </div>

      {/* Production Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(po => (
          <div key={po.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold text-purple-400 font-mono bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded">
                  {po.production_number}
                </span>
                <h3 className="font-bold text-white text-sm mt-1">{po.valve_name || 'Valve Product'}</h3>
                <div className="text-xs text-slate-400">Linked SO: <span className="text-blue-400 font-medium">{po.order_number || 'Direct Work Order'}</span></div>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                po.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                po.status === 'Testing' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' :
                po.status === 'In Production' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                'bg-amber-500/10 text-amber-400 border-amber-500/20'
              }`}>
                {po.status}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs bg-slate-950 p-3 rounded-xl border border-slate-800/80">
              <div><span className="text-slate-500 block text-[10px]">Required Qty</span><span className="font-mono font-bold text-white">{po.quantity_required} Pcs</span></div>
              <div><span className="text-slate-500 block text-[10px]">Completed</span><span className="font-mono font-bold text-emerald-400">{po.completed_qty} Pcs</span></div>
              <div><span className="text-slate-500 block text-[10px]">Technician</span><span className="font-semibold text-slate-300">{po.assigned_employee || 'Unassigned'}</span></div>
            </div>

            {/* Stage Progress Actions */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
              <div className="text-[11px] text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Target: {po.target_date || 'N/A'}
              </div>
              <div className="space-x-1">
                {po.status === 'Planned' && (
                  <button onClick={() => handleUpdateStatus(po.id, 'In Production')} className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-[11px] font-semibold">
                    Start Machining
                  </button>
                )}
                {po.status === 'In Production' && (
                  <button onClick={() => handleUpdateStatus(po.id, 'Assembly')} className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-[11px] font-semibold">
                    Move to Assembly
                  </button>
                )}
                {po.status === 'Assembly' && (
                  <button onClick={() => handleSendToQC(po)} className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-[11px] font-semibold inline-flex items-center gap-1">
                    <FlaskConical className="w-3 h-3" /> Send to QC
                  </button>
                )}
                {po.status === 'Testing' && (
                  <button onClick={() => handleSendToQC(po)} className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-semibold inline-flex items-center gap-1">
                    Log QC Test Report <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-white">Create Production Order</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Select Valve Product *</label>
                <select
                  required
                  value={formData.valve_product_id}
                  onChange={(e) => setFormData({ ...formData, valve_product_id: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-2.5"
                >
                  <option value="">-- Select Valve Product Master --</option>
                  {valveProducts.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Link Sales Order</label>
                  <select
                    value={formData.sales_order_id}
                    onChange={(e) => setFormData({ ...formData, sales_order_id: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-2.5"
                  >
                    <option value="">-- Direct Work Order --</option>
                    {salesOrders.map(so => <option key={so.id} value={so.id}>{so.order_number} ({so.customer_name})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Quantity Required *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.quantity_required}
                    onChange={(e) => setFormData({ ...formData, quantity_required: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-2.5 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Assigned Technician</label>
                  <input
                    type="text"
                    value={formData.assigned_employee}
                    onChange={(e) => setFormData({ ...formData, assigned_employee: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-2.5"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Target Completion Date</label>
                  <input
                    type="date"
                    value={formData.target_date}
                    onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-2.5"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-xs text-slate-400">Cancel</button>
                <button type="submit" className="px-4 py-2 text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white rounded-xl">Create Production Order</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
