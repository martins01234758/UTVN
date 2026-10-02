import React, { useState } from 'react';
import { 
  Building2, Store, ShieldCheck, Landmark, CheckCircle2, 
  AlertTriangle, Clock, ArrowRight, FileText, Send, Check, 
  Search, Lock, Layers, RefreshCw, Key, ShieldAlert, Sliders
} from 'lucide-react';
import { UniversalTransaction, UserRole } from '../types/utvn';
import { mockTransactions } from '../data/mockData';
import { generateUTID, generateIRN } from '../utils/cryptoSim';

interface RolePortalsViewProps {
  initialRole?: UserRole;
  onSelectTransaction: (tx: UniversalTransaction) => void;
}

export const RolePortalsView: React.FC<RolePortalsViewProps> = ({
  initialRole = 'BUYER',
  onSelectTransaction,
}) => {
  const [activeRole, setActiveRole] = useState<UserRole>(initialRole);
  
  // Buyer Portal State
  const [buyerPoNumber, setBuyerPoNumber] = useState('PO-2026-NEW-0914');
  const [buyerVendor, setBuyerVendor] = useState('Tata Steel Industrial Products Ltd');
  const [buyerAmount, setBuyerAmount] = useState('3200000');
  const [poCreatedNotice, setPoCreatedNotice] = useState(false);

  // Seller Portal State
  const [sellerInvNo, setSellerInvNo] = useState('INV-2026-TS-9921');
  const [sellerGstin, setSellerGstin] = useState('20AAACT2702H1ZZ');
  const [irnGenerated, setIrnGenerated] = useState('');
  const [sellerSubmitNotice, setSellerSubmitNotice] = useState(false);

  // Finance/Admin State
  const [autoApproveLimit, setAutoApproveLimit] = useState(1000000);
  const [requireCfoAbove, setRequireCfoAbove] = useState(5000000);
  const [strictBankLock, setStrictBankLock] = useState(true);
  const [ruleSavedNotice, setRuleSavedNotice] = useState(false);

  // Bank Provider State
  const [bankTxApproved, setBankTxApproved] = useState<Record<string, boolean>>({});

  const handleCreatePo = (e: React.FormEvent) => {
    e.preventDefault();
    setPoCreatedNotice(true);
    setTimeout(() => setPoCreatedNotice(false), 3500);
  };

  const handleGenerateSellerIrn = () => {
    const irn = generateIRN(sellerGstin, sellerInvNo);
    setIrnGenerated(irn);
    setSellerSubmitNotice(true);
    setTimeout(() => setSellerSubmitNotice(false), 3500);
  };

  const handleSaveRules = () => {
    setRuleSavedNotice(true);
    setTimeout(() => setRuleSavedNotice(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Role Navigation Segmented Bar */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono text-blue-400 font-semibold block uppercase">
            Multi-Party Ecosystem
          </span>
          <h2 className="text-base font-bold text-white">
            Role-Based Persona Consoles
          </h2>
          <p className="text-xs text-slate-400">
            Switch views to test tailored workflows for Buyers, Suppliers, Finance/Risk Admins, and Settlement Banks.
          </p>
        </div>

        {/* 4 Role Selector Tabs */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 border border-slate-800 rounded-lg text-xs overflow-x-auto">
          <button
            onClick={() => setActiveRole('BUYER')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeRole === 'BUYER' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            Buyer Portal
          </button>
          <button
            onClick={() => setActiveRole('SELLER')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeRole === 'SELLER' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            Seller Portal
          </button>
          <button
            onClick={() => setActiveRole('FINANCE_ADMIN')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeRole === 'FINANCE_ADMIN' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Finance / Risk Admin
          </button>
          <button
            onClick={() => setActiveRole('BANK_PROVIDER')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeRole === 'BANK_PROVIDER' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Landmark className="w-3.5 h-3.5" />
            Settlement Bank
          </button>
        </div>
      </div>

      {/* 1. BUYER PORTAL */}
      {activeRole === 'BUYER' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Create Purchase & Issue PO */}
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-400" />
                  Create Purchase Order (PO)
                </h3>
                <span className="text-[10px] font-mono text-emerald-400 font-semibold">ERP SYNC ON</span>
              </div>
              <p className="text-xs text-slate-400">
                Generate an immutable Purchase ID anchored to your enterprise Delegation of Authority (DoA).
              </p>

              <form onSubmit={handleCreatePo} className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">Purchase Order ID:</label>
                  <input
                    type="text"
                    value={buyerPoNumber}
                    onChange={(e) => setBuyerPoNumber(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Approved Vendor:</label>
                  <select
                    value={buyerVendor}
                    onChange={(e) => setBuyerVendor(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200"
                  >
                    <option value="Tata Steel Industrial Products Ltd">Tata Steel Industrial Products Ltd (Verified KYC)</option>
                    <option value="Siemens Energy Operations">Siemens Energy Operations (Verified KYC)</option>
                    <option value="Apex Nano-Filtration Tech LLC">Apex Nano-Filtration Tech LLC (First-Time)</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Order Value (INR):</label>
                  <input
                    type="number"
                    value={buyerAmount}
                    onChange={(e) => setBuyerAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 font-mono"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm shadow-blue-600/30"
                >
                  <Send className="w-3.5 h-3.5" />
                  Issue Purchase Order & Generate UTID
                </button>

                {poCreatedNotice && (
                  <div className="p-2.5 bg-emerald-950/60 border border-emerald-800/80 rounded text-emerald-300 text-[11px] flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>Purchase Order broadcasted to network under UTID {generateUTID('IND')}.</span>
                  </div>
                )}
              </form>
            </div>

            {/* Invoices Pending Review & Risk Alerts */}
            <div className="lg:col-span-2 p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Invoices Pending Buyer Approval & 3-Way Match
                  </h3>
                  <p className="text-xs text-slate-400">
                    Cross-matched with warehouse Goods Receipt Notes (GRN) and Tax Portal IRN hashes.
                  </p>
                </div>
                <span className="font-mono text-xs text-slate-400">
                  {mockTransactions.length} Active Records
                </span>
              </div>

              <div className="space-y-3">
                {mockTransactions.map((tx) => (
                  <div
                    key={tx.utid}
                    onClick={() => onSelectTransaction(tx)}
                    className="p-3.5 bg-slate-950/60 border border-slate-800 hover:border-slate-700 rounded-lg text-xs space-y-2 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-blue-400">{tx.purchaseOrderId}</span>
                        <span className="text-slate-600">/</span>
                        <span className="font-mono text-slate-300">{tx.invoiceId}</span>
                      </div>
                      <span className={`font-mono font-bold text-[11px] ${
                        tx.overallRiskLevel === 'BLOCKED' ? 'text-rose-400' : tx.overallRiskLevel === 'VERIFIED' ? 'text-emerald-400' : 'text-amber-400'
                      }`}>
                        {tx.overallRiskLevel}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-400">
                      <span>Supplier: <strong className="text-slate-200">{tx.seller.legalName}</strong></span>
                      <span className="font-mono font-semibold text-white">
                        {tx.totalAmount.toLocaleString()} {tx.currency}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-900">
                      <span>{tx.riskSummary}</span>
                      <span className="text-blue-400 font-semibold hover:underline">Review & Match →</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. SELLER PORTAL */}
      {activeRole === 'SELLER' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Invoice Submission & IRN Generator */}
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Store className="w-4 h-4 text-blue-400" />
                  Submit E-Invoice
                </h3>
                <span className="text-[10px] font-mono text-emerald-400 font-semibold">GST IRP INTEGRATED</span>
              </div>
              <p className="text-xs text-slate-400">
                Link invoice to Buyer PO and automatically sign with 64-char IRN hash and QR payload.
              </p>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">Target Purchase Order ID:</label>
                  <input
                    type="text"
                    defaultValue="PO-2026-LT-88192"
                    readOnly
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-400 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Supplier Invoice Number:</label>
                  <input
                    type="text"
                    value={sellerInvNo}
                    onChange={(e) => setSellerInvNo(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Supplier GSTIN:</label>
                  <input
                    type="text"
                    value={sellerGstin}
                    onChange={(e) => setSellerGstin(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 font-mono"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleGenerateSellerIrn}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm shadow-blue-600/30"
                >
                  <Key className="w-3.5 h-3.5" />
                  Request IRN & Submit to Network
                </button>

                {sellerSubmitNotice && (
                  <div className="p-3 bg-emerald-950/60 border border-emerald-800/80 rounded text-emerald-300 text-[11px] space-y-1">
                    <div className="font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> IRN Generated & Registered!
                    </div>
                    <div className="font-mono text-[10px] break-all opacity-80">{irnGenerated}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Invoiced Status & Settlement Tracking */}
            <div className="lg:col-span-2 p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Vendor Receivables & Payment Assurance Tracker
                  </h3>
                  <p className="text-xs text-slate-400">
                    Real-time status of your invoices through buyer 3-way match, tax verification, and bank clearing.
                  </p>
                </div>
                <span className="font-mono text-xs text-emerald-400">
                  Verified Escrow Guarantee Enabled
                </span>
              </div>

              <div className="space-y-3">
                {mockTransactions.map((tx) => (
                  <div
                    key={tx.utid}
                    onClick={() => onSelectTransaction(tx)}
                    className="p-3.5 bg-slate-950/60 border border-slate-800 hover:border-slate-700 rounded-lg text-xs space-y-2 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-blue-400">{tx.invoiceId}</span>
                      <span className="font-mono text-slate-300">{tx.status}</span>
                    </div>

                    <div className="flex items-center justify-between text-slate-400">
                      <span>Buyer: <strong className="text-slate-200">{tx.buyer.legalName}</strong></span>
                      <span className="font-mono font-semibold text-white">
                        {tx.totalAmount.toLocaleString()} {tx.currency}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-900">
                      <span>Bank Beneficiary: {tx.paymentDetails.beneficiaryAccount} ({tx.paymentDetails.status})</span>
                      <span className="text-blue-400 font-semibold hover:underline">Track Lifecycle →</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. FINANCE / ADMIN PORTAL */}
      {activeRole === 'FINANCE_ADMIN' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Approval Rules Configurator */}
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-blue-400" />
                  Approval & Risk Thresholds
                </h3>
              </div>
              <p className="text-xs text-slate-400">
                Configure corporate governance rules, maker-checker escalation limits, and bank mutation triggers.
              </p>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">
                    Auto-Approve Low Risk Limit (INR):
                  </label>
                  <input
                    type="number"
                    value={autoApproveLimit}
                    onChange={(e) => setAutoApproveLimit(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 font-mono"
                  />
                  <span className="text-[10px] text-slate-500 block mt-0.5">Transactions below this value with 0 flags settle automatically</span>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">
                    Mandatory Dual-CFO Limit (INR):
                  </label>
                  <input
                    type="number"
                    value={requireCfoAbove}
                    onChange={(e) => setRequireCfoAbove(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 font-mono"
                  />
                </div>

                <div className="pt-2 border-t border-slate-800">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={strictBankLock}
                      onChange={(e) => setStrictBankLock(e.target.checked)}
                      className="rounded bg-slate-950 border-slate-700 text-blue-600 focus:ring-0"
                    />
                    <span>Immediate Freeze on Bank Account Changes</span>
                  </label>
                  <span className="text-[10px] text-slate-500 block ml-5 mt-0.5">
                    Requires voice callback + signed notary document if beneficiary account mutates.
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleSaveRules}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg text-xs transition-colors"
                >
                  Save Governance Policies
                </button>

                {ruleSavedNotice && (
                  <div className="p-2 bg-emerald-950/60 border border-emerald-800/80 rounded text-emerald-300 text-[11px] text-center">
                    Policies updated across network sentinel nodes.
                  </div>
                )}
              </div>
            </div>

            {/* Enterprise Transaction Oversight & Alert Investigation */}
            <div className="lg:col-span-2 p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Risk Incidents & Fraud Investigation Queue
                  </h3>
                  <p className="text-xs text-slate-400">
                    Flagged transactions requiring operational intervention or forensic inquiry.
                  </p>
                </div>
                <span className="font-mono text-xs text-rose-400 font-semibold">
                  2 Critical Alerts Open
                </span>
              </div>

              <div className="space-y-3">
                {mockTransactions.filter(tx => tx.overallRiskLevel !== 'VERIFIED').map((tx) => (
                  <div
                    key={tx.utid}
                    onClick={() => onSelectTransaction(tx)}
                    className="p-3.5 bg-slate-950/80 border border-slate-800 hover:border-slate-700 rounded-lg text-xs space-y-2 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-blue-400">{tx.utid}</span>
                        <span className="text-slate-600">·</span>
                        <span className="text-slate-300">{tx.buyer.tradeName || tx.buyer.legalName}</span>
                      </div>
                      <span className={`font-mono font-bold text-[11px] px-2 py-0.5 rounded ${
                        tx.overallRiskLevel === 'BLOCKED' ? 'bg-rose-500/20 text-rose-300' : 'bg-orange-500/20 text-orange-300'
                      }`}>
                        {tx.overallRiskLevel}
                      </span>
                    </div>

                    <p className="text-slate-300 font-medium">
                      {tx.riskSummary}
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-900">
                      <span>Action Recommended: <strong className="text-slate-300">{tx.recommendedAction}</strong></span>
                      <span className="text-blue-400 font-semibold hover:underline">Open Forensic Audit →</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. BANK / PAYMENT PROVIDER GATEWAY */}
      {activeRole === 'BANK_PROVIDER' && (
        <div className="space-y-6">
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <span className="text-[11px] font-mono text-emerald-400 font-semibold uppercase">
                  Verified Payment Instruction (VPI) Rail
                </span>
                <h3 className="text-base font-bold text-white">
                  Settlement Bank Clearinghouse Console (RTGS / NEFT / ACH)
                </h3>
                <p className="text-xs text-slate-400">
                  Financial institutions receive pre-verified cryptographic tokens confirming 4-way match and beneficiary ownership before funds release.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="px-2.5 py-1 bg-emerald-950 border border-emerald-800 text-emerald-300 rounded font-semibold">
                  API Connected: RBI / NPCI Gateway
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {mockTransactions.map((tx) => {
                const isExecuted = tx.status === 'PAYMENT_EXECUTED' || bankTxApproved[tx.utid];
                const isBlocked = tx.overallRiskLevel === 'BLOCKED' && !bankTxApproved[tx.utid];

                return (
                  <div
                    key={tx.utid}
                    className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl text-xs space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <Landmark className="w-5 h-5 text-blue-400 shrink-0" />
                        <div>
                          <div className="font-mono font-bold text-slate-200">
                            {tx.paymentDetails.paymentId} · UTID: {tx.utid}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            Beneficiary: <strong className="text-white">{tx.paymentDetails.beneficiaryName}</strong> ({tx.paymentDetails.beneficiaryAccount} - {tx.paymentDetails.beneficiaryIfscOrIban})
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-mono text-sm font-bold text-white">
                          {tx.totalAmount.toLocaleString()} {tx.currency}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          Rail: {tx.paymentDetails.paymentRail}
                        </div>
                      </div>
                    </div>

                    <div className="p-2.5 bg-slate-900 border border-slate-800 rounded text-[11px] grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div>
                        <span className="text-slate-500 block">Beneficiary Name Match:</span>
                        <span className={tx.paymentDetails.nameMatchConfidence > 90 ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
                          {tx.paymentDetails.nameMatchConfidence}% via Penny-Drop
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Account History:</span>
                        <span className={tx.paymentDetails.bankAccountChangeDetected ? 'text-rose-400 font-bold' : 'text-slate-300'}>
                          {tx.paymentDetails.bankAccountChangeDetected ? 'UNVERIFIED MUTATION' : 'Verified Primary (2+ Years)'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">4-Way Match Token:</span>
                        <span className="font-mono text-blue-400 truncate block">
                          {tx.paymentDetails.escrowToken || 'CRYPTOGRAPHIC_TOKEN_VALID'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <button
                        onClick={() => onSelectTransaction(tx)}
                        className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
                      >
                        Inspect Full Cryptographic Payload →
                      </button>

                      <div className="flex items-center gap-2">
                        {isBlocked ? (
                          <span className="px-3 py-1 bg-rose-950 text-rose-300 border border-rose-800 font-semibold rounded font-mono text-[11px]">
                            PAYMENT BLOCKED BY SENTINEL
                          </span>
                        ) : isExecuted ? (
                          <span className="px-3 py-1 bg-emerald-950 text-emerald-300 border border-emerald-800 font-semibold rounded font-mono text-[11px] flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> SETTLEMENT CONFIRMED
                          </span>
                        ) : (
                          <button
                            onClick={() => setBankTxApproved(prev => ({ ...prev, [tx.utid]: true }))}
                            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded text-xs transition-colors shadow-sm"
                          >
                            Execute Settlement Release
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
