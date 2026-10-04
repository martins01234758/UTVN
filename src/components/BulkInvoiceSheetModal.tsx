import React, { useState, useEffect } from 'react';
import { 
  X, 
  FileSpreadsheet, 
  UploadCloud, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Layers, 
  ArrowRight, 
  Building2, 
  ShieldCheck, 
  ShieldAlert, 
  AlertCircle,
  Download,
  Copy,
  FileText,
  Sparkles,
  ExternalLink,
  TableProperties
} from 'lucide-react';
import { UniversalTransaction } from '../types/utvn';
import { 
  BulkInvoiceRow, 
  SAMPLE_BULK_SHEET_DATA, 
  parseDelimitedSheet, 
  parseGoogleSheetsValues, 
  evaluateBulkSheetRows, 
  convertBulkRowsToUniversalTransactions 
} from '../utils/bulkInvoiceProcessor';
import { fetchSheetValues, exportTransactionsToGoogleSheets } from '../services/sheetsService';
import { seedTransactionsToFirestore } from '../services/firestoreService';
import { User as FirebaseUser } from 'firebase/auth';

interface BulkInvoiceSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingTransactions: UniversalTransaction[];
  onBatchCreated: (newTransactions: UniversalTransaction[]) => void;
  currentUser: FirebaseUser | null;
  onOpenAuthModal?: () => void;
}

