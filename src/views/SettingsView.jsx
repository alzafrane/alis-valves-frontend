import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Settings, Upload, CheckCircle2, Building2, FileText, Phone, Mail, Shield, Save } from 'lucide-react';

export default function SettingsView() {
  const { settings, fetchSettings } = useAuth();
  const [formData, setFormData] = useState({
    company_name: 'Alis Valves',
    address: '',
    phone: '',
    email: '',
    gst_number: '',
    tax_rate: 18
  });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (settings) {
      setFormData({
        company_name: settings.company_name || 'Alis Valves',
        address: settings.address || '',
        phone: settings.phone || '',
        email: settings.email || '',
        gst_number: settings.gst_number || '',
        tax_rate: settings.tax_rate || 18
      });
      setLogoPreview(settings.logo_url || '/uploads/default_logo.svg');
    }
  }, [settings]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    setLoading(true);
    try {
      await axios.put('/api/settings', formData);
      await fetchSettings();
      setMsg('Company profile updated successfully!');
    } catch (err) {
      alert(err.response?.data?.error || 'Error updating settings');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (e) => {
    e.preventDefault();
    if (!logoFile) return alert('Please select a logo image file to upload');

    const data = new FormData();
    data.append('logo', logoFile);

    try {
      const res = await axios.post('/api/settings/logo', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setLogoPreview(res.data.logo_url);
      await fetchSettings();
      alert('Alis Valves logo updated successfully! It will now appear across sidebar, header, dashboard and printable documents.');
      setLogoFile(null);
    } catch (err) {
      alert(err.response?.data?.error || 'Error uploading logo');
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-400" />
          Alis Valves Company Settings & Branding
        </h2>
        <p className="text-xs text-slate-400">Configure company profile info, GST tax parameters and upload/replace company logo</p>
      </div>

      {msg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> {msg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Logo Upload Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 text-center">
          <h3 className="font-bold text-white text-sm">Company Logo Uploader</h3>
          <p className="text-xs text-slate-400">Uploaded logo automatically reflects on sidebar, login, headers and printable PDFs.</p>

          <div className="w-36 h-36 mx-auto bg-slate-950 border border-slate-800 rounded-2xl p-3 flex items-center justify-center shadow-inner overflow-hidden">
            <img
              src={logoPreview || '/uploads/default_logo.svg'}
              alt="Alis Valves Logo Preview"
              className="max-w-full max-h-full object-contain"
              onError={(e) => { e.target.src = '/uploads/default_logo.svg'; }}
            />
          </div>

          <form onSubmit={handleLogoUpload} className="space-y-3 pt-2">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files[0];
                if (f) {
                  setLogoFile(f);
                  setLogoPreview(URL.createObjectURL(f));
                }
              }}
              className="w-full text-xs text-slate-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700 cursor-pointer"
            />
            <button
              type="submit"
              disabled={!logoFile}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 rounded-xl text-xs transition-all flex items-center justify-center gap-2 disabled:opacity-40"
            >
              <Upload className="w-4 h-4" /> Save New Company Logo
            </button>
          </form>
        </div>

        {/* Profile Info Form */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="font-bold text-white text-sm">Company Details & Tax Setup</h3>
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Company Name *</label>
                <input
                  type="text"
                  required
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-2.5"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">GST Registration Number</label>
                <input
                  type="text"
                  value={formData.gst_number}
                  onChange={(e) => setFormData({ ...formData, gst_number: e.target.value })}
                  placeholder="24AAACA1234A1Z5"
                  className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-2.5 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Contact Phone</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-2.5"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Official Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-2.5"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Factory & Office Address</label>
              <textarea
                rows="2"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-2.5"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Default GST Rate (%)</label>
              <input
                type="number"
                value={formData.tax_rate}
                onChange={(e) => setFormData({ ...formData, tax_rate: Number(e.target.value) })}
                className="w-32 bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-2.5 font-mono"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-blue-600/30"
              >
                <Save className="w-4 h-4" /> Save Profile Settings
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
