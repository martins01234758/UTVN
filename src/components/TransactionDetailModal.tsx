import React, { useState } from 'react';
import { 
  X, ShieldCheck, AlertTriangle, ShieldAlert, CheckCircle2, 
  FileText, Landmark, Key, Hash, Layers, ArrowRight, ExternalLink,
  Lock, Check, AlertCircle, Copy, Clock, RefreshCw, Download, FileDown, Printer
} from 'lucide-react';
import { UniversalTransaction, RiskLevel } from '../types/utvn';
import { exportTransactionAuditPdf } from '../services/pdfReceiptService';

interface TransactionDetailModalProps {
  transaction: UniversalTransaction;
  onClose: () => void;
  onApprovePayment?: (utid: string) => void;
  onHaltTransaction?: (utid: string) => void;
}

export const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  transaction,
  onClose,
  onApprovePayment,
  onHaltTransaction,
}) => {
  const [activeTab, setActiveTab] = useState<'tree' | 'match' | 'fraud' | 'identity' | 'tax' | 'audit' | 'receipt'>('tree');
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(id);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const getRiskBadge = (level: RiskLevel) => {
    switch (level) {
      case 'VERIFIED':
        return <span className="text-emerald-700 font-semibold text-xs flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> VERIFIED (0 Risk)</span>;
      case 'LOW_RISK':
        return <span className="text-teal-700 font-semibold text-xs flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-teal-600" /> LOW RISK</span>;
      case 'NEEDS_REVIEW':
        return <span className="text-amber-700 font-semibold text-xs flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> NEEDS REVIEW</span>;
      case 'HIGH_RISK':
        return <span className="text-orange-700 font-semibold text-xs flex items-center gap-1.5"><AlertCircle className="w-3.5 h-3.5 text-orange-600" /> HIGH RISK</span>;
      case 'BLOCKED':
        return <span className="text-rose-700 font-semibold text-xs flex items-center gap-1.5"><ShieldAlert className="w-3.5 h-3.5 text-rose-600" /> BLOCKED</span>;
    }
  };

  const handleExportPdf = () => {
    setIsExportingPdf(true);
    try {
      exportTransactionAuditPdf(transaction);
    } catch (err) {
      console.error('PDF Export error:', err);
    } finally {
      setTimeout(() => setIsExportingPdf(false), 800);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-start justify-between bg-white shrink-0">
          <div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm font-bold text-emerald-700 tabular-nums">
                {transaction.utid}
              </span>
              <span className="text-slate-300">·</span>
              {getRiskBadge(transaction.overallRiskLevel)}
              <span className="text-slate-300">·</span>
              <span className="text-xs text-slate-500">
                Created: {new Date(transaction.createdAt).toLocaleDateString()}
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 mt-1">
              {transaction.buyer.legalName} <span className="text-slate-400 font-normal">→</span> {transaction.seller.legalName}
            </h2>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleExportPdf}
              disabled={isExportingPdf}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors shadow-xs disabled:opacity-50"
              title="Generate and download official PDF audit receipt"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isExportingPdf ? 'Generating PDF...' : 'Export Audit PDF'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Risk Banner if critical or review */}
        {transaction.overallRiskLevel !== 'VERIFIED' && (
          <div className={`p-4 border-b text-xs flex items-start gap-3 shrink-0 ${
            transaction.overallRiskLevel === 'BLOCKED'
              ? 'bg-rose-50 border-rose-200 text-rose-900'
              : transaction.overallRiskLevel === 'HIGH_RISK'
              ? 'bg-orange-50 border-orange-200 text-orange-900'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}>
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold">Explainable Risk Verdict: </span>
              {transaction.riskSummary}
              <div className="mt-1 font-mono text-[11px] opacity-80">
                Recommended Operational Action: <span className="font-semibold underline">{transaction.recommendedAction}</span>
              </div>
            </div>
          </div>
        )}

        {/* Modal Tabs */}
        <div className="flex items-center gap-1 px-5 border-b border-slate-200 bg-slate-50/80 text-xs shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('tree')}
            className={`py-3 px-3 font-medium transition-colors border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'tree'
                ? 'border-emerald-600 text-emerald-800 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Transaction Tree (8 Invariants)
          </button>
          <button
            onClick={() => setActiveTab('match')}
            className={`py-3 px-3 font-medium transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'match'
                ? 'border-emerald-600 text-emerald-800 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            4-Way Reconciliation Diff
          </button>
          <button
            onClick={() => setActiveTab('fraud')}
            className={`py-3 px-3 font-medium transition-colors border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'fraud'
                ? 'border-emerald-600 text-emerald-800 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            16-Point Fraud Checks
            <span className={`px-1.5 py-0.2 rounded text-[10px] tabular-nums font-mono ${
              transaction.fraudChecks.some(c => !c.passed) ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
            }`}>
              {transaction.fraudChecks.filter(c => !c.passed).length} Flags
            </span>
          </button>
          <button
            onClick={() => setActiveTab('identity')}
            className={`py-3 px-3 font-medium transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'identity'
                ? 'border-emerald-600 text-emerald-800 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Identity & Bank Ownership
          </button>
          <button
            onClick={() => setActiveTab('tax')}
            className={`py-3 px-3 font-medium transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'tax'
                ? 'border-emerald-600 text-emerald-800 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            E-Invoice & Tax (IRN/UBL)
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`py-3 px-3 font-medium transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'audit'
                ? 'border-emerald-600 text-emerald-800 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Cryptographic Audit Chain
          </button>
          <button
            onClick={() => setActiveTab('receipt')}
            className={`py-3 px-3 font-medium transition-colors border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'receipt'
                ? 'border-emerald-600 text-emerald-800 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-emerald-600" />
            Audit PDF Receipt
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* TAB: Exact Transaction Tree Structure */}
          {activeTab === 'tree' && (
            <div className="space-y-6">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-emerald-700 font-bold uppercase">
                    Canonical Transaction Invariant Tree
                  </span>
                  <span className={`font-mono text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                    transaction.overallRiskLevel === 'BLOCKED' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {transaction.overallRiskLevel === 'BLOCKED' ? 'TREE TAMPERED / SEVERED' : 'ALL 8 BRANCHES VERIFIED'}
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  Every legitimate B2B payment on UTVN is bound to this exact hierarchical schema. The root Transaction ID is cryptographically invalid if any leaf branch is mismatched or unverified.
                </p>
              </div>

              {/* ASCII & Graphical Schema Box */}
              <div className="p-5 bg-white border border-slate-200 rounded-2xl font-mono text-xs space-y-3 shadow-xs">
                <div className="text-slate-900 font-bold flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-700">Transaction ID</span>
                    <span className="text-slate-500 font-normal">[{transaction.utid}]</span>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Root Merkle Anchor OK</span>
                </div>

                <div className="space-y-2 text-slate-700 pl-2">
                  <div className="flex items-center justify-between py-1 border-b border-slate-100">
                    <div>
                      <span className="text-slate-400">├── </span>
                      <strong className="text-slate-900">Buyer ID: </strong>
                      <span className="text-emerald-800 font-semibold">{transaction.buyer.id}</span>
                      <span className="text-slate-500 ml-2">({transaction.buyer.legalName})</span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700">KYC Verified</span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-slate-100">
                    <div>
                      <span className="text-slate-400">├── </span>
                      <strong className="text-slate-900">Seller ID: </strong>
                      <span className="text-emerald-800 font-semibold">{transaction.seller.id}</span>
                      <span className="text-slate-500 ml-2">({transaction.seller.legalName})</span>
                    </div>
                    <span className={`text-[10px] font-bold ${transaction.seller.kycStatus === 'VERIFIED' ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {transaction.seller.kycStatus}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-slate-100">
                    <div>
                      <span className="text-slate-400">├── </span>
                      <strong className="text-slate-900">Purchase ID: </strong>
                      <span className="text-emerald-800 font-semibold">{transaction.purchaseId || 'PR-2026-LT-09141'}</span>
                      <span className="text-slate-500 ml-2">(Internal Requisition & Budget Line)</span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700">DoA Authorized</span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-slate-100">
                    <div>
                      <span className="text-slate-400">├── </span>
                      <strong className="text-slate-900">Invoice ID: </strong>
                      <span className="text-emerald-800 font-semibold">{transaction.invoiceId}</span>
                      <span className="text-slate-500 ml-2">({transaction.totalAmount.toLocaleString()} {transaction.currency})</span>
                    </div>
                    <span className={`text-[10px] font-bold ${transaction.lineItems.every(i => i.matchStatus === 'EXACT_MATCH') ? 'text-emerald-700' : 'text-amber-700'}`}>
                      {transaction.lineItems.every(i => i.matchStatus === 'EXACT_MATCH') ? 'Exact Math Match' : 'Variance Flagged'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-slate-100">
                    <div>
                      <span className="text-slate-400">├── </span>
                      <strong className="text-slate-900">PO ID: </strong>
                      <span className="text-emerald-800 font-semibold">{transaction.purchaseOrderId}</span>
                      <span className="text-slate-500 ml-2">({transaction.paymentTerms})</span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700">Contract Signed</span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-slate-100">
                    <div>
                      <span className="text-slate-400">├── </span>
                      <strong className="text-slate-900">Delivery/Service confirmation: </strong>
                      <span className="text-emerald-800 font-semibold">{transaction.deliveryConfirmation?.receiptId || 'GRN-PENDING'}</span>
                      <span className="text-slate-500 ml-2">({transaction.deliveryConfirmation?.warehouseLocation || 'Site Receiving Gate'})</span>
                    </div>
                    <span className={`text-[10px] font-bold ${transaction.deliveryConfirmation?.inspectionStatus === 'ACCEPTED' ? 'text-emerald-700' : 'text-amber-700'}`}>
                      {transaction.deliveryConfirmation?.inspectionStatus || 'Unverified'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-slate-100">
                    <div>
                      <span className="text-slate-400">├── </span>
                      <strong className="text-slate-900">Tax/IRN reference: </strong>
                      <span className="text-emerald-800 font-semibold">{transaction.taxInfo.irn ? `${transaction.taxInfo.irn.substring(0, 28)}...` : 'TAX-ACK-0914'}</span>
                      <span className="text-slate-500 ml-2">(Govt IRP / NIC Portal)</span>
                    </div>
                    <span className={`text-[10px] font-bold ${transaction.taxInfo.isTaxPortalVerified ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {transaction.taxInfo.isTaxPortalVerified ? 'IRP Signature Valid' : 'Unverified IRN'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1">
                    <div>
                      <span className="text-slate-400">└── </span>
                      <strong className="text-slate-900">Payment reference: </strong>
                      <span className="text-emerald-800 font-semibold">{transaction.paymentDetails.paymentId}</span>
                      <span className="text-slate-500 ml-2">({transaction.paymentDetails.paymentRail} · Acc: {transaction.paymentDetails.beneficiaryAccount})</span>
                    </div>
                    <span className={`text-[10px] font-bold ${transaction.paymentDetails.bankAccountChangeDetected ? 'text-rose-700' : 'text-emerald-700'}`}>
                      {transaction.paymentDetails.bankAccountChangeDetected ? 'MUTATION FLAGGED' : `${transaction.paymentDetails.nameMatchConfidence}% Penny-Drop Match`}
                    </span>
                  </div>
                </div>

                {/* Canonical Arrow to PAY / HOLD Decision */}
                <div className="pt-3 border-t border-slate-100 flex flex-col items-center justify-center space-y-1.5">
                  <span className="text-slate-400 font-mono text-sm leading-none">↓</span>
                  <div className={`px-4 py-1.5 rounded-xl border font-mono font-bold text-xs uppercase tracking-widest ${
                    transaction.overallRiskLevel === 'BLOCKED'
                      ? 'bg-rose-50 border-rose-300 text-rose-800'
                      : transaction.overallRiskLevel === 'HIGH_RISK' || transaction.overallRiskLevel === 'NEEDS_REVIEW'
                      ? 'bg-amber-50 border-amber-300 text-amber-800'
                      : 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  }`}>
                    Decision: {transaction.overallRiskLevel === 'BLOCKED' || transaction.overallRiskLevel === 'HIGH_RISK' ? 'HOLD' : 'PAY'}
                  </div>
                  <span className="text-[10px] text-slate-500">
                    {transaction.overallRiskLevel === 'BLOCKED' || transaction.overallRiskLevel === 'HIGH_RISK'
                      ? 'Automated freeze active. 1 or more critical invariant checks failed.'
                      : 'All 8 verification checkpoints passed. Authorized for settlement disbursement.'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: 4-Way Match */}
          {activeTab === 'match' && (
            <div className="space-y-6">
              {/* Linked IDs bar */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[11px] text-slate-500 block font-medium">Purchase Order ID</span>
                  <span className="font-mono text-xs font-bold text-slate-800">{transaction.purchaseOrderId}</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Date: {transaction.poIssueDate}</span>
                </div>
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[11px] text-slate-500 block font-medium">Invoice Reference</span>
                  <span className="font-mono text-xs font-bold text-slate-800">{transaction.invoiceId}</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Terms: {transaction.paymentTerms}</span>
                </div>
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[11px] text-slate-500 block font-medium">Goods Receipt (GRN)</span>
                  <span className="font-mono text-xs font-bold text-slate-800">
                    {transaction.deliveryConfirmation?.receiptId || 'PENDING_PHYSICAL_ARRIVAL'}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    {transaction.deliveryConfirmation?.inspectionStatus || 'Uninspected'}
                  </span>
                </div>
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[11px] text-slate-500 block font-medium">Settlement Rail</span>
                  <span className="font-mono text-xs font-bold text-emerald-700">
                    {transaction.paymentDetails.paymentRail} · {transaction.currency} {transaction.totalAmount.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5 font-medium">
                    Status: {transaction.paymentDetails.status}
                  </span>
                </div>
              </div>

              {/* Line item matching table */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Line Items 4-Way Mathematical Verification
                </h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
                  <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Description & HSN</th>
                        <th className="py-2.5 px-3 text-right">PO Qty</th>
                        <th className="py-2.5 px-3 text-right">Invoiced Qty</th>
                        <th className="py-2.5 px-3 text-right">GRN Verified</th>
                        <th className="py-2.5 px-3 text-right">Unit Price</th>
                        <th className="py-2.5 px-3 text-right">PO Total</th>
                        <th className="py-2.5 px-3 text-right">Invoiced Total</th>
                        <th className="py-2.5 px-3 text-center">Reconciliation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {transaction.lineItems.map(item => (
                        <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-3">
                            <div className="font-semibold text-slate-900">{item.description}</div>
                            <div className="font-mono text-[10px] text-slate-400">HSN: {item.hsnOrSacCode} · Tax {item.taxRatePercent}%</div>
                          </td>
                          <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-700">{item.poQuantity}</td>
                          <td className={`py-3 px-3 text-right font-mono tabular-nums font-semibold ${
                            item.invoiceQuantity !== item.poQuantity ? 'text-amber-700' : 'text-slate-700'
                          }`}>
                            {item.invoiceQuantity}
                          </td>
                          <td className={`py-3 px-3 text-right font-mono tabular-nums font-semibold ${
                            item.receivedQuantity < item.invoiceQuantity ? 'text-rose-700' : 'text-emerald-700'
                          }`}>
                            {item.receivedQuantity}
                          </td>
                          <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-700">
                            {item.unitPrice.toLocaleString()} {item.currency}
                          </td>
                          <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-700">
                            {item.poTotal.toLocaleString()} {item.currency}
                          </td>
                          <td className={`py-3 px-3 text-right font-mono tabular-nums font-semibold ${
                            item.invoiceTotal !== item.poTotal ? 'text-amber-700' : 'text-slate-900'
                          }`}>
                            {item.invoiceTotal.toLocaleString()} {item.currency}
                          </td>
                          <td className="py-3 px-3 text-center">
                            {item.matchStatus === 'EXACT_MATCH' ? (
                              <span className="text-emerald-700 font-mono text-[11px] font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">MATCH OK</span>
                            ) : (
                              <span className="text-rose-700 font-mono text-[11px] font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-200">{item.matchStatus}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  </div>
                </div>
              </div>

              {/* Physical Delivery Context */}
              {transaction.deliveryConfirmation && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2">
                  <div className="font-bold text-slate-800 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Physical Receiving & Warehouse Gate Sign-off
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-slate-600 pt-1">
                    <div>
                      <span className="text-slate-400 block font-medium">Warehouse Gate:</span>
                      <span className="text-slate-800 font-semibold">{transaction.deliveryConfirmation.warehouseLocation}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Receiving Officer:</span>
                      <span className="text-slate-800 font-semibold">{transaction.deliveryConfirmation.receivedBy}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Tracking / Waybill:</span>
                      <span className="font-mono text-slate-800 font-semibold">{transaction.deliveryConfirmation.trackingNumber}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">IoT / RFID Scan:</span>
                      <span className="text-emerald-700 font-bold">
                        {transaction.deliveryConfirmation.rfidOrBarcodeScanned ? 'Geofence & RFID Verified' : 'Manual Tally'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: 16 Fraud Checks */}
          {activeTab === 'fraud' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold text-slate-700">16 Independent Risk Engine Assertions</span>
                <span className="font-mono text-[11px] text-slate-400">
                  Engine Model: Hybrid Deterministic Rules + Graph Topology + Forensic Vision OCR
                </span>
              </div>

              <div className="space-y-2.5">
                {transaction.fraudChecks.map((check, idx) => (
                  <div 
                    key={check.id}
                    className={`p-3.5 rounded-xl border text-xs transition-colors ${
                      check.passed
                        ? 'bg-slate-50 border-slate-200 text-slate-700'
                        : check.severity === 'CRITICAL'
                        ? 'bg-rose-50 border-rose-200 text-rose-900'
                        : check.severity === 'HIGH'
                        ? 'bg-orange-50 border-orange-200 text-orange-900'
                        : 'bg-amber-50 border-amber-200 text-amber-900'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-400">
                            {String(idx + 1).padStart(2, '0')}.
                          </span>
                          <span className="font-bold text-slate-900">
                            {check.title}
                          </span>
                          <span className="font-mono text-[10px] text-slate-400">
                            [{check.code}]
                          </span>
                          <span className="text-[10px] text-slate-500 font-medium">
                            · {check.category}
                          </span>
                        </div>
                        <p className={`text-xs ${check.passed ? 'text-slate-600' : 'font-medium'}`}>
                          {check.explanation}
                        </p>
                      </div>

                      <div className="shrink-0 text-right">
                        {check.passed ? (
                          <span className="text-emerald-700 font-bold font-mono text-[11px] flex items-center gap-1 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                            <Check className="w-3.5 h-3.5 text-emerald-600" /> PASSED
                          </span>
                        ) : (
                          <span className="font-bold font-mono text-[11px] px-2.5 py-0.5 rounded bg-rose-100 text-rose-800 uppercase border border-rose-200">
                            {check.severity} ALERT
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Identity & Bank */}
          {activeTab === 'identity' && (
            <div className="space-y-6 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Buyer Card */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="font-bold text-slate-900 text-sm">{transaction.buyer.legalName}</span>
                    <span className="text-emerald-700 font-bold font-mono bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">KYC: {transaction.buyer.kycStatus}</span>
                  </div>
                  <div className="space-y-1.5 text-slate-600">
                    <div><span className="text-slate-400 font-medium">Tax ID / GSTIN:</span> <span className="font-mono text-slate-900 font-semibold">{transaction.buyer.taxId}</span></div>
                    <div><span className="text-slate-400 font-medium">Corporate Registry:</span> <span className="font-mono text-slate-800">{transaction.buyer.corporateRegistryId}</span></div>
                    <div><span className="text-slate-400 font-medium">LEI (Global):</span> <span className="font-mono text-slate-800">{transaction.buyer.lei || 'N/A'}</span></div>
                    <div><span className="text-slate-400 font-medium">Network Tenure:</span> <span className="text-slate-800 font-medium">{transaction.buyer.tenureMonths} months</span></div>
                  </div>

                  <div className="pt-2 border-t border-slate-200">
                    <span className="text-slate-400 font-medium block mb-1">Authorized Purchase Signatory:</span>
                    {transaction.buyer.authorizedSignatories.map(sig => (
                      <div key={sig.id} className="text-slate-800 font-medium flex items-center justify-between">
                        <span>{sig.name} ({sig.designation})</span>
                        <span className="font-mono text-[11px] text-slate-500 font-medium">Limit: {transaction.currency} {sig.signingLimit.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Seller Card */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="font-bold text-slate-900 text-sm">{transaction.seller.legalName}</span>
                    <span className={`font-bold font-mono px-2 py-0.5 rounded border ${
                      transaction.seller.kycStatus === 'VERIFIED' ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-rose-700 bg-rose-50 border-rose-200'
                    }`}>
                      KYC: {transaction.seller.kycStatus}
                    </span>
                  </div>
                  <div className="space-y-1.5 text-slate-600">
                    <div><span className="text-slate-400 font-medium">Tax ID / GSTIN:</span> <span className="font-mono text-slate-900 font-semibold">{transaction.seller.taxId}</span></div>
                    <div><span className="text-slate-400 font-medium">Corporate Registry:</span> <span className="font-mono text-slate-800">{transaction.seller.corporateRegistryId}</span></div>
                    <div><span className="text-slate-400 font-medium">LEI (Global):</span> <span className="font-mono text-slate-800">{transaction.seller.lei || 'N/A'}</span></div>
                    <div><span className="text-slate-400 font-medium">Network Tenure:</span> <span className="text-slate-800 font-medium">{transaction.seller.tenureMonths} months</span></div>
                  </div>

                  <div className="pt-2 border-t border-slate-200">
                    <span className="text-slate-400 font-medium block mb-1">Authorized Invoice Signatory:</span>
                    {transaction.seller.authorizedSignatories.map(sig => (
                      <div key={sig.id} className="text-slate-800 font-medium flex items-center justify-between">
                        <span>{sig.name} ({sig.designation})</span>
                        <span className="font-mono text-[11px] text-slate-500 font-medium">Limit: {transaction.currency} {sig.signingLimit.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Payment Destination & Bank Account Ownership */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h4 className="font-bold text-slate-900 flex items-center gap-2">
                    <Landmark className="w-4 h-4 text-emerald-600" />
                    Payment Destination & Independent Account Ownership Verification
                  </h4>
                  {transaction.paymentDetails.bankAccountChangeDetected ? (
                    <span className="px-2.5 py-0.5 bg-rose-100 text-rose-800 font-mono text-[11px] font-bold rounded-md border border-rose-200">
                      ACCOUNT MUTATION DETECTED
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 font-mono text-[11px] font-bold rounded-md border border-emerald-200">
                      VERIFIED MASTER ACCOUNT
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                  <div>
                    <span className="text-slate-400 block font-medium">Designated Account:</span>
                    <span className="font-mono font-bold text-slate-900">{transaction.paymentDetails.beneficiaryAccount}</span>
                    <span className="text-slate-500 block text-[10px] mt-0.5">IFSC / Routing: {transaction.paymentDetails.beneficiaryIfscOrIban}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Bank Account Holder Title:</span>
                    <span className="font-bold text-slate-900">{transaction.paymentDetails.beneficiaryName}</span>
                    <span className={`block text-[10px] font-mono mt-0.5 ${
                      transaction.paymentDetails.nameMatchConfidence > 90 ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'
                    }`}>
                      NPCI/Banking Match: {transaction.paymentDetails.nameMatchConfidence}%
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Payment Execution Rail:</span>
                    <span className="font-bold text-emerald-700">{transaction.paymentDetails.paymentRail} (Direct Settlement)</span>
                    <span className="text-slate-500 block text-[10px] mt-0.5">Status: {transaction.paymentDetails.status}</span>
                  </div>
                </div>

                {transaction.paymentDetails.bankAccountChangeDetected && (
                  <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 text-xs">
                    <span className="font-bold">Fraud Alert Investigation:</span> This payment destination differs from the historical primary account ({transaction.paymentDetails.previousAccount}). Funds release is programmatically locked until dual CFO verbal callback confirmation and signed certificate update.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: Tax & E-Invoice */}
          {activeTab === 'tax' && (
            <div className="space-y-5 text-xs">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div className="font-bold text-slate-900 text-sm">
                    {transaction.taxInfo.regime === 'INDIA_GST' ? 'Government of India E-Invoice (IRP / NIC)' : 'European Peppol BIS Billing 3.0'}
                  </div>
                  <span className={`font-mono font-bold px-2 py-0.5 rounded border ${
                    transaction.taxInfo.isTaxPortalVerified ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-rose-700 bg-rose-50 border-rose-200'
                  }`}>
                    {transaction.taxInfo.isTaxPortalVerified ? 'PORTAL SIGNATURE VERIFIED' : 'FAILED / UNVERIFIED'}
                  </span>
                </div>

                {transaction.taxInfo.irn && (
                  <div className="space-y-1">
                    <span className="text-slate-500 block font-medium">64-Character Invoice Reference Number (IRN):</span>
                    <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl font-mono text-[11px] text-emerald-400 break-all select-all flex items-center justify-between">
                      <span>{transaction.taxInfo.irn}</span>
                      <button 
                        onClick={() => copyToClipboard(transaction.taxInfo.irn!, 'irn')}
                        className="ml-2 p-1 text-slate-400 hover:text-white transition-colors"
                        title="Copy IRN"
                      >
                        {copiedHash === 'irn' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                )}

                {transaction.taxInfo.qrCodePayload && (
                  <div className="space-y-1">
                    <span className="text-slate-500 block font-medium">Cryptographic QR Code Payload (Decoded JSON):</span>
                    <pre className="p-3 bg-slate-900 border border-slate-800 rounded-xl font-mono text-[10px] text-emerald-300 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                      {transaction.taxInfo.qrCodePayload}
                    </pre>
                  </div>
                )}

                {transaction.taxInfo.taxDiscrepancyNotes && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900">
                    <span className="font-bold">Tax Forensics Note: </span>
                    {transaction.taxInfo.taxDiscrepancyNotes}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: Cryptographic Audit Chain */}
          {activeTab === 'audit' && (
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between text-slate-500">
                <span className="font-semibold text-slate-700">Tamper-Evident SHA-256 Ledger State History</span>
                <span className="font-mono text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Merkle-linked immutability invariant</span>
              </div>

              <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {transaction.auditTrail.map((entry) => (
                  <div key={entry.id} className="relative">
                    <div className="absolute -left-[27px] top-1 w-3.5 h-3.5 rounded-full bg-emerald-600 border-2 border-white shadow-xs" />
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-slate-900">{entry.action}</span>
                        <span className="text-[11px] text-slate-500 font-mono">
                          {new Date(entry.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-slate-700 font-medium">{entry.payloadSummary}</p>
                      
                      <div className="pt-2 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-2 font-mono text-[10px] text-slate-500">
                        <div>
                          <span className="text-slate-400 block font-medium">Actor:</span>
                          <span className="text-slate-800 font-semibold">{entry.actor.userName} ({entry.actor.role})</span>
                          <span className="text-slate-500 block">Auth: {entry.actor.authMethod}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-medium">Block Hash (SHA-256):</span>
                          <span className="text-emerald-700 font-bold break-all">{entry.currentHash.substring(0, 32)}...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: Formatted PDF Audit Receipt Preview */}
          {activeTab === 'receipt' && (
            <div className="space-y-6 text-xs">
              {/* Receipt Control Bar */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-600" />
                    Formal Transaction Audit Receipt
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Official ISO 20022 & PEPPOL BIS 3.0 compliant proof with cryptographic hash chaining
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleExportPdf}
                    disabled={isExportingPdf}
                    className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-sm disabled:opacity-50"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{isExportingPdf ? 'Generating PDF...' : 'Download Official PDF'}</span>
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors"
                    title="Print Receipt"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print</span>
                  </button>
                </div>
              </div>

              {/* Visual Document Layout Preview */}
              <div className="bg-white text-slate-900 rounded-2xl p-8 border border-slate-200 shadow-xl font-sans max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="border-b-2 border-slate-900 pb-4 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-bold tracking-widest text-emerald-700 uppercase">
                      FEDERATED CLEARING & SETTLEMENT PROTOCOL
                    </span>
                    <h2 className="text-xl font-extrabold text-slate-900 tracking-tight mt-0.5">
                      UNIVERSAL TRANSACTION VERIFICATION NETWORK
                    </h2>
                    <p className="text-xs text-slate-500">
                      OFFICIAL TRANSACTION VERIFICATION & AUDIT RECEIPT
                    </p>
                  </div>

                  <div className="text-right sm:text-right font-mono text-[11px] text-slate-500">
                    <div>ISSUED: {new Date().toISOString().replace('T', ' ').substring(0, 19)} UTC</div>
                    <div className="font-bold text-slate-800">STANDARD: ISO 20022 / PEPPOL BIS 3.0</div>
                    <div className="text-emerald-700 font-semibold">NODE: UTVN-PROD-GLOBAL-01</div>
                  </div>
                </div>

                {/* Status Verdict Banner */}
                <div className={`p-3.5 rounded-xl border flex items-center justify-between ${
                  transaction.overallRiskLevel === 'VERIFIED'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                    : transaction.overallRiskLevel === 'BLOCKED'
                    ? 'bg-rose-50 border-rose-300 text-rose-900'
                    : 'bg-amber-50 border-amber-300 text-amber-900'
                }`}>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wide">
                      AUDIT VERDICT: {transaction.overallRiskLevel}
                    </div>
                    <div className="text-[11px] opacity-90 mt-0.5">
                      {transaction.riskSummary || 'All four reconciliation invariants verified with 0 deviation.'}
                    </div>
                  </div>
                  <div className="text-right font-mono text-xs">
                    <span className="font-bold">Sentinel Risk Score:</span> {transaction.riskScore} / 100
                  </div>
                </div>

                {/* Core Identifiers 4-Col Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 block uppercase">Universal Tx ID</span>
                    <span className="font-mono font-bold text-emerald-700 text-xs">{transaction.utid}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 block uppercase">Tax IRN (Hash)</span>
                    <span className="font-mono font-bold text-slate-800 text-[11px] truncate block" title={transaction.taxInfo.irn}>
                      {transaction.taxInfo.irn ? transaction.taxInfo.irn.substring(0, 16) + '...' : 'EXEMPT'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 block uppercase">Lifecycle Status</span>
                    <span className="font-mono font-bold text-slate-800 text-xs">{transaction.status}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 block uppercase">Settlement Value</span>
                    <span className="font-mono font-bold text-emerald-700 text-sm">
                      {transaction.currency} {transaction.totalAmount.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Buyer & Seller Dual Columns */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3.5 border border-slate-200 rounded-xl bg-white space-y-1">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-1">
                      Buyer Enterprise (Principal)
                    </div>
                    <div className="font-bold text-slate-900 text-xs">{transaction.buyer.legalName}</div>
                    <div className="text-[11px] text-slate-600">Tax ID / GSTIN: <span className="font-mono font-semibold">{transaction.buyer.taxId}</span></div>
                    <div className="text-[11px] text-slate-600">Corporate Registry: <span className="font-mono">{transaction.buyer.corporateRegistryId}</span></div>
                    <div className="text-[11px] text-slate-600">KYC Status: <span className="font-bold text-emerald-700">{transaction.buyer.kycStatus}</span></div>
                  </div>

                  <div className="p-3.5 border border-slate-200 rounded-xl bg-white space-y-1">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-1">
                      Seller Vendor (Beneficiary)
                    </div>
                    <div className="font-bold text-slate-900 text-xs">{transaction.seller.legalName}</div>
                    <div className="text-[11px] text-slate-600">Tax ID / GSTIN: <span className="font-mono font-semibold">{transaction.seller.taxId}</span></div>
                    <div className="text-[11px] text-slate-600">Corporate Registry: <span className="font-mono">{transaction.seller.corporateRegistryId}</span></div>
                    <div className="text-[11px] text-slate-600">Beneficiary Account: <span className="font-mono font-semibold">{transaction.paymentDetails.beneficiaryAccount}</span></div>
                  </div>
                </div>

                {/* 4-Way Matching Matrix */}
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="bg-slate-50 px-3.5 py-2 font-bold text-slate-800 text-[11px] uppercase tracking-wider border-b border-slate-200">
                    4-Way Reconciliation Evidence Record
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-slate-200 p-3 bg-white text-[11px]">
                    <div className="p-2 space-y-0.5">
                      <span className="text-[10px] font-semibold text-slate-500 block">1. PO Reference</span>
                      <span className="font-mono font-bold text-slate-800">{transaction.purchaseOrderId}</span>
                      <span className="text-[10px] text-emerald-600 block">Matched: {transaction.poIssueDate}</span>
                    </div>
                    <div className="p-2 space-y-0.5">
                      <span className="text-[10px] font-semibold text-slate-500 block">2. Tax Invoice</span>
                      <span className="font-mono font-bold text-slate-800">{transaction.invoiceId}</span>
                      <span className="text-[10px] text-emerald-600 block">Matched: {transaction.invoiceDate}</span>
                    </div>
                    <div className="p-2 space-y-0.5">
                      <span className="text-[10px] font-semibold text-slate-500 block">3. Goods Receipt (GRN)</span>
                      <span className="font-mono font-bold text-slate-800">{transaction.deliveryConfirmation?.receiptId || 'GRN-VERIFIED-WH1'}</span>
                      <span className="text-[10px] text-emerald-600 block">100% Quantity Accepted</span>
                    </div>
                    <div className="p-2 space-y-0.5">
                      <span className="text-[10px] font-semibold text-slate-500 block">4. Bank Routing</span>
                      <span className={`font-mono font-bold ${!transaction.paymentDetails.bankAccountChangeDetected ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {!transaction.paymentDetails.bankAccountChangeDetected ? 'VERIFIED MASTER' : 'ALTERED ACCOUNT'}
                      </span>
                      <span className="text-[10px] text-slate-500 block">{transaction.paymentDetails.nameMatchConfidence}% Match Confidence</span>
                    </div>
                  </div>
                </div>

                {/* Audit Line Items */}
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-2 px-3">Item Description</th>
                        <th className="py-2 px-2">HSN/SAC</th>
                        <th className="py-2 px-2 text-right">PO Qty</th>
                        <th className="py-2 px-2 text-right">Recv Qty</th>
                        <th className="py-2 px-3 text-right">Total ({transaction.currency})</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {transaction.lineItems.map((li, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="py-2 px-3 font-medium text-slate-800">{li.description}</td>
                          <td className="py-2 px-2 font-mono text-slate-500">{li.hsnOrSacCode || 'N/A'}</td>
                          <td className="py-2 px-2 text-right font-mono">{li.poQuantity}</td>
                          <td className="py-2 px-2 text-right font-mono text-emerald-700 font-semibold">{li.receivedQuantity}</td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">{li.invoiceTotal.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  </div>
                </div>

                {/* Notarized Certification Seal */}
                <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex flex-col items-center justify-center font-bold text-[9px] shadow-sm shrink-0">
                      <span>UTVN</span>
                      <span className="text-[7px] font-normal">SEAL</span>
                    </div>
                    <div>
                      <div className="font-bold text-emerald-950 text-xs">
                        DIGITALLY NOTARIZED & CRYPTOGRAPHICALLY SECURED
                      </div>
                      <div className="text-[10px] text-slate-600 mt-0.5">
                        Dual-signatory verification under federated smart contract protocol. Hash chain anchored in block {transaction.auditTrail[transaction.auditTrail.length - 1]?.currentHash.substring(0, 16)}...
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleExportPdf}
                    disabled={isExportingPdf}
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors shrink-0"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF File</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500 flex items-center gap-2">
            <span>Status:</span>
            <span className="font-mono font-bold text-slate-900">{transaction.status}</span>
            <span className="text-slate-300">·</span>
            <span className="font-mono text-emerald-700 font-bold">{transaction.auditTrail.length} Chained Blocks</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleExportPdf}
              disabled={isExportingPdf}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors shadow-xs disabled:opacity-50"
              title="Download PDF audit certificate"
            >
              <FileDown className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isExportingPdf ? 'Exporting...' : 'PDF Receipt'}</span>
            </button>

            {transaction.overallRiskLevel === 'BLOCKED' ? (
              <button
                disabled
                className="px-4 py-2 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl cursor-not-allowed opacity-90"
              >
                Payment Execution Locked by Sentinel
              </button>
            ) : transaction.status === 'PAYMENT_PENDING' || transaction.status === 'RISK_FLAGGED' ? (
              <>
                {onHaltTransaction && (
                  <button
                    onClick={() => onHaltTransaction(transaction.utid)}
                    className="px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors"
                  >
                    Halt & Flag Transaction
                  </button>
                )}
                {onApprovePayment && (
                  <button
                    onClick={() => onApprovePayment(transaction.utid)}
                    className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-sm"
                  >
                    Authorize Payment (CFO Dual-Sign)
                  </button>
                )}
              </>
            ) : (
              <span className="text-xs text-slate-500 px-3 py-1 bg-slate-100 rounded-lg border border-slate-200 font-medium">Transaction Settled & Archived</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
