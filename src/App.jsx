import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import LoginView from './views/LoginView';
import DashboardView from './views/DashboardView';
import CustomersView from './views/CustomersView';
import EnquiriesView from './views/EnquiriesView';
import QuotationsView from './views/QuotationsView';
import SalesOrdersView from './views/SalesOrdersView';
import ValveProductsView from './views/ValveProductsView';
import BOMView from './views/BOMView';
import PurchaseView from './views/PurchaseView';
import InventoryView from './views/InventoryView';
import ProductionView from './views/ProductionView';
import QCView from './views/QCView';
import DispatchView from './views/DispatchView';
import AccountsView from './views/AccountsView';
import EmployeesView from './views/EmployeesView';
import ReportsView from './views/ReportsView';
import DocumentsView from './views/DocumentsView';
import SettingsView from './views/SettingsView';

function MainApp() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [convertEnquiry, setConvertEnquiry] = useState(null);
  const [qcProdOrder, setQcProdOrder] = useState(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center font-sans">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div className="text-sm font-semibold tracking-wider text-slate-400">Loading Alis Valves ERP System...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginView />;
  }

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView setActiveTab={setActiveTab} />;
      case 'customers':
        return <CustomersView />;
      case 'enquiries':
        return <EnquiriesView setActiveTab={setActiveTab} setConvertEnquiry={setConvertEnquiry} />;
      case 'quotations':
        return <QuotationsView setActiveTab={setActiveTab} convertEnquiry={convertEnquiry} setConvertEnquiry={setConvertEnquiry} />;
      case 'sales-orders':
        return <SalesOrdersView setActiveTab={setActiveTab} />;
      case 'valve-products':
        return <ValveProductsView />;
      case 'bom':
        return <BOMView />;
      case 'purchase':
        return <PurchaseView />;
      case 'inventory':
        return <InventoryView />;
      case 'production':
        return <ProductionView setActiveTab={setActiveTab} setQcProdOrder={setQcProdOrder} />;
      case 'qc':
        return <QCView qcProdOrder={qcProdOrder} setQcProdOrder={setQcProdOrder} />;
      case 'dispatch':
        return <DispatchView />;
      case 'accounts':
        return <AccountsView />;
      case 'employees':
        return <EmployeesView />;
      case 'reports':
        return <ReportsView />;
      case 'documents':
        return <DocumentsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex font-sans antialiased text-slate-100">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="flex-1">
          {renderActiveView()}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
