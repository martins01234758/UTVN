import React, { useState } from 'react';
import { 
  GitFork, CheckCircle2, AlertTriangle, ShieldAlert, ShieldCheck, 
  UserCheck, Store, FileText, FileCheck2, Truck, QrCode, 
  Landmark, ArrowRight, Copy, Check, Lock, AlertCircle, RefreshCw,
  ArrowDown, ChevronRight, Play, SlidersHorizontal, Scale, Shield
} from 'lucide-react';
import { UniversalTransaction, RiskLevel } from '../types/utvn';

interface TransactionTreeViewProps {
  transactions: UniversalTransaction[];
  onSelectTransaction?: (tx: UniversalTransaction) => void;
}

export const TransactionTreeView: React.FC<TransactionTreeViewProps> = ({
  transactions,
  onSelectTransaction,
}) => {
  const [selectedTxId, setSelectedTxId] = useState<string>(transactions[0]?.utid || '');
  const [selectedNodeKey, setSelectedNodeKey] = useState<string>('root');
  const [severedBranches, setSeveredBranches] = useState<Record<string, boolean>>({});
  const [copiedTree, setCopiedTree] = useState(false);
  
  // View Mode: 'decision_gate' (TXN-928371 PAY/HOLD) vs 'structural_tree' (8 Invariant UTID Tree)
  const [treeViewMode, setTreeViewMode] = useState<'decision_gate' | 'structural_tree'>('decision_gate');

  // Interactive 8-Point Gate Verification State for TXN-928371
  const [gateChecks, setGateChecks] = useState({
    verifiedBuyer: true,
    verifiedSeller: true,
    authorizedPurchase: true,
    validInvoice: true,
    goodsConfirmed: true,
    correctAmount: true,
    verifiedBankAccount: true,
    paymentAuthorized: true,
  });

  const [paymentDisbursed, setPaymentDisbursed] = useState(false);
  const [holdEscalated, setHoldEscalated] = useState(false);

  const toggleGate = (key: keyof typeof gateChecks) => {
    setGateChecks(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    setPaymentDisbursed(false);
    setHoldEscalated(false);
  };

  const allGatesPassed = Object.values(gateChecks).every(Boolean);
  const decisionResult = allGatesPassed ? 'PAY' : 'HOLD';

  const applyPreset = (preset: 'clean' | 'bank_fraud' | 'amount_mismatch' | 'unconfirmed_goods' | 'unauthorized_purchase') => {
    setPaymentDisbursed(false);
    setHoldEscalated(false);
    if (preset === 'clean') {
      setGateChecks({
        verifiedBuyer: true,
        verifiedSeller: true,
        authorizedPurchase: true,
        validInvoice: true,
        goodsConfirmed: true,
        correctAmount: true,
        verifiedBankAccount: true,
        paymentAuthorized: true,
      });
    } else if (preset === 'bank_fraud') {
      setGateChecks({
        verifiedBuyer: true,
        verifiedSeller: true,
        authorizedPurchase: true,
        validInvoice: true,
        goodsConfirmed: true,
        correctAmount: true,
        verifiedBankAccount: false, // Bank account mutated!
        paymentAuthorized: true,
      });
    } else if (preset === 'amount_mismatch') {
      setGateChecks({
        verifiedBuyer: true,
        verifiedSeller: true,
        authorizedPurchase: true,
        validInvoice: true,
        goodsConfirmed: true,
        correctAmount: false, // Discrepancy!
        verifiedBankAccount: true,
        paymentAuthorized: true,
      });
    } else if (preset === 'unconfirmed_goods') {
      setGateChecks({
        verifiedBuyer: true,
        verifiedSeller: true,
        authorizedPurchase: true,
        validInvoice: true,
        goodsConfirmed: false, // Phantom delivery!
        correctAmount: true,
        verifiedBankAccount: true,
        paymentAuthorized: true,
      });
    } else if (preset === 'unauthorized_purchase') {
      setGateChecks({
        verifiedBuyer: true,
        verifiedSeller: true,
        authorizedPurchase: false, // Rogue PO without DoA!
        validInvoice: true,
        goodsConfirmed: true,
        correctAmount: true,
        verifiedBankAccount: true,
        paymentAuthorized: false,
      });
    }
  };

  const currentTx = transactions.find(t => t.utid === selectedTxId) || transactions[0];

  const toggleSeverBranch = (branchKey: string) => {
    setSeveredBranches(prev => ({
      ...prev,
      [branchKey]: !prev[branchKey]
    }));
  };

  const isAnySevered = Object.values(severedBranches).some(Boolean);

  // The 8 Canonical Branches matching the User's exact Tree Structure
  const treeNodes = [
    {
      key: 'buyer',
      title: 'Buyer ID',
      idValue: currentTx.buyer.id,
      label: currentTx.buyer.legalName,
      subtext: `Tax: ${currentTx.buyer.taxId} · Registry: ${currentTx.buyer.corporateRegistryId}`,
      icon: UserCheck,
      status: currentTx.buyer.kycStatus === 'VERIFIED' ? 'VERIFIED' : 'FAILED',
      evidence: [
        { label: 'Corporate Registry ID', value: currentTx.buyer.corporateRegistryId },
        { label: 'Legal Entity Identifier (LEI)', value: currentTx.buyer.lei || 'GLEIF-335800QW9V620W9M1050' },
        { label: 'Tax Registration (GSTIN/VAT)', value: currentTx.buyer.taxId },
        { label: 'Authorized Signatory', value: currentTx.buyer.authorizedSignatories[0]?.name || 'Authorized Signatory' },
        { label: 'Delegation of Authority (DoA)', value: `Class 1 VP Signing Limit (${currentTx.currency} ${currentTx.buyer.authorizedSignatories[0]?.signingLimit.toLocaleString()})` },
        { label: 'Authentication Proof', value: 'Hardware FIDO2 Passkey + SAML SSO' }
      ]
    },
    {
      key: 'seller',
      title: 'Seller ID',
      idValue: currentTx.seller.id,
      label: currentTx.seller.legalName,
      subtext: `Tax: ${currentTx.seller.taxId} · Tenure: ${currentTx.seller.tenureMonths} Mo`,
      icon: Store,
      status: currentTx.seller.kycStatus === 'VERIFIED' ? 'VERIFIED' : 'FAILED',
      evidence: [
        { label: 'Corporate Registry ID', value: currentTx.seller.corporateRegistryId },
        { label: 'Tax ID (GSTIN/VAT)', value: currentTx.seller.taxId },
        { label: 'Beneficial Owner (UBO)', value: 'Verified 100% via MCA21 Corporate Filing' },
        { label: 'Digital Signature (DSC)', value: 'Class 3 X.509 Cryptographic Token Valid' },
        { label: 'Historical Network Volume', value: `${currentTx.currency} ${currentTx.seller.totalVolumeProcessed.toLocaleString()}` },
        { label: 'Corridor Risk Score', value: `${currentTx.seller.riskScore}/100` }
      ]
    },
    {
      key: 'purchase',
      title: 'Purchase ID',
      idValue: currentTx.purchaseId || 'PR-2026-LT-09141',
      label: 'Internal Requisition & Cost Center Allocation',
      subtext: `Budget Authority: CAPEX FY26 · Currency: ${currentTx.currency}`,
      icon: FileText,
      status: 'VERIFIED',
      evidence: [
        { label: 'Requisition Identifier', value: currentTx.purchaseId || 'PR-2026-LT-09141' },
        { label: 'Internal Cost Center', value: 'CC-9014 (Civil Heavy Projects Division)' },
        { label: 'Budget Commitment', value: `${currentTx.currency} ${currentTx.totalAmount.toLocaleString()} Approved` },
        { label: 'Delegation Check', value: 'Complies with Corporate Procurement Policy 4.2' },
        { label: 'Requisition Timestamp', value: currentTx.poIssueDate }
      ]
    },
    {
      key: 'po',
      title: 'PO ID',
      idValue: currentTx.purchaseOrderId,
      label: 'Binding Enterprise Purchase Order',
      subtext: `Issued: ${currentTx.poIssueDate} · Terms: ${currentTx.paymentTerms}`,
      icon: FileCheck2,
      status: currentTx.purchaseOrderId.includes('DUP') ? 'FAILED' : 'VERIFIED',
      evidence: [
        { label: 'Purchase Order Reference', value: currentTx.purchaseOrderId },
        { label: 'Contracted Line Items', value: `${currentTx.lineItems.length} Verified Lines` },
        { label: 'Total PO Baseline Value', value: `${currentTx.currency} ${(currentTx.lineItems.reduce((s,i) => s + i.poTotal, 0)).toLocaleString()}` },
        { label: 'Delivery Deadline', value: 'Net 15 Days from Dispatch' },
        { label: 'ERP Connector Anchor', value: 'SAP S/4HANA PO Document 45009182' }
      ]
    },
    {
      key: 'invoice',
      title: 'Invoice ID',
      idValue: currentTx.invoiceId,
      label: 'Commercial Tax Invoice',
      subtext: `Billed: ${currentTx.totalAmount.toLocaleString()} ${currentTx.currency}`,
      icon: FileText,
      status: currentTx.lineItems.some(i => i.matchStatus !== 'EXACT_MATCH') || currentTx.invoiceId.includes('TAMPER') ? 'FAILED' : 'VERIFIED',
      evidence: [
        { label: 'Invoice Reference Number', value: currentTx.invoiceId },
        { label: 'Invoice Issuance Date', value: currentTx.invoiceDate },
        { label: 'Gross Invoice Amount', value: `${currentTx.currency} ${currentTx.totalAmount.toLocaleString()}` },
        { label: 'Mathematical Reconciliation', value: currentTx.lineItems.every(i => i.matchStatus === 'EXACT_MATCH') ? '0.00% Variance (Exact Match)' : 'Discrepancy Detected' },
        { label: 'Payment Terms Bound', value: currentTx.paymentTerms }
      ]
    },
    {
      key: 'delivery',
      title: 'Delivery/Service confirmation',
      idValue: currentTx.deliveryConfirmation?.receiptId || 'GRN-PENDING',
      label: currentTx.deliveryConfirmation?.warehouseLocation || 'Physical Goods Receipt Note (GRN)',
      subtext: `Inspector: ${currentTx.deliveryConfirmation?.receivedBy || 'Pending'} · Status: ${currentTx.deliveryConfirmation?.inspectionStatus || 'Uninspected'}`,
      icon: Truck,
      status: currentTx.deliveryConfirmation?.inspectionStatus === 'ACCEPTED' ? 'VERIFIED' : 'FAILED',
      evidence: [
        { label: 'Goods Receipt Note (GRN)', value: currentTx.deliveryConfirmation?.receiptId || 'GRN-2026-MUM-48201' },
        { label: 'Physical Receiving Gate', value: currentTx.deliveryConfirmation?.warehouseLocation || 'Site Yard 4B' },
        { label: 'Receiving Inspector Officer', value: currentTx.deliveryConfirmation?.receivedBy || 'Store Quality Engineer' },
        { label: 'IoT / Weighbridge Confirmation', value: currentTx.deliveryConfirmation?.geofenceVerified ? 'Geofenced Weighbridge Verified' : 'Manual Tally' },
        { label: 'Waybill / Logistics Tracking', value: currentTx.deliveryConfirmation?.trackingNumber || 'TRK-TATA-LOG-90412' }
      ]
    },
    {
      key: 'tax',
      title: 'Tax/IRN reference',
      idValue: currentTx.taxInfo.irn ? `${currentTx.taxInfo.irn.substring(0, 24)}...` : 'TAX-ACK-0914',
      label: currentTx.taxInfo.regime === 'INDIA_GST' ? 'Government IRP 64-Char Hash' : 'Peppol BIS 3.0 UBL Identifier',
      subtext: `Portal Verified: ${currentTx.taxInfo.isTaxPortalVerified ? 'YES' : 'REJECTED'} · Tax: ${currentTx.currency} ${currentTx.taxInfo.taxAmount.toLocaleString()}`,
      icon: QrCode,
      status: currentTx.taxInfo.isTaxPortalVerified ? 'VERIFIED' : 'FAILED',
      evidence: [
        { label: 'E-Invoice Standard', value: currentTx.taxInfo.regime === 'INDIA_GST' ? 'National Tax Portal (IRP/NIC)' : 'OpenPEPPOL BIS 3.0' },
        { label: '64-Character IRN Hash', value: currentTx.taxInfo.irn || 'N/A' },
        { label: 'IRP Acknowledgement No', value: currentTx.taxInfo.irnAckNo || '112610940192' },
        { label: 'Digital QR Code Payload', value: currentTx.taxInfo.qrCodePayload ? 'Cryptographically Signed by NIC' : 'Standard UBL Digest' },
        { label: 'Portal Signature Status', value: currentTx.taxInfo.isTaxPortalVerified ? 'Cryptographically Validated' : 'Signature Invalid / Duplicate' }
      ]
    },
    {
      key: 'payment',
      title: 'Payment reference',
      idValue: currentTx.paymentDetails.paymentId,
      label: `${currentTx.paymentDetails.paymentRail} · Acc: ${currentTx.paymentDetails.beneficiaryAccount}`,
      subtext: `Beneficiary Match: ${currentTx.paymentDetails.nameMatchConfidence}% · Status: ${currentTx.paymentDetails.status}`,
      icon: Landmark,
      status: !currentTx.paymentDetails.bankAccountChangeDetected && currentTx.paymentDetails.nameMatchConfidence > 85 ? 'VERIFIED' : 'FAILED',
      evidence: [
        { label: 'Payment Instruction Token', value: currentTx.paymentDetails.paymentId },
        { label: 'Settlement Rail', value: `${currentTx.paymentDetails.paymentRail} (Direct RTGS/NEFT/ACH)` },
        { label: 'Destination Account Number', value: currentTx.paymentDetails.beneficiaryAccount },
        { label: 'IFSC / Routing Code', value: currentTx.paymentDetails.beneficiaryIfscOrIban },
        { label: 'Bank Penny-Drop Name Match', value: `${currentTx.paymentDetails.nameMatchConfidence}% Confirmed` },
        { label: 'Account Mutation Audit', value: currentTx.paymentDetails.bankAccountChangeDetected ? 'UNVERIFIED BANK CHANGE FLAGGED' : 'Verified Master Account (No Changes)' },
        { label: 'Final Settlement Reference', value: currentTx.paymentDetails.settlementReference || 'PENDING_FINAL_DISBURSEMENT' }
      ]
    }
  ];

  // Selected node details for Structural Tree
  const activeNode = selectedNodeKey === 'root' 
    ? {
        title: 'Universal Transaction ID (UTID)',
        idValue: currentTx.utid,
        label: `${currentTx.buyer.legalName} → ${currentTx.seller.legalName}`,
        subtext: `Total Gross: ${currentTx.currency} ${currentTx.totalAmount.toLocaleString()} · Created: ${new Date(currentTx.createdAt).toLocaleString()}`,
        status: isAnySevered || currentTx.overallRiskLevel === 'BLOCKED' ? 'FAILED' : currentTx.overallRiskLevel === 'VERIFIED' ? 'VERIFIED' : 'REVIEW',
        evidence: [
          { label: 'Universal Transaction ID (UTID)', value: currentTx.utid },
          { label: 'Cryptographic Root Hash', value: currentTx.auditTrail[0]?.currentHash || 'SHA256:7a9c8b4e1f2a3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c' },
          { label: 'Ledger Settlement State', value: currentTx.status },
          { label: 'Composite Risk Verdict', value: isAnySevered ? 'BLOCKED (MANUAL BRANCH SEVERED)' : currentTx.overallRiskLevel },
          { label: '16-Point Anomaly Score', value: `${currentTx.riskScore}/100` },
          { label: 'Connected Branches', value: '8 of 8 Invariants Anchored' }
        ]
      }
    : treeNodes.find(n => n.key === selectedNodeKey)!;

  const copyTreeAsText = () => {
    if (treeViewMode === 'decision_gate') {
      const gateText = `TXN-928371\n│\n├── [${gateChecks.verifiedBuyer ? '✔' : '✖'}] Verified Buyer\n├── [${gateChecks.verifiedSeller ? '✔' : '✖'}] Verified Seller\n├── [${gateChecks.authorizedPurchase ? '✔' : '✖'}] Authorized Purchase\n├── [${gateChecks.validInvoice ? '✔' : '✖'}] Valid Invoice\n├── [${gateChecks.goodsConfirmed ? '✔' : '✖'}] Goods/Service Confirmed\n├── [${gateChecks.correctAmount ? '✔' : '✖'}] Correct Amount\n├── [${gateChecks.verifiedBankAccount ? '✔' : '✖'}] Verified Bank Account\n└── [${gateChecks.paymentAuthorized ? '✔' : '✖'}] Payment Authorized\n             ↓\n       ${decisionResult}`;
      navigator.clipboard.writeText(gateText);
    } else {
      const textTree = `${currentTx.utid} (Universal Transaction ID)\n│\n├── Buyer ID: ${currentTx.buyer.id} (${currentTx.buyer.legalName})\n├── Seller ID: ${currentTx.seller.id} (${currentTx.seller.legalName})\n├── Purchase ID: ${currentTx.purchaseId || 'PR-2026-LT-09141'}\n├── Invoice ID: ${currentTx.invoiceId}\n├── PO ID: ${currentTx.purchaseOrderId}\n├── Delivery/Service confirmation: ${currentTx.deliveryConfirmation?.receiptId || 'GRN-PENDING'}\n├── Tax/IRN reference: ${currentTx.taxInfo.irn || 'TAX-REF-0914'}\n└── Payment reference: ${currentTx.paymentDetails.paymentId} (Acc: ${currentTx.paymentDetails.beneficiaryAccount})`;
      navigator.clipboard.writeText(textTree);
    }
    setCopiedTree(true);
    setTimeout(() => setCopiedTree(false), 2000);
  };

  // Canonical 8 Verification Checkpoints for TXN-928371
  const decisionGateList = [
    {
      key: 'verifiedBuyer' as const,
      name: 'Verified Buyer',
      desc: 'Buyer entity verified in corporate registry (CIN/LEI), active GSTIN, no sanction flags.',
      detail: 'Larsen & Toubro Ltd · CIN: L99999MH1946PLC004768 · GSTIN: 27AAACL0149R1Z1',
      icon: UserCheck
    },
    {
      key: 'verifiedSeller' as const,
      name: 'Verified Seller',
      desc: 'Seller KYC approved, UBO ownership verified, active tax standing in good standing.',
      detail: 'Tata Steel Industrial Products Ltd · GSTIN: 20AAACT2702H1ZZ · KYC Active',
      icon: Store
    },
    {
      key: 'authorizedPurchase' as const,
      name: 'Authorized Purchase',
      desc: 'Purchase order within authorized Delegation of Authority (DoA) limit and cost center budget.',
      detail: 'PO-2026-LT-88192 · Approved by VP Procurement (DoA Cap: ₹10,000,000)',
      icon: FileCheck2
    },
    {
      key: 'validInvoice' as const,
      name: 'Valid Invoice',
      desc: 'Authentic invoice with valid 64-character IRN hash registered on Government IRP portal.',
      detail: 'INV-TS-2026-09418 · IRN: b7c3d9a1f4e8201b... · IRP Signature Valid',
      icon: QrCode
    },
    {
      key: 'goodsConfirmed' as const,
      name: 'Goods/Service Confirmed',
      desc: 'Physical Goods Receipt Note (GRN) confirmed via weighbridge, RFID scan & geofence.',
      detail: 'GRN-2026-MUM-48201 · 50 MT Steel Received at Gate 4B · QA Stamped',
      icon: Truck
    },
    {
      key: 'correctAmount' as const,
      name: 'Correct Amount',
      desc: '0% variance across PO line prices, billed invoice total, tax calculations, and receipts.',
      detail: 'PO: ₹4,100,000 + GST ₹750,000 = ₹4,850,000 · Invoice: ₹4,850,000 (Exact Match)',
      icon: Scale
    },
    {
      key: 'verifiedBankAccount' as const,
      name: 'Verified Bank Account',
      desc: 'Penny-drop API confirms destination bank account matches vendor corporate name >90%.',
      detail: 'Acc: 000405001928 (ICICI) · Name Match: 99.8% · No Recent Bank Changes',
      icon: Landmark
    },
    {
      key: 'paymentAuthorized' as const,
      name: 'Payment Authorized',
      desc: 'Dual-control maker-checker signoff completed by corporate treasury officer via MFA.',
      detail: 'Dual Signatory: VP Procurement + CFO Passkey Digital Signature Certified',
      icon: ShieldCheck
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner with Mode Selector */}
      <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-[11px] font-mono text-emerald-700 font-bold uppercase tracking-wider">
                Universal Transaction Verification Topology
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-0.5">
              {treeViewMode === 'decision_gate' ? 'TXN-928371 Verification Gate → PAY / HOLD' : 'The Universal Transaction Invariant Tree'}
            </h2>
            <p className="text-xs text-slate-600 max-w-3xl leading-relaxed mt-1">
              {treeViewMode === 'decision_gate'
                ? 'Every transaction must satisfy all eight verification checkpoints. If any single gate fails, automated settlement locks into HOLD state.'
                : 'Every B2B payment is anchored to a cryptographic root Transaction ID connecting 8 required operational branches.'}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Mode Switcher Tabs */}
            <div className="flex items-center bg-slate-100 p-1 border border-slate-200 rounded-xl text-xs">
              <button
                onClick={() => setTreeViewMode('decision_gate')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                  treeViewMode === 'decision_gate' ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Shield className="w-3.5 h-3.5 text-emerald-600" />
                TXN-928371 (PAY / HOLD Gate)
              </button>
              <button
                onClick={() => setTreeViewMode('structural_tree')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                  treeViewMode === 'structural_tree' ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <GitFork className="w-3.5 h-3.5 text-emerald-600" />
                UTID 8 Invariants Tree
              </button>
            </div>

            <button
              onClick={copyTreeAsText}
              className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              {copiedTree ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              <span>{copiedTree ? 'Copied' : 'Copy Tree'}</span>
            </button>
          </div>
        </div>

        {/* MODE 1 SUB-BAR: Presets for TXN-928371 PAY/HOLD */}
        {treeViewMode === 'decision_gate' ? (
          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              <span className="text-slate-500 font-medium">Test Attack Presets:</span>
              <button
                onClick={() => applyPreset('clean')}
                className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-semibold transition-colors"
              >
                Clean (All 8 Pass → PAY)
              </button>
              <button
                onClick={() => applyPreset('bank_fraud')}
                className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 font-semibold transition-colors"
              >
                Bank Mutation Attack → HOLD
              </button>
              <button
                onClick={() => applyPreset('amount_mismatch')}
                className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 font-semibold transition-colors"
              >
                Incorrect Amount → HOLD
              </button>
              <button
                onClick={() => applyPreset('unconfirmed_goods')}
                className="px-2.5 py-1 rounded-lg bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-800 font-semibold transition-colors"
              >
                Unconfirmed Goods → HOLD
              </button>
              <button
                onClick={() => applyPreset('unauthorized_purchase')}
                className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-800 font-semibold transition-colors"
              >
                Unauthorized Purchase → HOLD
              </button>
            </div>

            <div className="flex items-center gap-2 font-mono text-[11px]">
              <span className="text-slate-500">Gate Score:</span>
              <span className="text-slate-900 font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                {Object.values(gateChecks).filter(Boolean).length} / 8 Passed
              </span>
            </div>
          </div>
        ) : (
          /* MODE 2 SUB-BAR: Transaction Selector */
          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-600 font-medium">Select Transaction to Inspect:</span>
              <select
                value={selectedTxId}
                onChange={(e) => {
                  setSelectedTxId(e.target.value);
                  setSeveredBranches({});
                  setSelectedNodeKey('root');
                }}
                className="bg-white border border-slate-200 rounded-xl px-3 py-1 text-slate-800 font-mono font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer shadow-2xs"
              >
                {transactions.map(tx => (
                  <option key={tx.utid} value={tx.utid} className="text-slate-800">
                    {tx.utid} — {tx.buyer.tradeName || tx.buyer.legalName} ({tx.overallRiskLevel})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 text-slate-500 font-mono text-[11px]">
              <span>Current Root State:</span>
              <span className={`font-bold px-2 py-0.5 rounded border ${
                isAnySevered || currentTx.overallRiskLevel === 'BLOCKED'
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : currentTx.overallRiskLevel === 'VERIFIED'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                {isAnySevered ? 'ROOT COMPROMISED (BRANCH SEVERED)' : currentTx.overallRiskLevel}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: TXN-928371 PAY / HOLD DECISION GATE VIEW                          */}
      {/* ========================================================================= */}
      {treeViewMode === 'decision_gate' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Visual Tree & Checkpoints (7 Cols) */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                8-Point Verification Gate Hierarchy
              </h3>
              <span className="text-[11px] text-slate-500 font-mono">
                Click checkboxes to toggle verification states
              </span>
            </div>

            {/* ROOT NODE: TXN-928371 */}
            <div className="relative pl-6">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`p-1.5 rounded-lg ${
                    allGatesPassed ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                  }`}>
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-mono text-[10px] text-slate-500 uppercase block font-bold">
                      Root Transaction Entity
                    </span>
                    <span className="font-mono text-base font-bold text-slate-900 tracking-wide">
                      TXN-928371
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-mono text-xs text-slate-500 block">Corridor: INR ₹4,850,000</span>
                  <span className={`font-mono text-xs font-bold ${
                    allGatesPassed ? 'text-emerald-700' : 'text-rose-700'
                  }`}>
                    {allGatesPassed ? 'ALL INVARIANTS SATISFIED' : 'VERIFICATION FAILED'}
                  </span>
                </div>
              </div>

              {/* Tree Branches (The 8 Gates) */}
              <div className="relative pl-8 pt-3 space-y-2.5 before:absolute before:left-3 before:top-0 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {decisionGateList.map((gate, index) => {
                  const Icon = gate.icon;
                  const isPassed = gateChecks[gate.key];
                  const isLast = index === decisionGateList.length - 1;

                  return (
                    <div key={gate.key} className="relative group">
                      {/* Horizontal Connector Line */}
                      <div className="absolute -left-5 top-5 w-5 h-0.5 bg-slate-200 group-hover:bg-emerald-500 transition-colors" />

                      <div
                        onClick={() => toggleGate(gate.key)}
                        className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                          isPassed
                            ? 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                            : 'bg-rose-50/70 border-rose-200 hover:border-rose-300 text-rose-950'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <input
                              type="checkbox"
                              checked={isPassed}
                              onChange={() => toggleGate(gate.key)}
                              className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer mt-0.5"
                            />
                            <div className={`p-1.5 rounded-lg shrink-0 ${
                              isPassed ? 'bg-slate-100 text-slate-700' : 'bg-rose-100 text-rose-700'
                            }`}>
                              <Icon className="w-3.5 h-3.5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-slate-700 font-bold text-[11px]">
                                  {isLast ? '└──' : '├──'} {gate.name}
                                </span>
                              </div>
                              <div className="text-slate-500 text-[11px] mt-0.5">
                                {gate.detail}
                              </div>
                            </div>
                          </div>

                          <div className="shrink-0 text-right">
                            {isPassed ? (
                              <span className="font-mono text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded flex items-center gap-1">
                                <Check className="w-3 h-3" /> VERIFIED
                              </span>
                            ) : (
                              <span className="font-mono text-[10px] font-bold text-rose-700 bg-rose-100 border border-rose-200 px-2 py-0.5 rounded">
                                GATE FAILED
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* The Canonical Down Arrow pointing to PAY / HOLD */}
              <div className="pt-4 flex flex-col items-center justify-center space-y-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 border border-slate-300 text-slate-700 animate-bounce">
                  <ArrowDown className="w-4 h-4" />
                </div>

                {/* Final Decision Gate Box: PAY or HOLD */}
                <div className={`w-full p-4 rounded-xl border text-center transition-all ${
                  decisionResult === 'PAY'
                    ? 'bg-emerald-50 border-2 border-emerald-500 text-emerald-950 shadow-sm'
                    : 'bg-rose-50 border-2 border-rose-500 text-rose-950 shadow-sm'
                }`}>
                  <div className="font-mono text-xs uppercase text-slate-600 font-semibold tracking-wider">
                    Automated Settlement Gate Verdict
                  </div>
                  <div className={`font-mono text-2xl font-black mt-1 tracking-widest ${
                    decisionResult === 'PAY' ? 'text-emerald-700' : 'text-rose-700'
                  }`}>
                    [ {decisionResult} ]
                  </div>
                  <div className="text-xs text-slate-600 mt-1 max-w-md mx-auto">
                    {decisionResult === 'PAY'
                      ? 'All 8 checkpoints cryptographically confirmed. Funds cleared for automated execution.'
                      : `Settlement blocked: ${8 - Object.values(gateChecks).filter(Boolean).length} verification gates failed. Transaction frozen.`}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Gateway Execution & Audit Log (5 Cols) */}
          <div className="lg:col-span-5 space-y-4 text-xs">
            {/* Gate Analysis & Action Box */}
            <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-emerald-700 uppercase font-bold">
                  Payment Clearing Gateway Execution
                </span>
                <span className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded border ${
                  decisionResult === 'PAY' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}>
                  {decisionResult} GATE ACTIVE
                </span>
              </div>

              <div>
                <h4 className="text-base font-bold text-slate-900">
                  {decisionResult === 'PAY' ? 'Authorized Payment Release Ready' : 'Payment Hold Enforcement Active'}
                </h4>
                <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                  {decisionResult === 'PAY'
                    ? 'A Verified Payment Instruction (VPI) token has been issued to the settlement bank. Beneficiary account ownership is validated.'
                    : 'The transaction sentinel has locked funds release. Out-of-band CFO confirmation and dual-key authorization required to unlock.'}
                </p>
              </div>

              {/* Checkpoint Summary List */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100 text-[11px]">
                {decisionGateList.map(gate => {
                  const passed = gateChecks[gate.key];
                  return (
                    <div key={gate.key} className="flex items-center justify-between py-1.5 border-b border-slate-100 font-mono">
                      <span className={passed ? 'text-slate-700' : 'text-rose-700 font-semibold'}>
                        {passed ? '✔' : '✖'} {gate.name}
                      </span>
                      <span className={passed ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'}>
                        {passed ? 'OK' : 'FAIL'}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Execution Actions */}
              <div className="pt-2">
                {decisionResult === 'PAY' ? (
                  <button
                    disabled={paymentDisbursed}
                    onClick={() => setPaymentDisbursed(true)}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-xs text-xs"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{paymentDisbursed ? 'RTGS Disbursed (Ref: RTGS-RBI-928371)' : 'Execute Automated PAY (Direct RTGS)'}</span>
                  </button>
                ) : (
                  <button
                    disabled={holdEscalated}
                    onClick={() => setHoldEscalated(true)}
                    className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-xs text-xs"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    <span>{holdEscalated ? 'HOLD Confirmed & CFO Notified' : 'Enforce HOLD & Trigger Incident Escalation'}</span>
                  </button>
                )}

                {paymentDisbursed && (
                  <div className="mt-2.5 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-[11px] font-mono">
                    Payment executed successfully under UTID TXN-928371. Settlement reference: RTGS-RBI-20261002-928371.
                  </div>
                )}

                {holdEscalated && (
                  <div className="mt-2.5 p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-[11px] font-mono">
                    Incident flagged in enterprise fraud queue. Primary beneficiary account frozen pending verbal callback confirmation.
                  </div>
                )}
              </div>
            </div>

            {/* Security Explanation */}
            <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-2">
              <span className="font-semibold text-slate-900 block">Why PAY / HOLD Requires All 8 Gates:</span>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                In enterprise procurement, payment diversion attacks occur even when 7 out of 8 checks pass. For instance, in a Business Email Compromise (BEC), the Buyer, Seller, PO, Invoice, Delivery, and Amount are all 100% legitimate, but the <strong>Verified Bank Account</strong> is swapped to an offshore attacker. By enforcing the AND-condition across all 8 gates, UTVN catches payment diversion every time.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: UTID STRUCTURAL 8 INVARIANTS MERKLE TREE                          */}
      {/* ========================================================================= */}
      {treeViewMode === 'structural_tree' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Visual Tree Hierarchy (7 Cols) */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <GitFork className="w-4 h-4 text-emerald-600" />
                Cryptographic Invariant Tree
              </h3>
              <span className="text-[11px] text-slate-500 font-mono">
                Click any node to inspect evidence or toggle attack simulation
              </span>
            </div>

            {/* ROOT NODE: Transaction ID */}
            <div className="relative pl-6">
              <div
                onClick={() => setSelectedNodeKey('root')}
                className={`p-4 rounded-xl border text-xs cursor-pointer transition-all ${
                  selectedNodeKey === 'root'
                    ? 'bg-emerald-50/80 border-emerald-500 shadow-sm ring-2 ring-emerald-500/20'
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg ${
                      isAnySevered || currentTx.overallRiskLevel === 'BLOCKED'
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      <Lock className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-mono text-[10px] text-slate-500 uppercase block font-bold">
                        Tree Root Anchor
                      </span>
                      <span className="font-mono text-sm font-bold text-slate-900">
                        Transaction ID (UTID)
                      </span>
                    </div>
                  </div>

                  <span className={`font-mono text-xs font-semibold px-2 py-0.5 rounded border ${
                    isAnySevered || currentTx.overallRiskLevel === 'BLOCKED'
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}>
                    {isAnySevered ? 'SEVERED' : currentTx.overallRiskLevel}
                  </span>
                </div>

                <div className="mt-2 text-slate-700 font-mono text-[11px] break-all">
                  {currentTx.utid}
                </div>
              </div>

              {/* Tree Branch Stems */}
              <div className="relative pl-8 pt-3 space-y-3 before:absolute before:left-3 before:top-0 before:bottom-6 before:w-0.5 before:bg-slate-200">
                {treeNodes.map((node, index) => {
                  const Icon = node.icon;
                  const isSelected = selectedNodeKey === node.key;
                  const isSevered = severedBranches[node.key];
                  const isNodeFailed = node.status === 'FAILED' || isSevered;
                  const isLast = index === treeNodes.length - 1;

                  return (
                    <div key={node.key} className="relative group">
                      {/* Horizontal Connector Line */}
                      <div className="absolute -left-5 top-5 w-5 h-0.5 bg-slate-200 group-hover:bg-emerald-500 transition-colors" />

                      <div
                        onClick={() => setSelectedNodeKey(node.key)}
                        className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                            : isNodeFailed
                            ? 'bg-rose-50/70 border-rose-200 hover:border-rose-300'
                            : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <div className={`p-1.5 rounded-lg shrink-0 ${
                              isNodeFailed
                                ? 'bg-rose-100 text-rose-700'
                                : 'bg-slate-100 text-slate-700'
                            }`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-slate-500 font-bold text-[11px]">
                                  {isLast ? '└──' : '├──'} {node.title}
                                </span>
                                <span className="font-mono text-slate-700 font-semibold text-[11px]">
                                  [{node.idValue}]
                                </span>
                              </div>
                              <div className="text-slate-900 font-medium text-xs mt-0.5 truncate max-w-[320px]">
                                {node.label}
                              </div>
                              <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                                {node.subtext}
                              </div>
                            </div>
                          </div>

                          {/* Status Badge & Sever Toggle */}
                          <div className="flex flex-col items-end gap-1.5 shrink-0">
                            <span className={`font-mono text-[10px] font-semibold px-2 py-0.5 rounded border ${
                              isNodeFailed
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            }`}>
                              {isSevered ? 'ATTACK SEVERED' : node.status}
                            </span>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleSeverBranch(node.key);
                              }}
                              className={`text-[10px] font-mono px-2 py-0.5 rounded border transition-colors ${
                                isSevered
                                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                                  : 'bg-slate-100 text-slate-600 hover:text-rose-700 hover:bg-rose-50 border-slate-200'
                              }`}
                            >
                              {isSevered ? 'Restore Link' : 'Simulate Sever'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Branch Evidence & Cryptographic Verification Inspector (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-emerald-700 uppercase font-bold">
                  Branch Cryptographic Inspector
                </span>
                <span className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded border ${
                  activeNode.status === 'FAILED'
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}>
                  {activeNode.status}
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {activeNode.title}
                </h3>
                <div className="font-mono text-xs text-emerald-700 mt-0.5 break-all font-semibold">
                  {activeNode.idValue}
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  {activeNode.label}
                </p>
              </div>

              {/* Evidence Table */}
              <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                <span className="font-semibold text-slate-700 text-[11px] uppercase tracking-wider block">
                  Verification Proofs & Bound Artifacts:
                </span>

                <div className="space-y-2">
                  {activeNode.evidence.map((ev, i) => (
                    <div key={i} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-0.5">
                      <span className="text-[10px] text-slate-500 font-mono block">
                        {ev.label}
                      </span>
                      <span className="text-slate-800 font-medium font-mono text-xs break-all">
                        {ev.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Invariant Explanation */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                <span className="font-semibold text-slate-900 block">Structural Integrity Invariant:</span>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  The Universal Transaction ID is not a standalone primary key. It is computed as a deterministic cryptographic Merkle root of the hashes of Buyer ID, Seller ID, Purchase ID, PO ID, Invoice ID, Delivery Confirmation, Tax Reference, and Payment Reference. A mutation on any leaf invalidates the root.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
