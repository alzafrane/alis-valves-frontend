import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Layers, Plus, Search, Eye, Trash2 } from 'lucide-react';

export default function BOMView() {
  const [boms, setBoms] = useState([]);
  const [valveProducts, setValveProducts] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [viewBOM, setViewBOM] = useState(null);

  const [formData, setFormData] = useState({
    valve_product_id: '',
    name: '',
    version: '1.0',
    notes: ''
  });

  const [items, setItems] = useState([
    { component_name: 'Body', part_number: 'RAW-WCB-BV2-150', quantity: 1, material: 'ASTM A216 WCB', unit: 'Pcs' },
    { component_name: 'Ball / Disc', part_number: 'CMP-BALL-2-316', quantity: 1, material: 'ASTM A351 CF8M', unit: 'Pcs' },
    { component_name: 'Seat Ring', part_number: 'CMP-SEAT-2-PTFE', quantity: 2, material: 'PTFE', unit: 'Pcs' },
    { component_name: 'Stem', part_number: 'RAW-STEM-316-25', quantity: 1, material: 'SS316', unit: 'Pcs' },
    { component_name: 'Gasket', part_number: 'CMP-GSK-2-150', quantity: 1, material: 'Spiral Wound SS316', unit: 'Pcs' }
  ]);

  const fetchData = async () => {
    try {
      const [bRes, vRes, iRes] = await Promise.all([
        axios.get('/api/boms'),
        axios.get('/api/valve-products'),
        axios.get('/api/inventory')
      ]);
      setBoms(bRes.data);
      setValveProducts(vRes.data);
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

  const handleAddItem = () => {
    setItems([...items, { component_name: '', part_number: '', quantity: 1, material: '', unit: 'Pcs' }]);
  };

  const handleRemoveItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, val) => {
    const newItems = [...items];
    newItems[index][field] = val;
    if (field === 'part_number' && val) {
      const match = inventoryItems.find(inv => inv.part_number === val);
      if (match) {
        newItems[index].component_name = match.item_name;
        newItems[index].material = match.material;
        newItems[index].unit = match.unit;
      }
    }
    setItems(newItems);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/boms', { ...formData, items });
      setShowModal(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Error creating BOM');
    }
  };

  const handleViewBOM = async (id) => {
    try {
      const res = await axios.get(`/api/boms/${id}`);
      setViewBOM(res.data);
    } catch (err) {
      alert('Failed to load BOM details');
    }
  };

  const filtered = boms.filter(b =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    (b.valve_name && b.valve_name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            Bill of Materials (BOM) Master
          </h2>
          <p className="text-xs text-slate-400">Define raw materials, component sub-assemblies and part requirements per valve design</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-indigo-600/30"
        >
          <Plus className="w-4 h-4" />
          Create New BOM Template
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search BOM by name or valve designation..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 text-white text-xs rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:border-indigo-500"
        />
      </div>

      {/* BOM Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(b => (
          <div key={b.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded font-mono">
                  v{b.version}
                </span>
                <span className="text-xs text-slate-400">{b.valve_type}</span>
              </div>
              <h3 className="font-bold text-white text-sm mt-2">{b.name}</h3>
              <p className="text-xs text-slate-400 mt-1">{b.valve_name || 'Generic Valve BOM'}</p>
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400">{b.notes || 'Standard manufacturing BOM'}</span>
              <button
                onClick={() => handleViewBOM(b.id)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
              >
                <Eye className="w-3.5 h-3.5" /> View Components
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create BOM Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-white">Create New BOM Template</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">BOM Template Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder='e.g. BOM for 2" Class 150 Ball Valve'
                    className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-2.5"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Link to Valve Product Master</label>
                  <select
                    value={formData.valve_product_id}
                    onChange={(e) => setFormData({ ...formData, valve_product_id: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-2.5"
                  >
                    <option value="">-- Choose Valve Product --</option>
                    {valveProducts.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                  </select>
                </div>
              </div>

              {/* Component Items */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white uppercase">Component Breakdown</h4>
                  <button type="button" onClick={handleAddItem} className="text-xs text-indigo-400 font-semibold hover:underline flex items-center gap-1">
                    <Plus className="w-3 h-3" /> Add Component
                  </button>
                </div>

                <div className="space-y-2">
                  {items.map((item, idx) => (
                    <div key={idx} className="p-3 bg-slate-950 border border-slate-800 rounded-xl grid grid-cols-12 gap-2 items-center text-xs">
                      <div className="col-span-3">
                        <label className="text-[9px] text-slate-500 block">Component Name</label>
                        <input
                          type="text"
                          required
                          value={item.component_name}
                          onChange={(e) => handleItemChange(idx, 'component_name', e.target.value)}
                          placeholder="e.g. Body Casting"
                          className="w-full bg-slate-900 border border-slate-800 text-white text-xs rounded-lg p-2"
                        />
                      </div>
                      <div className="col-span-3">
                        <label className="text-[9px] text-slate-500 block">Inventory Part #</label>
                        <select
                          value={item.part_number}
                          onChange={(e) => handleItemChange(idx, 'part_number', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 text-white text-xs rounded-lg p-2 font-mono"
                        >
                          <option value="">-- Custom Part --</option>
                          {inventoryItems.map(inv => <option key={inv.id} value={inv.part_number}>{inv.part_number} - {inv.item_name}</option>)}
                        </select>
                      </div>
                      <div className="col-span-3">
                        <label className="text-[9px] text-slate-500 block">Material Grade</label>
                        <input
                          type="text"
                          value={item.material}
                          onChange={(e) => handleItemChange(idx, 'material', e.target.value)}
                          placeholder="SS316 / WCB"
                          className="w-full bg-slate-900 border border-slate-800 text-white text-xs rounded-lg p-2"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="text-[9px] text-slate-500 block">Qty Required</label>
                        <input
                          type="number"
                          min="0.1"
                          step="any"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 text-white text-xs rounded-lg p-2"
                        />
                      </div>
                      <div className="col-span-1 text-right pt-3">
                        {items.length > 1 && (
                          <button type="button" onClick={() => handleRemoveItem(idx)} className="text-rose-400 hover:text-rose-300">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-xs text-slate-400">Cancel</button>
                <button type="submit" className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl">Save BOM Template</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View BOM Detail Modal */}
      {viewBOM && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">{viewBOM.bom.name}</h3>
                <p className="text-xs text-indigo-400">{viewBOM.bom.valve_name || 'Generic Valve BOM'} (v{viewBOM.bom.version})</p>
              </div>
              <button onClick={() => setViewBOM(null)} className="text-xs text-slate-400 hover:text-white">Close</button>
            </div>

            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase font-semibold">
                <tr>
                  <th className="p-3">Component</th>
                  <th className="p-3">Part #</th>
                  <th className="p-3">Material Grade</th>
                  <th className="p-3 text-right">Required Qty</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {viewBOM.items?.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40">
                    <td className="p-3 font-medium text-white">{item.component_name}</td>
                    <td className="p-3 font-mono text-slate-400">{item.part_number || 'N/A'}</td>
                    <td className="p-3 text-slate-300">{item.material || 'N/A'}</td>
                    <td className="p-3 text-right font-bold text-indigo-400">{item.quantity} {item.unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
