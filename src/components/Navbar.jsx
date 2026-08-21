import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Search, Bell, Shield, Building2, ExternalLink } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab }) {
  const { user, settings } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await axios.get(`/api/search?q=${encodeURIComponent(searchQuery)}`);
        setSearchResults(res.data);
        setShowResults(true);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectResult = (item) => {
    setShowResults(false);
    setSearchQuery('');
    if (item.type === 'Customer') setActiveTab('customers');
    else if (item.type === 'Sales Order') setActiveTab('sales-orders');
    else if (item.type === 'Quotation') setActiveTab('quotations');
    else if (item.type === 'Valve Product') setActiveTab('valve-products');
    else if (item.type === 'Inventory Item') setActiveTab('inventory');
  };

  return (
    <header className="h-16 bg-slate-900/80 backdrop-blur border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-20 no-print">
      {/* Title & Context */}
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-bold text-white tracking-wide uppercase">
          {activeTab.replace('-', ' ')}
        </h2>
        <span className="text-xs bg-slate-800 text-slate-400 px-2.5 py-1 rounded-full border border-slate-700 font-medium">
          Alis Valves ERP
        </span>
      </div>

      {/* Global Search Bar & Actions */}
      <div className="flex items-center gap-4">
        <div ref={searchRef} className="relative w-72 md:w-96">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Global Search (Order #, Customer, Part #, Valve...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery.trim() && setShowResults(true)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl pl-9 pr-4 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-500"
            />
          </div>

          {/* Search Dropdown Results */}
          {showResults && (
            <div className="absolute top-full mt-2 w-full bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden max-h-80 overflow-y-auto z-50">
              {isSearching ? (
                <div className="p-4 text-center text-xs text-slate-400">Searching Alis database...</div>
              ) : searchResults.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">No matching records found</div>
              ) : (
                <div className="divide-y divide-slate-800/60">
                  {searchResults.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectResult(item)}
                      className="w-full text-left px-4 py-3 hover:bg-slate-800/80 flex items-center justify-between transition-colors group"
                    >
                      <div>
                        <div className="text-xs font-semibold text-white group-hover:text-blue-400 flex items-center gap-2">
                          <span>{item.title}</span>
                          <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-1.5 py-0.5 rounded font-mono">
                            {item.type}
                          </span>
                        </div>
                        {item.subtitle && (
                          <div className="text-[11px] text-slate-400 mt-0.5">{item.subtitle}</div>
                        )}
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Company Quick Info & Role Badge */}
        <div className="hidden lg:flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
          <Building2 className="w-4 h-4 text-blue-400" />
          <span className="text-xs font-semibold text-slate-300">Alis Valves</span>
          <span className="text-slate-600">|</span>
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-xs font-medium text-slate-400">{user?.role}</span>
        </div>
      </div>
    </header>
  );
}
