import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FileCheck, Plus, Search, Eye, Printer, ShoppingCart, Trash2, ArrowRight } from 'lucide-react';

export default function QuotationsView({ setActiveTab, convertEnquiry, setConvertEnquiry }) {
  const { settings } = useAuth();
  const [quotations, setQuotations] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [valveProducts, setValveProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [printQuotation, setPrintQuotation] = useState(null);

  const [formData, setFormData] = useState({
    customer_id: '',
    enquiry_id: null,
    quotation_date: new Date().toISOString().split('T')[0],
    delivery_time: '3-4 Weeks from PO receipt',
    payment_terms: '30% Advance, 70% against proforma before dispatch',
    validity_days: 30,
    notes: 'Price quoted is ex-works Ahmedabad factory. GST 18% extra as applicable.'
  });

  const [items, setItems] = useState([
    { valve_product_id: '', description: '', valve_type: 'Ball Valve', size: '2 Inch', pressure_class: 'Class 150', material: 'WCB', quantity: 1, unit_price: 5000 }
  ]);

  const fetchData = async () => {
    try {
      const [qRes, cRes, vRes] = await Promise.all([
        axios.get('/api/quotations'),
        axios.get('/api/customers'),
        axios.get('/api/valve-products')
      ]);
      setQuotations(qRes.data);
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

  // Pre-fill when converting from enquiry
  useEffect(() => {
    if (convertEnquiry) {
      setFormData(prev => ({
        ...prev,
        customer_id: convertEnquiry.customer_id,
        enquiry_id: convertEnquiry.id
      }));
      setItems([{
        valve_product_id: '',
        description: `${convertEnquiry.valve_type} ${convertEnquiry.size} ${convertEnquiry.pressure_class} (${convertEnquiry.material})`,
        valve_type: convertEnquiry.valve_type || 'Ball Valve',
        size: convertEnquiry.size || '2 Inch',
        pressure_class: convertEnquiry.pressure_class || 'Class 150',
        material: convertEnquiry.material || 'WCB',
        quantity: convertEnquiry.quantity || 1,
        unit_price: 8500
      }]);
      setShowModal(true);
      if (setConvertEnquiry) setConvertEnquiry(null);
    }
  }, [convertEnquiry]);

  const handleAddItem = () => {
    setItems([...items, { valve_product_id: '', description: '', valve_type: 'Ball Valve', size: '2 Inch', pressure_class: 'Class 150', material: 'WCB', quantity: 1, unit_price: 0 }]);
  };

  const handleRemoveItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, val) => {
    const newItems = [...items];
    newItems[index][field] = val;
    if (field === 'valve_product_id' && val) {
      const selectedValve = valveProducts.find(v => v.id === Number(val));
      if (selectedValve) {
        newItems[index].description = selectedValve.name;
        newItems[index].valve_type = selectedValve.valve_type;
        newItems[index].size = selectedValve.size;
        newItems[index].pressure_class = selectedValve.pressure_class;
        newItems[index].material = selectedValve.body_material;
      }
    }
    setItems(newItems);
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + (Number(item.quantity || 0) * Number(item.unit_price || 0)), 0);
    const tax = subtotal * 0.18;
    const total = subtotal + tax;
    return { subtotal, tax, total };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/quotations', { ...formData, items });
      setShowModal(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Error creating quotation');
    }
  };

  const handleViewQuotation = async (id) => {
    try {
      const res = await axios.get(`/api/quotations/${id}`);
      setPrintQuotation(res.data);
    } catch (err) {
      alert('Failed to load quotation');
    }
  };

  const handleCreateSOFromQuotation = async (q) => {
    try {
      const fullQ = await axios.get(`/api/quotations/${q.id}`);
      const { quotation, items: qItems } = fullQ.data;

      const soItems = qItems.map(i => ({
        valve_product_id: i.valve_product_id,
        description: i.description,
        quantity: i.quantity,
        unit_price: i.unit_price
      }));

      await axios.post('/api/sales-orders', {
        quotation_id: quotation.id,
        customer_id: quotation.customer_id,
        customer_po_number: `PO-REF-${quotation.quotation_number}`,
        order_date: new Date().toISOString().split('T')[0],
        delivery_date: '',
        items: soItems,
        notes: `Converted from Quotation ${quotation.quotation_number}`
      });

      alert(`Sales Order created from Quotation ${quotation.quotation_number}!`);
      setActiveTab('sales-orders');
    } catch (err) {
      alert(err.response?.data?.error || 'Error creating sales order');
    }
  };

  const { subtotal, tax, total } = calculateTotals();

  const filtered = quotations.filter(q =>
    q.quotation_number.toLowerCase().includes(search.toLowerCase()) ||
    (q.customer_name && q.customer_name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-emerald-400" />
            Quotations & Estimates
          </h2>
          <p className="text-xs text-slate-400">Generate valve quotations with tax, delivery terms, and printable PDF layout</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-emerald-600/30"
        >
          <Plus className="w-4 h-4" />
          Create New Quotation
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search by Quotation # or Customer name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 text-white text-xs rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:border-emerald-500"
        />
      </div>

      {/* Quotations Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase font-semibold">
              <tr>
                <th className="p-3.5">Quotation #</th>
                <th className="p-3.5">Customer</th>
                <th className="p-3.5">Date</th>
                <th className="p-3.5">Subtotal</th>
                <th className="p-3.5">Total (inc. GST)</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((q) => (
                <tr key={q.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3.5 font-bold text-emerald-400">{q.quotation_number}</td>
                  <td className="p-3.5 font-medium text-white">{q.customer_name || 'N/A'}</td>
                  <td className="p-3.5 text-slate-400">{q.quotation_date}</td>
                  <td className="p-3.5 font-mono text-slate-300">₹{q.subtotal?.toLocaleString()}</td>
                  <td className="p-3.5 font-mono font-bold text-white">₹{q.total_amount?.toLocaleString()}</td>
                  <td className="p-3.5">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                      q.status === 'Won' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      'bg-blue-500/10 text-blue-400 border-blue-500/20'
                    }`}>
                      {q.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-right space-x-2">
                    <button
                      onClick={() => handleViewQuotation(q.id)}
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors text-[11px] inline-flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" /> View / Print PDF
                    </button>
                    {q.status !== 'Won' && (
                      <button
                        onClick={() => handleCreateSOFromQuotation(q)}
                        className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors text-[11px] font-semibold inline-flex items-center gap-1"
                      >
                        Convert to SO <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Quotation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-white">Create New Quotation</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
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
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Quotation Date</label>
                  <input
                    type="date"
                    required
                    value={formData.quotation_date}
                    onChange={(e) => setFormData({ ...formData, quotation_date: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-2.5"
                  />
                </div>
              </div>

              {/* Items Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Valve Line Items</h4>
                  <button type="button" onClick={handleAddItem} className="text-xs text-blue-400 font-semibold hover:underline flex items-center gap-1">
                    <Plus className="w-3 h-3" /> Add Item
                  </button>
                </div>

                <div className="space-y-3">
                  {items.map((item, idx) => (
                    <div key={idx} className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                      <div className="grid grid-cols-12 gap-2">
                        <div className="col-span-4">
                          <label className="text-[10px] text-slate-400 block mb-1">Preset Valve Master (Optional)</label>
                          <select
                            value={item.valve_product_id}
                            onChange={(e) => handleItemChange(idx, 'valve_product_id', e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 text-white text-xs rounded-lg p-2"
                          >
                            <option value="">-- Custom Spec --</option>
                            {valveProducts.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                          </select>
                        </div>
                        <div className="col-span-8">
                          <label className="text-[10px] text-slate-400 block mb-1">Description / Specification *</label>
                          <input
                            type="text"
                            required
                            value={item.description}
                            onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                            placeholder='e.g. 2" Class 150 Floating Ball Valve WCB Body SS316 Trim'
                            className="w-full bg-slate-900 border border-slate-800 text-white text-xs rounded-lg p-2"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-5 gap-2 items-center">
                        <div>
                          <label className="text-[10px] text-slate-400 block">Quantity</label>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 text-white text-xs rounded-lg p-2"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 block">Unit Price (₹)</label>
                          <input
                            type="number"
                            min="0"
                            value={item.unit_price}
                            onChange={(e) => handleItemChange(idx, 'unit_price', e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 text-white text-xs rounded-lg p-2 font-mono"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="text-[10px] text-slate-400 block">Total Price</label>
                          <div className="text-xs font-mono font-bold text-emerald-400 pt-2">
                            ₹{(Number(item.quantity || 0) * Number(item.unit_price || 0)).toLocaleString()}
                          </div>
                        </div>
                        <div className="text-right pt-2">
                          {items.length > 1 && (
                            <button type="button" onClick={() => handleRemoveItem(idx)} className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Calculation Card */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex justify-between items-center text-xs">
                <div className="space-y-1 text-slate-400">
                  <div>Delivery Time: <input type="text" value={formData.delivery_time} onChange={(e) => setFormData({ ...formData, delivery_time: e.target.value })} className="bg-slate-900 border border-slate-800 text-white px-2 py-1 rounded text-xs ml-2 w-64" /></div>
                  <div>Payment Terms: <input type="text" value={formData.payment_terms} onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })} className="bg-slate-900 border border-slate-800 text-white px-2 py-1 rounded text-xs ml-2 w-64" /></div>
                </div>
                <div className="text-right space-y-1">
                  <div className="text-slate-400">Subtotal: <span className="font-mono text-white">₹{subtotal.toLocaleString()}</span></div>
                  <div className="text-slate-400">GST (18%): <span className="font-mono text-white">₹{tax.toLocaleString()}</span></div>
                  <div className="text-sm font-bold text-emerald-400">Grand Total: <span className="font-mono">₹{total.toLocaleString()}</span></div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-xs text-slate-400">Cancel</button>
                <button type="submit" className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl">Save & Generate Quotation</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Quotation View / Modal */}
      {printQuotation && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-2xl w-full max-w-3xl p-8 space-y-6 max-h-[90vh] overflow-y-auto printable-area shadow-2xl">
            {/* Header / Logo */}
            <div className="flex items-start justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center gap-3">
                <img
                  src={settings?.logo_url || '/uploads/default_logo.svg'}
                  alt="Alis Valves Logo"
                  className="w-16 h-16 object-contain"
                />
                <div>
                  <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{settings?.company_name || 'ALIS VALVES'}</h1>
                  <p className="text-xs text-slate-600 font-medium">{settings?.address}</p>
                  <p className="text-xs text-slate-600">GST: {settings?.gst_number} | Phone: {settings?.phone}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-extrabold text-xs rounded-md uppercase tracking-wider block">QUOTATION</span>
                <div className="text-sm font-bold text-slate-900 mt-1">{printQuotation.quotation.quotation_number}</div>
                <div className="text-xs text-slate-500">Date: {printQuotation.quotation.quotation_date}</div>
              </div>
            </div>

            {/* Customer Details */}
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl text-xs">
              <div>
                <span className="font-bold text-slate-500 uppercase text-[10px] block mb-1">Quotation Issued To:</span>
                <div className="font-bold text-slate-900 text-sm">{printQuotation.quotation.customer_name}</div>
                <div className="text-slate-600">{printQuotation.quotation.customer_address}</div>
                <div className="text-slate-600">GST: {printQuotation.quotation.customer_gst || 'N/A'}</div>
              </div>
              <div className="text-right space-y-1">
                <div><span className="font-semibold text-slate-600">Delivery Time:</span> {printQuotation.quotation.delivery_time}</div>
                <div><span className="font-semibold text-slate-600">Payment Terms:</span> {printQuotation.quotation.payment_terms}</div>
                <div><span className="font-semibold text-slate-600">Validity:</span> {printQuotation.quotation.validity_days} Days</div>
              </div>
            </div>

            {/* Line Items */}
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white font-semibold">
                  <th className="p-2.5">#</th>
                  <th className="p-2.5">Valve Description & Specification</th>
                  <th className="p-2.5 text-center">Qty</th>
                  <th className="p-2.5 text-right">Unit Price (₹)</th>
                  <th className="p-2.5 text-right">Total (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {printQuotation.items?.map((item, idx) => (
                  <tr key={idx}>
                    <td className="p-2.5 text-slate-500">{idx + 1}</td>
                    <td className="p-2.5 font-medium text-slate-900">{item.description}</td>
                    <td className="p-2.5 text-center font-bold">{item.quantity}</td>
                    <td className="p-2.5 text-right font-mono">₹{item.unit_price?.toLocaleString()}</td>
                    <td className="p-2.5 text-right font-mono font-bold">₹{item.total_price?.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="flex justify-end pt-2">
              <div className="w-64 space-y-1.5 text-xs text-slate-700">
                <div className="flex justify-between"><span>Subtotal:</span><span className="font-mono font-semibold">₹{printQuotation.quotation.subtotal?.toLocaleString()}</span></div>
                <div className="flex justify-between"><span>GST (18%):</span><span className="font-mono font-semibold">₹{printQuotation.quotation.tax_amount?.toLocaleString()}</span></div>
                <div className="flex justify-between text-sm font-black border-t border-slate-300 pt-1.5 text-slate-900">
                  <span>Grand Total:</span>
                  <span className="font-mono text-emerald-700">₹{printQuotation.quotation.total_amount?.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-between items-center border-t border-slate-200 pt-4 no-print">
              <button onClick={() => setPrintQuotation(null)} className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-semibold">Close</button>
              <button onClick={() => window.print()} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2">
                <Printer className="w-4 h-4" /> Print / Save PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
