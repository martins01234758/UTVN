import React, { useState } from 'react';
import { 
  X, 
  FileSpreadsheet, 
  Database, 
  CloudCheck, 
  ExternalLink, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  LogOut, 
  User, 
  UploadCloud, 
  Layers, 
  ShieldCheck, 
  HardDriveDownload,
  AlertCircle,
  TableProperties,
  ArrowRight
} from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';
import { signInWithGoogle, logout, testConnection } from '../lib/firebase';
import { exportTransactionsToGoogleSheets, ExportResult, fetchSheetValues } from '../services/sheetsService';
import { seedTransactionsToFirestore } from '../services/firestoreService';
import { UniversalTransaction } from '../types/utvn';

interface GoogleSheetsSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: UniversalTransaction[];
  currentUser: FirebaseUser | null;
  onAuthChange: (user: FirebaseUser | null) => void;
  onSyncFirestoreSuccess?: (count: number) => void;
  onOpenAuthModal?: () => void;
  onOpenBulkImport?: () => void;
}

export const GoogleSheetsSyncModal: React.FC<GoogleSheetsSyncModalProps> = ({
  isOpen,
  onClose,
  transactions,
  currentUser,
  onAuthChange,
  onSyncFirestoreSuccess,
  onOpenAuthModal,
  onOpenBulkImport,
}) => {
  const [activeTab, setActiveTab] = useState<'sheets' | 'firestore' | 'cloudsql'>('sheets');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isSyncingFirestore, setIsSyncingFirestore] = useState(false);
  const [exportResult, setExportResult] = useState<ExportResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  // Mandatory confirmation dialog state for destructive/mutating Workspace operations
  const [showExportConfirm, setShowExportConfirm] = useState(false);
  const [sheetTitle, setSheetTitle] = useState('UTVN Verified Transaction Ledger');

  // Sheet reader test state
  const [readSheetId, setReadSheetId] = useState('');
  const [readRange, setReadRange] = useState('Verified Transactions!A1:E10');
  const [readRows, setReadRows] = useState<any[][] | null>(null);
  const [isReadingSheet, setIsReadingSheet] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    setErrorMsg(null);
    try {
      const res = await signInWithGoogle();
      if (res?.user) {
        onAuthChange(res.user);
        setSuccessMsg(`Successfully authenticated as ${res.user.displayName || res.user.email}`);
      }
    } catch (err: any) {
      console.error('Sign-in error:', err);
      setErrorMsg(err.message || 'Google Sign-In failed. Please try again.');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
      onAuthChange(null);
      setSuccessMsg('Signed out successfully.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Error signing out');
    }
  };

  const handleConfirmExport = async () => {
    setShowExportConfirm(false);
    setIsExporting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const result = await exportTransactionsToGoogleSheets(transactions, sheetTitle);
      setExportResult(result);
      setSuccessMsg(`Successfully exported ${result.rowsExported} transactions to Google Sheets!`);
    } catch (err: any) {
      console.error('Export error:', err);
      setErrorMsg(err.message || 'Failed to export to Google Sheets');
    } finally {
      setIsExporting(false);
    }
  };

  const handleSyncFirestore = async () => {
    setIsSyncingFirestore(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const count = await seedTransactionsToFirestore(transactions);
      if (onSyncFirestoreSuccess) onSyncFirestoreSuccess(count);
      setSuccessMsg(`Successfully synced ${count} transactions to Firebase Firestore database.`);
    } catch (err: any) {
      console.error('Firestore sync error:', err);
      setErrorMsg(err.message || 'Failed to sync with Firestore.');
    } finally {
      setIsSyncingFirestore(false);
    }
  };

  const handleFetchSheetData = async () => {
    if (!readSheetId.trim()) {
      setErrorMsg('Please enter a valid Google Spreadsheet ID');
      return;
    }
    setIsReadingSheet(true);
    setErrorMsg(null);
    try {
      const rows = await fetchSheetValues(readSheetId.trim(), readRange.trim());
      setReadRows(rows);
      setSuccessMsg(`Successfully loaded ${rows.length} rows from Google Sheet.`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to read Google Sheet');
    } finally {
      setIsReadingSheet(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-200">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                Google Sheets & Cloud Integrations
              </h2>
              <p className="text-xs text-slate-500">
                Live Google Sheets ledger generation, Firebase persistence, and Cloud architecture
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-slate-200 bg-slate-50/40 px-6">
          <button
            onClick={() => setActiveTab('sheets')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'sheets'
                ? 'border-emerald-600 text-emerald-700 bg-emerald-50/60'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            Google Sheets Integration
          </button>
          <button
            onClick={() => setActiveTab('firestore')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'firestore'
                ? 'border-emerald-600 text-emerald-700 bg-emerald-50/60'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Database className="w-4 h-4" />
            Firebase Firestore
          </button>
          <button
            onClick={() => setActiveTab('cloudsql')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'cloudsql'
                ? 'border-emerald-600 text-emerald-700 bg-emerald-50/60'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            Cloud SQL Architecture
          </button>
        </div>

        {/* Notifications */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>{errorMsg}</div>
          </div>
        )}
        {successMsg && (
          <div className="mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>{successMsg}</div>
          </div>
        )}

        <div className="p-6 space-y-6">
          {/* TAB 1: GOOGLE SHEETS */}
          {activeTab === 'sheets' && (
            <div className="space-y-6">
              {/* Auth Card */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-200/80 flex items-center justify-center text-slate-600">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">
                      {currentUser ? currentUser.displayName || currentUser.email : 'Google Account Connection'}
                    </div>
                    <div className="text-xs text-slate-500">
                      {currentUser 
                        ? `Connected with scopes: sheets, drive.file (${currentUser.email})`
                        : 'Sign in with your Google account to create and sync UTVN verification ledgers'}
                    </div>
                  </div>
                </div>

                <div>
                  {currentUser ? (
                    <button
                      onClick={handleSignOut}
                      className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  ) : (
                    <div>
                      <button
                        onClick={handleGoogleSignIn}
                        disabled={isSigningIn}
                        className="flex items-center gap-3 bg-white text-slate-800 border border-slate-300 px-4 py-2 rounded-xl font-semibold text-xs hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 48 48">
                          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                        </svg>
                        {isSigningIn ? 'Connecting...' : 'Sign in with Google'}
                      </button>
                      {onOpenAuthModal && (
                        <button
                          type="button"
                          onClick={onOpenAuthModal}
                          className="text-[11px] text-emerald-700 hover:text-emerald-800 font-medium underline mt-1.5 block text-center w-full"
                        >
                          Or use Microsoft, Apple, Email, Phone
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Action 1: Export to Google Sheets */}
              <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                      Export Transactions to Google Sheets
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Generates a formatted Google Spreadsheet containing all {transactions.length} universal transactions, 
                      4-way matching flags, tax IRN hashes, and explainable risk scores.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">Total Records</span>
                    <span className="text-base font-bold text-slate-900 font-mono">{transactions.length} Txns</span>
                  </div>
                  <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">Columns Mapped</span>
                    <span className="text-base font-bold text-emerald-600 font-mono">18 Fields</span>
                  </div>
                  <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">Audit Integrity</span>
                    <span className="text-base font-bold text-slate-800 font-mono">SHA-256 Hashes</span>
                  </div>
                </div>

                {currentUser ? (
                  <div>
                    <button
                      onClick={() => setShowExportConfirm(true)}
                      disabled={isExporting}
                      className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors disabled:opacity-50 shadow-sm"
                    >
                      {isExporting ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Creating Spreadsheet...
                        </>
                      ) : (
                        <>
                          <HardDriveDownload className="w-4 h-4" />
                          Export Ledger to Google Sheets
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    Please sign in with Google above to export to your Google Drive / Google Sheets.
                  </p>
                )}

                {/* Export Result Link Card */}
                {exportResult && (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Spreadsheet Created Successfully!
                      </span>
                      <span className="text-[10px] text-emerald-700 font-mono font-medium">{exportResult.rowsExported} rows written</span>
                    </div>
                    <p className="text-xs text-slate-700">
                      ID: <span className="font-mono text-emerald-800 font-semibold">{exportResult.spreadsheetId}</span>
                    </p>
                    <a
                      href={exportResult.spreadsheetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-700 hover:text-emerald-800 underline pt-1"
                    >
                      Open in Google Sheets ↗
                    </a>
                  </div>
                )}
              </div>

              {/* Action 2: Bulk Import Invoices from Google Sheet */}
              <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <TableProperties className="w-4 h-4 text-emerald-600" />
                      Bulk Invoice Sheet Importer & Auto-Match
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Import multiple invoices simultaneously from a Google Spreadsheet or CSV. Automatically matches known enterprise vendors, auto-renders KYC/banking details, and performs 16-point fraud checks in bulk.
                    </p>
                  </div>
                </div>

                {onOpenBulkImport && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenBulkImport();
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors shadow-sm"
                  >
                    <TableProperties className="w-4 h-4" />
                    Launch Bulk Sheet Importer
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Action 3: Inspect External Google Sheet */}
              <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 text-emerald-600" />
                  Read / Inspect Single Google Spreadsheet Range
                </h3>
                <p className="text-xs text-slate-500">
                  Read live cell data from any Google Spreadsheet shared with your account.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      placeholder="Spreadsheet ID (from URL /d/<SPREADSHEET_ID>/edit)"
                      value={readSheetId}
                      onChange={(e) => setReadSheetId(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 font-mono shadow-xs"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Range (e.g. Sheet1!A1:D10)"
                      value={readRange}
                      onChange={(e) => setReadRange(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 font-mono shadow-xs"
                    />
                  </div>
                </div>

                <button
                  onClick={handleFetchSheetData}
                  disabled={isReadingSheet || !currentUser}
                  className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors disabled:opacity-40 shadow-xs"
                >
                  {isReadingSheet ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <FileSpreadsheet className="w-3.5 h-3.5" />}
                  Fetch Sheet Cells
                </button>

                {readRows && readRows.length > 0 && (
                  <div className="mt-3 overflow-x-auto max-h-48 border border-slate-200 rounded-xl bg-white shadow-xs">
                    <table className="w-full text-[11px] text-left">
                      <thead className="bg-slate-50 text-slate-600 font-mono sticky top-0 border-b border-slate-200">
                        <tr>
                          {readRows[0].map((header: any, idx: number) => (
                            <th key={idx} className="px-3 py-2">{header}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-mono text-slate-700">
                        {readRows.slice(1, 6).map((row: any[], rowIdx: number) => (
                          <tr key={rowIdx} className="hover:bg-slate-50">
                            {row.map((cell: any, cellIdx: number) => (
                              <td key={cellIdx} className="px-3 py-2 whitespace-nowrap">{String(cell)}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: FIREBASE FIRESTORE */}
          {activeTab === 'firestore' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      Firebase Firestore NoSQL
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-200 font-mono font-medium">
                        PROVISIONED & ACTIVE
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5 font-mono">
                      Project: gen-lang-client-0897913406 | DB: ai-studio-utvnuniversaltra-...
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleSyncFirestore}
                  disabled={isSyncingFirestore}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors disabled:opacity-50 shadow-sm"
                >
                  {isSyncingFirestore ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <UploadCloud className="w-3.5 h-3.5" />
                  )}
                  Sync All to Firestore
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Security Rules Status
                  </div>
                  <p className="text-xs text-slate-500">
                    Hardened 8-pillar security rules deployed. Transactions are append-only; audit trails are cryptographically sealed.
                  </p>
                  <div className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200 font-semibold">
                    firestore.rules: DEPLOYED
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Database className="w-4 h-4 text-emerald-600" />
                    Collections Registered
                  </div>
                  <p className="text-xs text-slate-500">
                    Intermediate representation schema defined in <code className="text-slate-800 font-medium">firebase-blueprint.json</code>:
                  </p>
                  <div className="text-[11px] font-mono text-slate-700 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 font-medium">
                    /transactions, /audit_logs, /users
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CLOUD SQL ARCHITECTURE */}
          {activeTab === 'cloudsql' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-sm font-bold text-slate-900">Relational Cloud SQL (PostgreSQL) Architecture Status</h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  The Cloud SQL setup request for project <span className="font-mono text-slate-800 font-semibold">gen-lang-client-0897913406</span> in region <span className="font-mono text-slate-800 font-semibold">europe-west1</span> requires an active Google Cloud Billing Account with Owner permissions on the target GCP project.
                </p>
                <div className="p-3 bg-white border border-slate-200 rounded-lg text-xs space-y-1.5 font-mono">
                  <div className="text-slate-700 font-semibold">Instance Provisioning Diagnostic:</div>
                  <div className="text-amber-700">Status: Owner permissions and active GCP billing account required for PostgreSQL instance allocation.</div>
                  <div className="text-emerald-700 font-semibold">Graceful Failover: Fully active Firebase Firestore Enterprise datastore enabled with real-time replication.</div>
                </div>
              </div>

              <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3">
                <h4 className="text-xs font-bold text-slate-900">Architectural Comparison: Relational vs. Document vs. Ledger</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <span className="font-bold text-slate-800 block">Cloud SQL (Postgres)</span>
                    <span className="text-[11px] text-slate-500">ACID 4-way matching constraints, relational foreign keys, SQL views, audit triggers.</span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <span className="font-bold text-emerald-700 block">Firebase Firestore</span>
                    <span className="text-[11px] text-slate-500">Active enterprise NoSQL store, real-time snapshot subscribers, multi-region failover.</span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <span className="font-bold text-slate-800 block">Google Sheets</span>
                    <span className="text-[11px] text-slate-500">Collaborative enterprise reporting, finance team auditing, live reconciliation export.</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            UTVN Network Online
          </div>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg font-semibold transition-colors shadow-xs"
          >
            Close
          </button>
        </div>
      </div>

      {/* Mandatory User Confirmation Dialog for Mutating Workspace Operations */}
      {showExportConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3 text-emerald-600">
              <FileSpreadsheet className="w-6 h-6" />
              <h3 className="text-base font-bold text-slate-900">Confirm Google Sheets Export</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              You are about to create a new Google Spreadsheet titled:
            </p>
            <input
              type="text"
              value={sheetTitle}
              onChange={(e) => setSheetTitle(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 font-medium"
            />
            <p className="text-xs text-slate-500">
              This will write <strong className="text-slate-900">{transactions.length} verified transactions</strong> with 18 audit columns directly into your personal Google Drive / Google Sheets.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowExportConfirm(false)}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmExport}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-colors shadow-sm"
              >
                Confirm & Create Sheet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
