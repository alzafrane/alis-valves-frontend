import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FileQuestion, Plus, Search, Edit3, ArrowRight, CheckCircle } from 'lucide-react';

export default function EnquiriesView({ setActiveTab, setConvertEnquiry }) {
  const [enquiries, setEnquiries] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formData, setFormData] = useState({
    customer_id: '',
    enquiry_date: new Date().toISOString().split('T')[0],
    required_delivery_date: '',
    valve_type: 'Ball Valve',
    size: '2 Inch',
    pressure_class: 'Class 150',
    material: 'WCB Body / SS316 Trim',
    quantity: 1,
    specifications: '',
    notes: '',
    status: 'New'
  });

  const fetchData = async () => {
    try {
      const [enqRes, custRes] = await Promise.all([
        axios.get('/api/enquiries'),
        axios.get('/api/customers')
      ]);
      setEnquiries(enqRes.data);
      setCustomers(custRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditItem(item);
      setFormData({ ...item });
    } else {
      setEditItem(null);
      setFormData({
        customer_id: customers[0]?.id || '',
        enquiry_date: new Date().toISOString().split('T')[0],
        required_delivery_date: '',
        valve_type: 'Ball Valve',
        size: '2 Inch',
        pressure_class: 'Class 150',
        material: 'WCB Body / SS316 Trim',
        quantity: 1,
        specifications: '',
        notes: '',
        status: 'New'
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editItem) {
        await axios.put(`/api/enquiries/${editItem.id}`, formData);
      } else {
        await axios.post('/api/enquiries', formData);
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Error saving enquiry');
    }
  };

  const handleConvertToQuotation = (enquiry) => {
    if (setConvertEnquiry) {
      setConvertEnquiry(enquiry);
    }
    setActiveTab('quotations');
  };

  const filtered = enquiries.filter(e =>
    e.enquiry_number.toLowerCase().includes(search.toLowerCase()) ||
    (e.customer_name && e.customer_name.toLowerCase().includes(search.toLowerCase())) ||
    (e.valve_type && e.valve_type.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FileQuestion className="w-5 h-5 text-amber-400" />
            Customer Enquiries (RFQs)
          </h2>
          <p className="text-xs text-slate-400">Record customer requirements and track quotation conversion</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-amber-600/30"
        >
          <Plus className="w-4 h-4" />
          Create New Enquiry
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search by Enquiry #, Customer name, or Valve type..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 text-white text-xs rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:border-amber-500"
        />
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase font-semibold">
              <tr>
                <th className="p-3.5">Enquiry #</th>
                <th className="p-3.5">Customer</th>
                <th className="p-3.5">Valve Specs</th>
                <th className="p-3.5">Qty</th>
                <th className="p-3.5">Enquiry Date</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((enq) => (
                <tr key={enq.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3.5 font-bold text-amber-400">{enq.enquiry_number}</td>
                  <td className="p-3.5 font-medium text-white">{enq.customer_name || 'N/A'}</td>
                  <td className="p-3.5 text-slate-300">
                    <div className="font-semibold">{enq.valve_type} - {enq.size}</div>
                    <div className="text-[10px] text-slate-400">{enq.pressure_class} | {enq.material}</div>
                  </td>
                  <td className="p-3.5 font-bold text-white">{enq.quantity}</td>
                  <td className="p-3.5 text-slate-400">{enq.enquiry_date}</td>
                  <td className="p-3.5">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                      enq.status === 'New' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                      enq.status === 'Quoted' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                      enq.status === 'Won' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      'bg-slate-800 text-slate-400 border-slate-700'
                    }`}>
                      {enq.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-right space-x-2">
                    {enq.status !== 'Quoted' && enq.status !== 'Won' && (
                      <button
                        onClick={() => handleConvertToQuotation(enq)}
                        className="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/30 rounded-lg transition-all text-[11px] font-semibold inline-flex items-center gap-1"
                      >
                        Create Quotation <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                    <button onClick={() => handleOpenModal(enq)} className="p-1.5 text-slate-400 hover:text-amber-400">
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-white">{editItem ? 'Edit Enquiry' : 'Create New Enquiry'}</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Select Customer *</label>
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Enquiry Date</label>
                  <input
                    type="date"
                    required
                    value={formData.enquiry_date}
                    onChange={(e) => setFormData({ ...formData, enquiry_date: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-2.5"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Required Delivery Date</label>
                  <input
                    type="date"
                    value={formData.required_delivery_date}
                    onChange={(e) => setFormData({ ...formData, required_delivery_date: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-2.5"
                  />
                </div>
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
                    placeholder='2 Inch (DN50)'
                    className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-2.5"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Pressure/Class</label>
                  <input
                    type="text"
                    value={formData.pressure_class}
                    onChange={(e) => setFormData({ ...formData, pressure_class: e.target.value })}
                    placeholder="Class 150"
                    className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-2.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Material</label>
                  <input
                    type="text"
                    value={formData.material}
                    onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                    placeholder="ASTM A216 WCB / SS316"
                    className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-2.5"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-2.5"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Specifications & Testing Requirements</label>
                <textarea
                  rows="2"
                  value={formData.specifications}
                  onChange={(e) => setFormData({ ...formData, specifications: e.target.value })}
                  placeholder="Hydro test pressure, seat leakage class, flange standard..."
                  className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-2.5"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-xs text-slate-400">Cancel</button>
                <button type="submit" className="px-4 py-2 text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white rounded-xl">Save Enquiry</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
