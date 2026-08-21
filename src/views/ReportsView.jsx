import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart3, Printer, Download, Filter, Calendar } from 'lucide-react';

export default function ReportsView() {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      const res = await axios.get('/api/reports');
      setReportData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const { salesReport, stockReport, qcReport, outstandingReport } = reportData || {};

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            Executive Reports & Analytics
          </h2>
          <p className="text-xs text-slate-400">Monthly sales revenue, stock valuation, QC pass rates & outstanding balances</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-blue-600/30"
          >
            <Printer className="w-4 h-4" /> Print / Export PDF Summary
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 printable-area">
        {/* Sales Summary Report */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-400" /> Monthly Sales & Order History
          </h3>
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-semibold uppercase">
              <tr>
                <th className="p-2.5">Date</th>
                <th className="p-2.5">Orders</th>
                <th className="p-2.5 text-right">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {salesReport?.map((row, idx) => (
                <tr key={idx}>
                  <td className="p-2.5 text-slate-300">{row.date}</td>
                  <td className="p-2.5 font-bold text-white">{row.total_orders}</td>
                  <td className="p-2.5 text-right font-mono font-bold text-emerald-400">₹{row.total_revenue?.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Inventory Stock Value Report */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-400" /> Stock Quantity by Category
          </h3>
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-semibold uppercase">
              <tr>
                <th className="p-2.5">Category</th>
                <th className="p-2.5">Item Count</th>
                <th className="p-2.5 text-right">Total Units</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {stockReport?.map((row, idx) => (
                <tr key={idx}>
                  <td className="p-2.5 font-bold text-white">{row.category}</td>
                  <td className="p-2.5 text-slate-300">{row.item_count} items</td>
                  <td className="p-2.5 text-right font-mono font-bold text-emerald-400">{row.total_quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* QC Pass/Fail Rate Report */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-cyan-400" /> Quality Testing Breakdown
          </h3>
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-semibold uppercase">
              <tr>
                <th className="p-2.5">Test Type</th>
                <th className="p-2.5">Result</th>
                <th className="p-2.5 text-right">Count</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {qcReport?.map((row, idx) => (
                <tr key={idx}>
                  <td className="p-2.5 font-medium text-slate-200">{row.test_type}</td>
                  <td className="p-2.5 font-bold text-emerald-400">{row.result}</td>
                  <td className="p-2.5 text-right font-mono font-bold text-white">{row.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Customer Receivables Report */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-rose-400" /> Customer Outstanding Receivables
          </h3>
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-semibold uppercase">
              <tr>
                <th className="p-2.5">Customer Name</th>
                <th className="p-2.5 text-right">Outstanding (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {outstandingReport?.map((row, idx) => (
                <tr key={idx}>
                  <td className="p-2.5 font-bold text-white">{row.company_name}</td>
                  <td className="p-2.5 text-right font-mono font-bold text-rose-400">₹{row.outstanding?.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
