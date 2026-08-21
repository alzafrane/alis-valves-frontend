import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PackageCheck, Plus, Search, Truck, FileText } from 'lucide-react';

export default function DispatchView() {
  const [dispatches, setDispatches] = useState([]);
  const [salesOrders, setSalesOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    sales_order_id: '',
    invoice_number: '',
    dispatch_date: new Date().toISOString().split('T')[0],
    packing_details: 'Heavy Duty Wooden Box Packing with VCI Rust Prevention',
    quantity: 1,
    transporter: 'V-Trans Express / GATI KWE',
    vehicle_number: 'GJ-01-XX-9988',
    tracking_number: 'LR-2026-99120',
    remarks: 'Dispatched in good condition.'
  });

  const fetchData = async () => {
    try {
      const [dRes, soRes] = await Promise.all([
        axios.get('/api/dispatches'),
        axios.get('/api/sales-orders')
      ]);
      setDispatches(dRes.data);
      setSalesOrders(soRes.data.filter(s => s.production_status === 'Completed' || s.order_status === 'In Production'));
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
      await axios.post('/api/dispatches', formData);
      setShowModal(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Error recording dispatch');
    }
  };

  const filtered = dispatches.filter(d =>
    d.dispatch_number.toLowerCase().includes(search.toLowerCase()) ||
    (d.customer_name && d.customer_name.toLowerCase().includes(search.toLowerCase())) ||
    (d.order_number && d.order_number.toLowerCase().includes(search.toLowerCase())) ||
    (d.tracking_number && d.tracking_number.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <PackageCheck className="w-5 h-5 text-emerald-400" />
            Dispatch & Logistics Management
          </h2>
          <p className="text-xs text-slate-400">Record finished valve shipments, transporter details, vehicle LR numbers & delivery status</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-emerald-600/30"
        >
          <Plus className="w-4 h-4" />
          Record New Dispatch
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search by Dispatch #, Customer, SO #, or Tracking LR..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 text-white text-xs rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:border-emerald-500"
        />
      </div>

      {/* Dispatch Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase font-semibold">
              <tr>
                <th className="p-3.5">Dispatch #</th>
                <th className="p-3.5">Customer & Sales Order</th>
                <th className="p-3.5">Qty & Packing</th>
                <th className="p-3.5">Dispatch Date</th>
                <th className="p-3.5">Transporter & LR #</th>
                <th className="p-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map(d => (
                <tr key={d.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3.5 font-bold font-mono text-emerald-400">{d.dispatch_number}</td>
                  <td className="p-3.5">
                    <div className="font-bold text-white">{d.customer_name}</div>
                    <div className="text-[10px] text-blue-400 font-mono">SO: {d.order_number}</div>
                  </td>
                  <td className="p-3.5 text-slate-300">
                    <div className="font-bold text-white">{d.quantity} Pcs</div>
                    <div className="text-[10px] text-slate-400 truncate max-w-xs">{d.packing_details}</div>
                  </td>
                  <td className="p-3.5 text-slate-400 font-medium">{d.dispatch_date}</td>
                  <td className="p-3.5 text-slate-300">
                    <div className="font-semibold flex items-center gap-1"><Truck className="w-3 h-3 text-slate-500" /> {d.transporter || 'N/A'}</div>
                    <div className="text-[10px] text-amber-400 font-mono">LR: {d.tracking_number || 'N/A'} ({d.vehicle_number})</div>
                  </td>
                  <td className="p-3.5">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {d.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-white">Record New Dispatch Shipment</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Select Sales Order *</label>
                <select
                  required
                  value={formData.sales_order_id}
                  onChange={(e) => setFormData({ ...formData, sales_order_id: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-2.5"
                >
                  <option value="">-- Choose Completed Sales Order --</option>
                  {salesOrders.map(so => <option key={so.id} value={so.id}>{so.order_number} ({so.customer_name})</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Dispatch Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.dispatch_date}
                    onChange={(e) => setFormData({ ...formData, dispatch_date: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-2.5"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Dispatched Quantity</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-2.5 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Transporter Name</label>
                  <input
                    type="text"
                    value={formData.transporter}
                    onChange={(e) => setFormData({ ...formData, transporter: e.target.value })}
                    placeholder="V-Trans / TCI Freight"
                    className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-2.5"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Tracking LR / Ref Number</label>
                  <input
                    type="text"
                    value={formData.tracking_number}
                    onChange={(e) => setFormData({ ...formData, tracking_number: e.target.value })}
                    placeholder="LR-2026-99"
                    className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-2.5 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Packing Details</label>
                <input
                  type="text"
                  value={formData.packing_details}
                  onChange={(e) => setFormData({ ...formData, packing_details: e.target.value })}
                  placeholder="Wooden crate box packing with plastic wrap"
                  className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-2.5"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-xs text-slate-400">Cancel</button>
                <button type="submit" className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl">Save & Confirm Dispatch</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
