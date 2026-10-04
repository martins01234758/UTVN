import React, { useState, useEffect } from 'react';
import { 
  X, 
  Send, 
  ShieldCheck, 
  Landmark, 
  CheckCircle2, 
  AlertTriangle, 
  FileSearch, 
  Scan, 
  UploadCloud, 
  FileText, 
  Check, 
  Building2, 
  Key, 
  Layers, 
  ArrowRight,
  Eye,
  AlertCircle,
  Copy,
  Sparkles
} from 'lucide-react';
import { UniversalTransaction, PartyIdentity } from '../types/utvn';
import { generateUTID, generateIRN } from '../utils/cryptoSim';
import { evaluateTransactionFraud } from '../utils/fraudEngine';
import { 
  SAMPLE_SCANNED_INVOICES, 
  ScannedInvoiceData, 
  matchScannedCompany, 
  CompanyMatchResult 
} from '../utils/companyDirectory';
import { saveTransactionToFirestore } from '../services/firestoreService';

interface NewTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (tx: UniversalTransaction) => void;
  existingTransactions?: UniversalTransaction[];
}

export const NewTransactionModal: React.FC<NewTransactionModalProps> = ({
  isOpen,
  onClose,
  onCreated,
  existingTransactions = [],
}) => {
  const [activeTab, setActiveTab] = useState<'scan' | 'manual'>('scan');

  // Scanner State
  const [selectedSampleIndex, setSelectedSampleIndex] = useState<number>(0);
  const [scannedDoc, setScannedDoc] = useState<ScannedInvoiceData>(SAMPLE_SCANNED_INVOICES[0]);
  const [matchResult, setMatchResult] = useState<CompanyMatchResult | null>(null);
  const [isProcessingScan, setIsProcessingScan] = useState<boolean>(false);
  const [customText, setCustomText] = useState<string>('');
  const [showCustomUpload, setShowCustomUpload] = useState<boolean>(false);

  // Manual Form State
  const [buyerName, setBuyerName] = useState('Larsen & Toubro Heavy Infrastructure Ltd');
  const [buyerGstin, setBuyerGstin] = useState('27AAACL0149R1Z1');
  const [sellerName, setSellerName] = useState('Tata Steel Industrial Products Ltd');
  const [sellerGstin, setSellerGstin] = useState('20AAACT2702H1ZZ');
  const [poId, setPoId] = useState('PO-2026-LT-' + Math.floor(10000 + Math.random() * 90000));
  const [invId, setInvId] = useState('INV-2026-TS-' + Math.floor(10000 + Math.random() * 90000));
  const [amount, setAmount] = useState(3800000);
  const [simulateBankChange, setSimulateBankChange] = useState(false);
  const [simulateQtyMismatch, setSimulateQtyMismatch] = useState(false);

  // Analyze scanned document on mount or sample switch
  useEffect(() => {
    if (!isOpen) return;
    setIsProcessingScan(true);
    const timer = setTimeout(() => {
      const result = matchScannedCompany(
        scannedDoc.sellerName,
        scannedDoc.sellerTaxId,
        scannedDoc.bankAccount,
        existingTransactions
      );
      setMatchResult(result);
      setIsProcessingScan(false);
    }, 200);

    return () => clearTimeout(timer);
  }, [isOpen, scannedDoc, existingTransactions]);

  const handleSelectSample = (index: number) => {
    setSelectedSampleIndex(index);
    setScannedDoc(SAMPLE_SCANNED_INVOICES[index]);
    setShowCustomUpload(false);
  };

  const handleCustomTextParse = (text: string) => {
    setCustomText(text);
    if (!text.trim()) return;

    // Simple client-side regex extraction for custom pasted invoices
    const gstinMatch = text.match(/\b([0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1})\b/i);
    const invMatch = text.match(/(?:invoice|inv)[\s#:.-]+([A-Z0-9_-]+)/i);
    const poMatch = text.match(/(?:po|order|purchase order)[\s#:.-]+([A-Z0-9_-]+)/i);
    const amountMatch = text.match(/(?:total|amount|payable)[\s:₹$€INR]*([0-9,]+(?:\.[0-9]{2})?)/i);
    const sellerMatch = text.match(/(?:seller|supplier|from|vendor)[\s:]+([A-Za-z0-9&.,\s]+)/i);

    const parsed: ScannedInvoiceData = {
      fileName: 'Custom-Pasted-Invoice.txt',
      sellerName: sellerMatch ? sellerMatch[1].split('\n')[0].trim() : 'Scanned Vendor Entity',
      sellerTaxId: gstinMatch ? gstinMatch[1].toUpperCase() : '20AAACT2702H1ZZ',
      buyerName: 'Larsen & Toubro Heavy Infrastructure Ltd',
      buyerTaxId: '27AAACL0149R1Z1',
      invoiceNumber: invMatch ? invMatch[1].trim() : 'INV-2026-CUSTOM-' + Math.floor(1000 + Math.random() * 9000),
      invoiceDate: new Date().toISOString().split('T')[0],
      poNumber: poMatch ? poMatch[1].trim() : 'PO-2026-LT-' + Math.floor(1000 + Math.random() * 9000),
      poDate: new Date().toISOString().split('T')[0],
      totalAmount: amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : 2500000,
      currency: 'INR',
      bankAccount: '000405009821034',
      ifscOrIban: 'SBIN0000125',
      bankName: 'State Bank of India',
      itemsDescription: 'Procured Materials & Engineering Assemblies',
      rawText: text,
    };

    setScannedDoc(parsed);
  };

  const handleGenerateFromScan = async () => {
    const isMatched = matchResult?.isMatch && matchResult.matchedCompany;
    const company = isMatched ? matchResult.matchedCompany! : null;

    const utid = generateUTID(scannedDoc.currency === 'INR' ? 'IND' : 'EU');
    const irn = generateIRN(scannedDoc.sellerTaxId, scannedDoc.invoiceNumber);

    // Build buyer identity
    const buyerObj: PartyIdentity = {
      id: 'ORG-BYR-1004',
      legalName: scannedDoc.buyerName,
      country: scannedDoc.currency === 'INR' ? 'India' : 'Germany',
      taxId: scannedDoc.buyerTaxId,
      corporateRegistryId: 'L99999MH1946PLC004768',
      riskScore: 3,
      kycStatus: 'VERIFIED',
      bankAccounts: [
        {
          accountNumber: '912020048192019',
          ifscOrIban: 'HDFC0000060',
          bankName: 'HDFC Bank Ltd, Corporate Branch',
          isPrimary: true,
          verifiedAt: '2024-01-15',
          pennyDropMatch: true,
        },
      ],
      authorizedSignatories: [
        {
          id: 'SIG-1',
          name: 'Rajesh K. Varma',
          email: 'rajesh.varma@enterprise.com',
          designation: 'VP Procurement & Supply Chain',
          signingLimit: 10000000,
          hasDigitalSignature: true,
        },
      ],
      tenureMonths: 48,
      totalVolumeProcessed: 500000000,
    };

    // If company was previously scanned / matched, automatically use all verified information!
    const sellerObj: PartyIdentity = company ? {
      ...company,
    } : {
      id: 'ORG-SUP-' + Math.floor(1000 + Math.random() * 9000),
      legalName: scannedDoc.sellerName,
      country: scannedDoc.currency === 'INR' ? 'India' : 'Germany',
      taxId: scannedDoc.sellerTaxId,
      corporateRegistryId: 'U72900KA2021PTC148900',
      riskScore: 45, // Higher risk for first-time supplier
      kycStatus: 'PENDING',
      bankAccounts: [
        {
          accountNumber: scannedDoc.bankAccount,
          ifscOrIban: scannedDoc.ifscOrIban,
          bankName: scannedDoc.bankName,
          isPrimary: true,
          verifiedAt: new Date().toISOString().split('T')[0],
          pennyDropMatch: false,
        },
      ],
      authorizedSignatories: [
        {
          id: 'SIG-NEW',
          name: 'Supplier Signatory on Invoice',
          email: 'accounts@' + scannedDoc.sellerName.toLowerCase().replace(/[^a-z]/g, '') + '.com',
          designation: 'Authorized Representative',
          signingLimit: 5000000,
          hasDigitalSignature: false,
        },
      ],
      tenureMonths: 1,
      totalVolumeProcessed: scannedDoc.totalAmount,
    };

    const hasBankDiscrepancy = matchResult?.isMatch && !matchResult.bankAccountMatchesHistorical;

    const baseTx: Partial<UniversalTransaction> = {
      utid,
      status: hasBankDiscrepancy ? 'RISK_FLAGGED' : 'MATCHING_VERIFIED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      currency: scannedDoc.currency,
      totalAmount: scannedDoc.totalAmount,
      buyer: buyerObj,
      seller: sellerObj,
      purchaseId: 'PR-2026-' + Math.floor(10000 + Math.random() * 90000),
      purchaseOrderId: scannedDoc.poNumber,
      poIssueDate: scannedDoc.poDate || new Date().toISOString().split('T')[0],
      invoiceId: scannedDoc.invoiceNumber,
      invoiceDate: scannedDoc.invoiceDate,
      paymentTerms: company ? 'NET 30 Days (Standard Corporate)' : 'NET 15 Days',
      lineItems: [
        {
          id: 'LI-SCAN-01',
          description: scannedDoc.itemsDescription,
          hsnOrSacCode: scannedDoc.currency === 'INR' ? '72163300' : '84119900',
          poQuantity: 10,
          invoiceQuantity: 10,
          receivedQuantity: 10,
          unitPrice: scannedDoc.totalAmount / 10,
          taxRatePercent: scannedDoc.currency === 'INR' ? 18 : 19,
          poTotal: scannedDoc.totalAmount,
          invoiceTotal: scannedDoc.totalAmount,
          currency: scannedDoc.currency,
          matchStatus: 'EXACT_MATCH',
        },
      ],
      taxInfo: {
        regime: scannedDoc.currency === 'INR' ? 'INDIA_GST' : 'EU_PEPPOL_VAT',
        sellerGstin: scannedDoc.sellerTaxId,
        buyerGstin: scannedDoc.buyerTaxId,
        irn,
        taxAmount: scannedDoc.totalAmount * 0.18,
        isTaxPortalVerified: true,
      },
      deliveryConfirmation: {
        receiptId: 'GRN-2026-DEL-' + Math.floor(1000 + Math.random() * 9000),
        deliveryDate: new Date().toISOString().split('T')[0],
        receivedBy: 'Central Logistics Yard Incharge',
        warehouseLocation: 'Bay 4 Goods Reception',
        trackingNumber: 'TRK-SCAN-' + Math.floor(1000 + Math.random() * 9000),
        geofenceVerified: true,
        rfidOrBarcodeScanned: true,
        inspectionStatus: 'ACCEPTED',
      },
      paymentDetails: {
        paymentId: 'PAY-2026-' + Math.floor(10000 + Math.random() * 90000),
        paymentRail: scannedDoc.currency === 'INR' ? 'RTGS' : 'SEPA',
        beneficiaryAccount: scannedDoc.bankAccount,
        beneficiaryIfscOrIban: scannedDoc.ifscOrIban,
        beneficiaryName: scannedDoc.sellerName,
        nameMatchConfidence: hasBankDiscrepancy ? 45.0 : 99.2,
        bankAccountChangeDetected: Boolean(hasBankDiscrepancy),
        previousAccount: matchResult?.historicalPrimaryAccount ? `${matchResult.historicalPrimaryAccount} (Verified Master on File)` : undefined,
        status: hasBankDiscrepancy ? 'BLOCKED' : 'PENDING_APPROVAL',
      },
      auditTrail: [
        {
          id: 'AUD-SCAN-1',
          timestamp: new Date().toISOString(),
          action: isMatched ? 'INVOICE_SCANNED_EXISTING_COMPANY_AUTO_RENDERED' : 'INVOICE_SCANNED_NEW_SUPPLIER_REGISTERED',
          actor: {
            userId: 'usr-scanner-agent',
            userName: 'UTVN Optical & Semantic Document Scanner',
            role: 'AUTOMATED_DOCUMENT_SENTINEL',
            authMethod: 'API_TOKEN',
          },
          previousHash: '0000000000000000000000000000000000000000000000000000000000000000',
          currentHash: '7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a',
          payloadSummary: isMatched
            ? `Scanned invoice for ${scannedDoc.sellerName}. Matched existing company records with ${matchResult?.confidence}% confidence. Auto-rendered verified banking and signatories.`
            : `Scanned invoice for ${scannedDoc.sellerName}. First-time supplier registered for verification.`,
        },
      ],
    };

    const evaluation = evaluateTransactionFraud(baseTx);
    const fullTx: UniversalTransaction = {
      ...(baseTx as any),
      overallRiskLevel: evaluation.riskLevel,
      riskScore: evaluation.riskScore,
      fraudChecks: evaluation.checks,
      riskSummary: evaluation.summary,
      recommendedAction: evaluation.recommendedAction,
    };

    // Optionally save to Firestore in background
    saveTransactionToFirestore(fullTx).catch((err) => console.warn('Firestore sync note:', err));

    onCreated(fullTx);
    onClose();
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const utid = generateUTID('IND');
    const irn = generateIRN(sellerGstin, invId);

    const baseTx: Partial<UniversalTransaction> = {
      utid,
      status: 'PAYMENT_PENDING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      currency: 'INR',
      totalAmount: amount,
      buyer: {
        id: 'ORG-BYR-' + Math.floor(1000 + Math.random() * 9000),
        legalName: buyerName,
        country: 'India',
        taxId: buyerGstin,
        corporateRegistryId: 'L99999MH1946PLC004768',
        riskScore: 3,
        kycStatus: 'VERIFIED',
        bankAccounts: [],
        authorizedSignatories: [
          {
            id: 'SIG-1',
            name: 'Rajesh K. Varma',
            email: 'r.varma@enterprise.com',
            designation: 'VP Procurement',
            signingLimit: 10000000,
            hasDigitalSignature: true,
          },
        ],
        tenureMonths: 36,
        totalVolumeProcessed: 500000000,
      },
      seller: {
        id: 'ORG-SUP-' + Math.floor(1000 + Math.random() * 9000),
        legalName: sellerName,
        country: 'India',
        taxId: sellerGstin,
        corporateRegistryId: 'L27100MH1907PLC000260',
        riskScore: 2,
        kycStatus: 'VERIFIED',
        bankAccounts: [],
        authorizedSignatories: [
          {
            id: 'SIG-2',
            name: 'Authorized Vendor Officer',
            email: 'vendor@tatasteel.com',
            designation: 'Director Commercial',
            signingLimit: 25000000,
            hasDigitalSignature: true,
          },
        ],
        tenureMonths: 48,
        totalVolumeProcessed: 900000000,
      },
      purchaseId: 'PR-2026-LT-' + Math.floor(10000 + Math.random() * 90000),
      purchaseOrderId: poId,
      poIssueDate: new Date().toISOString().split('T')[0],
      invoiceId: invId,
      invoiceDate: new Date().toISOString().split('T')[0],
      paymentTerms: 'NET 30 Days',
      lineItems: [
        {
          id: 'LI-NEW-01',
          description: 'Industrial Galvanized Steel Pipe Sections',
          hsnOrSacCode: '73066100',
          poQuantity: 40,
          invoiceQuantity: simulateQtyMismatch ? 50 : 40,
          receivedQuantity: 40,
          unitPrice: amount / (simulateQtyMismatch ? 50 : 40),
          taxRatePercent: 18,
          poTotal: amount,
          invoiceTotal: amount,
          currency: 'INR',
          matchStatus: simulateQtyMismatch ? 'QTY_MISMATCH' : 'EXACT_MATCH',
        },
      ],
      taxInfo: {
        regime: 'INDIA_GST',
        sellerGstin,
        buyerGstin,
        irn,
        taxAmount: amount * 0.18,
        isTaxPortalVerified: true,
      },
      deliveryConfirmation: {
        receiptId: 'GRN-2026-DEL-' + Math.floor(1000 + Math.random() * 9000),
        deliveryDate: new Date().toISOString().split('T')[0],
        receivedBy: 'Warehouse Logistics Incharge',
        warehouseLocation: 'Central Facility Bay 2',
        trackingNumber: 'TRK-LOG-8812',
        geofenceVerified: true,
        rfidOrBarcodeScanned: true,
        inspectionStatus: 'ACCEPTED',
      },
      paymentDetails: {
        paymentId: 'PAY-2026-' + Math.floor(10000 + Math.random() * 90000),
        paymentRail: 'RTGS',
        beneficiaryAccount: simulateBankChange ? '998811002233' : '000405001928',
        beneficiaryIfscOrIban: 'ICIC0000004',
        beneficiaryName: simulateBankChange ? 'Altered Phishing Shell Account' : sellerName,
        nameMatchConfidence: simulateBankChange ? 32 : 99.4,
        bankAccountChangeDetected: simulateBankChange,
        previousAccount: '000405001928 (Verified Master)',
        status: 'PENDING_APPROVAL',
      },
      auditTrail: [
        {
          id: 'AUD-NEW-1',
          timestamp: new Date().toISOString(),
          action: 'UTVN_TRANSACTION_REGISTERED',
          actor: {
            userId: 'usr-initiator',
            userName: 'Enterprise Initiator',
            role: 'BUYER_SIGNATORY',
            authMethod: 'MFA_PASSKEY',
          },
          previousHash: '0000000000000000000000000000000000000000000000000000000000000000',
          currentHash: '3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b',
          payloadSummary: `Created transaction for ${buyerName} and ${sellerName}`,
        },
      ],
    };

    const evaluation = evaluateTransactionFraud(baseTx);
    const fullTx: UniversalTransaction = {
      ...(baseTx as any),
      overallRiskLevel: evaluation.riskLevel,
      riskScore: evaluation.riskScore,
      fraudChecks: evaluation.checks,
      riskSummary: evaluation.summary,
      recommendedAction: evaluation.recommendedAction,
    };

    onCreated(fullTx);
    onClose();
  };

  const formatCurrency = (val: number, curr: string = 'INR') => {
    return curr === 'INR'
      ? `₹${val.toLocaleString('en-IN')}`
      : `${curr} ${val.toLocaleString('en-US')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden my-8 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200">
              <Scan className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                Create UTVN Verification
                <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  OCR & Company Memory
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Scan an invoice to auto-detect existing companies and populate verified records
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-slate-100 bg-slate-50/50 px-6 shrink-0">
          <button
            onClick={() => setActiveTab('scan')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'scan'
                ? 'border-emerald-600 text-emerald-700 bg-emerald-50/40'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Scan className="w-4 h-4" />
            Scan Invoice & Auto-Match Company
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'manual'
                ? 'border-emerald-600 text-emerald-700 bg-emerald-50/40'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            Manual Field Configuration
          </button>
        </div>

        {/* Body Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: SCAN INVOICE & AUTO-MATCH */}
          {activeTab === 'scan' && (
            <div className="space-y-6">
              {/* Preset Invoice Selectors */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                    <FileSearch className="w-3.5 h-3.5 text-emerald-600" />
                    Select Scanned Invoice Document (or Upload / Paste):
                  </label>
                  <button
                    onClick={() => setShowCustomUpload(!showCustomUpload)}
                    className="text-xs text-emerald-700 hover:text-emerald-800 underline flex items-center gap-1 font-semibold"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    {showCustomUpload ? 'Hide Custom Upload' : 'Upload / Paste Custom Invoice'}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  {SAMPLE_SCANNED_INVOICES.map((sample, idx) => {
                    const isSelected = selectedSampleIndex === idx && !showCustomUpload;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelectSample(idx)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'bg-emerald-50/80 border-emerald-500 shadow-xs ring-2 ring-emerald-500/20'
                            : 'bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono text-slate-500">{sample.currency}</span>
                          {idx === 0 && <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-mono font-bold">KNOWN VENDOR</span>}
                          {idx === 1 && <span className="text-[9px] bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded font-mono font-bold">DIVERSION ATTACK</span>}
                          {idx === 2 && <span className="text-[9px] bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded font-mono font-bold">PEPPOL / EU</span>}
                          {idx === 3 && <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-mono font-bold">NEW VENDOR</span>}
                        </div>
                        <div className="font-semibold text-xs text-slate-900 truncate mt-1">
                          {sample.sellerName}
                        </div>
                        <div className="text-[11px] font-mono text-emerald-700 font-bold mt-0.5">
                          {formatCurrency(sample.totalAmount, sample.currency)}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-1 truncate">
                          {sample.invoiceNumber}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Upload or Paste Area */}
              {showCustomUpload && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                      <UploadCloud className="w-4 h-4 text-emerald-600" />
                      Paste Invoice Text / Upload Raw Scanned OCR Data
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">Auto-extracts GSTIN, PO, Amount, Bank</span>
                  </div>
                  <textarea
                    rows={4}
                    value={customText}
                    onChange={(e) => handleCustomTextParse(e.target.value)}
                    placeholder="Paste text from any scanned PDF or OCR system here (e.g. Seller: Tata Steel, GSTIN: 20AAACT2702H1ZZ, Total: ₹4,850,000, A/C: 000405009821034)..."
                    className="w-full bg-white border border-slate-200 rounded-lg p-3 text-xs text-slate-900 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              )}

              {/* Scanned Document Preview & Optical Data Inspector */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left: Scanned Document Data */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-emerald-600" />
                      Extracted Invoice OCR Metadata
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">{scannedDoc.fileName}</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-start justify-between">
                      <span className="text-slate-500">Supplier Legal Name:</span>
                      <span className="font-semibold text-slate-900 text-right max-w-[200px] truncate">{scannedDoc.sellerName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Tax ID / GSTIN / VAT:</span>
                      <span className="font-mono text-emerald-700 font-bold">{scannedDoc.sellerTaxId}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Invoice Number:</span>
                      <span className="font-mono text-slate-900 font-semibold">{scannedDoc.invoiceNumber}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Linked Purchase Order:</span>
                      <span className="font-mono text-emerald-700 font-semibold">{scannedDoc.poNumber}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Total Invoice Amount:</span>
                      <span className="font-mono font-bold text-slate-900">{formatCurrency(scannedDoc.totalAmount, scannedDoc.currency)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Remittance Bank Account:</span>
                      <span className="font-mono text-slate-800">{scannedDoc.bankAccount} ({scannedDoc.ifscOrIban})</span>
                    </div>
                  </div>

                  {scannedDoc.rawText && (
                    <div className="pt-2 border-t border-slate-200">
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">OCR Raw Text Preview</span>
                      <div className="p-2 bg-white rounded border border-slate-200 text-[10px] font-mono text-slate-600 max-h-24 overflow-y-auto whitespace-pre-wrap">
                        {scannedDoc.rawText}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right: Company Recognition & Auto-Render Memory Engine */}
                <div className="p-4 bg-white border border-slate-200 rounded-xl flex flex-col justify-between space-y-4 shadow-2xs">
                  <div>
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
                      <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-emerald-600" />
                        Company Recognition Engine
                      </span>
                      {isProcessingScan ? (
                        <span className="text-[10px] text-slate-500 animate-pulse font-mono">Analyzing memory...</span>
                      ) : matchResult?.isMatch ? (
                        <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200 font-mono flex items-center gap-1 font-bold">
                          <Check className="w-3 h-3" /> MATCHED ({matchResult.confidence}%)
                        </span>
                      ) : (
                        <span className="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200 font-mono font-semibold">
                          NEW COMPANY
                        </span>
                      )}
                    </div>

                    {/* MATCH FOUND -> AUTO-RENDERED INFO */}
                    {matchResult?.isMatch && matchResult.matchedCompany ? (
                      <div className="space-y-3">
                        <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl space-y-1.5">
                          <div className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                            <Building2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>Auto-Rendered Verified Enterprise Profile</span>
                          </div>
                          <p className="text-[11px] text-slate-600 leading-relaxed">
                            Found matching verified company in UTVN database. Automatically populated verified KYC, registered bank account, and DSC signing authority from historical ledger.
                          </p>
                        </div>

                        {/* Auto-Rendered Field Matrix */}
                        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                          <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg">
                            <span className="text-[10px] text-slate-500 block">Verified Entity Name</span>
                            <span className="font-semibold text-slate-900 text-[11px] truncate block">{matchResult.matchedCompany.legalName}</span>
                          </div>
                          <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg">
                            <span className="text-[10px] text-slate-500 block">Corporate Registry ID</span>
                            <span className="text-emerald-700 font-semibold text-[11px]">{matchResult.matchedCompany.corporateRegistryId}</span>
                          </div>
                          <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg">
                            <span className="text-[10px] text-slate-500 block">Historical Settled Txns</span>
                            <span className="text-slate-900 font-semibold text-[11px]">{matchResult.historicalTransactionCount} Previous Transactions</span>
                          </div>
                          <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg">
                            <span className="text-[10px] text-slate-500 block">Historical Volume</span>
                            <span className="text-slate-900 font-semibold text-[11px]">{formatCurrency(matchResult.historicalVolume, scannedDoc.currency)}</span>
                          </div>
                        </div>

                        {/* Signatory on File */}
                        <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-600 flex items-center gap-1 font-medium">
                              <Key className="w-3 h-3 text-emerald-600" />
                              Registered Authorized Signatory:
                            </span>
                            <span className="text-emerald-700 font-mono text-[10px] font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">DSC Active</span>
                          </div>
                          <div className="text-slate-900 font-semibold text-[11px]">
                            {matchResult.matchedCompany.authorizedSignatories[0]?.name || 'Commercial Officer'}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {matchResult.matchedCompany.authorizedSignatories[0]?.designation} · Limit: {formatCurrency(matchResult.matchedCompany.authorizedSignatories[0]?.signingLimit || 10000000)}
                          </div>
                        </div>

                        {/* Discrepancy / Diversion Warning */}
                        {!matchResult.bankAccountMatchesHistorical && (
                          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-1">
                            <div className="text-xs font-bold text-rose-800 flex items-center gap-1.5">
                              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                              <span>BANK ACCOUNT DIVERSION DETECTED!</span>
                            </div>
                            <p className="text-[11px] text-rose-900 leading-relaxed">
                              Scanned invoice requests remittance to <span className="font-mono font-bold">{scannedDoc.bankAccount}</span>, but the verified historical account on file is <span className="font-mono font-bold">{matchResult.historicalPrimaryAccount}</span>.
                            </p>
                            <span className="text-[10px] text-rose-700 block pt-1 font-mono font-semibold">
                              Automated Sentinel will flag RISK_FLAGGED / BLOCKED upon UTID generation.
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      /* NO MATCH -> FIRST-TIME VENDOR */
                      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
                        <div className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
                          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>First-Time Supplier Detected</span>
                        </div>
                        <p className="text-[11px] text-amber-900 leading-relaxed">
                          This company has not been previously scanned or verified in your UTVN network. Generating this transaction will trigger First-Time Supplier KYC onboarding and Penny-Drop bank verification protocols.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Action CTA */}
                  <div className="pt-2">
                    <button
                      onClick={handleGenerateFromScan}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs"
                    >
                      <Scan className="w-4 h-4" />
                      Generate Universal Transaction ID (UTID)
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <p className="text-[10px] text-slate-500 text-center mt-2">
                      Applies 4-way matching, runs 16-point fraud engine, and records immutable SHA-256 audit block.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MANUAL FIELD CONFIGURATION */}
          {activeTab === 'manual' && (
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Buyer */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
                    <Building2 className="w-4 h-4 text-emerald-600" />
                    Buyer Entity (Enterprise)
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1 font-medium">Company Legal Name</label>
                    <input
                      type="text"
                      value={buyerName}
                      onChange={(e) => setBuyerName(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1 font-medium">GSTIN / Tax ID</label>
                    <input
                      type="text"
                      value={buyerGstin}
                      onChange={(e) => setBuyerGstin(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Seller */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
                    <Building2 className="w-4 h-4 text-emerald-600" />
                    Seller Entity (Supplier)
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1 font-medium">Company Legal Name</label>
                    <input
                      type="text"
                      value={sellerName}
                      onChange={(e) => setSellerName(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1 font-medium">GSTIN / Tax ID</label>
                    <input
                      type="text"
                      value={sellerGstin}
                      onChange={(e) => setSellerGstin(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Transaction IDs & Amounts */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-600 mb-1 font-medium">Purchase Order (PO ID)</label>
                  <input
                    type="text"
                    value={poId}
                    onChange={(e) => setPoId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-600 mb-1 font-medium">Invoice ID</label>
                  <input
                    type="text"
                    value={invId}
                    onChange={(e) => setInvId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-600 mb-1 font-medium">Amount (INR)</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Simulation Toggles */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-slate-800 block">Adversarial Simulation Toggles</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <label className="flex items-center gap-2 text-slate-700 cursor-pointer font-medium">
                    <input
                      type="checkbox"
                      checked={simulateBankChange}
                      onChange={(e) => setSimulateBankChange(e.target.checked)}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Simulate Bank Account Change (Diversion Fraud)</span>
                  </label>
                  <label className="flex items-center gap-2 text-slate-700 cursor-pointer font-medium">
                    <input
                      type="checkbox"
                      checked={simulateQtyMismatch}
                      onChange={(e) => setSimulateQtyMismatch(e.target.checked)}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Simulate Quantity Mismatch (Overbilling)</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
                >
                  Create & Evaluate
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
