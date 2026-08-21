import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FolderArchive, Upload, FileText, Download, Trash2 } from 'lucide-react';

export default function DocumentsView() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [entityType, setEntityType] = useState('Valve Drawing');

  const fetchDocs = async () => {
    try {
      const res = await axios.get('/api/documents');
      setDocuments(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert('Please select a file to upload');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title || file.name);
    formData.append('entity_type', entityType);

    try {
      await axios.post('/api/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setTitle('');
      setFile(null);
      fetchDocs();
    } catch (err) {
      alert(err.response?.data?.error || 'Error uploading document');
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FolderArchive className="w-5 h-5 text-blue-400" />
            Engineering Drawings & Document Repository
          </h2>
          <p className="text-xs text-slate-400">Attach technical valve drawings, customer PO copies, test reports & material spec sheets</p>
        </div>
      </div>

      {/* Upload Form Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <h3 className="font-bold text-white text-sm mb-3">Upload New Attachment</h3>
        <form onSubmit={handleUpload} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Document Title</label>
            <input
              type="text"
              placeholder="e.g. 2 inch Ball Valve General Assembly Drawing"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-2.5"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Category</label>
            <select
              value={entityType}
              onChange={(e) => setEntityType(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-2.5"
            >
              <option value="Valve Drawing">Valve Assembly Drawing</option>
              <option value="Purchase Document">Purchase PO Copy</option>
              <option value="Customer PO">Customer Order PO</option>
              <option value="Test Report">QC Inspection Certificate</option>
              <option value="General">Other Technical Document</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Select File</label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl p-2"
            />
          </div>
          <div>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/30"
            >
              <Upload className="w-4 h-4" /> Upload Document
            </button>
          </div>
        </form>
      </div>

      {/* Documents List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {documents.map(d => (
          <div key={d.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4">
            <div>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase">
                {d.entity_type}
              </span>
              <h4 className="font-bold text-white text-sm mt-2">{d.title}</h4>
              <p className="text-xs text-slate-400 mt-1">Uploaded by {d.uploaded_by || 'Staff'} on {d.created_at?.split(' ')[0]}</p>
            </div>
            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <a
                href={d.file_path}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-blue-400" /> View / Download File
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
