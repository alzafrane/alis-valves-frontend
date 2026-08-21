import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Users, Plus, Search, Edit3, Trash2, History, Phone, Mail, MapPin, FileText, ShoppingCart, FileCheck } from 'lucide-react';

export default function CustomersView() {
  const { user } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [historyData, setHistoryData] = useState(null);
  const [formData, setFormData] = useState({
    company_name: '',
    contact_person: '',
    email: '',
    phone: '',
    address: '',
    gst_number: '',
    notes: ''
  });

  const fetchCustomers = async () => {
    try {
      const res = await axios.get('/api/customers');
      setCustomers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditItem(item);
      setFormData({ ...item });
    } else {
      setEditItem(null);
      setFormData({
        company_name: '',
        contact_person: '',
        email: '',
        phone: '',
        address: '',
        gst_number: '',
        notes: ''
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editItem) {
        await axios.put(`/api/customers/${editItem.id}`, formData);
      } else {
        await axios.post('/api/customers', formData);
      }
      setShowModal(false);
      fetchCustomers();
    } catch (err) {
      alert(err.response?.data?.error || 'Error saving customer');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) return;
    try {
      await axios.delete(`/api/customers/${id}`);
      fetchCustomers();
    } catch (err) {
      alert(err.response?.data?.error || 'Error deleting customer');
    }
  };

  const handleViewHistory = async (id) => {
    try {
      const res = await axios.get(`/api/customers/${id}`);
      setHistoryData(res.data);
    } catch (err) {
      alert('Failed to load customer history');
    }
  };

  const filtered = customers.filter(c =>
    c.company_name.toLowerCase().includes(search.toLowerCase()) ||
    (c.contact_person && c.contact_person.toLowerCase().includes(search.toLowerCase())) ||
    (c.gst_number && c.gst_number.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            Customer Management
          </h2>
          <p className="text-xs text-slate-400">Manage client directory, GST details and purchase history</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-blue-600/30"
        >
          <Plus className="w-4 h-4" />
          Add New Customer
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search by company name, contact person, or GST..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 text-white text-xs rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Customers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((c) => (
          <div key={c.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-white text-sm">{c.company_name}</h3>
                  <p className="text-xs text-blue-400 font-medium">{c.contact_person || 'No contact person'}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => handleViewHistory(c.id)} title="History" className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded-lg">
                    <History className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleOpenModal(c)} title="Edit" className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg">
                    <Edit3 className="w-4 h-4" />
                  </button>
                  {user?.role === 'Admin' && (
                    <button onClick={() => handleDelete(c.id)} title="Delete" className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-400">
                {c.phone && <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-slate-500" /><span>{c.phone}</span></div>}
                {c.email && <div className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-slate-500" /><span>{c.email}</span></div>}
                {c.gst_number && <div className="flex items-center gap-2"><FileText className="w-3.5 h-3.5 text-slate-500" /><span className="font-mono text-slate-300">GST: {c.gst_number}</span></div>}
                {c.address && <div className="flex items-start gap-2"><MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" /><span className="line-clamp-2">{c.address}</span></div>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">{editItem ? 'Edit Customer' : 'Add New Customer'}</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Company Name *</label>
                <input
                  type="text"
                  required
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-2.5 focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={formData.contact_person}
                    onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-2.5"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">GST Number</label>
                  <input
                    type="text"
                    value={formData.gst_number}
                    onChange={(e) => setFormData({ ...formData, gst_number: e.target.value })}
                    placeholder="24AAACA1234A1Z5"
                    className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-2.5 font-mono"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Phone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-2.5"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-2.5"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Address</label>
                <textarea
                  rows="2"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-2.5"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-xl"
                >
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer History Drawer Modal */}
      {historyData && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">{historyData.customer.company_name}</h3>
                <p className="text-xs text-blue-400">Customer History & Transaction Record</p>
              </div>
              <button onClick={() => setHistoryData(null)} className="text-xs text-slate-400 hover:text-white">Close</button>
            </div>

            {/* Sales Orders */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-300 flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-blue-400" />
                Sales Orders ({historyData.orders?.length || 0})
              </h4>
              <div className="space-y-1">
                {historyData.orders?.map(o => (
                  <div key={o.id} className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-blue-400">{o.order_number}</span>
                      <span className="text-slate-400 ml-2">PO: {o.customer_po_number || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-slate-200">₹{o.total_amount?.toLocaleString()}</span>
                      <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px]">{o.order_status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quotations */}
            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-bold text-slate-300 flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-400" />
                Quotations ({historyData.quotations?.length || 0})
              </h4>
              <div className="space-y-1">
                {historyData.quotations?.map(q => (
                  <div key={q.id} className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-400">{q.quotation_number}</span>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-slate-200">₹{q.total_amount?.toLocaleString()}</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px]">{q.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