export const BulkInvoiceSheetModal: React.FC<BulkInvoiceSheetModalProps> = ({
  isOpen,
  onClose,
  existingTransactions,
  onBatchCreated,
  currentUser,
  onOpenAuthModal,
}) => {
  const [inputMethod, setInputMethod] = useState<'sample' | 'sheets' | 'paste' | 'upload'>('sample');
  const [rows, setRows] = useState<BulkInvoiceRow[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isExportingSheets, setIsExportingSheets] = useState<boolean>(false);
  const [pastedText, setPastedText] = useState<string>('');
  
  // Google Sheets input state
  const [spreadsheetId, setSpreadsheetId] = useState<string>('');
  const [sheetRange, setSheetRange] = useState<string>('Invoices!A1:N25');
  const [sheetsError, setSheetsError] = useState<string | null>(null);

  // Status feedback
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  // Load and evaluate initial sample on mount or when modal opens
  useEffect(() => {
    if (isOpen) {
      loadSampleData();
    }
  }, [isOpen, existingTransactions]);

  const loadSampleData = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const evaluated = evaluateBulkSheetRows(SAMPLE_BULK_SHEET_DATA, existingTransactions);
      setRows(evaluated);
      setIsProcessing(false);
      setSuccessBanner(`Loaded ${evaluated.length} invoice rows from Enterprise Procurement Batch.`);
    }, 150);
  };

  const handleParsePastedData = () => {
    if (!pastedText.trim()) {
      setErrorBanner('Please paste tab-delimited or CSV table data.');
      return;
    }
    setIsProcessing(true);
    setErrorBanner(null);
    try {
      const parsed = parseDelimitedSheet(pastedText);
      if (parsed.length === 0) {
        setErrorBanner('Could not parse valid invoice rows from pasted text. Ensure header row is present.');
        setIsProcessing(false);
        return;
      }
      const evaluated = evaluateBulkSheetRows(parsed, existingTransactions);
      setRows(evaluated);
      setSuccessBanner(`Parsed and evaluated ${evaluated.length} rows from pasted data.`);
    } catch (err: any) {
      setErrorBanner('Parse error: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFetchFromGoogleSheets = async () => {
    if (!spreadsheetId.trim()) {
      setSheetsError('Please enter a valid Google Spreadsheet ID');
      return;
    }
    if (!currentUser) {
      setSheetsError('Google Authentication required. Please sign in first.');
      return;
    }

    setIsProcessing(true);
    setSheetsError(null);
    setErrorBanner(null);

    try {
      const values = await fetchSheetValues(spreadsheetId.trim(), sheetRange.trim());
      if (!values || values.length < 2) {
        setSheetsError('No data found in the specified range. Ensure first row contains column headers.');
        setIsProcessing(false);
        return;
      }
      const parsed = parseGoogleSheetsValues(values);
      const evaluated = evaluateBulkSheetRows(parsed, existingTransactions);
      setRows(evaluated);
      setSuccessBanner(`Successfully loaded and evaluated ${evaluated.length} invoices directly from Google Sheet.`);
    } catch (err: any) {
      setSheetsError(err.message || 'Failed to fetch from Google Sheets.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setIsProcessing(true);
        const parsed = parseDelimitedSheet(content);
        const evaluated = evaluateBulkSheetRows(parsed, existingTransactions);
        setRows(evaluated);
        setIsProcessing(false);
        setSuccessBanner(`Uploaded and evaluated ${evaluated.length} rows from file ${file.name}.`);
      }
    };
    reader.readAsText(file);
  };

  const handleCommitBatch = async () => {
    if (rows.length === 0) return;
    setIsProcessing(true);
    setErrorBanner(null);

    try {
      // 1. Convert to official UniversalTransactions
      const newTransactions = convertBulkRowsToUniversalTransactions(rows, existingTransactions);

      // 2. Batch commit to Firestore in background
      seedTransactionsToFirestore(newTransactions).catch((err) =>
        console.warn('Firestore bulk seed notice:', err)
      );

      // 3. Update application state
      onBatchCreated(newTransactions);
      onClose();
    } catch (err: any) {
      setErrorBanner('Failed to commit batch: ' + err.message);
      setIsProcessing(false);
    }
  };

  const handleExportBatchToGoogleSheets = async () => {
    if (rows.length === 0) return;
    if (!currentUser) {
      if (onOpenAuthModal) onOpenAuthModal();
      return;
    }

    setIsExportingSheets(true);
    setErrorBanner(null);

    try {
      const txns = convertBulkRowsToUniversalTransactions(rows, existingTransactions);
      const res = await exportTransactionsToGoogleSheets(txns, 'UTVN Bulk Sheet Verification Ledger');
      setSuccessBanner(`Exported batch verification report to Google Sheets! ID: ${res.spreadsheetId}`);
      window.open(res.spreadsheetUrl, '_blank');
    } catch (err: any) {
      setErrorBanner('Failed to export to Google Sheets: ' + err.message);
    } finally {
      setIsExportingSheets(false);
    }
  };

  // Metrics calculation
  const totalVolume = rows.reduce((acc, r) => acc + r.amount, 0);
  const matchedCount = rows.filter((r) => r.matchResult?.isMatch).length;
  const blockedCount = rows.filter((r) => r.status === 'BLOCKED').length;
  const reviewCount = rows.filter((r) => r.status === 'NEEDS_REVIEW').length;
  const verifiedCount = rows.filter((r) => r.status === 'VERIFIED').length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-6xl shadow-2xl overflow-hidden my-8 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-200">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                Bulk Invoice Sheet Importer
                <span className="text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full font-mono">
                  Auto-Match & 16-Point Audit
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Import multiple invoices from Google Sheets, CSV, or ERP exports with automatic company recognition
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

        {/* Input Source Selector Bar */}
        <div className="flex border-b border-slate-200 bg-slate-50/50 px-6 shrink-0 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setInputMethod('sample')}
            className={`py-3 px-4 flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
              inputMethod === 'sample'
                ? 'border-emerald-600 text-emerald-700 bg-emerald-50/60'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            Enterprise Procurement Sample Batch
          </button>
          <button
            onClick={() => setInputMethod('sheets')}
            className={`py-3 px-4 flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
              inputMethod === 'sheets'
                ? 'border-emerald-600 text-emerald-700 bg-emerald-50/60'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            Connect Google Spreadsheet (Live)
          </button>
          <button
            onClick={() => setInputMethod('upload')}
            className={`py-3 px-4 flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
              inputMethod === 'upload'
                ? 'border-emerald-600 text-emerald-700 bg-emerald-50/60'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            Upload CSV / Excel File
          </button>
          <button
            onClick={() => setInputMethod('paste')}
            className={`py-3 px-4 flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
              inputMethod === 'paste'
                ? 'border-emerald-600 text-emerald-700 bg-emerald-50/60'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            Paste Delimited Table Data
          </button>
        </div>

        {/* Feedback Banners */}
        {errorBanner && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>{errorBanner}</div>
          </div>
        )}
        {successBanner && (
          <div className="mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>{successBanner}</div>
          </div>
        )}

        {/* Dynamic Source Configuration Panels */}
        <div className="px-6 pt-4 shrink-0">
          {/* 1. GOOGLE SHEETS INPUT */}
          {inputMethod === 'sheets' && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  Fetch Rows from Google Spreadsheet
                </span>
                {currentUser ? (
                  <span className="text-[11px] text-emerald-700 font-mono font-semibold">
                    Signed in as {currentUser.email}
                  </span>
                ) : (
                  <button
                    onClick={onOpenAuthModal}
                    className="text-[11px] text-emerald-700 hover:text-emerald-800 font-medium underline"
                  >
                    Sign in with Google to enable Sheets access
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    placeholder="Google Spreadsheet ID (e.g. 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms)"
                    value={spreadsheetId}
                    onChange={(e) => setSpreadsheetId(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-emerald-500 shadow-xs"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Sheet Range (e.g. Invoices!A1:N25)"
                    value={sheetRange}
                    onChange={(e) => setSheetRange(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-emerald-500 shadow-xs"
                  />
                </div>
              </div>

              {sheetsError && (
                <p className="text-xs text-rose-600 font-mono">{sheetsError}</p>
              )}

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-500">
                  Headers recognized: Seller, Tax ID, Buyer, Invoice #, PO #, Amount, Currency, Bank Account, IFSC
                </span>
                <button
                  onClick={handleFetchFromGoogleSheets}
                  disabled={isProcessing}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors disabled:opacity-50 shadow-sm"
                >
                  {isProcessing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <TableProperties className="w-3.5 h-3.5" />}
                  Fetch & Auto-Match Rows
                </button>
              </div>
            </div>
          )}

          {/* 2. UPLOAD FILE */}
          {inputMethod === 'upload' && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-2">
                <UploadCloud className="w-4 h-4 text-emerald-600" />
                Select CSV or Delimited Text File from Your Computer
              </span>
              <input
                type="file"
                accept=".csv, .tsv, .txt"
                onChange={handleFileUpload}
                className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border file:border-emerald-300 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
              />
            </div>
          )}

          {/* 3. PASTE TEXT */}
          {inputMethod === 'paste' && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Paste Table Rows (Tab or Comma Delimited)</span>
                <button
                  onClick={handleParsePastedData}
                  disabled={isProcessing}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50 shadow-sm"
                >
                  {isProcessing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  Parse & Auto-Match
                </button>
              </div>
              <textarea
                rows={3}
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="Seller, GSTIN, Buyer, InvoiceNo, Date, PONo, Amount, Currency, BankAccount, IFSC, Description&#10;Tata Steel, 20AAACT2702H1ZZ, L&T, INV-891, 2026-10-02, PO-102, 4500000, INR, 000405009821034, SBIN0000125, Steel Beams..."
                className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 font-mono focus:outline-none focus:border-emerald-500 shadow-xs"
              />
            </div>
          )}
        </div>

        {/* Summary Telemetry Metrics Grid */}
        <div className="px-6 py-3 grid grid-cols-2 sm:grid-cols-5 gap-3 shrink-0">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl shadow-xs">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">Total Invoices</span>
            <span className="text-base font-bold text-slate-900 font-mono">{rows.length} Rows</span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl shadow-xs">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">Batch Total Gross</span>
            <span className="text-base font-bold text-emerald-600 font-mono">
              ₹{(totalVolume / 100000).toFixed(2)}L
            </span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl shadow-xs">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">Company Auto-Matches</span>
            <span className="text-base font-bold text-emerald-700 font-mono flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              {matchedCount} / {rows.length}
            </span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl shadow-xs">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">16-Point Audit Clear</span>
            <span className="text-base font-bold text-emerald-600 font-mono">{verifiedCount} Clean</span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl col-span-2 sm:col-span-1 shadow-xs">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">Blocked / Alerts</span>
            <span className="text-base font-bold text-rose-600 font-mono flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
              {blockedCount} Blocked · {reviewCount} Review
            </span>
          </div>
        </div>

        {/* Main Bulk Verification Table */}
        <div className="flex-1 overflow-y-auto px-6 pb-4">
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 sticky top-0 z-10 font-mono">
                <tr>
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Supplier Legal Name & GSTIN</th>
                  <th className="py-2.5 px-3">Company Recognition State</th>
                  <th className="py-2.5 px-3">Invoice & PO Reference</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
                  <th className="py-2.5 px-3">Bank Remittance & Sentinel</th>
                  <th className="py-2.5 px-3">16-Point Audit Verdict</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500 font-sans">
                      No invoice rows loaded. Select a sample batch above or fetch from Google Sheets.
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => {
                    const match = row.matchResult;
                    const hasBankDiversion = match?.isMatch && !match.bankAccountMatchesHistorical;

                    return (
                      <tr key={row.rowId} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3 text-slate-400">{row.rowId}</td>

                        {/* Supplier */}
                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-900 font-sans">{row.sellerName}</div>
                          <div className="text-[10px] text-emerald-700 font-mono">{row.sellerTaxId}</div>
                        </td>

                        {/* Company Memory Match */}
                        <td className="py-3 px-3">
                          {match?.isMatch ? (
                            <div className="space-y-0.5">
                              <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200 font-medium">
                                <Sparkles className="w-3 h-3 text-emerald-600" />
                                Auto-Matched ({match.confidence}%)
                              </span>
                              <div className="text-[10px] text-slate-500 font-sans">
                                {match.historicalTransactionCount} past txns on file
                              </div>
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] bg-amber-50 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200 font-sans font-medium">
                              New Supplier Protocol
                            </span>
                          )}
                        </td>

                        {/* Invoice & PO */}
                        <td className="py-3 px-3">
                          <div className="text-slate-800 font-medium">{row.invoiceNumber}</div>
                          <div className="text-[10px] text-emerald-700">{row.poNumber}</div>
                        </td>

                        {/* Amount */}
                        <td className="py-3 px-3 text-right">
                          <div className="font-bold text-slate-900">
                            {row.currency === 'INR'
                              ? `₹${row.amount.toLocaleString('en-IN')}`
                              : `${row.currency} ${row.amount.toLocaleString()}`}
                          </div>
                          <div className="text-[10px] text-slate-400">{row.currency}</div>
                        </td>

                        {/* Bank Details & Diversion Check */}
                        <td className="py-3 px-3">
                          {hasBankDiversion ? (
                            <div className="text-rose-700 space-y-0.5">
                              <div className="font-bold flex items-center gap-1 text-rose-600">
                                <AlertTriangle className="w-3 h-3" />
                                Diversion Detected!
                              </div>
                              <div className="text-[10px] text-rose-600">
                                Sheet: {row.bankAccount}
                              </div>
                              <div className="text-[10px] text-slate-500">
                                Registered: {match?.historicalPrimaryAccount}
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-0.5 text-slate-700">
                              <div className="text-[10px] flex items-center gap-1 text-emerald-700 font-medium">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified Account
                              </div>
                              <div className="text-[10px] text-slate-500">{row.bankAccount}</div>
                            </div>
                          )}
                        </td>

                        {/* Audit Verdict */}
                        <td className="py-3 px-3">
                          {row.status === 'BLOCKED' ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                              <ShieldAlert className="w-3 h-3 text-rose-600" /> BLOCKED
                            </span>
                          ) : row.status === 'NEEDS_REVIEW' ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              <AlertTriangle className="w-3 h-3 text-amber-600" /> NEEDS REVIEW
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              <ShieldCheck className="w-3 h-3 text-emerald-600" /> VERIFIED
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              {rows.length} Invoices Ready for Batch UTID Commitment
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={handleExportBatchToGoogleSheets}
              disabled={isExportingSheets || rows.length === 0}
              className="px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors disabled:opacity-50 shadow-xs"
              title="Export all validated invoice rows back to Google Sheets"
            >
              {isExportingSheets ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              )}
              Export to Google Sheets
            </button>

            <button
              onClick={handleCommitBatch}
              disabled={isProcessing || rows.length === 0}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors shadow-sm disabled:opacity-50"
            >
              {isProcessing ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <ShieldCheck className="w-3.5 h-3.5" />
              )}
              Generate All UTVNs ({rows.length}) & Commit
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
