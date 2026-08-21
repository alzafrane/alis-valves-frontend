import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Wrench, Plus, Search, Edit3, Trash2, ShieldCheck, FileCode } from 'lucide-react';

export default function ValveProductsView() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    valve_type: 'Ball Valve',
    size: '2 Inch (DN50)',
    pressure_class: 'Class 150',
    body_material: 'ASTM A216 Gr. WCB',
    trim_material: 'SS316 (CF8M)',
    seat_material: 'PTFE',
    stem_material: 'ASTM A276 Gr. 316',
    end_connection: 'Flanged RF ANSI B16.5',
    actuator_type: 'Lever Operated',
    design_standard: 'API 6D / BS 5351',
    testing_standard: 'API 598',
    description: ''
  });

  const fetchProducts = async () => {
    try {
      const res = await axios.get('/api/valve-products');
      setProducts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditItem(item);
      setFormData({ ...item });
    } else {
      setEditItem(null);
      setFormData({
        name: '',
        valve_type: 'Ball Valve',
        size: '2 Inch (DN50)',
        pressure_class: 'Class 150',
        body_material: 'ASTM A216 Gr. WCB',
        trim_material: 'SS316 (CF8M)',
        seat_material: 'PTFE',
        stem_material: 'ASTM A276 Gr. 316',
        end_connection: 'Flanged RF ANSI B16.5',
        actuator_type: 'Lever Operated',
        design_standard: 'API 6D / BS 5351',
        testing_standard: 'API 598',
        description: ''
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editItem) {
        await axios.put(`/api/valve-products/${editItem.id}`, formData);
      } else {
        await axios.post('/api/valve-products', formData);
      }
      setShowModal(false);
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.error || 'Error saving valve product');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this valve product master?')) return;
    try {
      await axios.delete(`/api/valve-products/${id}`);
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.error || 'Error deleting valve product');
    }
  };

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.valve_type.toLowerCase().includes(search.toLowerCase()) ||
      p.size.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === 'ALL' || p.valve_type === filterType;
    return matchSearch && matchType;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Wrench className="w-5 h-5 text-blue-400" />
            Valve Product Master Specifications
          </h2>
          <p className="text-xs text-slate-400">Library of reusable valve engineering design specs, standards & trim materials</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-blue-600/30"
        >
          <Plus className="w-4 h-4" />
          Add Valve Master
        </button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {['ALL', 'Ball Valve', 'Gate Valve', 'Globe Valve', 'Butterfly Valve', 'Check Valve', 'Custom Valve'].map(t => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                filterType === t
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="relative w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search valve specs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 text-white text-xs rounded-xl pl-9 pr-4 py-2 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Valve Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(p => (
          <div key={p.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase tracking-wide">
                  {p.valve_type}
                </span>
                <h3 className="font-bold text-white text-base mt-1">{p.name}</h3>
                <div className="text-xs text-slate-400 font-mono mt-0.5">{p.size} | {p.pressure_class}</div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => handleOpenModal(p)} className="p-1.5 text-slate-400 hover:text-amber-400 rounded-lg">
                  <Edit3 className="w-4 h-4" />
                </button>
                {user?.role === 'Admin' && (
                  <button onClick={() => handleDelete(p.id)} className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950 p-3 rounded-xl border border-slate-800/80">
              <div><span className="text-slate-500 block text-[10px]">Body Material:</span><span className="text-slate-200 font-semibold">{p.body_material || 'N/A'}</span></div>
              <div><span className="text-slate-500 block text-[10px]">Trim / Ball Material:</span><span className="text-slate-200 font-semibold">{p.trim_material || 'N/A'}</span></div>
              <div><span className="text-slate-500 block text-[10px]">Seat Material:</span><span className="text-slate-200 font-semibold">{p.seat_material || 'N/A'}</span></div>
              <div><span className="text-slate-500 block text-[10px]">End Connection:</span><span className="text-slate-200 font-semibold">{p.end_connection || 'N/A'}</span></div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
              <span className="flex items-center gap-1"><FileCode className="w-3.5 h-3.5 text-slate-500" /> Std: {p.design_standard || 'API 6D'}</span>
              <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Test: {p.testing_standard || 'API 598'}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-white">{editItem ? 'Edit Valve Master' : 'Add Valve Master'}</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Valve Name / Designation *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder='e.g. 2" Class 150 Floating Ball Valve WCB'
                  className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-2.5"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Valve Type</label>
                  <select
                    value={formData.valve_type}
                    onChange={(e) => setFormData({ ...formData, valve_type: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-2.5"
                  >
                    <option value="Ball Valve">Ball Valve</option>
                    <option value="Gate Valve">Gate Valve</option>
                    <option value="Globe Valve">Globe Valve</option>
                    <option value="Butterfly Valve">Butterfly Valve</option>
                    <option value="Check Valve">Check Valve</option>
                    <option value="Custom Valve">Custom Valve</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Size</label>
                  <input
                    type="text"
                    value={formData.size}
                    onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-2.5"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Pressure Class</label>
                  <input
                    type="text"
                    value={formData.pressure_class}
                    onChange={(e) => setFormData({ ...formData, pressure_class: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-2.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Body Material</label>
                  <input
                    type="text"
                    value={formData.body_material}
                    onChange={(e) => setFormData({ ...formData, body_material: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-2.5"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Trim / Disc Material</label>
                  <input
                    type="text"
                    value={formData.trim_material}
                    onChange={(e) => setFormData({ ...formData, trim_material: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-2.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Seat Material</label>
                  <input
                    type="text"
                    value={formData.seat_material}
                    onChange={(e) => setFormData({ ...formData, seat_material: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-2.5"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Design Standard</label>
                  <input
                    type="text"
                    value={formData.design_standard}
                    onChange={(e) => setFormData({ ...formData, design_standard: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-2.5"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Testing Standard</label>
                  <input
                    type="text"
                    value={formData.testing_standard}
                    onChange={(e) => setFormData({ ...formData, testing_standard: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-2.5"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-xs text-slate-400">Cancel</button>
                <button type="submit" className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-xl">Save Valve Master</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
