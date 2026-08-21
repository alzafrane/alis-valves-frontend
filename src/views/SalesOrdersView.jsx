import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShoppingCart, Plus, Search, Layers, CheckCircle2, AlertTriangle, ArrowRight, Eye, Wrench } from 'lucide-react';

export default function SalesOrdersView({ setActiveTab }) {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [valveProducts, setValveProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [bomCheckData, setBomCheckData] = useState(null);

  const [formData, setFormData] = useState({
    customer_id: '',
    customer_po_number: '',
    order_date: new Date().toISOString().split('T')[0],
    delivery_date: '',
    notes: ''
  });

  const [items, setItems] = useState([
    { valve_product_id: '', description: '', quantity: 1, unit_price: 8500 }
  ]);

  const fetchData = async () => {
    try {
      const [oRes, cRes, vRes] = await Promise.all([
        axios.get('/api/sales-orders'),
        axios.get('/api/customers'),
        axios.get('/api/valve-products')
      ]);
      setOrders(oRes.data);
      setCustomers(cRes.data);
      setValveProducts(vRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddItem = () => {
    setItems([...items, { valve_product_id: '', description: '', quantity: 1, unit_price: 0 }]);
  };

  const handleItemChange = (index, field, val) => {
    const newItems = [...items];
    newItems[index][field] = val;
    if (field === 'valve_product_id' && val) {
      const selected = valveProducts.find(v => v.id === Number(val));
      if (selected) newItems[index].description = selected.name;
    }
    setItems(newItems);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/sales-orders', { ...formData, items });
      setShowModal(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Error creating sales order');
    }
  };

  const handleCheckBOMStock = async (soId) => {
    try {
      const res = await axios.get(`/api/sales-orders/${soId}/bom-check`);
      setBomCheckData(res.data);
    } catch (err) {
      alert('Failed to check BOM stock availability');
    }
  };

  const handleStartProduction = async (so) => {
    try {
      const fullSO = await axios.get(`/api/sales-orders/${so.id}`);
      const { order, items: soItems } = fullSO.data;

      const firstItem = soItems[0];
      if (!firstItem || !firstItem.valve_product_id) {
        alert('Please assign a Valve Product Master to this order item first');
        return;
      }

      await axios.post('/api/production', {
        sales_order_id: order.id,
        valve_product_id: firstItem.valve_product_id,
        quantity_required: firstItem.quantity,
        assigned_employee: 'Manoj Kumar',
        start_date: new Date().toISOString().split('T')[0],
        target_date: order.delivery_date || '',
        notes: `Production for SO ${order.order_number} (${order.customer_name})`
      });

      alert(`Production Order created for ${order.order_number}!`);
      setActiveTab('production');
    } catch (err) {
      alert(err.response?.data?.error || 'Error creating production order');
    }
  };

  const filtered = orders.filter(o =>
    o.order_number.toLowerCase().includes(search.toLowerCase()) ||
    (o.customer_po_number && o.customer_po_number.toLowerCase().includes(search.toLowerCase())) ||
    (o.customer_name && o.customer_name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-indigo-400" />
            Sales Orders
          </h2>
          <p className="text-xs text-slate-400">Manage confirmed customer orders, check BOM raw material stock & initiate production</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-indigo-600/30"
        >
          <Plus className="w-4 h-4" />
          Create Sales Order
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search by SO #, Customer PO #, or Customer..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 text-white text-xs rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:border-indigo-500"
        />
      </div>

      {/* Sales Orders Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase font-semibold">
              <tr>
                <th className="p-3.5">SO #</th>
                <th className="p-3.5">Customer & PO</th>
                <th className="p-3.5">Order Date</th>
                <th className="p-3.5">Delivery Date</th>
                <th className="p-3.5">Total Amount</th>
                <th className="p-3.5">Production Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((so) => (
                <tr key={so.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3.5 font-bold text-indigo-400">{so.order_number}</td>
                  <td className="p-3.5">
                    <div className="font-medium text-white">{so.customer_name || 'N/A'}</div>
                    <div className="text-[10px] text-slate-400 font-mono">PO: {so.customer_po_number || 'N/A'}</div>
                  </td>
                  <td className="p-3.5 text-slate-400">{so.order_date}</td>
                  <td className="p-3.5 text-slate-300 font-semibold">{so.delivery_date || 'N/A'}</td>
                  <td className="p-3.5 font-mono font-bold text-white">₹{so.total_amount?.toLocaleString()}</td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                      {so.production_status}
                    </span>
                  </td>
                  <td className="p-3.5 text-right space-x-2">
                    <button
                      onClick={() => handleCheckBOMStock(so.id)}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-medium inline-flex items-center gap-1"
                    >
                      <Layers className="w-3.5 h-3.5 text-blue-400" /> BOM Stock Check
                    </button>
                    {so.production_status === 'Planned' && (
                      <button
                        onClick={() => handleStartProduction(so)}
                        className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-[11px] font-semibold inline-flex items-center gap-1"
                      >
                        <Wrench className="w-3.5 h-3.5" /> Start Prod
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* BOM Stock Check Modal */}
      {bomCheckData && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-blue-400" />
                  BOM Material Availability Analysis
                </h3>
                <p className="text-xs text-slate-400">Verifying raw materials and component stock against BOM required quantities</p>
              </div>
              <button onClick={() => setBomCheckData(null)} className="text-xs text-slate-400 hover:text-white">Close</button>
            </div>

            {bomCheckData.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">No BOM template linked to this valve product yet.</div>
            ) : (
              bomCheckData.map((res, idx) => (
                <div key={idx} className="space-y-3">
                  <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <div>
                      <div className="font-bold text-white text-xs">{res.description}</div>
                      <div className="text-[10px] text-slate-400">Linked BOM: {res.bom_name} (Order Qty: {res.order_qty})</div>
                    </div>
                    <div>
                      {res.isFullyAvailable ? (
                        <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> 100% Materials In Stock
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-full text-xs font-bold flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" /> Missing Raw Materials
                        </span>
                      )}
                    </div>
                  </div>

                  <table className="w-full text-left text-xs bg-slate-950 rounded-xl overflow-hidden">
                    <thead className="bg-slate-900 text-slate-400 font-semibold">
                      <tr>
                        <th className="p-2.5">Component</th>
                        <th className="p-2.5">Part #</th>
                        <th className="p-2.5">Required</th>
                        <th className="p-2.5">Available Stock</th>
                        <th className="p-2.5 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {res.stockCheck?.map((item, biIdx) => (
                        <tr key={biIdx}>
                          <td className="p-2.5 font-medium text-slate-200">{item.component_name}</td>
                          <td className="p-2.5 font-mono text-slate-400">{item.part_number}</td>
                          <td className="p-2.5 font-bold text-white">{item.requiredQty} {item.unit}</td>
                          <td className="p-2.5 font-mono text-slate-300">{item.availableQty} {item.unit}</td>
                          <td className="p-2.5 text-right">
                            {item.isSufficient ? (
                              <span className="text-emerald-400 font-semibold">OK</span>
                            ) : (
                              <button
                                onClick={() => { setBomCheckData(null); setActiveTab('purchase'); }}
                                className="text-rose-400 hover:underline font-bold text-[11px]"
                              >
                                Create Purchase Order
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Create Sales Order Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-white">Create New Sales Order</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Customer *</label>
                  <select
                    required
                    value={formData.customer_id}
                    onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-2.5"
                  >
                    <option value="">-- Choose Customer --</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.company_name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Customer PO Number *</label>
                  <input
                    type="text"
                    required
                    value={formData.customer_po_number}
                    onChange={(e) => setFormData({ ...formData, customer_po_number: e.target.value })}
                    placeholder="PO/2026/VALVE-99"
                    className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-2.5 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Order Date</label>
                  <input
                    type="date"
                    required
                    value={formData.order_date}
                    onChange={(e) => setFormData({ ...formData, order_date: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-2.5"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Promised Delivery Date</label>
                  <input
                    type="date"
                    value={formData.delivery_date}
                    onChange={(e) => setFormData({ ...formData, delivery_date: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-2.5"
                  />
                </div>
              </div>

              {/* Items */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-white uppercase">Order Line Items</label>
                {items.map((item, idx) => (
                  <div key={idx} className="p-3 bg-slate-950 border border-slate-800 rounded-xl grid grid-cols-12 gap-2">
                    <div className="col-span-5">
                      <select
                        value={item.valve_product_id}
                        onChange={(e) => handleItemChange(idx, 'valve_product_id', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 text-white text-xs rounded-lg p-2"
                      >
                        <option value="">-- Valve Product Master --</option>
                        {valveProducts.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                      </select>
                    </div>
                    <div className="col-span-4">
                      <input
                        type="text"
                        required
                        value={item.description}
                        onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                        placeholder="Description"
                        className="w-full bg-slate-900 border border-slate-800 text-white text-xs rounded-lg p-2"
                      />
                    </div>
                    <div className="col-span-1">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 text-white text-xs rounded-lg p-2"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        min="0"
                        value={item.unit_price}
                        onChange={(e) => handleItemChange(idx, 'unit_price', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 text-white text-xs rounded-lg p-2 font-mono"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-xs text-slate-400">Cancel</button>
                <button type="submit" className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl">Create Sales Order</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
