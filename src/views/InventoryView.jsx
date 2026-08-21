import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Boxes, Plus, Search, AlertTriangle, History, ArrowDownLeft, ArrowUpRight, SlidersHorizontal } from 'lucide-react';

export default function InventoryView() {
  const [items, setItems] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [showItemModal, setShowItemModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [transactions, setTransactions] = useState([]);

  const [itemFormData, setItemFormData] = useState({
    item_name: '',
    part_number: '',
    category: 'Raw Material',
    material: '',
    quantity: 0,
    unit: 'Pcs',
    min_stock: 5,
    supplier_id: '',
    heat_number: '',
    location: '',
    unit_cost: 0
  });

  const [adjustFormData, setAdjustFormData] = useState({
    transaction_type: 'IN',
    quantity: 1,
    reason: 'Stock IN',
    reference_number: ''
  });

  const fetchData = async () => {
    try {
      const [iRes, sRes] = await Promise.all([
        axios.get('/api/inventory'),
        axios.get('/api/suppliers')
      ]);
      setItems(iRes.data);
      setSuppliers(sRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateItem = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/inventory', itemFormData);
      setShowItemModal(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Error creating inventory item');
    }
  };

  const handleOpenAdjust = (item) => {
    setSelectedItem(item);
    setAdjustFormData({
      transaction_type: 'IN',
      quantity: 1,
      reason: 'Stock Adjustment',
      reference_number: ''
    });
    setShowAdjustModal(true);
  };

  const handleAdjustSubmit = async (e) => {
    e.preventDefault();
    if (!selectedItem) return;
    try {
      await axios.post(`/api/inventory/${selectedItem.id}/stock-adjust`, adjustFormData);
      setShowAdjustModal(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Error adjusting stock');
    }
  };

  const handleViewHistory = async () => {
    try {
      const res = await axios.get('/api/inventory/transactions');
      setTransactions(res.data);
      setShowHistoryModal(true);
    } catch (err) {
      alert('Failed to load transaction audit history');
    }
  };

  const filtered = items.filter(i => {
    const matchSearch = i.item_name.toLowerCase().includes(search.toLowerCase()) ||
      i.part_number.toLowerCase().includes(search.toLowerCase()) ||
      (i.heat_number && i.heat_number.toLowerCase().includes(search.toLowerCase()));
    const matchCat = categoryFilter === 'ALL' || i.category === categoryFilter;
    return matchSearch && matchCat;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Boxes className="w-5 h-5 text-emerald-400" />
            Inventory & Raw Material Stock
          </h2>
          <p className="text-xs text-slate-400">Track raw materials, castings, forged components, heat numbers & stock history log</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleViewHistory}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3 py-2 rounded-xl flex items-center gap-1.5 border border-slate-700 transition-colors"
          >
            <History className="w-3.5 h-3.5 text-blue-400" /> Stock History Log
          </button>
          <button
            onClick={() => setShowItemModal(true)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-lg shadow-emerald-600/30"
          >
            <Plus className="w-4 h-4" /> Add Inventory Item
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {['ALL', 'Raw Material', 'Component', 'Hardware', 'Finished Valve'].map(c => (
            <button
              key={c}
              onClick={() => setCategoryFilter(c)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                categoryFilter === c
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="relative w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search item, Part #, or Heat #..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 text-white text-xs rounded-xl pl-9 pr-4 py-2 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase font-semibold">
              <tr>
                <th className="p-3.5">Part #</th>
                <th className="p-3.5">Item Name & Category</th>
                <th className="p-3.5">Material Grade</th>
                <th className="p-3.5">Heat / Batch #</th>
                <th className="p-3.5">Current Stock</th>
                <th className="p-3.5">Min Level</th>
                <th className="p-3.5 text-right">Stock Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map(i => {
                const isLowStock = i.quantity <= i.min_stock;
                return (
                  <tr key={i.id} className={`hover:bg-slate-800/40 transition-colors ${isLowStock ? 'bg-rose-500/5' : ''}`}>
                    <td className="p-3.5 font-bold font-mono text-emerald-400">{i.part_number}</td>
                    <td className="p-3.5">
                      <div className="font-bold text-white">{i.item_name}</div>
                      <div className="text-[10px] text-slate-400">{i.category}</div>
                    </td>
                    <td className="p-3.5 text-slate-300">{i.material || 'N/A'}</td>
                    <td className="p-3.5 font-mono text-slate-400">{i.heat_number || 'N/A'}</td>
                    <td className="p-3.5">
                      <span className={`font-mono font-black text-sm ${isLowStock ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {i.quantity} {i.unit}
                      </span>
                      {isLowStock && (
                        <span className="ml-2 px-1.5 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[9px] font-bold rounded uppercase">
                          Low Stock
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-slate-400 font-mono">{i.min_stock} {i.unit}</td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => handleOpenAdjust(i)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-medium inline-flex items-center gap-1"
                      >
                        <SlidersHorizontal className="w-3.5 h-3.5 text-blue-400" /> Stock Adjustment
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock History Log Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <History className="w-5 h-5 text-blue-400" />
                  Stock Transaction Audit Log
                </h3>
                <p className="text-xs text-slate-400">Complete historical audit trail of stock increases, decreases and adjustments</p>
              </div>
              <button onClick={() => setShowHistoryModal(false)} className="text-xs text-slate-400 hover:text-white">Close</button>
            </div>

            <table className="w-full text-left text-xs bg-slate-950 rounded-xl overflow-hidden">
              <thead className="bg-slate-900 text-slate-400 uppercase font-semibold">
                <tr>
                  <th className="p-3">Date & User</th>
                  <th className="p-3">Item</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Qty</th>
                  <th className="p-3">Before → After</th>
                  <th className="p-3">Reason / Ref</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {transactions.map(tx => (
                  <tr key={tx.id}>
                    <td className="p-3 text-slate-400">
                      <div className="font-semibold text-slate-200">{tx.user_name}</div>
                      <div className="text-[10px]">{tx.created_at}</div>
                    </td>
                    <td className="p-3 font-medium text-white">{tx.item_name}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        tx.transaction_type === 'IN' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        tx.transaction_type === 'OUT' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                        'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      }`}>
                        {tx.transaction_type}
                      </span>
                    </td>
                    <td className="p-3 font-bold font-mono text-white">{tx.quantity} {tx.unit}</td>
                    <td className="p-3 font-mono text-slate-400">{tx.previous_qty} → <span className="text-white font-bold">{tx.new_qty}</span></td>
                    <td className="p-3 text-slate-300">{tx.reason} <span className="text-[10px] text-slate-500">({tx.reference_number})</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Stock Adjust Modal */}
      {showAdjustModal && selectedItem && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-base font-bold text-white">Adjust Stock: {selectedItem.item_name}</h3>
            <p className="text-xs text-slate-400">Current Stock: <span className="text-emerald-400 font-bold font-mono">{selectedItem.quantity} {selectedItem.unit}</span></p>

            <form onSubmit={handleAdjustSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Transaction Type</label>
                <select
                  value={adjustFormData.transaction_type}
                  onChange={(e) => setAdjustFormData({ ...adjustFormData, transaction_type: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-2.5"
                >
                  <option value="IN">Stock IN (+ Add Stock)</option>
                  <option value="OUT">Stock OUT (- Issue Material)</option>
                  <option value="ADJUSTMENT">Correction (Set Exact Stock)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Quantity</label>
                <input
                  type="number"
                  min="0.1"
                  step="any"
                  required
                  value={adjustFormData.quantity}
                  onChange={(e) => setAdjustFormData({ ...adjustFormData, quantity: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-2.5 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Reason / Note *</label>
                <input
                  type="text"
                  required
                  value={adjustFormData.reason}
                  onChange={(e) => setAdjustFormData({ ...adjustFormData, reason: e.target.value })}
                  placeholder="e.g. Issued for Assembly PO-PROD-001"
                  className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-2.5"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAdjustModal(false)} className="px-4 py-2 text-xs text-slate-400">Cancel</button>
                <button type="submit" className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl">Submit Stock Update</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Inventory Item Modal */}
      {showItemModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-white">Add New Inventory Item</h3>
            <form onSubmit={handleCreateItem} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Item Name *</label>
                  <input
                    type="text"
                    required
                    value={itemFormData.item_name}
                    onChange={(e) => setItemFormData({ ...itemFormData, item_name: e.target.value })}
                    placeholder="WCB Casting Body"
                    className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-2.5"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Part Number *</label>
                  <input
                    type="text"
                    required
                    value={itemFormData.part_number}
                    onChange={(e) => setItemFormData({ ...itemFormData, part_number: e.target.value })}
                    placeholder="RAW-WCB-01"
                    className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-2.5 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Category</label>
                  <select
                    value={itemFormData.category}
                    onChange={(e) => setItemFormData({ ...itemFormData, category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-2.5"
                  >
                    <option value="Raw Material">Raw Material</option>
                    <option value="Component">Component</option>
                    <option value="Hardware">Hardware</option>
                    <option value="Finished Valve">Finished Valve</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Initial Qty</label>
                  <input
                    type="number"
                    value={itemFormData.quantity}
                    onChange={(e) => setItemFormData({ ...itemFormData, quantity: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-2.5"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Min Stock Level</label>
                  <input
                    type="number"
                    value={itemFormData.min_stock}
                    onChange={(e) => setItemFormData({ ...itemFormData, min_stock: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-2.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Material Grade</label>
                  <input
                    type="text"
                    value={itemFormData.material}
                    onChange={(e) => setItemFormData({ ...itemFormData, material: e.target.value })}
                    placeholder="ASTM A216 WCB"
                    className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-2.5"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Heat / Batch Number</label>
                  <input
                    type="text"
                    value={itemFormData.heat_number}
                    onChange={(e) => setItemFormData({ ...itemFormData, heat_number: e.target.value })}
                    placeholder="HT-8849"
                    className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-2.5 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowItemModal(false)} className="px-4 py-2 text-xs text-slate-400">Cancel</button>
                <button type="submit" className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl">Save Inventory Item</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
