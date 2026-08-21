import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Truck, Plus, Search, CheckCircle2, PackageCheck, Eye, Building2 } from 'lucide-react';

export default function PurchaseView() {
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState('orders'); // 'orders' or 'suppliers'
  const [search, setSearch] = useState('');
  const [showPOModal, setShowPOModal] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [receiveData, setReceiveData] = useState(null);

  const [poFormData, setPoFormData] = useState({
    supplier_id: '',
    order_date: new Date().toISOString().split('T')[0],
    expected_delivery: '',
    notes: ''
  });

  const [poItems, setPoItems] = useState([
    { inventory_item_id: '', item_name: 'WCB Casting Body 2" 150#', quantity: 10, unit_price: 2500 }
  ]);

  const [supplierFormData, setSupplierFormData] = useState({
    company_name: '',
    contact_person: '',
    email: '',
    phone: '',
    address: '',
    gst_number: '',
    notes: ''
  });

  const fetchData = async () => {
    try {
      const [poRes, sRes, iRes] = await Promise.all([
        axios.get('/api/purchase-orders'),
        axios.get('/api/suppliers'),
        axios.get('/api/inventory')
      ]);
      setPurchaseOrders(poRes.data);
      setSuppliers(sRes.data);
      setInventoryItems(iRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddPoItem = () => {
    setPoItems([...poItems, { inventory_item_id: '', item_name: '', quantity: 1, unit_price: 0 }]);
  };

  const handlePoItemChange = (index, field, val) => {
    const newItems = [...poItems];
    newItems[index][field] = val;
    if (field === 'inventory_item_id' && val) {
      const selected = inventoryItems.find(i => i.id === Number(val));
      if (selected) {
        newItems[index].item_name = selected.item_name;
        newItems[index].unit_price = selected.unit_cost || 0;
      }
    }
    setPoItems(newItems);
  };

  const handleCreatePO = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/purchase-orders', { ...poFormData, items: poItems });
      setShowPOModal(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Error creating purchase order');
    }
  };

  const handleCreateSupplier = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/suppliers', supplierFormData);
      setShowSupplierModal(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Error creating supplier');
    }
  };

  const handleOpenReceive = async (poId) => {
    try {
      const res = await axios.get(`/api/purchase-orders/${poId}`);
      setReceiveData(res.data);
    } catch (err) {
      alert('Failed to load PO details');
    }
  };

  const handleReceiveItem = async (poId, itemId, rxQty) => {
    if (!rxQty || rxQty <= 0) return;
    try {
      await axios.post(`/api/purchase-orders/${poId}/receive`, {
        item_id: itemId,
        received_quantity: Number(rxQty)
      });
      // Refresh modal and main list
      const res = await axios.get(`/api/purchase-orders/${poId}`);
      setReceiveData(res.data);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Error receiving material');
    }
  };

  const filteredPOs = purchaseOrders.filter(po =>
    po.po_number.toLowerCase().includes(search.toLowerCase()) ||
    (po.supplier_name && po.supplier_name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header & Sub-Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Truck className="w-5 h-5 text-amber-400" />
            Purchase Management & Procurement
          </h2>
          <p className="text-xs text-slate-400">Issue raw material POs to suppliers, track GRN material receipts & inventory stock-in</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSupplierModal(true)}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors border border-slate-700"
          >
            <Building2 className="w-3.5 h-3.5" /> Add Supplier
          </button>
          <button
            onClick={() => setShowPOModal(true)}
            className="bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-lg shadow-amber-600/30"
          >
            <Plus className="w-4 h-4" /> Issue Purchase Order
          </button>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-4 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveSubTab('orders')}
          className={`text-xs font-bold pb-2 border-b-2 transition-all ${
            activeSubTab === 'orders' ? 'border-amber-500 text-amber-400' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Purchase Orders ({purchaseOrders.length})
        </button>
        <button
          onClick={() => setActiveSubTab('suppliers')}
          className={`text-xs font-bold pb-2 border-b-2 transition-all ${
            activeSubTab === 'suppliers' ? 'border-amber-500 text-amber-400' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Approved Suppliers Directory ({suppliers.length})
        </button>
      </div>

      {/* View 1: Purchase Orders Table */}
      {activeSubTab === 'orders' && (
        <div className="space-y-4">
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by PO # or Supplier..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 text-white text-xs rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase font-semibold">
                  <tr>
                    <th className="p-3.5">PO #</th>
                    <th className="p-3.5">Supplier</th>
                    <th className="p-3.5">Order Date</th>
                    <th className="p-3.5">Expected Delivery</th>
                    <th className="p-3.5">Total Value</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredPOs.map(po => (
                    <tr key={po.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3.5 font-bold text-amber-400">{po.po_number}</td>
                      <td className="p-3.5 font-medium text-white">{po.supplier_name}</td>
                      <td className="p-3.5 text-slate-400">{po.order_date}</td>
                      <td className="p-3.5 text-slate-300">{po.expected_delivery || 'N/A'}</td>
                      <td className="p-3.5 font-mono font-bold text-white">₹{po.total_amount?.toLocaleString()}</td>
                      <td className="p-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                          po.status === 'Received' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          po.status === 'Partially Received' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                          'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>
                          {po.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => handleOpenReceive(po.id)}
                          className="px-2.5 py-1 bg-amber-600/20 hover:bg-amber-600 text-amber-400 hover:text-white border border-amber-500/30 rounded-lg transition-all text-[11px] font-semibold inline-flex items-center gap-1"
                        >
                          <PackageCheck className="w-3.5 h-3.5" /> Receive Material (GRN)
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* View 2: Suppliers Directory */}
      {activeSubTab === 'suppliers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {suppliers.map(s => (
            <div key={s.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-white text-sm">{s.company_name}</h3>
                  <p className="text-xs text-amber-400 font-medium">{s.contact_person || 'No contact person'}</p>
                </div>
              </div>
              <div className="space-y-1 text-xs text-slate-400">
                <div>Phone: <span className="text-slate-200">{s.phone || 'N/A'}</span></div>
                <div>Email: <span className="text-slate-200">{s.email || 'N/A'}</span></div>
                <div>GST: <span className="font-mono text-slate-300">{s.gst_number || 'N/A'}</span></div>
                <div>Address: <span className="text-slate-400">{s.address || 'N/A'}</span></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Material Received / GRN Modal */}
      {receiveData && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <PackageCheck className="w-5 h-5 text-amber-400" />
                  Goods Receipt Note (GRN) - {receiveData.po.po_number}
                </h3>
                <p className="text-xs text-slate-400">Supplier: {receiveData.po.supplier_name}</p>
              </div>
              <button onClick={() => setReceiveData(null)} className="text-xs text-slate-400 hover:text-white">Close</button>
            </div>

            <table className="w-full text-left text-xs bg-slate-950 rounded-xl overflow-hidden">
              <thead className="bg-slate-900 text-slate-400 uppercase font-semibold">
                <tr>
                  <th className="p-3">Item Description</th>
                  <th className="p-3">Ordered</th>
                  <th className="p-3">Received</th>
                  <th className="p-3">Pending</th>
                  <th className="p-3 text-right">Stock In Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {receiveData.items?.map((item) => (
                  <tr key={item.id}>
                    <td className="p-3 font-medium text-white">{item.item_name}</td>
                    <td className="p-3 font-bold text-slate-200">{item.quantity}</td>
                    <td className="p-3 font-bold text-emerald-400">{item.received_qty}</td>
                    <td className="p-3 font-bold text-amber-400">{item.pending_qty}</td>
                    <td className="p-3 text-right">
                      {item.pending_qty > 0 ? (
                        <div className="flex items-center justify-end gap-1">
                          <input
                            type="number"
                            id={`rx-${item.id}`}
                            defaultValue={item.pending_qty}
                            min="1"
                            max={item.pending_qty}
                            className="w-16 bg-slate-900 border border-slate-800 text-white text-xs px-2 py-1 rounded font-mono text-center"
                          />
                          <button
                            onClick={() => {
                              const input = document.getElementById(`rx-${item.id}`);
                              handleReceiveItem(receiveData.po.id, item.id, input.value);
                            }}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded text-[11px]"
                          >
                            Receive & Stock In
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-emerald-400 font-bold flex items-center justify-end gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Fully Received
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create PO Modal */}
      {showPOModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-white">Issue Purchase Order</h3>
            <form onSubmit={handleCreatePO} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Select Supplier *</label>
                  <select
                    required
                    value={poFormData.supplier_id}
                    onChange={(e) => setPoFormData({ ...poFormData, supplier_id: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-2.5"
                  >
                    <option value="">-- Choose Supplier --</option>
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.company_name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Expected Delivery Date</label>
                  <input
                    type="date"
                    value={poFormData.expected_delivery}
                    onChange={(e) => setPoFormData({ ...poFormData, expected_delivery: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-2.5"
                  />
                </div>
              </div>

              {/* Items */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-white uppercase">Purchase Items</label>
                  <button type="button" onClick={handleAddPoItem} className="text-xs text-amber-400 font-semibold hover:underline flex items-center gap-1">
                    <Plus className="w-3 h-3" /> Add Item
                  </button>
                </div>

                {poItems.map((item, idx) => (
                  <div key={idx} className="p-3 bg-slate-950 border border-slate-800 rounded-xl grid grid-cols-12 gap-2">
                    <div className="col-span-5">
                      <select
                        value={item.inventory_item_id}
                        onChange={(e) => handlePoItemChange(idx, 'inventory_item_id', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 text-white text-xs rounded-lg p-2"
                      >
                        <option value="">-- Link Inventory Item --</option>
                        {inventoryItems.map(inv => <option key={inv.id} value={inv.id}>{inv.item_name} ({inv.part_number})</option>)}
                      </select>
                    </div>
                    <div className="col-span-4">
                      <input
                        type="text"
                        required
                        value={item.item_name}
                        onChange={(e) => handlePoItemChange(idx, 'item_name', e.target.value)}
                        placeholder="Item Description"
                        className="w-full bg-slate-900 border border-slate-800 text-white text-xs rounded-lg p-2"
                      />
                    </div>
                    <div className="col-span-1">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handlePoItemChange(idx, 'quantity', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 text-white text-xs rounded-lg p-2 font-mono"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        min="0"
                        value={item.unit_price}
                        onChange={(e) => handlePoItemChange(idx, 'unit_price', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 text-white text-xs rounded-lg p-2 font-mono"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowPOModal(false)} className="px-4 py-2 text-xs text-slate-400">Cancel</button>
                <button type="submit" className="px-4 py-2 text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white rounded-xl">Issue Purchase Order</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Supplier Modal */}
      {showSupplierModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">Add Approved Supplier</h3>
            <form onSubmit={handleCreateSupplier} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Company Name *</label>
                <input
                  type="text"
                  required
                  value={supplierFormData.company_name}
                  onChange={(e) => setSupplierFormData({ ...supplierFormData, company_name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-2.5"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={supplierFormData.contact_person}
                    onChange={(e) => setSupplierFormData({ ...supplierFormData, contact_person: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-2.5"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">GST Number</label>
                  <input
                    type="text"
                    value={supplierFormData.gst_number}
                    onChange={(e) => setSupplierFormData({ ...supplierFormData, gst_number: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-2.5 font-mono"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowSupplierModal(false)} className="px-4 py-2 text-xs text-slate-400">Cancel</button>
                <button type="submit" className="px-4 py-2 text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white rounded-xl">Save Supplier</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
