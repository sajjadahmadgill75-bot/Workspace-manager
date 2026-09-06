'use client';

import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { closeModal } from '../../store/slices/uiSlice';
import { exportStateToJSON, importStateFromJSON, performFactoryReset } from '../../store';
import { X, Download, Upload, RotateCcw, AlertTriangle, CheckCircle2 } from 'lucide-react';

export function DataBackupModal() {
  const dispatch = useAppDispatch();
  const { activeModal } = useAppSelector((state) => state.ui);

  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);

  if (activeModal !== 'jsonExportImport') return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportError(null);
    setImportSuccess(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const result = importStateFromJSON(content);
      if (result.success) {
        setImportSuccess('Database snapshot imported successfully!');
      } else {
        setImportError(result.error || 'Failed to import snapshot.');
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to perform a factory reset? All local custom tasks and workspaces will be replaced with initial factory mock data.')) {
      performFactoryReset();
      setImportSuccess('Factory reset complete. Initial mock dataset restored.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-100">Data Backup & Restore</h3>
          <button onClick={() => dispatch(closeModal())} className="p-1 rounded-lg text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 text-xs">
          {/* Notifications */}
          {importSuccess && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{importSuccess}</span>
            </div>
          )}

          {importError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{importError}</span>
            </div>
          )}

          {/* Export JSON Section */}
          <div className="p-4 bg-slate-800/40 border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center gap-2 font-bold text-slate-200">
              <Download className="w-4 h-4 text-indigo-400" />
              <span>Export Client Database Snapshot</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Downloads a formatted `.json` backup containing all users, workspaces, projects, tasks, comments, and audit logs.
            </p>
            <button
              onClick={exportStateToJSON}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold shadow transition"
            >
              Export Database (.JSON)
            </button>
          </div>

          {/* Import JSON Section */}
          <div className="p-4 bg-slate-800/40 border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center gap-2 font-bold text-slate-200">
              <Upload className="w-4 h-4 text-emerald-400" />
              <span>Import JSON Database File</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Upload a previously exported JSON backup file. Includes schema verification.
            </p>
            <label className="block w-full text-center py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-semibold cursor-pointer border border-slate-700 transition">
              <span>Choose Backup File...</span>
              <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          {/* Factory Reset Section */}
          <div className="p-4 bg-rose-500/5 border border-rose-500/20 rounded-xl space-y-3">
            <div className="flex items-center gap-2 font-bold text-rose-400">
              <RotateCcw className="w-4 h-4 text-rose-400" />
              <span>Factory Reset App Store</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Wipes local browser storage (`localStorage` & `IndexedDB`) and restores original pre-populated mock dataset.
            </p>
            <button
              onClick={handleReset}
              className="w-full py-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30 rounded-lg font-bold transition"
            >
              Restore Factory Mock Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
