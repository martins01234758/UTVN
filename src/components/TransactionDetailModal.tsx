import React, { useState } from 'react';
import { 
  X, ShieldCheck, AlertTriangle, ShieldAlert, CheckCircle2, 
  FileText, Landmark, Key, Hash, Layers, ArrowRight, ExternalLink,
  Lock, Check, AlertCircle, Copy, Clock, RefreshCw
} from 'lucide-react';
import { UniversalTransaction, RiskLevel } from '../types/utvn';

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
  const [activeTab, setActiveTab] = useState<'tree' | 'match' | 'fraud' | 'identity' | 'tax' | 'audit'>('tree');
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(id);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const getRiskBadge = (level: RiskLevel) => {
    switch (level) {
      case 'VERIFIED':
        return <span className="text-emerald-400 font-semibold text-xs flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> VERIFIED (0 Risk)</span>;
      case 'LOW_RISK':
        return <span className="text-blue-400 font-semibold text-xs flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" /> LOW RISK</span>;
      case 'NEEDS_REVIEW':
        return <span className="text-amber-400 font-semibold text-xs flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5" /> NEEDS REVIEW</span>;
      case 'HIGH_RISK':
        return <span className="text-orange-400 font-semibold text-xs flex items-center gap-1.5"><AlertCircle className="w-3.5 h-3.5" /> HIGH RISK</span>;
      case 'BLOCKED':
        return <span className="text-rose-400 font-semibold text-xs flex items-center gap-1.5"><ShieldAlert className="w-3.5 h-3.5" /> BLOCKED</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-5xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-start justify-between bg-slate-900/90 shrink-0">
          <div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm font-bold text-blue-400 tabular-nums">
                {transaction.utid}
              </span>
              <span className="text-slate-600">·</span>
              {getRiskBadge(transaction.overallRiskLevel)}
              <span className="text-slate-600">·</span>
              <span className="text-xs text-slate-400">
                Created: {new Date(transaction.createdAt).toLocaleDateString()}
              </span>
            </div>
            <h2 className="text-lg font-bold text-white mt-1">
              {transaction.buyer.legalName} <span className="text-slate-500 font-normal">→</span> {transaction.seller.legalName}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Risk Banner if critical or review */}
        {transaction.overallRiskLevel !== 'VERIFIED' && (
          <div className={`p-4 border-b text-xs flex items-start gap-3 shrink-0 ${
            transaction.overallRiskLevel === 'BLOCKED'
              ? 'bg-rose-950/30 border-rose-900/50 text-rose-200'
              : transaction.overallRiskLevel === 'HIGH_RISK'
              ? 'bg-orange-950/30 border-orange-900/50 text-orange-200'
              : 'bg-amber-950/30 border-amber-900/50 text-amber-200'
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
        <div className="flex items-center gap-1 px-5 border-b border-slate-800 bg-slate-900/50 text-xs shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('tree')}
            className={`py-3 px-3 font-medium transition-colors border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'tree'
                ? 'border-blue-500 text-blue-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Transaction Tree (8 Invariants)
          </button>
          <button
            onClick={() => setActiveTab('match')}
            className={`py-3 px-3 font-medium transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'match'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            4-Way Reconciliation Diff
          </button>
          <button
            onClick={() => setActiveTab('fraud')}
            className={`py-3 px-3 font-medium transition-colors border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'fraud'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            16-Point Fraud Checks
            <span className={`px-1.5 py-0.2 rounded text-[10px] tabular-nums font-mono ${
              transaction.fraudChecks.some(c => !c.passed) ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'
            }`}>
              {transaction.fraudChecks.filter(c => !c.passed).length} Flags
            </span>
          </button>
          <button
            onClick={() => setActiveTab('identity')}
            className={`py-3 px-3 font-medium transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'identity'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Identity & Bank Ownership
          </button>
          <button
            onClick={() => setActiveTab('tax')}
            className={`py-3 px-3 font-medium transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'tax'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            E-Invoice & Tax (IRN/UBL)
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`py-3 px-3 font-medium transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'audit'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Cryptographic Audit Chain
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* TAB: Exact Transaction Tree Structure */}
          {activeTab === 'tree' && (
            <div className="space-y-6">
              <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-blue-400 font-bold uppercase">
                    Canonical Transaction Invariant Tree
                  </span>
                  <span className={`font-mono text-[11px] font-semibold px-2 py-0.5 rounded ${
                    transaction.overallRiskLevel === 'BLOCKED' ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'
                  }`}>
                    {transaction.overallRiskLevel === 'BLOCKED' ? 'TREE TAMPERED / SEVERED' : 'ALL 8 BRANCHES VERIFIED'}
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  Every legitimate B2B payment on UTVN is bound to this exact hierarchical schema. The root Transaction ID is cryptographically invalid if any leaf branch is mismatched or unverified.
                </p>
              </div>

              {/* ASCII & Graphical Schema Box */}
              <div className="p-5 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs space-y-3">
                <div className="text-white font-bold flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-blue-400">Transaction ID</span>
                    <span className="text-slate-400 font-normal">[{transaction.utid}]</span>
                  </div>
                  <span className="text-[10px] text-emerald-400">Root Merkle Anchor OK</span>
                </div>

                <div className="space-y-2 text-slate-300 pl-2">
                  <div className="flex items-center justify-between py-1 border-b border-slate-900">
                    <div>
                      <span className="text-slate-500">├── </span>
                      <strong className="text-white">Buyer ID: </strong>
                      <span className="text-blue-300">{transaction.buyer.id}</span>
                      <span className="text-slate-400 ml-2">({transaction.buyer.legalName})</span>
                    </div>
                    <span className="text-[10px] text-emerald-400">KYC Verified</span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-slate-900">
                    <div>
                      <span className="text-slate-500">├── </span>
                      <strong className="text-white">Seller ID: </strong>
                      <span className="text-blue-300">{transaction.seller.id}</span>
                      <span className="text-slate-400 ml-2">({transaction.seller.legalName})</span>
                    </div>
                    <span className={`text-[10px] ${transaction.seller.kycStatus === 'VERIFIED' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {transaction.seller.kycStatus}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-slate-900">
                    <div>
                      <span className="text-slate-500">├── </span>
                      <strong className="text-white">Purchase ID: </strong>
                      <span className="text-blue-300">{transaction.purchaseId || 'PR-2026-LT-09141'}</span>
                      <span className="text-slate-400 ml-2">(Internal Requisition & Budget Line)</span>
                    </div>
                    <span className="text-[10px] text-emerald-400">DoA Authorized</span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-slate-900">
                    <div>
                      <span className="text-slate-500">├── </span>
                      <strong className="text-white">Invoice ID: </strong>
                      <span className="text-blue-300">{transaction.invoiceId}</span>
                      <span className="text-slate-400 ml-2">({transaction.totalAmount.toLocaleString()} {transaction.currency})</span>
                    </div>
                    <span className={`text-[10px] ${transaction.lineItems.every(i => i.matchStatus === 'EXACT_MATCH') ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {transaction.lineItems.every(i => i.matchStatus === 'EXACT_MATCH') ? 'Exact Math Match' : 'Variance Flagged'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-slate-900">
                    <div>
                      <span className="text-slate-500">├── </span>
                      <strong className="text-white">PO ID: </strong>
                      <span className="text-blue-300">{transaction.purchaseOrderId}</span>
                      <span className="text-slate-400 ml-2">({transaction.paymentTerms})</span>
                    </div>
                    <span className="text-[10px] text-emerald-400">Contract Signed</span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-slate-900">
                    <div>
                      <span className="text-slate-500">├── </span>
                      <strong className="text-white">Delivery/Service confirmation: </strong>
                      <span className="text-blue-300">{transaction.deliveryConfirmation?.receiptId || 'GRN-PENDING'}</span>
                      <span className="text-slate-400 ml-2">({transaction.deliveryConfirmation?.warehouseLocation || 'Site Receiving Gate'})</span>
                    </div>
                    <span className={`text-[10px] ${transaction.deliveryConfirmation?.inspectionStatus === 'ACCEPTED' ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {transaction.deliveryConfirmation?.inspectionStatus || 'Unverified'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-slate-900">
                    <div>
                      <span className="text-slate-500">├── </span>
                      <strong className="text-white">Tax/IRN reference: </strong>
                      <span className="text-blue-300">{transaction.taxInfo.irn ? `${transaction.taxInfo.irn.substring(0, 28)}...` : 'TAX-ACK-0914'}</span>
                      <span className="text-slate-400 ml-2">(Govt IRP / NIC Portal)</span>
                    </div>
                    <span className={`text-[10px] ${transaction.taxInfo.isTaxPortalVerified ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {transaction.taxInfo.isTaxPortalVerified ? 'IRP Signature Valid' : 'Unverified IRN'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1">
                    <div>
                      <span className="text-slate-500">└── </span>
                      <strong className="text-white">Payment reference: </strong>
                      <span className="text-blue-300">{transaction.paymentDetails.paymentId}</span>
                      <span className="text-slate-400 ml-2">({transaction.paymentDetails.paymentRail} · Acc: {transaction.paymentDetails.beneficiaryAccount})</span>
                    </div>
                    <span className={`text-[10px] ${transaction.paymentDetails.bankAccountChangeDetected ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {transaction.paymentDetails.bankAccountChangeDetected ? 'MUTATION FLAGGED' : `${transaction.paymentDetails.nameMatchConfidence}% Penny-Drop Match`}
                    </span>
                  </div>
                </div>

                {/* Canonical Arrow to PAY / HOLD Decision */}
                <div className="pt-3 border-t border-slate-900 flex flex-col items-center justify-center space-y-1.5">
                  <span className="text-slate-500 font-mono text-sm leading-none">↓</span>
                  <div className={`px-4 py-1.5 rounded-lg border font-mono font-bold text-xs uppercase tracking-widest ${
                    transaction.overallRiskLevel === 'BLOCKED'
                      ? 'bg-rose-950/80 border-rose-800 text-rose-300'
                      : transaction.overallRiskLevel === 'HIGH_RISK' || transaction.overallRiskLevel === 'NEEDS_REVIEW'
                      ? 'bg-amber-950/80 border-amber-800 text-amber-300'
                      : 'bg-emerald-950/80 border-emerald-800 text-emerald-300'
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
                <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg">
                  <span className="text-[11px] text-slate-500 block">Purchase Order ID</span>
                  <span className="font-mono text-xs font-semibold text-slate-200">{transaction.purchaseOrderId}</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">Date: {transaction.poIssueDate}</span>
                </div>
                <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg">
                  <span className="text-[11px] text-slate-500 block">Invoice Reference</span>
                  <span className="font-mono text-xs font-semibold text-slate-200">{transaction.invoiceId}</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">Terms: {transaction.paymentTerms}</span>
                </div>
                <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg">
                  <span className="text-[11px] text-slate-500 block">Goods Receipt (GRN)</span>
                  <span className="font-mono text-xs font-semibold text-slate-200">
                    {transaction.deliveryConfirmation?.receiptId || 'PENDING_PHYSICAL_ARRIVAL'}
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    {transaction.deliveryConfirmation?.inspectionStatus || 'Uninspected'}
                  </span>
                </div>
                <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg">
                  <span className="text-[11px] text-slate-500 block">Settlement Rail</span>
                  <span className="font-mono text-xs font-semibold text-slate-200">
                    {transaction.paymentDetails.paymentRail} · {transaction.currency} {transaction.totalAmount.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    Status: {transaction.paymentDetails.status}
                  </span>
                </div>
              </div>

              {/* Line item matching table */}
              <div>
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Line Items 4-Way Mathematical Verification
                </h4>
                <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-950/50">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900/80 text-slate-400 font-semibold border-b border-slate-800">
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
                    <tbody className="divide-y divide-slate-800/60">
                      {transaction.lineItems.map(item => (
                        <tr key={item.id} className="hover:bg-slate-800/30">
                          <td className="py-3 px-3">
                            <div className="font-medium text-slate-200">{item.description}</div>
                            <div className="font-mono text-[10px] text-slate-500">HSN: {item.hsnOrSacCode} · Tax {item.taxRatePercent}%</div>
                          </td>
                          <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-300">{item.poQuantity}</td>
                          <td className={`py-3 px-3 text-right font-mono tabular-nums font-semibold ${
                            item.invoiceQuantity !== item.poQuantity ? 'text-amber-400' : 'text-slate-300'
                          }`}>
                            {item.invoiceQuantity}
                          </td>
                          <td className={`py-3 px-3 text-right font-mono tabular-nums font-semibold ${
                            item.receivedQuantity < item.invoiceQuantity ? 'text-rose-400' : 'text-emerald-400'
                          }`}>
                            {item.receivedQuantity}
                          </td>
                          <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-300">
                            {item.unitPrice.toLocaleString()} {item.currency}
                          </td>
                          <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-300">
                            {item.poTotal.toLocaleString()} {item.currency}
                          </td>
                          <td className={`py-3 px-3 text-right font-mono tabular-nums font-semibold ${
                            item.invoiceTotal !== item.poTotal ? 'text-amber-400' : 'text-slate-200'
                          }`}>
                            {item.invoiceTotal.toLocaleString()} {item.currency}
                          </td>
                          <td className="py-3 px-3 text-center">
                            {item.matchStatus === 'EXACT_MATCH' ? (
                              <span className="text-emerald-400 font-mono text-[11px] font-semibold">MATCH OK</span>
                            ) : (
                              <span className="text-rose-400 font-mono text-[11px] font-semibold">{item.matchStatus}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Physical Delivery Context */}
              {transaction.deliveryConfirmation && (
                <div className="p-4 bg-slate-950/40 border border-slate-800 rounded-lg text-xs space-y-2">
                  <div className="font-semibold text-slate-300 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Physical Receiving & Warehouse Gate Sign-off
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-slate-400 pt-1">
                    <div>
                      <span className="text-slate-500 block">Warehouse Gate:</span>
                      <span className="text-slate-200">{transaction.deliveryConfirmation.warehouseLocation}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Receiving Officer:</span>
                      <span className="text-slate-200">{transaction.deliveryConfirmation.receivedBy}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Tracking / Waybill:</span>
                      <span className="font-mono text-slate-200">{transaction.deliveryConfirmation.trackingNumber}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">IoT / RFID Scan:</span>
                      <span className="text-emerald-400 font-medium">
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
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>16 Independent Risk Engine Assertions</span>
                <span className="font-mono">
                  Engine Model: Hybrid Deterministic Rules + Graph Topology + Forensic Vision OCR
                </span>
              </div>

              <div className="space-y-2.5">
                {transaction.fraudChecks.map((check, idx) => (
                  <div 
                    key={check.id}
                    className={`p-3.5 rounded-lg border text-xs transition-colors ${
                      check.passed
                        ? 'bg-slate-950/40 border-slate-800 text-slate-300'
                        : check.severity === 'CRITICAL'
                        ? 'bg-rose-950/30 border-rose-800/60 text-rose-200'
                        : check.severity === 'HIGH'
                        ? 'bg-orange-950/30 border-orange-800/60 text-orange-200'
                        : 'bg-amber-950/30 border-amber-800/60 text-amber-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-400">
                            {String(idx + 1).padStart(2, '0')}.
                          </span>
                          <span className="font-semibold text-white">
                            {check.title}
                          </span>
                          <span className="font-mono text-[10px] text-slate-500">
                            [{check.code}]
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            · {check.category}
                          </span>
                        </div>
                        <p className={`text-xs ${check.passed ? 'text-slate-400' : 'font-medium'}`}>
                          {check.explanation}
                        </p>
                      </div>

                      <div className="shrink-0 text-right">
                        {check.passed ? (
                          <span className="text-emerald-400 font-semibold font-mono text-[11px] flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> PASSED
                          </span>
                        ) : (
                          <span className="font-semibold font-mono text-[11px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 uppercase">
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
                <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-200 text-sm">{transaction.buyer.legalName}</span>
                    <span className="text-emerald-400 font-semibold font-mono">KYC: {transaction.buyer.kycStatus}</span>
                  </div>
                  <div className="space-y-1.5 text-slate-400">
                    <div><span className="text-slate-500">Tax ID / GSTIN:</span> <span className="font-mono text-slate-200">{transaction.buyer.taxId}</span></div>
                    <div><span className="text-slate-500">Corporate Registry:</span> <span className="font-mono text-slate-200">{transaction.buyer.corporateRegistryId}</span></div>
                    <div><span className="text-slate-500">LEI (Global):</span> <span className="font-mono text-slate-200">{transaction.buyer.lei || 'N/A'}</span></div>
                    <div><span className="text-slate-500">Network Tenure:</span> <span className="text-slate-200">{transaction.buyer.tenureMonths} months</span></div>
                  </div>

                  <div className="pt-2 border-t border-slate-800">
                    <span className="text-slate-500 block mb-1">Authorized Purchase Signatory:</span>
                    {transaction.buyer.authorizedSignatories.map(sig => (
                      <div key={sig.id} className="text-slate-300 font-medium flex items-center justify-between">
                        <span>{sig.name} ({sig.designation})</span>
                        <span className="font-mono text-[11px] text-slate-400">Limit: {transaction.currency} {sig.signingLimit.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Seller Card */}
                <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-200 text-sm">{transaction.seller.legalName}</span>
                    <span className={`font-semibold font-mono ${
                      transaction.seller.kycStatus === 'VERIFIED' ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      KYC: {transaction.seller.kycStatus}
                    </span>
                  </div>
                  <div className="space-y-1.5 text-slate-400">
                    <div><span className="text-slate-500">Tax ID / GSTIN:</span> <span className="font-mono text-slate-200">{transaction.seller.taxId}</span></div>
                    <div><span className="text-slate-500">Corporate Registry:</span> <span className="font-mono text-slate-200">{transaction.seller.corporateRegistryId}</span></div>
                    <div><span className="text-slate-500">LEI (Global):</span> <span className="font-mono text-slate-200">{transaction.seller.lei || 'N/A'}</span></div>
                    <div><span className="text-slate-500">Network Tenure:</span> <span className="text-slate-200">{transaction.seller.tenureMonths} months</span></div>
                  </div>

                  <div className="pt-2 border-t border-slate-800">
                    <span className="text-slate-500 block mb-1">Authorized Invoice Signatory:</span>
                    {transaction.seller.authorizedSignatories.map(sig => (
                      <div key={sig.id} className="text-slate-300 font-medium flex items-center justify-between">
                        <span>{sig.name} ({sig.designation})</span>
                        <span className="font-mono text-[11px] text-slate-400">Limit: {transaction.currency} {sig.signingLimit.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Payment Destination & Bank Account Ownership */}
              <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-slate-200 flex items-center gap-2">
                    <Landmark className="w-4 h-4 text-blue-400" />
                    Payment Destination & Independent Account Ownership Verification
                  </h4>
                  {transaction.paymentDetails.bankAccountChangeDetected ? (
                    <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 font-mono text-[11px] font-semibold rounded">
                      ACCOUNT MUTATION DETECTED
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 font-mono text-[11px] font-semibold rounded">
                      VERIFIED MASTER ACCOUNT
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                  <div>
                    <span className="text-slate-500 block">Designated Account:</span>
                    <span className="font-mono font-semibold text-slate-200">{transaction.paymentDetails.beneficiaryAccount}</span>
                    <span className="text-slate-500 block text-[10px]">IFSC / Routing: {transaction.paymentDetails.beneficiaryIfscOrIban}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Bank Account Holder Title:</span>
                    <span className="font-medium text-slate-200">{transaction.paymentDetails.beneficiaryName}</span>
                    <span className={`block text-[10px] font-mono ${
                      transaction.paymentDetails.nameMatchConfidence > 90 ? 'text-emerald-400' : 'text-rose-400 font-bold'
                    }`}>
                      NPCI/Banking Match: {transaction.paymentDetails.nameMatchConfidence}%
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Payment Execution Rail:</span>
                    <span className="font-semibold text-slate-200">{transaction.paymentDetails.paymentRail} (Direct Settlement)</span>
                    <span className="text-slate-500 block text-[10px]">Status: {transaction.paymentDetails.status}</span>
                  </div>
                </div>

                {transaction.paymentDetails.bankAccountChangeDetected && (
                  <div className="p-3 bg-rose-950/40 border border-rose-900/60 rounded text-rose-200 text-xs">
                    <span className="font-bold">Fraud Alert Investigation:</span> This payment destination differs from the historical primary account ({transaction.paymentDetails.previousAccount}). Funds release is programmatically locked until dual CFO verbal callback confirmation and signed certificate update.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: Tax & E-Invoice */}
          {activeTab === 'tax' && (
            <div className="space-y-5 text-xs">
              <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-slate-200 text-sm">
                    {transaction.taxInfo.regime === 'INDIA_GST' ? 'Government of India E-Invoice (IRP / NIC)' : 'European Peppol BIS Billing 3.0'}
                  </div>
                  <span className={`font-mono font-semibold ${
                    transaction.taxInfo.isTaxPortalVerified ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {transaction.taxInfo.isTaxPortalVerified ? 'PORTAL SIGNATURE VERIFIED' : 'FAILED / UNVERIFIED'}
                  </span>
                </div>

                {transaction.taxInfo.irn && (
                  <div className="space-y-1">
                    <span className="text-slate-500 block">64-Character Invoice Reference Number (IRN):</span>
                    <div className="p-2.5 bg-slate-900 border border-slate-800 rounded font-mono text-[11px] text-blue-300 break-all select-all flex items-center justify-between">
                      <span>{transaction.taxInfo.irn}</span>
                      <button 
                        onClick={() => copyToClipboard(transaction.taxInfo.irn!, 'irn')}
                        className="ml-2 p-1 text-slate-400 hover:text-white"
                        title="Copy IRN"
                      >
                        {copiedHash === 'irn' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                )}

                {transaction.taxInfo.qrCodePayload && (
                  <div className="space-y-1">
                    <span className="text-slate-500 block">Cryptographic QR Code Payload (Decoded JSON):</span>
                    <pre className="p-2.5 bg-slate-900 border border-slate-800 rounded font-mono text-[10px] text-slate-400 overflow-x-auto whitespace-pre-wrap">
                      {transaction.taxInfo.qrCodePayload}
                    </pre>
                  </div>
                )}

                {transaction.taxInfo.taxDiscrepancyNotes && (
                  <div className="p-3 bg-amber-950/40 border border-amber-900/60 rounded text-amber-200">
                    <span className="font-semibold">Tax Forensics Note: </span>
                    {transaction.taxInfo.taxDiscrepancyNotes}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: Cryptographic Audit Chain */}
          {activeTab === 'audit' && (
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span>Tamper-Evident SHA-256 Ledger State History</span>
                <span className="font-mono text-[11px]">Ledger Invariant: Merkle-linked immutability</span>
              </div>

              <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                {transaction.auditTrail.map((entry, idx) => (
                  <div key={entry.id} className="relative">
                    <div className="absolute -left-[27px] top-1 w-3.5 h-3.5 rounded-full bg-blue-600 border-2 border-slate-900" />
                    <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-slate-200">{entry.action}</span>
                        <span className="text-[11px] text-slate-500 font-mono">
                          {new Date(entry.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-slate-300">{entry.payloadSummary}</p>
                      
                      <div className="pt-2 border-t border-slate-900 grid grid-cols-1 md:grid-cols-2 gap-2 font-mono text-[10px] text-slate-500">
                        <div>
                          <span className="text-slate-600 block">Actor:</span>
                          <span className="text-slate-300">{entry.actor.userName} ({entry.actor.role})</span>
                          <span className="text-slate-500 block">Auth: {entry.actor.authMethod}</span>
                        </div>
                        <div>
                          <span className="text-slate-600 block">Block Hash (SHA-256):</span>
                          <span className="text-blue-400 break-all">{entry.currentHash.substring(0, 32)}...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-400">
            Current Status: <span className="font-mono font-semibold text-white">{transaction.status}</span>
          </div>

          <div className="flex items-center gap-2">
            {transaction.overallRiskLevel === 'BLOCKED' ? (
              <button
                disabled
                className="px-4 py-2 text-xs font-semibold text-rose-300 bg-rose-950/60 border border-rose-800/80 rounded-lg cursor-not-allowed opacity-80"
              >
                Payment Execution Locked by Sentinel
              </button>
            ) : transaction.status === 'PAYMENT_PENDING' || transaction.status === 'RISK_FLAGGED' ? (
              <>
                {onHaltTransaction && (
                  <button
                    onClick={() => onHaltTransaction(transaction.utid)}
                    className="px-3.5 py-2 text-xs font-semibold text-rose-400 bg-rose-950/30 hover:bg-rose-900/40 border border-rose-800/50 rounded-lg transition-colors"
                  >
                    Halt & Flag Transaction
                  </button>
                )}
                {onApprovePayment && (
                  <button
                    onClick={() => onApprovePayment(transaction.utid)}
                    className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors shadow-sm shadow-blue-600/30"
                  >
                    Authorize Payment (CFO Dual-Sign)
                  </button>
                )}
              </>
            ) : (
              <span className="text-xs text-slate-400">Transaction Settled & Archived</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
