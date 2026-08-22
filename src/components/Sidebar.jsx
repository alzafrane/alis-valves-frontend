import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  FileQuestion,
  FileCheck,
  ShoppingCart,
  Wrench,
  Boxes,
  Truck,
  Layers,
  FlaskConical,
  PackageCheck,
  Receipt,
  BarChart3,
  UserCog,
  Settings,
  FolderArchive,
  LogOut,
  ChevronRight
} from 'lucide-react';

export const navigationItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['Admin', 'Sales', 'Purchase', 'Store', 'Production', 'QC', 'Accounts'] },
  { id: 'customers', label: 'Customers', icon: Users, roles: ['Admin', 'Sales', 'Accounts'] },
  { id: 'enquiries', label: 'Enquiries / RFQ', icon: FileQuestion, roles: ['Admin', 'Sales'] },
  { id: 'quotations', label: 'Quotations', icon: FileCheck, roles: ['Admin', 'Sales'] },
  { id: 'sales-orders', label: 'Sales Orders', icon: ShoppingCart, roles: ['Admin', 'Sales', 'Accounts', 'Production'] },
  { id: 'valve-products', label: 'Valve Products', icon: Wrench, roles: ['Admin', 'Sales', 'Store', 'Production', 'QC'] },
  { id: 'bom', label: 'BOM Master', icon: Layers, roles: ['Admin', 'Store', 'Production'] },
  { id: 'purchase', label: 'Purchase & Suppliers', icon: Truck, roles: ['Admin', 'Purchase', 'Accounts'] },
  { id: 'inventory', label: 'Inventory / Stock', icon: Boxes, roles: ['Admin', 'Store', 'Purchase', 'Production'] },
  { id: 'production', label: 'Production', icon: Wrench, roles: ['Admin', 'Production', 'QC'] },
  { id: 'qc', label: 'QC & Testing', icon: FlaskConical, roles: ['Admin', 'QC', 'Production'] },
  { id: 'dispatch', label: 'Dispatch', icon: PackageCheck, roles: ['Admin', 'Sales', 'Store', 'Accounts'] },
  { id: 'accounts', label: 'Accounts', icon: Receipt, roles: ['Admin', 'Accounts'] },
  { id: 'reports', label: 'Reports', icon: BarChart3, roles: ['Admin', 'Sales', 'Purchase', 'QC', 'Accounts'] },
  { id: 'documents', label: 'Documents', icon: FolderArchive, roles: ['Admin', 'Sales', 'QC', 'Production'] },
  { id: 'employees', label: 'Employees & Roles', icon: UserCog, roles: ['Admin'] },
  { id: 'settings', label: 'Settings', icon: Settings, roles: ['Admin'] },
];

export default function Sidebar({ activeTab, setActiveTab }) {
  const { user, settings, logout } = useAuth();
  const role = user?.role || 'Admin';

  const visibleItems = navigationItems.filter(item => item.roles.includes(role));

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen sticky top-0 z-30 select-none no-print">
      {/* Brand Header & Logo */}
      <div className="p-4 border-b border-slate-800 flex items-center gap-3">
        <div className="w-14 h-14 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
          <img
            src={settings?.logo_url || '/logo.jpg'}
            alt="Alis Valves Logo"
            className="w-full h-full object-contain p-0"
            onError={(e) => { e.target.src = '/logo.jpg'; }}
          />
        </div>
        <div className="overflow-hidden">
          <h1 className="font-extrabold text-base tracking-wider text-white truncate">
            {settings?.company_name || 'ALIS VALVES'}
          </h1>
          <span className="text-[10px] tracking-widest text-blue-400 font-semibold uppercase block">
            ERP SYSTEM v2.0
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {isActive && <ChevronRight className="w-4 h-4 text-blue-200" />}
            </button>
          );
        })}
      </div>

      {/* User Profile Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/50">
        <div className="flex items-center justify-between">
          <div className="overflow-hidden pr-2">
            <div className="font-semibold text-sm text-slate-200 truncate">{user?.name}</div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="text-xs text-blue-400 font-medium">{user?.role}</span>
            </div>
          </div>
          <button
            onClick={logout}
            title="Logout"
            className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
