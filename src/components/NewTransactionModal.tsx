import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Scan, 
  UploadCloud, 
  FileText, 
  Building2, 
  ShieldCheck, 
  ArrowRight,
  ArrowLeft,
  FileCheck2,
  Receipt,
  Sparkles,
  CheckCircle2,
  Hash,
  Landmark,
  Layers,
  ChevronRight,
  Camera,
  Video,
  RefreshCw
} from 'lucide-react';
import { UniversalTransaction, PartyIdentity } from '../types/utvn';
import { generateUTID, generateIRN } from '../utils/cryptoSim';
import { evaluateTransactionFraud } from '../utils/fraudEngine';

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
}) => {
  // Step 1: 'scan' (Document Upload & Extraction)
  // Step 2: 'mint' (Review & Cryptographic Registration)
  const [currentStep, setCurrentStep] = useState<'scan' | 'mint'>('scan');
  const [scanMethod, setScanMethod] = useState<'camera' | 'upload'>('upload');

  // Camera State
  const [isCameraRunning, setIsCameraRunning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Invoice Form State
  const [sellerName, setSellerName] = useState('Tata Steel Industrial Products Ltd');
  const [sellerTaxId, setSellerTaxId] = useState('20AAACT2702H1ZZ');
  const [bankAccount, setBankAccount] = useState('000405001928');
  const [ifscOrIban, setIfscOrIban] = useState('ICIC0000004');
  const [bankName, setBankName] = useState('ICICI Bank Ltd');

  const [buyerName, setBuyerName] = useState('Larsen & Toubro Heavy Infrastructure Ltd');
  const [buyerTaxId, setBuyerTaxId] = useState('27AAACL0149R1Z1');

  const [invoiceNumber, setInvoiceNumber] = useState(`INV-2026-TS-${Math.floor(1000 + Math.random() * 9000)}`);
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [poNumber, setPoNumber] = useState(`PO-2026-LT-${Math.floor(1000 + Math.random() * 9000)}`);
  const [totalAmount, setTotalAmount] = useState<number>(3850000);
  const [currency, setCurrency] = useState<'INR' | 'EUR' | 'USD'>('INR');
  const [itemDescription, setItemDescription] = useState('Industrial Galvanized Structural Steel Sections');

  const [isScanning, setIsScanning] = useState(false);
  const [scannedFileName, setScannedFileName] = useState<string>('Invoice-TataSteel-Industrial.pdf');
  const [selectedSample, setSelectedSample] = useState<'steel' | 'electronics' | 'pharma'>('steel');
  const [isMinting, setIsMinting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clean up camera stream on close / unmount
  const stopCameraStream = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    setIsCameraRunning(false);
  };

  useEffect(() => {
    if (!isOpen) {
      stopCameraStream();
    }
    return () => {
      stopCameraStream();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Start Device Camera for Live Document Scanning
  const handleStartCamera = async () => {
    setScanMethod('camera');
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera device access not supported in this browser.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraRunning(true);
    } catch (err: any) {
      console.warn('Camera error:', err);
      setCameraError('Camera access unavailable. Using optical simulated camera scanner.');
      setIsCameraRunning(true);
    }
  };

  // Capture & Scan from Camera
  const handleCaptureCamera = () => {
    setIsScanning(true);
    stopCameraStream();
    setScannedFileName('Live-Camera-Invoice-Scan.jpg');

    setTimeout(() => {
      setIsScanning(false);
      setInvoiceNumber(`INV-CAM-${Math.floor(1000 + Math.random() * 9000)}`);
      setPoNumber(`PO-CAM-${Math.floor(1000 + Math.random() * 9000)}`);
      setTotalAmount(4850000);
      setSellerName('Tata Steel Industrial Products Ltd');
      setBuyerName('Larsen & Toubro Heavy Infrastructure Ltd');
    }, 600);
  };

  // Handle Drag & Drop / File Selection
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScannedFileName(file.name);
    setIsScanning(true);

    setTimeout(() => {
      setIsScanning(false);
      setInvoiceNumber(`INV-SCAN-${Math.floor(1000 + Math.random() * 9000)}`);
      setPoNumber(`PO-SCAN-${Math.floor(1000 + Math.random() * 9000)}`);
      setTotalAmount(4250000);
    }, 500);
  };

  // Quick Sample Selector
  const handleSelectSample = (sampleType: 'steel' | 'electronics' | 'pharma') => {
    setSelectedSample(sampleType);
    if (sampleType === 'steel') {
      setSellerName('Tata Steel Industrial Products Ltd');
      setSellerTaxId('20AAACT2702H1ZZ');
      setBankAccount('000405001928');
      setIfscOrIban('ICIC0000004');
      setBankName('ICICI Bank Ltd');
      setBuyerName('Larsen & Toubro Heavy Infrastructure Ltd');
      setBuyerTaxId('27AAACL0149R1Z1');
      setInvoiceNumber(`INV-2026-TS-${Math.floor(1000 + Math.random() * 9000)}`);
      setPoNumber(`PO-2026-LT-${Math.floor(1000 + Math.random() * 9000)}`);
      setTotalAmount(3850000);
      setCurrency('INR');
      setItemDescription('Structural Galvanized Steel Beams & Angle Sections');
      setScannedFileName('Invoice-TataSteel-Industrial.pdf');
    } else if (sampleType === 'electronics') {
      setSellerName('Foxconn India Precision Assembly Pvt Ltd');
      setSellerTaxId('33AABCF8891P1ZK');
      setBankAccount('919020088192011');
      setIfscOrIban('HDFC0000055');
      setBankName('HDFC Bank Ltd');
      setBuyerName('Reliance Retail Ventures Ltd');
      setBuyerTaxId('24AAACR5055K1Z8');
      setInvoiceNumber(`INV-2026-FX-${Math.floor(1000 + Math.random() * 9000)}`);
      setPoNumber(`PO-2026-RR-${Math.floor(1000 + Math.random() * 9000)}`);
      setTotalAmount(18450000);
      setCurrency('INR');
      setItemDescription('SMT Motherboard Sub-Assemblies & Logic Chips');
      setScannedFileName('Invoice-Foxconn-Electronics.pdf');
    } else {
      setSellerName('Sun Pharma Global Laboratories');
      setSellerTaxId('24AAACS7019E1ZM');
      setBankAccount('000501009944112');
      setIfscOrIban('SBIN0000125');
      setBankName('State Bank of India');
      setBuyerName('Apollo Hospitals Enterprise Ltd');
      setBuyerTaxId('33AAACA3890H1ZV');
      setInvoiceNumber(`INV-2026-SP-${Math.floor(1000 + Math.random() * 9000)}`);
      setPoNumber(`PO-2026-AP-${Math.floor(1000 + Math.random() * 9000)}`);
      setTotalAmount(6720000);
      setCurrency('INR');
      setItemDescription('Active Pharmaceutical Ingredients & Sterile Injectables');
      setScannedFileName('Invoice-SunPharma-Medical.pdf');
    }
  };

  // Execute Minting to Ledger
  const handleExecuteMint = (e: React.FormEvent) => {
    e.preventDefault();
    setIsMinting(true);

    const utid = generateUTID(currency === 'INR' ? 'IND' : 'EU');
    const irn = generateIRN(sellerTaxId, invoiceNumber);

    const buyerObj: PartyIdentity = {
      id: `ORG-BYR-${Math.floor(1000 + Math.random() * 9000)}`,
      legalName: buyerName,
      country: currency === 'INR' ? 'India' : 'Germany',
      taxId: buyerTaxId,
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
          name: 'Chief Procurement Officer',
          email: 'procurement@' + buyerName.toLowerCase().replace(/[^a-z]/g, '') + '.com',
          designation: 'Head of Procurement',
          signingLimit: 25000000,
          hasDigitalSignature: true,
        },
      ],
      tenureMonths: 48,
      totalVolumeProcessed: 500000000,
    };

    const sellerObj: PartyIdentity = {
      id: `ORG-SUP-${Math.floor(1000 + Math.random() * 9000)}`,
      legalName: sellerName,
      country: currency === 'INR' ? 'India' : 'Germany',
      taxId: sellerTaxId,
      corporateRegistryId: 'L27100MH1907PLC000260',
      riskScore: 2,
      kycStatus: 'VERIFIED',
      bankAccounts: [
        {
          accountNumber: bankAccount,
          ifscOrIban,
          bankName,
          isPrimary: true,
          verifiedAt: new Date().toISOString().split('T')[0],
          pennyDropMatch: true,
        },
      ],
      authorizedSignatories: [
        {
          id: 'SIG-2',
          name: 'Commercial Director',
          email: 'commercial@' + sellerName.toLowerCase().replace(/[^a-z]/g, '') + '.com',
          designation: 'Authorized Signatory',
          signingLimit: 50000000,
          hasDigitalSignature: true,
        },
      ],
      tenureMonths: 36,
      totalVolumeProcessed: 900000000,
    };

    const baseTx: Partial<UniversalTransaction> = {
      utid,
      status: 'MATCHING_VERIFIED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      currency,
      totalAmount,
      buyer: buyerObj,
      seller: sellerObj,
      purchaseId: `PR-2026-${Math.floor(10000 + Math.random() * 90000)}`,
      purchaseOrderId: poNumber,
      poIssueDate: new Date().toISOString().split('T')[0],
      invoiceId: invoiceNumber,
      invoiceDate,
      paymentTerms: 'NET 30 Days (Standard Corporate)',
      lineItems: [
        {
          id: 'LI-01',
          description: itemDescription,
          hsnOrSacCode: currency === 'INR' ? '72163300' : '84119900',
          poQuantity: 50,
          invoiceQuantity: 50,
          receivedQuantity: 50,
          unitPrice: totalAmount / 50,
          taxRatePercent: 18,
          poTotal: totalAmount,
          invoiceTotal: totalAmount,
          currency,
          matchStatus: 'EXACT_MATCH',
        },
      ],
      taxInfo: {
        regime: currency === 'INR' ? 'INDIA_GST' : 'EU_PEPPOL_VAT',
        sellerGstin: sellerTaxId,
        buyerGstin: buyerTaxId,
        irn,
        taxAmount: totalAmount * 0.18,
        isTaxPortalVerified: true,
      },
      deliveryConfirmation: {
        receiptId: `GRN-2026-DEL-${Math.floor(1000 + Math.random() * 9000)}`,
        deliveryDate: new Date().toISOString().split('T')[0],
        receivedBy: 'Warehouse Logistics Incharge',
        warehouseLocation: 'Central Bay Goods Reception',
        trackingNumber: `TRK-SCAN-${Math.floor(1000 + Math.random() * 9000)}`,
        geofenceVerified: true,
        rfidOrBarcodeScanned: true,
        inspectionStatus: 'ACCEPTED',
      },
      paymentDetails: {
        paymentId: `PAY-2026-${Math.floor(10000 + Math.random() * 90000)}`,
        paymentRail: currency === 'INR' ? 'RTGS' : 'SEPA',
        beneficiaryAccount: bankAccount,
        beneficiaryIfscOrIban: ifscOrIban,
        beneficiaryName: sellerName,
        nameMatchConfidence: 99.4,
        bankAccountChangeDetected: false,
        status: 'PENDING_APPROVAL',
      },
      auditTrail: [
        {
          id: `AUD-SCAN-${Date.now()}`,
          timestamp: new Date().toISOString(),
          action: 'UTVN_TRANSACTION_REGISTERED',
          actor: {
            userId: 'usr-scanner-operator',
            userName: 'Authorized Operations Officer',
            role: 'BUYER_SIGNATORY',
            authMethod: 'MFA_PASSKEY',
          },
          previousHash: '0000000000000000000000000000000000000000000000000000000000000000',
          currentHash: '4f8a1c9e2b3d7a0f5e6a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e',
          payloadSummary: `Scanned & minted invoice ${invoiceNumber} for ${buyerName}`,
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

    setTimeout(() => {
      setIsMinting(false);
      onCreated(fullTx);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden my-6 max-h-[92vh] flex flex-col animate-fade-in">
        
        {/* Top Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200">
              <Scan className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                Scan Invoice & Mint UTVN
                <span className="text-[10px] font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
                  OCR Engine
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Scan an invoice to extract billing data, verify counterparties, and mint to the ledger
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              stopCameraStream();
              onClose();
            }}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2-Step Process Indicator */}
        <div className="px-6 py-3 bg-white border-b border-slate-100 flex items-center justify-center gap-3 shrink-0">
          {/* Step 1 Pill */}
          <button
            type="button"
            onClick={() => setCurrentStep('scan')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              currentStep === 'scan'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-2xs font-bold'
                : 'text-slate-500 hover:text-slate-800 bg-slate-50 border border-slate-200'
            }`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
              currentStep === 'scan' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
            }`}>
              1
            </span>
            <Scan className="w-3.5 h-3.5" />
            <span>Step 1: Scan Invoice</span>
          </button>

          <ChevronRight className="w-4 h-4 text-slate-300" />

          {/* Step 2 Pill */}
          <button
            type="button"
            onClick={() => setCurrentStep('mint')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              currentStep === 'mint'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-2xs font-bold'
                : 'text-slate-500 hover:text-slate-800 bg-slate-50 border border-slate-200'
            }`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
              currentStep === 'mint' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
            }`}>
              2
            </span>
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Step 2: Review & Mint UTID</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* STEP 1: SCAN INVOICE OPTION                                               */}
        {/* ========================================================================= */}
        {currentStep === 'scan' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            
            {/* Scan Method Switcher: Camera Scan vs File Upload */}
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <button
                type="button"
                onClick={handleStartCamera}
                className={`flex-1 py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  scanMethod === 'camera'
                    ? 'bg-emerald-50 text-emerald-900 border-emerald-400 ring-2 ring-emerald-500/20 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Camera className="w-4 h-4 text-emerald-600" />
                <span>Scan Invoice with Camera</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  stopCameraStream();
                  setScanMethod('upload');
                }}
                className={`flex-1 py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  scanMethod === 'upload'
                    ? 'bg-emerald-50 text-emerald-900 border-emerald-400 ring-2 ring-emerald-500/20 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <UploadCloud className="w-4 h-4 text-emerald-600" />
                <span>Upload & Scan Invoice File</span>
              </button>
            </div>

            {/* OPTION A: LIVE CAMERA SCANNER VIEW */}
            {scanMethod === 'camera' && (
              <div className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 p-4 text-white relative space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 font-mono text-emerald-400 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                    Live Document Optical Scanner Active
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">1080p Optical Feed</span>
                </div>

                {/* Viewfinder with Laser Scanner Line */}
                <div className="relative h-64 bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center border border-slate-800">
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    muted 
                    className="w-full h-full object-cover"
                  />

                  {/* High-Tech Document Framing Overlay */}
                  <div className="absolute inset-6 border-2 border-emerald-500/60 rounded-lg pointer-events-none flex flex-col justify-between p-2">
                    <div className="flex justify-between text-emerald-400 text-xs font-mono font-bold">
                      <span>┌ SCAN AREA</span>
                      <span>┐</span>
                    </div>
                    
                    {/* Animated Scanning Laser Line */}
                    <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_8px_#10b981] animate-pulse"></div>

                    <div className="flex justify-between text-emerald-400 text-xs font-mono font-bold">
                      <span>└</span>
                      <span>ALIGN INVOICE ┘</span>
                    </div>
                  </div>

                  {cameraError && (
                    <div className="absolute bottom-3 left-3 right-3 bg-slate-900/90 text-amber-300 p-2 rounded-lg text-[11px] text-center font-mono border border-amber-500/30">
                      {cameraError}
                    </div>
                  )}
                </div>

                {/* Camera Capture Action */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-slate-400">Position physical invoice within target frame</span>
                  <button
                    type="button"
                    onClick={handleCaptureCamera}
                    className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/30 active:scale-95"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Capture & Scan Invoice</span>
                  </button>
                </div>
              </div>
            )}

            {/* OPTION B: FILE UPLOAD DROPZONE */}
            {scanMethod === 'upload' && (
              <div>
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-2">
                  Drop Invoice Document to Scan (PDF, Image, Scanned Receipt)
                </label>

                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-emerald-300 hover:border-emerald-500 bg-emerald-50/40 hover:bg-emerald-50/70 rounded-2xl p-7 text-center cursor-pointer transition-all group"
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileUpload} 
                    accept=".pdf,.png,.jpg,.jpeg,.txt" 
                    className="hidden" 
                  />
                  <div className="flex flex-col items-center justify-center gap-2.5">
                    <div className="p-3 rounded-2xl bg-white border border-emerald-200 shadow-xs group-hover:scale-105 transition-transform text-emerald-600">
                      <UploadCloud className="w-8 h-8" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        {scannedFileName ? (
                          <span className="text-emerald-700 flex items-center justify-center gap-1.5 font-mono">
                            <FileCheck2 className="w-4 h-4 text-emerald-600" /> {scannedFileName}
                          </span>
                        ) : (
                          'Click to upload or drag & drop invoice document'
                        )}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        OCR extracts Tax IDs, PO numbers, bank IFSC, and line items
                      </p>
                    </div>

                    {isScanning && (
                      <div className="text-xs text-emerald-700 font-semibold flex items-center gap-1.5 animate-pulse mt-1 font-mono">
                        <Sparkles className="w-3.5 h-3.5" />
                        Scanning optical characters and extracting invoice fields...
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Quick Enterprise Invoice Pre-sets */}
            <div>
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-2">
                Or One-Click Scan Enterprise Invoices
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => handleSelectSample('steel')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selectedSample === 'steel'
                      ? 'bg-emerald-50/80 border-emerald-500 shadow-xs ring-2 ring-emerald-500/20'
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-emerald-700 uppercase">Manufacturing</span>
                    {selectedSample === 'steel' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  </div>
                  <div className="font-bold text-xs text-slate-900 truncate mt-1">
                    Tata Steel Products
                  </div>
                  <div className="text-xs font-mono text-emerald-700 font-bold mt-0.5">
                    ₹38,50,000 INR
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    Buyer: L&T Infrastructure
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectSample('electronics')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selectedSample === 'electronics'
                      ? 'bg-emerald-50/80 border-emerald-500 shadow-xs ring-2 ring-emerald-500/20'
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-emerald-700 uppercase">Technology</span>
                    {selectedSample === 'electronics' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  </div>
                  <div className="font-bold text-xs text-slate-900 truncate mt-1">
                    Foxconn Assembly
                  </div>
                  <div className="text-xs font-mono text-emerald-700 font-bold mt-0.5">
                    ₹1,84,50,000 INR
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    Buyer: Reliance Retail
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectSample('pharma')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selectedSample === 'pharma'
                      ? 'bg-emerald-50/80 border-emerald-500 shadow-xs ring-2 ring-emerald-500/20'
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-emerald-700 uppercase">Healthcare</span>
                    {selectedSample === 'pharma' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  </div>
                  <div className="font-bold text-xs text-slate-900 truncate mt-1">
                    Sun Pharma Labs
                  </div>
                  <div className="text-xs font-mono text-emerald-700 font-bold mt-0.5">
                    ₹67,20,000 INR
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    Buyer: Apollo Hospitals
                  </div>
                </button>
              </div>
            </div>

            {/* Extracted Overview Card with Clear Next Action */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between shadow-2xs">
              <div>
                <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Invoice Data Extracted & Ready</span>
                </div>
                <div className="text-[11px] text-slate-600 mt-0.5 font-mono">
                  {sellerName} ➔ {buyerName} · {currency} {totalAmount.toLocaleString()}
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  stopCameraStream();
                  setCurrentStep('mint');
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-sm shadow-emerald-600/25 active:scale-95"
              >
                <span>Proceed to Minting</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: REVIEW EXTRACTED DETAILS & MINT TO LEDGER                         */}
        {/* ========================================================================= */}
        {currentStep === 'mint' && (
          <form onSubmit={handleExecuteMint} className="flex-1 overflow-y-auto p-6 space-y-5">
            
            {/* Context bar with back button */}
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Review Extracted Fields Before Minting
              </span>
              <button
                type="button"
                onClick={() => setCurrentStep('scan')}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Change Document</span>
              </button>
            </div>

            {/* 1. Counterparties: Seller & Buyer Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Seller / Supplier */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-900 border-b border-slate-200 pb-2">
                  <span className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                    Seller (Payee / Supplier)
                  </span>
                  <span className="text-[10px] text-emerald-700 font-mono font-bold">SELLER</span>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-600 font-medium mb-1">Company Legal Name</label>
                  <input
                    type="text"
                    required
                    value={sellerName}
                    onChange={(e) => setSellerName(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-600 font-medium mb-1">Tax ID / GSTIN / VAT</label>
                  <input
                    type="text"
                    required
                    value={sellerTaxId}
                    onChange={(e) => setSellerTaxId(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono text-emerald-800 font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] text-slate-600 font-medium mb-1">Remittance Bank Account</label>
                    <input
                      type="text"
                      required
                      value={bankAccount}
                      onChange={(e) => setBankAccount(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 font-medium mb-1">IFSC / Routing Code</label>
                    <input
                      type="text"
                      required
                      value={ifscOrIban}
                      onChange={(e) => setIfscOrIban(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Buyer / Payer */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-900 border-b border-slate-200 pb-2">
                  <span className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                    Buyer (Payer / Enterprise)
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono font-bold">BUYER</span>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-600 font-medium mb-1">Company Legal Name</label>
                  <input
                    type="text"
                    required
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-600 font-medium mb-1">Tax ID / GSTIN / VAT</label>
                  <input
                    type="text"
                    required
                    value={buyerTaxId}
                    onChange={(e) => setBuyerTaxId(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-800 font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-600 font-medium mb-1">Goods / Services Description</label>
                  <input
                    type="text"
                    required
                    value={itemDescription}
                    onChange={(e) => setItemDescription(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* 2. Billing & Transaction Identifiers */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div>
                <label className="block text-[11px] text-slate-600 font-medium mb-1">Invoice Number</label>
                <input
                  type="text"
                  required
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-900 font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 font-medium mb-1">Invoice Date</label>
                <input
                  type="date"
                  required
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 font-medium mb-1">Purchase Order (PO #)</label>
                <input
                  type="text"
                  required
                  value={poNumber}
                  onChange={(e) => setPoNumber(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-mono text-emerald-800 font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 font-medium mb-1">Gross Amount ({currency})</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-900 font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Action Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Will seal with SHA-256 state hash & 64-char IRN
              </span>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setCurrentStep('scan')}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
                <button
                  type="submit"
                  disabled={isMinting}
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-emerald-600/30 flex items-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  <Scan className="w-4 h-4" />
                  <span>{isMinting ? 'Minting UTID...' : 'Mint & Record to Ledger'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
