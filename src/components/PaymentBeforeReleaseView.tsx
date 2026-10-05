import React, { useState } from 'react';
import { 
  ShieldCheck, ShieldAlert, AlertTriangle, CheckCircle2, 
  ArrowRight, Landmark, Upload, Play, Check, X, FileText, 
  RefreshCw, TrendingUp, Layers, Lock, Cpu, Eye, ExternalLink
} from 'lucide-react';

interface BatchPaymentItem {
  id: string;
  vendorName: string;
  vendorGstin: string;
  invoiceNo: string;
  invoiceAmount: number;
  poNumber: string;
  grnReceiptNo: string;
  bankAccount: string;
  ifsc: string;
  pennyDropName: string;
  pennyDropScore: number;
  bankAccountChanged: boolean;
  irnVerified: boolean;
  amountMismatch: boolean;
  goodsReceiptMatched: boolean;
  status: 'CLEARED' | 'HELD_FRAUD' | 'HELD_OVERBILLING' | 'HELD_UNVERIFIED';
  holdReason?: string;
}

export const PaymentBeforeReleaseView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'batch_scanner' | 'strategy_blueprint'>('batch_scanner');
  const [scanExecuted, setScanExecuted] = useState(false);
  const [clearedBatchReleased, setClearedBatchReleased] = useState(false);

  // Scheduled wire disbursement batch (e.g. today's 5:00 PM corporate wire run)
  const initialBatch: BatchPaymentItem[] = [
    {
      id: 'PAY-RUN-01',
      vendorName: 'Tata Steel Industrial Products Ltd',
      vendorGstin: '20AAACT2702H1ZZ',
      invoiceNo: 'INV-TS-2026-09418',
      invoiceAmount: 4850000,
      poNumber: 'PO-2026-LT-88192',
      grnReceiptNo: 'GRN-2026-MUM-48201',
      bankAccount: '000405001928',
      ifsc: 'ICIC0000004',
      pennyDropName: 'Tata Steel Industrial Products Ltd',
      pennyDropScore: 99.8,
      bankAccountChanged: false,
      irnVerified: true,
      amountMismatch: false,
      goodsReceiptMatched: true,
      status: 'CLEARED'
    },
    {
      id: 'PAY-RUN-02',
      vendorName: 'Polymer Packaging Solutions Private Ltd',
      vendorGstin: '24AABCP9012M1ZM',
      invoiceNo: 'INV-PPS-2026-TAMPER-08',
      invoiceAmount: 12500000,
      poNumber: 'PO-2026-GCPL-40912',
      grnReceiptNo: 'GRN-PENDING',
      bankAccount: '99881100223344', // Altered bank account!
      ifsc: 'SBIN0009941',
      pennyDropName: 'Polymer Pack Trading Corp', // Mismatch!
      pennyDropScore: 32.1,
      bankAccountChanged: true, // BEC attack!
      irnVerified: false,
      amountMismatch: true,
      goodsReceiptMatched: false,
      status: 'HELD_FRAUD',
      holdReason: 'CRITICAL BEC ALERT: Bank account differs from verified master record. Penny-drop name match is only 32.1%. Wire release blocked.'
    },
    {
      id: 'PAY-RUN-03',
      vendorName: 'Apex Electrical Conduit Systems LLP',
      vendorGstin: '27AAPFA1029K1ZX',
      invoiceNo: 'INV-2026-0941-REISSUE',
      invoiceAmount: 1820000,
      poNumber: 'PO-2026-LT-88192-DUP',
      grnReceiptNo: 'GRN-NOT-FOUND',
      bankAccount: '200192841029',
      ifsc: 'PUNB0021400',
      pennyDropName: 'Apex Shell Trading',
      pennyDropScore: 41.0,
      bankAccountChanged: false,
      irnVerified: false, // Duplicate recycled IRN!
      amountMismatch: false,
      goodsReceiptMatched: false,
      status: 'HELD_FRAUD',
      holdReason: 'DUPLICATE IRN COLLISION: Government IRP reports this 64-char IRN was already settled 14 days ago. Fictitious double-billing intercepted.'
    },
    {
      id: 'PAY-RUN-04',
      vendorName: 'Vandenberg Precision Forgings BV',
      vendorGstin: 'NL859201948B01',
      invoiceNo: 'INV-VBF-2026-0412',
      invoiceAmount: 31050000, // INR equivalent of €345,000
      poNumber: 'PO-2026-SE-9081',
      grnReceiptNo: 'GRN-2026-BER-0912',
      bankAccount: 'NL91ABNA0417164300',
      ifsc: 'ABNANL2A',
      pennyDropName: 'Vandenberg Precision Forgings BV',
      pennyDropScore: 99.1,
      bankAccountChanged: false,
      irnVerified: true,
      amountMismatch: true, // Invoiced 500 units vs 400 received!
      goodsReceiptMatched: false,
      status: 'HELD_OVERBILLING',
      holdReason: 'OVERBILLING DETECTED: Invoiced quantity (500 units) exceeds Goods Receipt Note (400 received). Variance of +20% (₹6,210,000 unverified value).'
    },
    {
      id: 'PAY-RUN-05',
      vendorName: 'Schneider Industrial Switchgears Ltd',
      vendorGstin: '29AAACS1902K1ZX',
      invoiceNo: 'INV-SE-2026-44019',
      invoiceAmount: 8900000,
      poNumber: 'PO-2026-LT-99410',
      grnReceiptNo: 'GRN-2026-BLR-0192',
      bankAccount: '002905008129',
      ifsc: 'HDFC0000060',
      pennyDropName: 'Schneider Industrial Switchgears Ltd',
      pennyDropScore: 99.7,
      bankAccountChanged: false,
      irnVerified: true,
      amountMismatch: false,
      goodsReceiptMatched: true,
      status: 'CLEARED'
    }
  ];

  const [batchItems, setBatchItems] = useState<BatchPaymentItem[]>(initialBatch);

  const totalBatchValue = batchItems.reduce((sum, item) => sum + item.invoiceAmount, 0);
  const clearedItems = batchItems.filter(item => item.status === 'CLEARED');
  const clearedValue = clearedItems.reduce((sum, item) => sum + item.invoiceAmount, 0);
  const heldItems = batchItems.filter(item => item.status !== 'CLEARED');
  const heldValue = heldItems.reduce((sum, item) => sum + item.invoiceAmount, 0);

  const runPreReleaseScan = () => {
    setScanExecuted(true);
  };

  const releaseClearedWires = () => {
    setClearedBatchReleased(true);
  };

  return (
    <div className="space-y-6">
      {/* Strategic Manifesto Banner */}
      <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded font-mono text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            THE PRACTICAL WEDGE STRATEGY
          </span>
          <span className="text-slate-300">·</span>
          <span className="text-xs font-semibold text-slate-500">Single-Player AP Sentinel</span>
        </div>

        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
          "Payment-Before-Release Fraud Verification for B2B Invoices"
        </h2>

        <p className="text-xs text-slate-600 max-w-4xl leading-relaxed">
          <strong className="text-slate-900">The Cold-Start Reality:</strong> You don’t automatically get a network just because you create an ID. Forcing hundreds of thousands of suppliers and banks to adopt a brand new universal ID on Day 1 is an adoption death trap.
          <br /><br />
          Instead, UTVN launches as a <strong className="text-slate-900">single-player wedge product</strong> installed exclusively by enterprise buyers. It intercepts the AP payment file right before wire release, cross-verifying invoices against Government Tax APIs (GST/IRN) and Bank Penny-Drop APIs. <strong className="text-emerald-700">Zero suppliers need to sign up. 100% of payment diversion fraud is stopped on Day 1.</strong>
        </p>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 pt-3 border-t border-slate-100 flex-wrap">
          <button
            onClick={() => setActiveTab('batch_scanner')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'batch_scanner' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            Live Pre-Payment Batch Intercept Simulator
          </button>
          <button
            onClick={() => setActiveTab('strategy_blueprint')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'strategy_blueprint' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            The 4-Stage Bridge: From Wedge to Universal Network
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: LIVE PRE-PAYMENT BATCH INTERCEPT SIMULATOR                         */}
      {/* ========================================================================= */}
      {activeTab === 'batch_scanner' && (
        <div className="space-y-6">
          {/* Batch Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-1 shadow-sm">
              <span className="text-[11px] text-slate-500 block font-medium">Scheduled Wire Batch Value</span>
              <div className="text-xl font-bold font-mono text-slate-900 tabular-nums">
                ₹{totalBatchValue.toLocaleString()}
              </div>
              <span className="text-[10px] text-slate-400 font-mono">5 Payments Scheduled for 5:00 PM Run</span>
            </div>

            <div className="p-4 bg-white border border-rose-200 rounded-2xl space-y-1 shadow-sm">
              <span className="text-[11px] text-rose-700 block font-medium">Fraud / Loss Intercepted</span>
              <div className="text-xl font-bold font-mono text-rose-700 tabular-nums">
                ₹{heldValue.toLocaleString()}
              </div>
              <span className="text-[10px] text-rose-600 font-mono">3 Fraudulent Wires Intercepted (100%)</span>
            </div>

            <div className="p-4 bg-white border border-emerald-200 rounded-2xl space-y-1 shadow-sm">
              <span className="text-[11px] text-emerald-800 block font-medium">Cleared for Automated Wire</span>
              <div className="text-xl font-bold font-mono text-emerald-700 tabular-nums">
                ₹{clearedValue.toLocaleString()}
              </div>
              <span className="text-[10px] text-emerald-600 font-mono">2 Payments 100% Invariant Verified</span>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-1 shadow-sm">
              <span className="text-[11px] text-emerald-800 block font-medium">Supplier Adoption Required</span>
              <div className="text-xl font-bold font-mono text-emerald-700">
                0 Suppliers
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Verified via Out-of-Band Gov & Bank APIs</span>
            </div>
          </div>

          {/* Controller & Batch Trigger */}
          <div className="p-5 bg-white border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-900">
                Treasury AP Outbox: Pre-Release Verification Gate
              </h3>
              <p className="text-xs text-slate-500">
                Hooked between ERP payment run (e.g. SAP F110 / Oracle Payables) and corporate banking portal.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {!scanExecuted ? (
                <button
                  onClick={runPreReleaseScan}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl transition-colors flex items-center gap-2 shadow-sm"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Run Pre-Release Sentinel Scan
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-emerald-700 font-bold flex items-center gap-1.5 mr-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Scan Complete: 3 Holds Triggered
                  </span>
                  <button
                    disabled={clearedBatchReleased}
                    onClick={releaseClearedWires}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-semibold text-xs rounded-xl transition-colors flex items-center gap-2 shadow-sm"
                  >
                    <Landmark className="w-4 h-4" />
                    <span>{clearedBatchReleased ? 'Cleared Batch Disbursed (RTGS)' : `Release Cleared Wires (₹${clearedValue.toLocaleString()})`}</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Table of Scheduled Batch Items */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
            <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Disbursement Item</th>
                  <th className="py-3 px-4">Vendor & GSTIN</th>
                  <th className="py-3 px-4 text-right">Amount (INR)</th>
                  <th className="py-3 px-4">Destination Account Audit</th>
                  <th className="py-3 px-4 text-center">Tax / IRN Check</th>
                  <th className="py-3 px-4 text-center">3-Way Match</th>
                  <th className="py-3 px-4 text-center">Pre-Release Gate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {batchItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono">
                      <div className="font-bold text-emerald-700">{item.id}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{item.invoiceNo} · {item.poNumber}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900 truncate max-w-[220px]">
                        {item.vendorName}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                        GSTIN: {item.vendorGstin}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono tabular-nums font-bold text-slate-900">
                      ₹{item.invoiceAmount.toLocaleString()}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-mono text-[11px] text-slate-800 font-medium">
                        {item.bankAccount} ({item.ifsc})
                      </div>
                      <div className="text-[10px] mt-0.5">
                        {item.bankAccountChanged ? (
                          <span className="text-rose-700 font-bold font-mono">
                            ⚠ MUTATION: Penny-Drop {item.pennyDropScore}% ({item.pennyDropName})
                          </span>
                        ) : (
                          <span className="text-emerald-700 font-mono font-medium">
                            ✔ Penny-Drop Verified: {item.pennyDropScore}% Match
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      {item.irnVerified ? (
                        <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          IRP VALID
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
                          REJECTED
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      {!item.amountMismatch && item.goodsReceiptMatched ? (
                        <span className="font-mono text-emerald-700 font-bold text-[11px]">100% MATCH</span>
                      ) : (
                        <span className="font-mono text-rose-700 font-bold text-[11px]">
                          {item.amountMismatch ? 'PRICE DELTA' : 'MISSING GRN'}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      {item.status === 'CLEARED' ? (
                        <span className="px-3 py-1 rounded-lg font-mono font-bold text-xs bg-emerald-50 text-emerald-800 border border-emerald-200">
                          PAY (CLEARED)
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-lg font-mono font-bold text-xs bg-rose-50 text-rose-800 border border-rose-200">
                          HOLD (LOCKED)
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>

          {/* Deep Explanation of What Just Happened */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-5 bg-white border border-slate-200 rounded-2xl space-y-2 shadow-sm">
              <span className="font-bold text-emerald-700 flex items-center gap-1.5 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 1. How Bank Accounts Are Verified
              </span>
              <p className="text-slate-600 leading-relaxed">
                UTVN connects directly to NPCI/Banking Penny-Drop APIs. It pulses a ₹1 deposit to the bank account printed on the invoice. The bank returns the legal account title. If the title doesn’t match the vendor master record &gt;90%, the payment is automatically frozen.
              </p>
            </div>

            <div className="p-5 bg-white border border-slate-200 rounded-2xl space-y-2 shadow-sm">
              <span className="font-bold text-emerald-700 flex items-center gap-1.5 text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> 2. How Fake Invoices Are Intercepted
              </span>
              <p className="text-slate-600 leading-relaxed">
                Rather than asking the vendor if the invoice is real, UTVN queries the National Tax Portal (NIC/IRP). If the 64-character IRN does not exist, has a broken cryptographic signature, or was already settled under another payment run, it is blocked instantly.
              </p>
            </div>

            <div className="p-5 bg-white border border-slate-200 rounded-2xl space-y-2 shadow-sm">
              <span className="font-bold text-emerald-700 flex items-center gap-1.5 text-xs">
                <Lock className="w-4 h-4 text-emerald-600" /> 3. Why Zero Suppliers Need to Join
              </span>
              <p className="text-slate-600 leading-relaxed">
                All verifications happen using data the buyer already possesses (ERP PO, Goods Receipt Note) or public authoritative infrastructure (Government IRP + Bank Clearinghouse). The buyer gets 100% fraud protection without waiting for any counterparty.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: THE 4-STAGE BRIDGE (WEDGE TO UNIVERSAL NETWORK)                    */}
      {/* ========================================================================= */}
      {activeTab === 'strategy_blueprint' && (
        <div className="space-y-6 text-xs">
          <div className="p-5 bg-white border border-slate-200 rounded-2xl space-y-2 shadow-sm">
            <h3 className="font-bold text-slate-900 text-sm">
              The Evolution Playbook: "Come for the Wedge Tool, Stay for the Network"
            </h3>
            <p className="text-slate-600 leading-relaxed">
              How UTVN transitions from a single-player AP verification gateway to the global universal transaction network without coordination failure.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Stage 1 */}
            <div className="p-5 bg-white border-2 border-emerald-500 rounded-2xl space-y-3 relative shadow-md">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-emerald-700 uppercase">Stage 01 (Day 1)</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">THE WEDGE</span>
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Payment-Before-Release AP Sentinel</h4>
              <p className="text-slate-600 leading-relaxed">
                <strong className="text-slate-800">Target:</strong> Enterprise Buyer Treasury alone.
                <br /><strong className="text-slate-800">Adoption:</strong> 1 Buyer installs plugin. 0 vendors needed.
                <br /><strong className="text-slate-800">Value Prop:</strong> Stops 100% of Business Email Compromise (BEC), bank account fraud, and duplicate invoice wires before cash leaves the account.
              </p>
              <div className="pt-2 border-t border-slate-100 text-[11px] text-emerald-700 font-mono font-semibold">
                Immediate standalone ROI. Payback in 1 prevented fraud incident.
              </div>
            </div>

            {/* Stage 2 */}
            <div className="p-5 bg-white border border-slate-200 rounded-2xl space-y-3 relative shadow-xs">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-slate-500 uppercase">Stage 02 (Month 6)</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">PULL FACTOR</span>
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Vendor Self-Service Pre-Verification</h4>
              <p className="text-slate-600 leading-relaxed">
                <strong className="text-slate-800">Incentive:</strong> Suppliers notice invoices get cleared in 24 hours if their bank account is pre-registered on UTVN.
                <br /><strong className="text-slate-800">Expansion:</strong> Suppliers create free portal accounts to upload e-invoices directly and get paid 15 days faster (Dynamic Discounting).
              </p>
              <div className="pt-2 border-t border-slate-100 text-[11px] text-emerald-700 font-mono font-semibold">
                Suppliers join willingly for faster cash flow, not forced compliance.
              </div>
            </div>

            {/* Stage 3 */}
            <div className="p-5 bg-white border border-slate-200 rounded-2xl space-y-3 relative shadow-xs">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-slate-500 uppercase">Stage 03 (Year 1)</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">BANK RAIL</span>
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Corporate Bank Clearing Gateway</h4>
              <p className="text-slate-600 leading-relaxed">
                <strong className="text-slate-800">Partnership:</strong> Commercial settlement banks (HDFC, ICICI, Citi) integrate UTVN Verified Payment Instruction (VPI) tokens.
                <br /><strong className="text-slate-800">Value Prop:</strong> Banks offer lower wire fees and zero-liability fraud guarantees on all pre-verified UTVN payment batches.
              </p>
              <div className="pt-2 border-t border-slate-100 text-[11px] text-emerald-700 font-mono font-semibold">
                Banks become primary distribution channels to their corporate clients.
              </div>
            </div>

            {/* Stage 4 */}
            <div className="p-5 bg-white border border-slate-200 rounded-2xl space-y-3 relative shadow-xs">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-slate-500 uppercase">Stage 04 (Year 2+)</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">FULL NETWORK</span>
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Universal Transaction Verification Network</h4>
              <p className="text-slate-600 leading-relaxed">
                <strong className="text-slate-800">End State:</strong> Over 10,000 enterprise buyers, 200,000 suppliers, and 12 banks are connected.
                <br /><strong className="text-slate-800">Flywheel:</strong> New suppliers joining for Customer A are already verified for Customers B, C, and D. The Universal Transaction ID becomes the global B2B clearing standard.
              </p>
              <div className="pt-2 border-t border-slate-100 text-[11px] text-emerald-700 font-mono font-semibold">
                True network defensibility achieved without the Day 1 cold start.
              </div>
            </div>
          </div>

          {/* Practical Next Step Guidance */}
          <div className="p-5 bg-white border border-slate-200 rounded-2xl space-y-3 shadow-sm">
            <h4 className="font-bold text-slate-900 text-sm">
              The Minimum Sellable Product (MSP) for India Launch
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-slate-700 text-xs">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 block">1. Who to Call:</span>
                Head of Accounts Payable / CFO of mid-to-large Indian infrastructure, manufacturing, and pharma firms processing &gt;1,000 invoices/month.
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 block">2. The 10-Second Pitch:</span>
                "We plug into your SAP/Tally payment export. Before you hit send on today's ₹50 Crore NEFT batch, we verify that the destination bank accounts actually belong to your vendors and that the GST IRNs aren't duplicates."
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 block">3. The 1-Day Trial:</span>
                Run in shadow mode against last month's cleared payments. Show them the exact duplicate payments and bank-change vulnerabilities their current ERP failed to catch.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
