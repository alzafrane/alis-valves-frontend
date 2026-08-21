import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Users,
  FileQuestion,
  ShoppingCart,
  Wrench,
  FlaskConical,
  PackageCheck,
  AlertTriangle,
  Receipt,
  ArrowUpRight,
  Clock,
  Calendar,
  Layers
} from 'lucide-react';

export default function DashboardView({ setActiveTab }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      const res = await axios.get('/api/dashboard');
      setData(res.data);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-slate-400">Loading Alis Valves Dashboard...</div>;
  }

  const { kpis, recentOrders, recentEnquiries, lowStockAlerts, upcomingDeliveries } = data || {};

  const kpiCards = [
    { label: 'Total Customers', val: kpis?.totalCustomers || 0, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', tab: 'customers' },
    { label: 'Pending Enquiries', val: kpis?.pendingEnquiries || 0, icon: FileQuestion, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', tab: 'enquiries' },
    { label: 'Active Orders', val: kpis?.activeOrders || 0, icon: ShoppingCart, color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20', tab: 'sales-orders' },
    { label: 'Pending Production', val: kpis?.pendingProduction || 0, icon: Wrench, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20', tab: 'production' },
    { label: 'Pending QC Testing', val: kpis?.pendingQC || 0, icon: FlaskConical, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20', tab: 'qc' },
    { label: 'Ready for Dispatch', val: kpis?.readyDispatch || 0, icon: PackageCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', tab: 'dispatch' },
    { label: 'Low Stock Alerts', val: kpis?.lowStockItems || 0, icon: AlertTriangle, color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20', tab: 'inventory' },
    { label: 'Pending Payments', val: kpis?.pendingPayments || 0, icon: Receipt, color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20', tab: 'accounts' },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpiCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <button
              key={idx}
              onClick={() => setActiveTab(card.tab)}
              className={`p-4 rounded-2xl border ${card.bg} text-left transition-all hover:scale-[1.02] flex items-center justify-between group`}
            >
              <div>
                <div className="text-xs font-semibold text-slate-400">{card.label}</div>
                <div className={`text-2xl font-black mt-1 ${card.color}`}>{card.val}</div>
              </div>
              <div className={`p-3 rounded-xl bg-slate-900/60 border border-slate-800 ${card.color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Sales Orders */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-blue-400" />
              Recent Sales Orders
            </h3>
            <button
              onClick={() => setActiveTab('sales-orders')}
              className="text-xs font-medium text-blue-400 hover:underline flex items-center gap-1"
            >
              View All <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase font-semibold">
                <tr>
                  <th className="p-2.5 rounded-l-lg">Order #</th>
                  <th className="p-2.5">Customer</th>
                  <th className="p-2.5">Amount</th>
                  <th className="p-2.5">Order Status</th>
                  <th className="p-2.5 rounded-r-lg">Delivery</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {recentOrders && recentOrders.length > 0 ? (
                  recentOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-2.5 font-semibold text-blue-400">{ord.order_number}</td>
                      <td className="p-2.5 text-slate-200">{ord.customer_name || 'N/A'}</td>
                      <td className="p-2.5 text-slate-200 font-mono">₹{ord.total_amount?.toLocaleString()}</td>
                      <td className="p-2.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          {ord.order_status}
                        </span>
                      </td>
                      <td className="p-2.5 text-slate-400">{ord.delivery_date || 'N/A'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="p-4 text-center text-slate-500">No recent orders</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alerts Widget */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              Low Stock Warnings
            </h3>
            <button
              onClick={() => setActiveTab('inventory')}
              className="text-xs font-medium text-rose-400 hover:underline flex items-center gap-1"
            >
              Manage Stock
            </button>
          </div>

          <div className="space-y-2">
            {lowStockAlerts && lowStockAlerts.length > 0 ? (
              lowStockAlerts.map((item) => (
                <div key={item.id} className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-200">{item.item_name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{item.part_number}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-rose-400">{item.quantity} {item.unit}</span>
                    <div className="text-[9px] text-slate-500">Min: {item.min_stock}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-xs text-slate-500">All inventory levels healthy</div>
            )}
          </div>
        </div>
      </div>

      {/* Secondary Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent RFQ / Enquiries */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <FileQuestion className="w-4 h-4 text-amber-400" />
              Recent Enquiries (RFQs)
            </h3>
            <button onClick={() => setActiveTab('enquiries')} className="text-xs font-medium text-amber-400 hover:underline">
              View All
            </button>
          </div>

          <div className="space-y-2">
            {recentEnquiries && recentEnquiries.length > 0 ? (
              recentEnquiries.map((enq) => (
                <div key={enq.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-amber-400">{enq.enquiry_number}</span>
                      <span className="text-[10px] text-slate-400">{enq.customer_name}</span>
                    </div>
                    <div className="text-xs text-slate-300 mt-0.5">
                      {enq.valve_type} ({enq.size} {enq.pressure_class}) - Qty: {enq.quantity}
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    {enq.status}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-xs text-slate-500">No active enquiries</div>
            )}
          </div>
        </div>

        {/* Upcoming Deliveries */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-400" />
              Upcoming Delivery Schedule
            </h3>
            <button onClick={() => setActiveTab('sales-orders')} className="text-xs font-medium text-emerald-400 hover:underline">
              Schedule
            </button>
          </div>

          <div className="space-y-2">
            {upcomingDeliveries && upcomingDeliveries.length > 0 ? (
              upcomingDeliveries.map((del) => (
                <div key={del.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white">{del.order_number} - {del.customer_name}</div>
                    <div className="text-xs text-slate-400">PO: {del.customer_po_number || 'N/A'}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {del.delivery_date}
                    </span>
                    <span className="text-[10px] text-slate-500 block">{del.production_status}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-xs text-slate-500">No pending delivery dates</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
