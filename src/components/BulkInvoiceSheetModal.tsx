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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-6xl shadow-2xl overflow-hidden my-8 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Bulk Invoice Sheet Importer
                <span className="text-[11px] font-normal bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono">
                  Auto-Match & 16-Point Audit
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Import multiple invoices from Google Sheets, CSV, or ERP exports with automatic company recognition
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Source Selector Bar */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 px-6 shrink-0 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setInputMethod('sample')}
            className={`py-3 px-4 flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
              inputMethod === 'sample'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            Enterprise Procurement Sample Batch
          </button>
          <button
            onClick={() => setInputMethod('sheets')}
            className={`py-3 px-4 flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
              inputMethod === 'sheets'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            Connect Google Spreadsheet (Live)
          </button>
          <button
            onClick={() => setInputMethod('upload')}
            className={`py-3 px-4 flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
              inputMethod === 'upload'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            Upload CSV / Excel File
          </button>
          <button
            onClick={() => setInputMethod('paste')}
            className={`py-3 px-4 flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
              inputMethod === 'paste'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            Paste Delimited Table Data
          </button>
        </div>

        {/* Feedback Banners */}
        {errorBanner && (
          <div className="mx-6 mt-4 p-3 bg-red-950/60 border border-red-800/80 rounded-xl text-xs text-red-300 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div>{errorBanner}</div>
          </div>
        )}
        {successBanner && (
          <div className="mx-6 mt-4 p-3 bg-emerald-950/60 border border-emerald-800/80 rounded-xl text-xs text-emerald-300 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>{successBanner}</div>
          </div>
        )}

        {/* Dynamic Source Configuration Panels */}
        <div className="px-6 pt-4 shrink-0">
          {/* 1. GOOGLE SHEETS INPUT */}
          {inputMethod === 'sheets' && (
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  Fetch Rows from Google Spreadsheet
                </span>
                {currentUser ? (
                  <span className="text-[11px] text-emerald-400 font-mono">
                    Signed in as {currentUser.email}
                  </span>
                ) : (
                  <button
                    onClick={onOpenAuthModal}
                    className="text-[11px] text-blue-400 hover:text-blue-300 underline"
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
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Sheet Range (e.g. Invoices!A1:N25)"
                    value={sheetRange}
                    onChange={(e) => setSheetRange(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {sheetsError && (
                <p className="text-xs text-red-400 font-mono">{sheetsError}</p>
              )}

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-500">
                  Headers recognized: Seller, Tax ID, Buyer, Invoice #, PO #, Amount, Currency, Bank Account, IFSC
                </span>
                <button
                  onClick={handleFetchFromGoogleSheets}
                  disabled={isProcessing}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  {isProcessing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <TableProperties className="w-3.5 h-3.5" />}
                  Fetch & Auto-Match Rows
                </button>
              </div>
            </div>
          )}

          {/* 2. UPLOAD FILE */}
          {inputMethod === 'upload' && (
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <UploadCloud className="w-4 h-4 text-blue-400" />
                Select CSV or Delimited Text File from Your Computer
              </span>
              <input
                type="file"
                accept=".csv, .tsv, .txt"
                onChange={handleFileUpload}
                className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500 cursor-pointer"
              />
            </div>
          )}

          {/* 3. PASTE TEXT */}
          {inputMethod === 'paste' && (
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Paste Table Rows (Tab or Comma Delimited)</span>
                <button
                  onClick={handleParsePastedData}
                  disabled={isProcessing}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
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
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-blue-500"
              />
            </div>
          )}
        </div>

        {/* Summary Telemetry Metrics Grid */}
        <div className="px-6 py-3 grid grid-cols-2 sm:grid-cols-5 gap-3 shrink-0">
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Total Invoices</span>
            <span className="text-base font-bold text-white font-mono">{rows.length} Rows</span>
          </div>

          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Batch Total Gross</span>
            <span className="text-base font-bold text-emerald-400 font-mono">
              ₹{(totalVolume / 100000).toFixed(2)}L
            </span>
          </div>

          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Company Auto-Matches</span>
            <span className="text-base font-bold text-blue-400 font-mono flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              {matchedCount} / {rows.length}
            </span>
          </div>

          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block">16-Point Audit Clear</span>
            <span className="text-base font-bold text-emerald-400 font-mono">{verifiedCount} Clean</span>
          </div>

          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl col-span-2 sm:col-span-1">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Blocked / Alerts</span>
            <span className="text-base font-bold text-rose-400 font-mono flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" />
              {blockedCount} Blocked · {reviewCount} Review
            </span>
          </div>
        </div>

        {/* Main Bulk Verification Table */}
        <div className="flex-1 overflow-y-auto px-6 pb-4">
          <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 sticky top-0 z-10 font-mono">
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
              <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
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
                      <tr key={row.rowId} className="hover:bg-slate-900/60 transition-colors">
                        <td className="py-3 px-3 text-slate-500">{row.rowId}</td>

                        {/* Supplier */}
                        <td className="py-3 px-3">
                          <div className="font-semibold text-white font-sans">{row.sellerName}</div>
                          <div className="text-[10px] text-blue-400">{row.sellerTaxId}</div>
                        </td>

                        {/* Company Memory Match */}
                        <td className="py-3 px-3">
                          {match?.isMatch ? (
                            <div className="space-y-0.5">
                              <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                                <Sparkles className="w-3 h-3 text-emerald-400" />
                                Auto-Matched ({match.confidence}%)
                              </span>
                              <div className="text-[10px] text-slate-400 font-sans">
                                {match.historicalTransactionCount} past txns on file
                              </div>
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30 font-sans">
                              New Supplier Protocol
                            </span>
                          )}
                        </td>

                        {/* Invoice & PO */}
                        <td className="py-3 px-3">
                          <div className="text-slate-200">{row.invoiceNumber}</div>
                          <div className="text-[10px] text-emerald-400">{row.poNumber}</div>
                        </td>

                        {/* Amount */}
                        <td className="py-3 px-3 text-right">
                          <div className="font-bold text-white">
                            {row.currency === 'INR'
                              ? `₹${row.amount.toLocaleString('en-IN')}`
                              : `${row.currency} ${row.amount.toLocaleString()}`}
                          </div>
                          <div className="text-[10px] text-slate-500">{row.currency}</div>
                        </td>

                        {/* Bank Details & Diversion Check */}
                        <td className="py-3 px-3">
                          {hasBankDiversion ? (
                            <div className="text-rose-400 space-y-0.5">
                              <div className="font-bold flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                Diversion Detected!
                              </div>
                              <div className="text-[10px] text-rose-300">
                                Sheet: {row.bankAccount}
                              </div>
                              <div className="text-[10px] text-slate-400">
                                Registered: {match?.historicalPrimaryAccount}
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-0.5 text-slate-300">
                              <div className="text-[10px] flex items-center gap-1 text-emerald-400">
                                <CheckCircle2 className="w-3 h-3" /> Verified Account
                              </div>
                              <div className="text-[10px] text-slate-400">{row.bankAccount}</div>
                            </div>
                          )}
                        </td>

                        {/* Audit Verdict */}
                        <td className="py-3 px-3">
                          {row.status === 'BLOCKED' ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-400 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-800">
                              <ShieldAlert className="w-3 h-3" /> BLOCKED
                            </span>
                          ) : row.status === 'NEEDS_REVIEW' ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800">
                              <AlertTriangle className="w-3 h-3" /> NEEDS REVIEW
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                              <ShieldCheck className="w-3 h-3" /> VERIFIED
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
        <div className="p-5 border-t border-slate-800 bg-slate-950 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              {rows.length} Invoices Ready for Batch UTID Commitment
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={handleExportBatchToGoogleSheets}
              disabled={isExportingSheets || rows.length === 0}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors disabled:opacity-50"
              title="Export all validated invoice rows back to Google Sheets"
            >
              {isExportingSheets ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              )}
              Export to Google Sheets
            </button>

            <button
              onClick={handleCommitBatch}
              disabled={isProcessing || rows.length === 0}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors shadow-lg shadow-emerald-600/30 disabled:opacity-50"
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
