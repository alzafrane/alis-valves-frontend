import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FlaskConical, Plus, Search, CheckCircle2, XCircle, Printer, Eye, ShieldCheck, FileCheck2 } from 'lucide-react';

export default function QCView({ qcProdOrder, setQcProdOrder }) {
  const { user, settings } = useAuth();
  const [tests, setTests] = useState([]);
  const [productionOrders, setProductionOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [printCert, setPrintCert] = useState(null);

  const [formData, setFormData] = useState({
    production_order_id: '',
    valve_details: '',
    quantity_tested: 1,
    test_type: 'Hydro Test',
    test_pressure: 'Shell: 450 PSI (31 Bar) | Seat: 300 PSI (21 Bar)',
    test_duration: '15 Minutes',
    result: 'Pass',
    inspector: user?.name || 'Amit Verma',
    test_date: new Date().toISOString().split('T')[0],
    remarks: 'Hydrostatic pressure testing completed with zero seat leakage per API 598.'
  });

  const fetchData = async () => {
    try {
      const [tRes, pRes] = await Promise.all([
        axios.get('/api/qc-tests'),
        axios.get('/api/production')
      ]);
      setTests(tRes.data);
      setProductionOrders(pRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Pre-fill when coming from Production module
  useEffect(() => {
    if (qcProdOrder) {
      setFormData(prev => ({
        ...prev,
        production_order_id: qcProdOrder.id,
        valve_details: `${qcProdOrder.valve_name || 'Valve Product'} (PO: ${qcProdOrder.production_number})`,
        quantity_tested: qcProdOrder.quantity_required || 1
      }));
      setShowModal(true);
      if (setQcProdOrder) setQcProdOrder(null);
    }
  }, [qcProdOrder]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/qc-tests', formData);
      setShowModal(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Error logging QC report');
    }
  };

  const handleSelectProdOrder = (poId) => {
    const po = productionOrders.find(p => p.id === Number(poId));
    if (po) {
      setFormData(prev => ({
        ...prev,
        production_order_id: po.id,
        valve_details: `${po.valve_name} (SO: ${po.order_number || 'Direct'})`,
        quantity_tested: po.quantity_required
      }));
    }
  };

  const filtered = tests.filter(t =>
    t.test_number.toLowerCase().includes(search.toLowerCase()) ||
    (t.valve_name && t.valve_name.toLowerCase().includes(search.toLowerCase())) ||
    (t.inspector && t.inspector.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-cyan-400" />
            Quality Control & Valve Hydro/Pneumatic Testing
          </h2>
          <p className="text-xs text-slate-400">Conduct hydrostatic, pneumatic seat leakage & pressure testing per API 598 / BS standards</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-cyan-600/30"
        >
          <Plus className="w-4 h-4" />
          Log New QC Test Report
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search by QC Report #, Valve, or Inspector..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 text-white text-xs rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:border-cyan-500"
        />
      </div>

      {/* QC Test Reports Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase font-semibold">
              <tr>
                <th className="p-3.5">Report #</th>
                <th className="p-3.5">Production Order & Valve</th>
                <th className="p-3.5">Test Type</th>
                <th className="p-3.5">Pressure & Duration</th>
                <th className="p-3.5">Inspector & Date</th>
                <th className="p-3.5">Result</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((t) => (
                <tr key={t.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3.5 font-bold font-mono text-cyan-400">{t.test_number}</td>
                  <td className="p-3.5">
                    <div className="font-bold text-white">{t.valve_name || t.valve_details}</div>
                    <div className="text-[10px] text-slate-400">PO: {t.production_number} (Tested Qty: {t.quantity_tested})</div>
                  </td>
                  <td className="p-3.5 font-medium text-slate-300">{t.test_type}</td>
                  <td className="p-3.5 text-slate-400 font-mono text-[11px]">{t.test_pressure} ({t.test_duration})</td>
                  <td className="p-3.5 text-slate-300">
                    <div className="font-medium">{t.inspector}</div>
                    <div className="text-[10px] text-slate-500">{t.test_date}</div>
                  </td>
                  <td className="p-3.5">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border flex items-center gap-1 w-fit ${
                      t.result === 'Pass' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    }`}>
                      {t.result === 'Pass' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {t.result}
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => setPrintCert(t)}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-medium inline-flex items-center gap-1"
                    >
                      <Printer className="w-3.5 h-3.5 text-cyan-400" /> Test Certificate PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log QC Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-white">Log Quality Control Test Report</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Select Production Order *</label>
                <select
                  required
                  value={formData.production_order_id}
                  onChange={(e) => {
                    setFormData({ ...formData, production_order_id: e.target.value });
                    handleSelectProdOrder(e.target.value);
                  }}
                  className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-2.5"
                >
                  <option value="">-- Choose Active Production Order --</option>
                  {productionOrders.map(p => <option key={p.id} value={p.id}>{p.production_number} - {p.valve_name} ({p.quantity_required} Pcs)</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Test Type *</label>
                  <select
                    value={formData.test_type}
                    onChange={(e) => setFormData({ ...formData, test_type: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-2.5"
                  >
                    <option value="Hydro Test">Hydrostatic Test</option>
                    <option value="Pneumatic Test">Pneumatic Seat Leakage Test</option>
                    <option value="Shell Test">Shell Pressure Test</option>
                    <option value="Pressure Test">High Pressure Air Test</option>
                    <option value="Final Inspection">Final Visual & Dimensional Inspection</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Quantity Tested</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.quantity_tested}
                    onChange={(e) => setFormData({ ...formData, quantity_tested: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-2.5 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Test Pressure Ratings</label>
                <input
                  type="text"
                  value={formData.test_pressure}
                  onChange={(e) => setFormData({ ...formData, test_pressure: e.target.value })}
                  placeholder="Shell: 450 PSI | Seat: 300 PSI"
                  className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-2.5 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Test Result *</label>
                  <select
                    value={formData.result}
                    onChange={(e) => setFormData({ ...formData, result: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-2.5 font-bold text-emerald-400"
                  >
                    <option value="Pass">Pass (Approved)</option>
                    <option value="Fail">Fail (Rejected)</option>
                    <option value="Rework">Rework Required</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">QC Inspector Name</label>
                  <input
                    type="text"
                    value={formData.inspector}
                    onChange={(e) => setFormData({ ...formData, inspector: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-2.5"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Inspection Remarks</label>
                <textarea
                  rows="2"
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-2.5"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-xs text-slate-400">Cancel</button>
                <button type="submit" className="px-4 py-2 text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl">Save QC Test Report</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable QC Test Certificate PDF Modal */}
      {printCert && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-2xl w-full max-w-2xl p-8 space-y-6 max-h-[90vh] overflow-y-auto printable-area shadow-2xl border-4 border-slate-900">
            {/* Certificate Header */}
            <div className="text-center border-b-2 border-slate-900 pb-4">
              <img src={settings?.logo_url || '/uploads/default_logo.svg'} alt="Alis Logo" className="w-14 h-14 mx-auto mb-2 object-contain" />
              <h1 className="text-2xl font-black uppercase tracking-tight">{settings?.company_name || 'ALIS VALVES'}</h1>
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-widest">VALVE TEST CERTIFICATE & QUALITY INSPECTION REPORT</p>
              <p className="text-[10px] text-slate-500">{settings?.address}</p>
            </div>

            {/* Cert Details */}
            <div className="grid grid-cols-2 gap-4 bg-slate-100 p-4 rounded-xl text-xs border border-slate-300">
              <div>
                <div><span className="font-bold text-slate-700">Certificate No:</span> <span className="font-mono text-cyan-800 font-extrabold">{printCert.test_number}</span></div>
                <div><span className="font-bold text-slate-700">Production Order:</span> {printCert.production_number}</div>
                <div><span className="font-bold text-slate-700">Valve Description:</span> {printCert.valve_name || printCert.valve_details}</div>
              </div>
              <div className="text-right">
                <div><span className="font-bold text-slate-700">Test Date:</span> {printCert.test_date}</div>
                <div><span className="font-bold text-slate-700">Test Standard:</span> API 598 / BS 6755</div>
                <div><span className="font-bold text-slate-700">Quantity Tested:</span> {printCert.quantity_tested} Pcs</div>
              </div>
            </div>

            {/* Test Results Table */}
            <table className="w-full text-left text-xs border-collapse border border-slate-400">
              <thead>
                <tr className="bg-slate-900 text-white font-bold">
                  <th className="p-2 border border-slate-400">Test Type</th>
                  <th className="p-2 border border-slate-400">Test Pressure</th>
                  <th className="p-2 border border-slate-400">Duration</th>
                  <th className="p-2 border border-slate-400 text-center">Result</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-2.5 font-bold border border-slate-400">{printCert.test_type}</td>
                  <td className="p-2.5 font-mono border border-slate-400">{printCert.test_pressure}</td>
                  <td className="p-2.5 border border-slate-400">{printCert.test_duration || '15 Mins'}</td>
                  <td className="p-2.5 border border-slate-400 text-center font-black text-emerald-700 text-sm">{printCert.result}</td>
                </tr>
              </tbody>
            </table>

            <div className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="font-bold text-slate-900 block mb-1">Inspector Remarks:</span>
              <p>{printCert.remarks}</p>
            </div>

            {/* Signatures */}
            <div className="flex justify-between items-end pt-8 border-t border-slate-300">
              <div className="text-center">
                <div className="w-32 border-b border-slate-400 mb-1"></div>
                <span className="text-[10px] font-bold uppercase text-slate-500">Quality Inspector</span>
                <div className="text-xs font-bold text-slate-900">{printCert.inspector}</div>
              </div>
              <div className="text-center">
                <div className="w-32 border-b border-slate-400 mb-1"></div>
                <span className="text-[10px] font-bold uppercase text-slate-500">Quality Manager Stamp</span>
                <div className="text-xs font-bold text-slate-900">Alis Valves QA Dept</div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center border-t border-slate-200 pt-4 no-print">
              <button onClick={() => setPrintCert(null)} className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-semibold">Close</button>
              <button onClick={() => window.print()} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2">
                <Printer className="w-4 h-4" /> Print Test Certificate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
