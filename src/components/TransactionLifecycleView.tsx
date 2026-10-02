import React, { useState } from 'react';
import { 
  CheckCircle2, ArrowRight, ShieldCheck, AlertTriangle, ShieldAlert,
  Play, RefreshCw, FileText, Check, AlertCircle, Landmark, Key,
  Lock, Hash, ArrowDown, ChevronRight, CornerDownRight
} from 'lucide-react';
import { UniversalTransaction, RiskLevel } from '../types/utvn';
import { evaluateTransactionFraud } from '../utils/fraudEngine';
import { generateUTID, generateIRN, computeBlockHash } from '../utils/cryptoSim';

interface TransactionLifecycleViewProps {
  onTransactionCreated?: (tx: UniversalTransaction) => void;
}

export const TransactionLifecycleView: React.FC<TransactionLifecycleViewProps> = ({
  onTransactionCreated,
}) => {
  // Active pipeline stage (1 to 8)
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [activeScenario, setActiveScenario] = useState<'clean' | 'bank_fraud' | 'overbilling' | 'duplicate_irn'>('clean');

  // Interactive Form / Scenario State
  const [poAmount, setPoAmount] = useState<number>(4500000);
  const [invoiceAmount, setInvoiceAmount] = useState<number>(4500000);
  const [poQty, setPoQty] = useState<number>(50);
  const [invQty, setInvQty] = useState<number>(50);
  const [receivedQty, setReceivedQty] = useState<number>(50);
  const [bankAccount, setBankAccount] = useState<string>('000405001928');
  const [bankAccountModified, setBankAccountModified] = useState<boolean>(false);
  const [nameMatchScore, setNameMatchScore] = useState<number>(99.6);
  const [duplicateIrnFlag, setDuplicateIrnFlag] = useState<boolean>(false);
  const [kycVerified, setKycVerified] = useState<boolean>(true);

  // Generated identifiers
  const [currentUtid] = useState<string>(generateUTID('IND'));
  const [currentPoId, setCurrentPoId] = useState<string>('PO-2026-LNT-99014');
  const [currentInvId, setCurrentInvId] = useState<string>('INV-2026-TS-04128');
  const [currentGrnId] = useState<string>('GRN-2026-MUM-8812');
  const [currentIrn, setCurrentIrn] = useState<string>(
    generateIRN('20AAACT2702H1ZZ', '04128')
  );

  // Scenario quick selector
  const loadScenario = (scenario: 'clean' | 'bank_fraud' | 'overbilling' | 'duplicate_irn') => {
    setActiveScenario(scenario);
    setCurrentStep(1);
    if (scenario === 'clean') {
      setPoAmount(4500000);
      setInvoiceAmount(4500000);
      setPoQty(50);
      setInvQty(50);
      setReceivedQty(50);
      setBankAccount('000405001928');
      setBankAccountModified(false);
      setNameMatchScore(99.6);
      setDuplicateIrnFlag(false);
      setKycVerified(true);
      setCurrentInvId('INV-2026-TS-04128');
      setCurrentIrn(generateIRN('20AAACT2702H1ZZ', '04128'));
    } else if (scenario === 'bank_fraud') {
      setPoAmount(4500000);
      setInvoiceAmount(4500000);
      setPoQty(50);
      setInvQty(50);
      setReceivedQty(50);
      setBankAccount('99881100223344'); // Fraud account
      setBankAccountModified(true);
      setNameMatchScore(21.4); // Mismatch!
      setDuplicateIrnFlag(false);
      setKycVerified(true);
      setCurrentInvId('INV-2026-TS-TAMPER');
      setCurrentIrn(generateIRN('20AAACT2702H1ZZ', 'TAMPER'));
    } else if (scenario === 'overbilling') {
      setPoAmount(4500000);
      setInvoiceAmount(5400000); // 20% overbilled
      setPoQty(50);
      setInvQty(60); // Invoiced 60 vs 50 received
      setReceivedQty(50);
      setBankAccount('000405001928');
      setBankAccountModified(false);
      setNameMatchScore(99.6);
      setDuplicateIrnFlag(false);
      setKycVerified(true);
      setCurrentInvId('INV-2026-TS-OVERBILL');
      setCurrentIrn(generateIRN('20AAACT2702H1ZZ', 'OVERBILL'));
    } else if (scenario === 'duplicate_irn') {
      setPoAmount(4500000);
      setInvoiceAmount(4500000);
      setPoQty(50);
      setInvQty(50);
      setReceivedQty(0);
      setBankAccount('000405001928');
      setBankAccountModified(false);
      setNameMatchScore(99.6);
      setDuplicateIrnFlag(true);
      setKycVerified(false);
      setCurrentInvId('INV-2026-0941-REISSUE');
      setCurrentIrn('b7c3d9a1f4e8201b5a92cf6481023a9b1c5e6f7d8a90123456789abcdef01234'); // already spent!
    }
  };

  // Evaluate current transaction through the 16-point fraud engine
  const currentEvaluation = evaluateTransactionFraud({
    utid: currentUtid,
    purchaseOrderId: currentPoId,
    invoiceId: currentInvId,
    totalAmount: invoiceAmount,
    currency: 'INR',
    buyer: {
      id: 'ORG-BYR-1004',
      legalName: 'Larsen & Toubro Heavy Infrastructure Ltd',
      country: 'India',
      taxId: '27AAACL0149R1Z1',
      corporateRegistryId: 'L99999MH1946PLC004768',
      riskScore: 3,
      kycStatus: 'VERIFIED',
      bankAccounts: [],
      authorizedSignatories: [],
      tenureMonths: 48,
      totalVolumeProcessed: 900000000
    },
    seller: {
      id: 'ORG-SUP-3091',
      legalName: 'Tata Steel Industrial Products Ltd',
      country: 'India',
      taxId: '20AAACT2702H1ZZ',
      corporateRegistryId: 'L27100MH1907PLC000260',
      riskScore: kycVerified ? 3 : 85,
      kycStatus: kycVerified ? 'VERIFIED' : 'SUSPENDED',
      bankAccounts: [],
      authorizedSignatories: [],
      tenureMonths: 48,
      totalVolumeProcessed: 900000000
    },
    lineItems: [
      {
        id: 'LI-SIM-01',
        description: 'Structural Steel Hollow Sections Grade E350',
        hsnOrSacCode: '73066100',
        poQuantity: poQty,
        invoiceQuantity: invQty,
        receivedQuantity: receivedQty,
        unitPrice: 90000,
        taxRatePercent: 18,
        poTotal: poAmount,
        invoiceTotal: invoiceAmount,
        currency: 'INR',
        matchStatus: invQty !== poQty ? 'QTY_MISMATCH' : invoiceAmount !== poAmount ? 'PRICE_MISMATCH' : 'EXACT_MATCH'
      }
    ],
    taxInfo: {
      regime: 'INDIA_GST',
      sellerGstin: '20AAACT2702H1ZZ',
      buyerGstin: '27AAACL0149R1Z1',
      irn: currentIrn,
      taxAmount: invoiceAmount * 0.18,
      isTaxPortalVerified: !duplicateIrnFlag,
      taxDiscrepancyNotes: duplicateIrnFlag ? 'DUPLICATE_IRN_DETECTED_ON_IRP_PORTAL' : undefined
    },
    paymentDetails: {
      paymentId: 'PAY-SIM-9921',
      paymentRail: 'RTGS',
      beneficiaryAccount: bankAccount,
      beneficiaryIfscOrIban: 'ICIC0000004',
      beneficiaryName: bankAccountModified ? 'Offshore Diverted Shell Ltd' : 'Tata Steel Industrial Products Ltd',
      nameMatchConfidence: nameMatchScore,
      bankAccountChangeDetected: bankAccountModified,
      previousAccount: '000405001928 (Verified ICICI Master)',
      status: currentStep >= 7 ? (bankAccountModified || duplicateIrnFlag ? 'BLOCKED' : 'RELEASED') : 'PENDING_APPROVAL'
    }
  });

  const steps = [
    {
      num: 1,
      title: 'Buyer Creates Purchase Order',
      desc: 'Generates immutable Purchase ID linked to authorized Delegation of Authority (DoA).',
      actor: 'Buyer (L&T ERP)'
    },
    {
      num: 2,
      title: 'Seller Accepts & Links Invoice',
      desc: 'Seller counter-signs PO and generates Invoice ID cryptographically linked to Purchase ID.',
      actor: 'Seller (Tata Steel)'
    },
    {
      num: 3,
      title: 'E-Invoice IRN & Tax Cross-Check',
      desc: 'Validates 64-char IRN with National Tax Portal (NIC/IRP) & verifies cryptographic signature.',
      actor: 'Tax Authority Gateway'
    },
    {
      num: 4,
      title: 'Goods/Service Delivery Confirmed',
      desc: 'Physical weighbridge, RFID scan & geofenced Goods Receipt Note (GRN) synchronized.',
      actor: 'Warehouse Receiver'
    },
    {
      num: 5,
      title: 'Payment Destination & Account Ownership',
      desc: 'Penny-drop API & NPCI verification check beneficiary account history & name match.',
      actor: 'Bank Clearinghouse'
    },
    {
      num: 6,
      title: '16-Point AI & Rule Fraud Risk Engine',
      desc: 'Deterministic rules, graph topology, ML anomaly & document forensics run concurrently.',
      actor: 'UTVN Sentinel'
    },
    {
      num: 7,
      title: 'Transaction Approval / Block Verdict',
      desc: 'Automated clearance or lock based on explainable risk score and policy threshold.',
      actor: 'CFO Dual-Key Gate'
    },
    {
      num: 8,
      title: 'Payment Settlement & Cryptographic Hash',
      desc: 'Payment executed on RTGS/NEFT rail; immutable Merkle audit block recorded.',
      actor: 'Settlement Rail'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Controller Bar */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-mono text-blue-400 font-semibold block uppercase tracking-wider">
              Interactive 4-Way Matching & Verification Simulator
            </span>
            <h2 className="text-lg font-bold text-white">
              End-to-End B2B Transaction Lifecycle Pipeline
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Step through the verification sequence or inject live fraud vectors to observe the engine's automated defenses.
            </p>
          </div>

          {/* Preset Fraud Vectors */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 border border-slate-800 rounded-lg text-xs overflow-x-auto">
            <span className="text-slate-400 px-2 font-medium">Test Scenario:</span>
            <button
              onClick={() => loadScenario('clean')}
              className={`px-3 py-1.5 rounded-md font-semibold whitespace-nowrap transition-colors ${
                activeScenario === 'clean'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Golden Path (Verified)
            </button>
            <button
              onClick={() => loadScenario('bank_fraud')}
              className={`px-3 py-1.5 rounded-md font-semibold whitespace-nowrap transition-colors ${
                activeScenario === 'bank_fraud'
                  ? 'bg-rose-950 text-rose-300 border border-rose-800'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Bank Change Attack
            </button>
            <button
              onClick={() => loadScenario('overbilling')}
              className={`px-3 py-1.5 rounded-md font-semibold whitespace-nowrap transition-colors ${
                activeScenario === 'overbilling'
                  ? 'bg-orange-950 text-orange-300 border border-orange-800'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Qty & Price Creep
            </button>
            <button
              onClick={() => loadScenario('duplicate_irn')}
              className={`px-3 py-1.5 rounded-md font-semibold whitespace-nowrap transition-colors ${
                activeScenario === 'duplicate_irn'
                  ? 'bg-rose-950 text-rose-300 border border-rose-800'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Duplicate IRN & Ghost
            </button>
          </div>
        </div>

        {/* Universal Transaction ID Banner */}
        <div className="p-3 bg-slate-950/80 border border-slate-800/80 rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Universal Transaction ID:</span>
            <span className="font-mono font-bold text-blue-400">{currentUtid}</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>PO: <strong className="text-slate-200 font-mono">{currentPoId}</strong></span>
            <span>Invoice: <strong className="text-slate-200 font-mono">{currentInvId}</strong></span>
            <span>GRN: <strong className="text-slate-200 font-mono">{currentGrnId}</strong></span>
          </div>
        </div>
      </div>

      {/* 8-Step Interactive Pipeline Progress Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 overflow-x-auto">
        <div className="flex items-center justify-between min-w-[750px] relative">
          {/* Connector line */}
          <div className="absolute left-6 right-6 top-4 h-0.5 bg-slate-800 -z-0" />
          
          {steps.map((step) => {
            const isCompleted = currentStep > step.num;
            const isCurrent = currentStep === step.num;
            
            return (
              <button
                key={step.num}
                onClick={() => setCurrentStep(step.num)}
                className="flex flex-col items-center group relative z-10 focus:outline-none"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs font-bold transition-all ${
                  isCompleted
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/50'
                    : isCurrent
                    ? 'bg-blue-600 text-white ring-4 ring-blue-500/20 shadow-md shadow-blue-900/50'
                    : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700'
                }`}>
                  {isCompleted ? <Check className="w-4 h-4" /> : step.num}
                </div>
                <span className={`text-[10px] mt-2 font-medium text-center max-w-[85px] leading-tight ${
                  isCurrent ? 'text-blue-400 font-semibold' : 'text-slate-400 group-hover:text-slate-200'
                }`}>
                  {step.title.split(' ')[0]} {step.title.split(' ')[1]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Step Detail Stage View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Step Interactive Inspection */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-mono text-blue-400 font-bold uppercase">
                  Stage {currentStep} of 8: {steps[currentStep - 1].actor}
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">
                  {steps[currentStep - 1].title}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {steps[currentStep - 1].desc}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  disabled={currentStep === 1}
                  onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
                  className="px-3 py-1.5 text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  disabled={currentStep === 8}
                  onClick={() => setCurrentStep(prev => Math.min(8, prev + 1))}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 shadow-sm shadow-blue-600/30"
                >
                  Next Stage
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Stage-specific interactive controls */}
            {currentStep === 1 && (
              <div className="space-y-4 pt-2 border-t border-slate-800 text-xs">
                <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-lg space-y-3">
                  <h4 className="font-semibold text-slate-200">Buyer ERP Purchase Order Dispatch</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-slate-500 block">Buyer Legal Entity:</span>
                      <span className="text-slate-200 font-medium">Larsen & Toubro Heavy Civil Ltd</span>
                      <span className="text-slate-500 block text-[10px]">CIN: L99999MH1946PLC004768</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Designated Supplier:</span>
                      <span className="text-slate-200 font-medium">Tata Steel Industrial Products Ltd</span>
                      <span className="text-slate-500 block text-[10px]">GSTIN: 20AAACT2702H1ZZ</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-800/80">
                    <div>
                      <label className="text-slate-500 block">PO Order Quantity (MT):</label>
                      <input
                        type="number"
                        value={poQty}
                        onChange={(e) => setPoQty(Number(e.target.value))}
                        className="w-full mt-1 bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-200 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-slate-500 block">Approved PO Budget (INR):</label>
                      <input
                        type="number"
                        value={poAmount}
                        onChange={(e) => setPoAmount(Number(e.target.value))}
                        className="w-full mt-1 bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-200 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-slate-500 block">Signatory Authority:</label>
                      <div className="mt-1 font-mono text-emerald-400 font-semibold pt-1">
                        DoA Approved (₹10M Limit)
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4 pt-2 border-t border-slate-800 text-xs">
                <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-lg space-y-3">
                  <h4 className="font-semibold text-slate-200">Seller Invoicing & Purchase Order Acceptance</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-slate-500 block">Invoice Number:</label>
                      <input
                        type="text"
                        value={currentInvId}
                        onChange={(e) => setCurrentInvId(e.target.value)}
                        className="w-full mt-1 bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-200 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-slate-500 block">Invoiced Billed Quantity (MT):</label>
                      <input
                        type="number"
                        value={invQty}
                        onChange={(e) => setInvQty(Number(e.target.value))}
                        className={`w-full mt-1 bg-slate-900 border rounded px-2.5 py-1 font-mono ${
                          invQty !== poQty ? 'border-amber-500 text-amber-300 font-bold' : 'border-slate-700 text-slate-200'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-slate-500 block">Invoiced Amount (INR):</label>
                      <input
                        type="number"
                        value={invoiceAmount}
                        onChange={(e) => setInvoiceAmount(Number(e.target.value))}
                        className={`w-full mt-1 bg-slate-900 border rounded px-2.5 py-1 font-mono ${
                          invoiceAmount !== poAmount ? 'border-amber-500 text-amber-300 font-bold' : 'border-slate-700 text-slate-200'
                        }`}
                      />
                    </div>
                    <div>
                      <span className="text-slate-500 block">Linked Reference Integrity:</span>
                      <div className="mt-1 font-mono text-blue-400 font-semibold pt-1">
                        Bound to {currentPoId} via UTID
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4 pt-2 border-t border-slate-800 text-xs">
                <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-slate-200">E-Invoicing Government Tax Verification</h4>
                    <span className={`font-mono font-semibold ${
                      !duplicateIrnFlag ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {!duplicateIrnFlag ? 'IRP NIC SIGNATURE VALID' : 'IRN COLLISION / TAMPERED'}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <span className="text-slate-500 block">64-Character Invoice Reference Number (IRN):</span>
                    <div className="p-2.5 bg-slate-900 border border-slate-800 rounded font-mono text-[11px] text-blue-300 break-all select-all">
                      {currentIrn}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                      <input
                        type="checkbox"
                        checked={duplicateIrnFlag}
                        onChange={(e) => setDuplicateIrnFlag(e.target.checked)}
                        className="rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-0"
                      />
                      <span>Simulate Recycled / Duplicate IRN Collision</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-4 pt-2 border-t border-slate-800 text-xs">
                <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-lg space-y-3">
                  <h4 className="font-semibold text-slate-200">Goods Receipt Note (GRN) & Physical Fulfillment</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-slate-500 block">Physical Received Quantity (MT):</label>
                      <input
                        type="number"
                        value={receivedQty}
                        onChange={(e) => setReceivedQty(Number(e.target.value))}
                        className={`w-full mt-1 bg-slate-900 border rounded px-2.5 py-1 font-mono ${
                          receivedQty < invQty ? 'border-rose-500 text-rose-300 font-bold' : 'border-slate-700 text-slate-200'
                        }`}
                      />
                    </div>
                    <div>
                      <span className="text-slate-500 block">Weighbridge & RFID:</span>
                      <span className="font-medium text-emerald-400 block mt-2">Verified at Gate 4B</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Receiving Inspector:</span>
                      <span className="text-slate-200 block mt-2 font-mono">Vikram Joshi (QA Store)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 5 && (
              <div className="space-y-4 pt-2 border-t border-slate-800 text-xs">
                <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-slate-200">Bank Destination & Penny-Drop Account Ownership</h4>
                    {bankAccountModified ? (
                      <span className="font-mono text-rose-400 font-semibold">ACCOUNT MUTATION FLAGGED</span>
                    ) : (
                      <span className="font-mono text-emerald-400 font-semibold">VERIFIED CORPORATE ACCOUNT</span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-slate-500 block">Beneficiary Account Number:</label>
                      <input
                        type="text"
                        value={bankAccount}
                        onChange={(e) => setBankAccount(e.target.value)}
                        className={`w-full mt-1 bg-slate-900 border rounded px-2.5 py-1 font-mono ${
                          bankAccountModified ? 'border-rose-500 text-rose-300 font-bold' : 'border-slate-700 text-slate-200'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="text-slate-500 block">Bank Name Matching Score (%):</label>
                      <input
                        type="number"
                        value={nameMatchScore}
                        onChange={(e) => setNameMatchScore(Number(e.target.value))}
                        className={`w-full mt-1 bg-slate-900 border rounded px-2.5 py-1 font-mono ${
                          nameMatchScore < 85 ? 'border-rose-500 text-rose-300 font-bold' : 'border-slate-700 text-slate-200'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                      <input
                        type="checkbox"
                        checked={bankAccountModified}
                        onChange={(e) => {
                          setBankAccountModified(e.target.checked);
                          if (e.target.checked) {
                            setBankAccount('99881100223344');
                            setNameMatchScore(21.4);
                          } else {
                            setBankAccount('000405001928');
                            setNameMatchScore(99.6);
                          }
                        }}
                        className="rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-0"
                      />
                      <span>Inject Bank Account Mutation (BEC attack scenario)</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 6 && (
              <div className="space-y-4 pt-2 border-t border-slate-800 text-xs">
                <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-slate-200">16-Point Multi-Vector Engine Execution</h4>
                    <span className="font-mono text-blue-400">Score: {currentEvaluation.riskScore}/100</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div className="p-2 bg-slate-900 rounded border border-slate-800 text-center">
                      <span className="text-[10px] text-slate-500 block">Deterministic</span>
                      <span className="font-bold text-white">
                        {currentEvaluation.checks.filter(c => c.category === 'DETERMINISTIC' && c.passed).length}/8 Passed
                      </span>
                    </div>
                    <div className="p-2 bg-slate-900 rounded border border-slate-800 text-center">
                      <span className="text-[10px] text-slate-500 block">ML Anomaly</span>
                      <span className="font-bold text-white">
                        {currentEvaluation.checks.filter(c => c.category === 'ML_ANOMALY' && c.passed).length}/4 Passed
                      </span>
                    </div>
                    <div className="p-2 bg-slate-900 rounded border border-slate-800 text-center">
                      <span className="text-[10px] text-slate-500 block">Graph Topology</span>
                      <span className="font-bold text-white">
                        {currentEvaluation.checks.filter(c => c.category === 'GRAPH_ANALYSIS' && c.passed).length}/3 Passed
                      </span>
                    </div>
                    <div className="p-2 bg-slate-900 rounded border border-slate-800 text-center">
                      <span className="text-[10px] text-slate-500 block">Forensic Vision</span>
                      <span className="font-bold text-white">
                        {currentEvaluation.checks.filter(c => c.category === 'DOCUMENT_FORENSICS' && c.passed).length}/1 Passed
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 7 && (
              <div className="space-y-4 pt-2 border-t border-slate-800 text-xs">
                <div className={`p-4 rounded-lg border space-y-3 ${
                  currentEvaluation.riskLevel === 'BLOCKED'
                    ? 'bg-rose-950/40 border-rose-900/60'
                    : currentEvaluation.riskLevel === 'HIGH_RISK'
                    ? 'bg-orange-950/40 border-orange-900/60'
                    : 'bg-emerald-950/40 border-emerald-900/60'
                }`}>
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-white text-sm">
                      Automated Decision: {currentEvaluation.riskLevel}
                    </h4>
                    <span className="font-mono text-xs font-semibold">
                      Action: {currentEvaluation.recommendedAction}
                    </span>
                  </div>
                  <p className="text-slate-300">
                    {currentEvaluation.summary}
                  </p>
                </div>
              </div>
            )}

            {currentStep === 8 && (
              <div className="space-y-4 pt-2 border-t border-slate-800 text-xs">
                <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-slate-200">Settlement Execution & Tamper-Evident Ledger Log</h4>
                    <span className="font-mono text-emerald-400 font-semibold">LEDGER INVARIANT LOCKED</span>
                  </div>

                  <div className="p-3 bg-slate-900 border border-slate-800 rounded font-mono text-[11px] text-slate-300 space-y-1">
                    <div>Block Hash: <span className="text-blue-400">{computeBlockHash('0000', currentUtid, new Date().toISOString())}</span></div>
                    <div>Settlement Reference: <span className="text-emerald-400">RTGS-RBI-20261002-9901412</span></div>
                    <div>Clearance Time: <span className="text-white">1.18 seconds</span></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Live Explanatory Risk & Mathematical Diff Card */}
        <div className="space-y-4">
          {/* Real-time Risk Verdict Card */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Real-Time Risk State</span>
              <span className="font-mono text-xs font-bold text-white">
                Score: {currentEvaluation.riskScore}/100
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-lg shrink-0 ${
                currentEvaluation.riskLevel === 'BLOCKED'
                  ? 'bg-rose-500/20 text-rose-400'
                  : currentEvaluation.riskLevel === 'HIGH_RISK'
                  ? 'bg-orange-500/20 text-orange-400'
                  : currentEvaluation.riskLevel === 'NEEDS_REVIEW'
                  ? 'bg-amber-500/20 text-amber-400'
                  : 'bg-emerald-500/20 text-emerald-400'
              }`}>
                {currentEvaluation.riskLevel === 'BLOCKED' ? (
                  <ShieldAlert className="w-6 h-6" />
                ) : currentEvaluation.riskLevel === 'VERIFIED' ? (
                  <CheckCircle2 className="w-6 h-6" />
                ) : (
                  <AlertTriangle className="w-6 h-6" />
                )}
              </div>
              <div>
                <div className="text-sm font-bold text-white">
                  {currentEvaluation.riskLevel}
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  {currentEvaluation.criticalFlagsCount} Critical · {currentEvaluation.highFlagsCount} High Flags
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800 text-[11px] text-slate-300">
              <div className="font-semibold text-slate-200 mb-1">Explainable Reason:</div>
              {currentEvaluation.summary}
            </div>

            {/* Reconciliation mathematical diff counters */}
            <div className="space-y-2 pt-2 border-t border-slate-800 text-xs font-mono">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Amount Variance:</span>
                <span className={invoiceAmount !== poAmount ? 'text-amber-400 font-bold' : 'text-slate-300'}>
                  {invoiceAmount === poAmount ? '0.00 INR (0%)' : `${(invoiceAmount - poAmount).toLocaleString()} INR (${(((invoiceAmount - poAmount)/poAmount)*100).toFixed(1)}%)`}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Quantity Delta:</span>
                <span className={invQty !== receivedQty ? 'text-rose-400 font-bold' : 'text-slate-300'}>
                  {invQty === receivedQty ? '0 MT Match' : `${invQty - receivedQty} MT Unreceived`}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Beneficiary Match:</span>
                <span className={nameMatchScore < 85 ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                  {nameMatchScore}% Match
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">E-Invoice IRP Status:</span>
                <span className={duplicateIrnFlag ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                  {duplicateIrnFlag ? 'DUPLICATE' : 'VERIFIED'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
