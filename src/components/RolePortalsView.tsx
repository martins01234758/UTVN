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
      <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono text-emerald-700 font-bold block uppercase">
            Multi-Party Ecosystem
          </span>
          <h2 className="text-base font-bold text-slate-900">
            Role-Based Persona Consoles
          </h2>
          <p className="text-xs text-slate-600">
            Switch views to test tailored workflows for Buyers, Suppliers, Finance/Risk Admins, and Settlement Banks.
          </p>
        </div>

        {/* 4 Role Selector Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 border border-slate-200 rounded-xl text-xs overflow-x-auto">
          <button
            onClick={() => setActiveRole('BUYER')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeRole === 'BUYER' ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-emerald-600" />
            Buyer Portal
          </button>
          <button
            onClick={() => setActiveRole('SELLER')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeRole === 'SELLER' ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Store className="w-3.5 h-3.5 text-emerald-600" />
            Seller Portal
          </button>
          <button
            onClick={() => setActiveRole('FINANCE_ADMIN')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeRole === 'FINANCE_ADMIN' ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Finance / Risk Admin
          </button>
          <button
            onClick={() => setActiveRole('BANK_PROVIDER')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeRole === 'BANK_PROVIDER' ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Landmark className="w-3.5 h-3.5 text-emerald-600" />
            Settlement Bank
          </button>
        </div>
      </div>

      {/* 1. BUYER PORTAL */}
      {activeRole === 'BUYER' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Create Purchase & Issue PO */}
            <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  Create Purchase Order (PO)
                </h3>
                <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">ERP SYNC ON</span>
              </div>
              <p className="text-xs text-slate-600">
                Generate an immutable Purchase ID anchored to your enterprise Delegation of Authority (DoA).
              </p>

              <form onSubmit={handleCreatePo} className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-600 block mb-1 font-medium">Purchase Order ID:</label>
                  <input
                    type="text"
                    value={buyerPoNumber}
                    onChange={(e) => setBuyerPoNumber(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-900 font-mono text-xs focus:bg-white focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-slate-600 block mb-1 font-medium">Approved Vendor:</label>
                  <select
                    value={buyerVendor}
                    onChange={(e) => setBuyerVendor(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-900 text-xs focus:bg-white focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="Tata Steel Industrial Products Ltd">Tata Steel Industrial Products Ltd (Verified KYC)</option>
                    <option value="Siemens Energy Operations">Siemens Energy Operations (Verified KYC)</option>
                    <option value="Apex Nano-Filtration Tech LLC">Apex Nano-Filtration Tech LLC (First-Time)</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-600 block mb-1 font-medium">Order Value (INR):</label>
                  <input
                    type="number"
                    value={buyerAmount}
                    onChange={(e) => setBuyerAmount(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-900 font-mono text-xs focus:bg-white focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  Issue Purchase Order & Generate UTID
                </button>

                {poCreatedNotice && (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-[11px] flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                    <span>Purchase Order broadcasted to network under UTID {generateUTID('IND')}.</span>
                  </div>
                )}
              </form>
            </div>

            {/* Invoices Pending Review & Risk Alerts */}
            <div className="lg:col-span-2 p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Invoices Pending Buyer Approval & 3-Way Match
                  </h3>
                  <p className="text-xs text-slate-600">
                    Cross-matched with warehouse Goods Receipt Notes (GRN) and Tax Portal IRN hashes.
                  </p>
                </div>
                <span className="font-mono text-xs text-slate-500">
                  {mockTransactions.length} Active Records
                </span>
              </div>

              <div className="space-y-3">
                {mockTransactions.map((tx) => (
                  <div
                    key={tx.utid}
                    onClick={() => onSelectTransaction(tx)}
                    className="p-3.5 bg-slate-50 border border-slate-200 hover:border-slate-300 hover:bg-white rounded-xl text-xs space-y-2 cursor-pointer transition-all shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-emerald-700">{tx.purchaseOrderId}</span>
                        <span className="text-slate-400">/</span>
                        <span className="font-mono text-slate-700 font-semibold">{tx.invoiceId}</span>
                      </div>
                      <span className={`font-mono font-bold text-[11px] px-2 py-0.5 rounded border ${
                        tx.overallRiskLevel === 'BLOCKED' ? 'bg-rose-50 text-rose-700 border-rose-200' : tx.overallRiskLevel === 'VERIFIED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {tx.overallRiskLevel}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-600">
                      <span>Supplier: <strong className="text-slate-900">{tx.seller.legalName}</strong></span>
                      <span className="font-mono font-semibold text-slate-900">
                        {tx.totalAmount.toLocaleString()} {tx.currency}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-200/60">
                      <span>{tx.riskSummary}</span>
                      <span className="text-emerald-700 font-semibold hover:underline">Review & Match →</span>
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
            <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Store className="w-4 h-4 text-emerald-600" />
                  Submit E-Invoice
                </h3>
                <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">GST IRP INTEGRATED</span>
              </div>
              <p className="text-xs text-slate-600">
                Link invoice to Buyer PO and automatically sign with 64-char IRN hash and QR payload.
              </p>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-600 block mb-1 font-medium">Target Purchase Order ID:</label>
                  <input
                    type="text"
                    defaultValue="PO-2026-LT-88192"
                    readOnly
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-600 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="text-slate-600 block mb-1 font-medium">Supplier Invoice Number:</label>
                  <input
                    type="text"
                    value={sellerInvNo}
                    onChange={(e) => setSellerInvNo(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-900 font-mono text-xs focus:bg-white focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-slate-600 block mb-1 font-medium">Supplier GSTIN:</label>
                  <input
                    type="text"
                    value={sellerGstin}
                    onChange={(e) => setSellerGstin(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-900 font-mono text-xs focus:bg-white focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleGenerateSellerIrn}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Key className="w-3.5 h-3.5" />
                  Request IRN & Submit to Network
                </button>

                {sellerSubmitNotice && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-[11px] space-y-1">
                    <div className="font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> IRN Generated & Registered!
                    </div>
                    <div className="font-mono text-[10px] break-all opacity-90 text-emerald-900">{irnGenerated}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Invoiced Status & Settlement Tracking */}
            <div className="lg:col-span-2 p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Vendor Receivables & Payment Assurance Tracker
                  </h3>
                  <p className="text-xs text-slate-600">
                    Real-time status of your invoices through buyer 3-way match, tax verification, and bank clearing.
                  </p>
                </div>
                <span className="font-mono text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold">
                  Verified Escrow Guarantee Enabled
                </span>
              </div>

              <div className="space-y-3">
                {mockTransactions.map((tx) => (
                  <div
                    key={tx.utid}
                    onClick={() => onSelectTransaction(tx)}
                    className="p-3.5 bg-slate-50 border border-slate-200 hover:border-slate-300 hover:bg-white rounded-xl text-xs space-y-2 cursor-pointer transition-all shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-emerald-700">{tx.invoiceId}</span>
                      <span className="font-mono text-slate-700 font-semibold">{tx.status}</span>
                    </div>

                    <div className="flex items-center justify-between text-slate-600">
                      <span>Buyer: <strong className="text-slate-900">{tx.buyer.legalName}</strong></span>
                      <span className="font-mono font-semibold text-slate-900">
                        {tx.totalAmount.toLocaleString()} {tx.currency}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                      <span>Bank Beneficiary: {tx.paymentDetails.beneficiaryAccount} ({tx.paymentDetails.status})</span>
                      <span className="text-emerald-700 font-semibold hover:underline">Track Lifecycle →</span>
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
            <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-emerald-600" />
                  Approval & Risk Thresholds
                </h3>
              </div>
              <p className="text-xs text-slate-600">
                Configure corporate governance rules, maker-checker escalation limits, and bank mutation triggers.
              </p>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-600 block mb-1 font-medium">
                    Auto-Approve Low Risk Limit (INR):
                  </label>
                  <input
                    type="number"
                    value={autoApproveLimit}
                    onChange={(e) => setAutoApproveLimit(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-900 font-mono text-xs focus:bg-white focus:ring-1 focus:ring-emerald-500"
                  />
                  <span className="text-[10px] text-slate-500 block mt-0.5">Transactions below this value with 0 flags settle automatically</span>
                </div>

                <div>
                  <label className="text-slate-600 block mb-1 font-medium">
                    Mandatory Dual-CFO Limit (INR):
                  </label>
                  <input
                    type="number"
                    value={requireCfoAbove}
                    onChange={(e) => setRequireCfoAbove(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-900 font-mono text-xs focus:bg-white focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                    <input
                      type="checkbox"
                      checked={strictBankLock}
                      onChange={(e) => setStrictBankLock(e.target.checked)}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="font-medium">Immediate Freeze on Bank Account Changes</span>
                  </label>
                  <span className="text-[10px] text-slate-500 block ml-5 mt-0.5">
                    Requires voice callback + signed notary document if beneficiary account mutates.
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleSaveRules}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs transition-colors shadow-xs"
                >
                  Save Governance Policies
                </button>

                {ruleSavedNotice && (
                  <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-[11px] text-center font-medium">
                    Policies updated across network sentinel nodes.
                  </div>
                )}
              </div>
            </div>

            {/* Enterprise Transaction Oversight & Alert Investigation */}
            <div className="lg:col-span-2 p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Risk Incidents & Fraud Investigation Queue
                  </h3>
                  <p className="text-xs text-slate-600">
                    Flagged transactions requiring operational intervention or forensic inquiry.
                  </p>
                </div>
                <span className="font-mono text-xs text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 font-bold">
                  2 Critical Alerts Open
                </span>
              </div>

              <div className="space-y-3">
                {mockTransactions.filter(tx => tx.overallRiskLevel !== 'VERIFIED').map((tx) => (
                  <div
                    key={tx.utid}
                    onClick={() => onSelectTransaction(tx)}
                    className="p-3.5 bg-slate-50 border border-slate-200 hover:border-slate-300 hover:bg-white rounded-xl text-xs space-y-2 cursor-pointer transition-all shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-emerald-700">{tx.utid}</span>
                        <span className="text-slate-400">·</span>
                        <span className="text-slate-700 font-semibold">{tx.buyer.tradeName || tx.buyer.legalName}</span>
                      </div>
                      <span className={`font-mono font-bold text-[11px] px-2 py-0.5 rounded border ${
                        tx.overallRiskLevel === 'BLOCKED' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-orange-50 text-orange-700 border-orange-200'
                      }`}>
                        {tx.overallRiskLevel}
                      </span>
                    </div>

                    <p className="text-slate-700 font-medium">
                      {tx.riskSummary}
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                      <span>Action Recommended: <strong className="text-slate-800">{tx.recommendedAction}</strong></span>
                      <span className="text-emerald-700 font-semibold hover:underline">Open Forensic Audit →</span>
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
          <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <span className="text-[11px] font-mono text-emerald-700 font-bold uppercase">
                  Verified Payment Instruction (VPI) Rail
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  Settlement Bank Clearinghouse Console (RTGS / NEFT / ACH)
                </h3>
                <p className="text-xs text-slate-600">
                  Financial institutions receive pre-verified cryptographic tokens confirming 4-way match and beneficiary ownership before funds release.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl font-semibold">
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
                    className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <Landmark className="w-5 h-5 text-emerald-600 shrink-0" />
                        <div>
                          <div className="font-mono font-bold text-slate-900">
                            {tx.paymentDetails.paymentId} · UTID: {tx.utid}
                          </div>
                          <div className="text-[11px] text-slate-600">
                            Beneficiary: <strong className="text-slate-900">{tx.paymentDetails.beneficiaryName}</strong> ({tx.paymentDetails.beneficiaryAccount} - {tx.paymentDetails.beneficiaryIfscOrIban})
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-mono text-sm font-bold text-slate-900">
                          {tx.totalAmount.toLocaleString()} {tx.currency}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          Rail: {tx.paymentDetails.paymentRail}
                        </div>
                      </div>
                    </div>

                    <div className="p-2.5 bg-white border border-slate-200 rounded-lg text-[11px] grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div>
                        <span className="text-slate-500 block">Beneficiary Name Match:</span>
                        <span className={tx.paymentDetails.nameMatchConfidence > 90 ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'}>
                          {tx.paymentDetails.nameMatchConfidence}% via Penny-Drop
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Account History:</span>
                        <span className={tx.paymentDetails.bankAccountChangeDetected ? 'text-rose-700 font-bold' : 'text-slate-800 font-medium'}>
                          {tx.paymentDetails.bankAccountChangeDetected ? 'UNVERIFIED MUTATION' : 'Verified Primary (2+ Years)'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">4-Way Match Token:</span>
                        <span className="font-mono text-emerald-700 truncate block font-medium">
                          {tx.paymentDetails.escrowToken || 'CRYPTOGRAPHIC_TOKEN_VALID'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <button
                        onClick={() => onSelectTransaction(tx)}
                        className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold"
                      >
                        Inspect Full Cryptographic Payload →
                      </button>

                      <div className="flex items-center gap-2">
                        {isBlocked ? (
                          <span className="px-3 py-1 bg-rose-50 text-rose-700 border border-rose-200 font-bold rounded-lg font-mono text-[11px]">
                            PAYMENT BLOCKED BY SENTINEL
                          </span>
                        ) : isExecuted ? (
                          <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold rounded-lg font-mono text-[11px] flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> SETTLEMENT CONFIRMED
                          </span>
                        ) : (
                          <button
                            onClick={() => setBankTxApproved(prev => ({ ...prev, [tx.utid]: true }))}
                            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs transition-colors shadow-xs"
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
