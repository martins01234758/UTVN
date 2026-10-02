import React, { useState } from 'react';
import { X, Send, ShieldCheck, Landmark, CheckCircle2, AlertTriangle } from 'lucide-react';
import { UniversalTransaction } from '../types/utvn';
import { generateUTID, generateIRN } from '../utils/cryptoSim';
import { evaluateTransactionFraud } from '../utils/fraudEngine';

interface NewTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (tx: UniversalTransaction) => void;
}

export const NewTransactionModal: React.FC<NewTransactionModalProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  if (!isOpen) return null;

  const [buyerName, setBuyerName] = useState('Larsen & Toubro Heavy Infrastructure Ltd');
  const [buyerGstin, setBuyerGstin] = useState('27AAACL0149R1Z1');
  const [sellerName, setSellerName] = useState('Tata Steel Industrial Products Ltd');
  const [sellerGstin, setSellerGstin] = useState('20AAACT2702H1ZZ');
  const [poId, setPoId] = useState('PO-2026-LT-' + Math.floor(10000 + Math.random() * 90000));
  const [invId, setInvId] = useState('INV-2026-TS-' + Math.floor(10000 + Math.random() * 90000));
  const [amount, setAmount] = useState(3800000);
  const [simulateBankChange, setSimulateBankChange] = useState(false);
  const [simulateQtyMismatch, setSimulateQtyMismatch] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
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
            hasDigitalSignature: true
          }
        ],
        tenureMonths: 36,
        totalVolumeProcessed: 500000000
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
            hasDigitalSignature: true
          }
        ],
        tenureMonths: 48,
        totalVolumeProcessed: 900000000
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
          matchStatus: simulateQtyMismatch ? 'QTY_MISMATCH' : 'EXACT_MATCH'
        }
      ],
      taxInfo: {
        regime: 'INDIA_GST',
        sellerGstin,
        buyerGstin,
        irn,
        taxAmount: amount * 0.18,
        isTaxPortalVerified: true
      },
      deliveryConfirmation: {
        receiptId: 'GRN-2026-DEL-' + Math.floor(1000 + Math.random() * 9000),
        deliveryDate: new Date().toISOString().split('T')[0],
        receivedBy: 'Warehouse Logistics Incharge',
        warehouseLocation: 'Central Facility Bay 2',
        trackingNumber: 'TRK-LOG-8812',
        geofenceVerified: true,
        rfidOrBarcodeScanned: true,
        inspectionStatus: 'ACCEPTED'
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
        status: 'PENDING_APPROVAL'
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
            authMethod: 'MFA_PASSKEY'
          },
          previousHash: '0000000000000000000000000000000000000000000000000000000000000000',
          currentHash: '3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b',
          payloadSummary: `Created transaction for ${buyerName} and ${sellerName}`
        }
      ]
    };

    const evaluation = evaluateTransactionFraud(baseTx);
    const fullTx: UniversalTransaction = {
      ...(baseTx as any),
      overallRiskLevel: evaluation.riskLevel,
      riskScore: evaluation.riskScore,
      fraudChecks: evaluation.checks,
      riskSummary: evaluation.summary,
      recommendedAction: evaluation.recommendedAction
    };

    onCreated(fullTx);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-xl shadow-2xl overflow-hidden my-8">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-white text-base">
              Create New Verifiable Transaction
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 block mb-1">Buyer Organization:</label>
              <input
                type="text"
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-slate-200"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Buyer GSTIN:</label>
              <input
                type="text"
                value={buyerGstin}
                onChange={(e) => setBuyerGstin(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-slate-200 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 block mb-1">Supplier Organization:</label>
              <input
                type="text"
                value={sellerName}
                onChange={(e) => setSellerName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-slate-200"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Supplier GSTIN:</label>
              <input
                type="text"
                value={sellerGstin}
                onChange={(e) => setSellerGstin(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-slate-200 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-slate-400 block mb-1">Purchase Order ID:</label>
              <input
                type="text"
                value={poId}
                onChange={(e) => setPoId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-slate-200 font-mono"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Invoice ID:</label>
              <input
                type="text"
                value={invId}
                onChange={(e) => setInvId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-slate-200 font-mono"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Amount (INR):</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-slate-200 font-mono"
              />
            </div>
          </div>

          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg space-y-2">
            <span className="font-semibold text-slate-300 block">Adversarial Simulation Toggles:</span>
            <div className="flex flex-col gap-1.5">
              <label className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-slate-200">
                <input
                  type="checkbox"
                  checked={simulateBankChange}
                  onChange={(e) => setSimulateBankChange(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-0"
                />
                <span>Simulate Bank Account Change (BEC Diversion Fraud)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-slate-200">
                <input
                  type="checkbox"
                  checked={simulateQtyMismatch}
                  onChange={(e) => setSimulateQtyMismatch(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-0"
                />
                <span>Simulate Quantity Mismatch (Invoiced 50 vs Received 40)</span>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-semibold text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded font-semibold text-xs flex items-center gap-1.5 shadow-sm shadow-blue-600/30"
            >
              <Send className="w-3.5 h-3.5" />
              Generate UTID & Run Verification
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
