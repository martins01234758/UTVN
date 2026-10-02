import React, { useState } from 'react';
import { 
  Globe2, QrCode, FileCode2, Cpu, ArrowRightLeft, 
  CheckCircle2, Copy, Check, ExternalLink, ShieldCheck, 
  Landmark, RefreshCw, Key
} from 'lucide-react';
import { generateIRN, generateEInvoiceQRData, generateUblXml } from '../utils/cryptoSim';

export const InteroperabilityView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'india' | 'global' | 'erp'>('india');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // India Live Generator
  const [sellerGstin, setSellerGstin] = useState('20AAACT2702H1ZZ');
  const [buyerGstin, setBuyerGstin] = useState('27AAACL0149R1Z1');
  const [docNum, setDocNum] = useState('INV-2026-90412');
  const [invAmount, setInvAmount] = useState(4850000);

  const irn = generateIRN(sellerGstin, docNum);
  const qrData = generateEInvoiceQRData(
    sellerGstin, 
    buyerGstin, 
    docNum, 
    new Date().toISOString().split('T')[0], 
    invAmount, 
    1, 
    irn
  );

  // Global Peppol Live Generator
  const [currency, setCurrency] = useState('EUR');
  const [sellerName, setSellerName] = useState('Vandenberg Precision Forgings BV');
  const [buyerName, setBuyerName] = useState('Siemens Energy AG');
  const [peppolAmount, setPeppolAmount] = useState(345000);

  const ublXml = generateUblXml(
    'UTVN-2026-EU-51209-C8D3',
    'PO-2026-SE-9081',
    'INV-VBF-2026-0412',
    sellerName,
    buyerName,
    peppolAmount,
    currency
  );

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const erpIntegrations = [
    {
      name: 'SAP S/4HANA & ECC 6.0',
      protocol: 'RFC / OData / IDoc INVOIC02',
      syncMode: 'Bi-directional Real-Time',
      status: 'NATIVE ADAPTER CERTIFIED',
      desc: 'Hooks into SAP MIRO transaction code to halt payment release if UTVN 4-way match score is under 95%.'
    },
    {
      name: 'Oracle Fusion Cloud Financials',
      protocol: 'REST API / FBDI / SOAP',
      syncMode: 'Webhook Triggered',
      status: 'ORACLE CLOUD READY',
      desc: 'Synchronizes AP Invoice Holds automatically upon detecting bank account mutations or duplicate IRNs.'
    },
    {
      name: 'Microsoft Dynamics 365 Finance',
      protocol: 'OData v4 / Azure Service Bus',
      syncMode: 'Event-Driven',
      status: 'VERIFIED CONNECTOR',
      desc: 'Validates vendor bank accounts prior to generating payment journal disbursement batches.'
    },
    {
      name: 'Tally Prime (Gold & Silver)',
      protocol: 'TDL TCP Server / XML Exchange',
      syncMode: 'Local Desktop Daemon',
      status: 'OFFLINE-RESILIENT SYNC',
      desc: 'Seamlessly reads local Tally vouchers, generates IRN with IRP, and syncs UTID with zero manual re-entry.'
    },
    {
      name: 'Zoho Books Enterprise',
      protocol: 'OAuth 2.0 / REST Webhooks',
      syncMode: 'Real-Time Webhook',
      status: 'DIRECT APP MARKETPLACE',
      desc: 'Instant 4-way verification badge embedded into invoice detail screens for MSMEs and mid-market buyers.'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
        <span className="text-[11px] font-mono text-blue-400 font-semibold uppercase">
          Interoperability Engine
        </span>
        <h2 className="text-xl font-bold text-white">
          Global + India Architecture: Integrating Without Replacing
        </h2>
        <p className="text-xs text-slate-300 max-w-4xl leading-relaxed">
          UTVN acts as a neutral verification layer that sits across existing ERPs, banks, and government tax networks. It does not force counterparties to abandon their existing software or sign up for identical accounts.
        </p>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 pt-3 border-t border-slate-800">
          <button
            onClick={() => setActiveTab('india')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'india' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            India Stack (GST / IRN / Banking)
          </button>
          <button
            onClick={() => setActiveTab('global')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'global' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Global Stack (Peppol / UBL 2.1 / ISO 20022)
          </button>
          <button
            onClick={() => setActiveTab('erp')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'erp' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ERP Adapters (SAP / Oracle / Tally / Zoho)
          </button>
        </div>
      </div>

      {/* 1. INDIA STACK */}
      {activeTab === 'india' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Controls */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4 text-xs">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <QrCode className="w-4 h-4 text-blue-400" />
              Indian E-Invoicing & GST IRP Integration
            </h3>
            <p className="text-slate-400">
              India mandates e-invoicing for B2B transactions &gt;₹5 Crore via the Invoice Registration Portal (IRP/NIC). UTVN utilizes this government standard as an instant ground truth.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-slate-400 block mb-1">Seller GSTIN:</label>
                <input
                  type="text"
                  value={sellerGstin}
                  onChange={(e) => setSellerGstin(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 font-mono"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Buyer GSTIN:</label>
                <input
                  type="text"
                  value={buyerGstin}
                  onChange={(e) => setBuyerGstin(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Document Number:</label>
                  <input
                    type="text"
                    value={docNum}
                    onChange={(e) => setDocNum(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Invoice Value (INR):</label>
                  <input
                    type="number"
                    value={invAmount}
                    onChange={(e) => setInvAmount(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg space-y-1.5">
              <span className="font-semibold text-slate-200 block">Indian Payment Rails Supported:</span>
              <div className="grid grid-cols-2 gap-2 text-slate-400 text-[11px] font-mono">
                <div>• RBI Real-Time Gross Settlement (RTGS)</div>
                <div>• National Electronic Funds Transfer (NEFT)</div>
                <div>• NPCI e-NACH & Mandate Autopay</div>
                <div>• NPCI UPI B2B & BBPS Invoicing</div>
              </div>
            </div>
          </div>

          {/* Real-time Hash & QR Output */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-white">
                Live IRP Hashes & QR Code Payload
              </h4>
              <span className="font-mono text-emerald-400 font-semibold">NIC Schema 1.1</span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span>Calculated 64-Character IRN:</span>
                <button
                  onClick={() => copyToClipboard(irn, 'irn')}
                  className="text-blue-400 hover:text-blue-300 flex items-center gap-1 font-mono text-[10px]"
                >
                  {copiedKey === 'irn' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  Copy Hash
                </button>
              </div>
              <div className="p-2.5 bg-slate-950 border border-slate-800 rounded font-mono text-[11px] text-blue-300 break-all select-all">
                {irn}
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-slate-400 block">Digital B2B QR Code Payload (Base64/JSON):</span>
              <pre className="p-3 bg-slate-950 border border-slate-800 rounded font-mono text-[10px] text-slate-300 overflow-x-auto whitespace-pre-wrap max-h-48">
                {qrData}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* 2. GLOBAL STACK */}
      {activeTab === 'global' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4 text-xs">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Globe2 className="w-4 h-4 text-blue-400" />
              Peppol BIS Billing 3.0 & Cross-Border UBL 2.1
            </h3>
            <p className="text-slate-400">
              European and international cross-border trade relies on OpenPEPPOL and Universal Business Language (UBL XML). UTVN injects cryptographic UTID anchors directly into standard &lt;cac:AdditionalDocumentReference&gt; structures.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-slate-400 block mb-1">Seller Organization:</label>
                <input
                  type="text"
                  value={sellerName}
                  onChange={(e) => setSellerName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Buyer Organization:</label>
                <input
                  type="text"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Currency Code:</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200"
                  >
                    <option value="EUR">EUR (€)</option>
                    <option value="USD">USD ($)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="SGD">SGD (S$)</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Payable Amount:</label>
                  <input
                    type="number"
                    value={peppolAmount}
                    onChange={(e) => setPeppolAmount(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg space-y-1.5">
              <span className="font-semibold text-slate-200 block">International Clearing Standards:</span>
              <div className="grid grid-cols-2 gap-2 text-slate-400 text-[11px] font-mono">
                <div>• ISO 20022 camt.053 & pain.001</div>
                <div>• SEPA Instant Credit Transfer</div>
                <div>• US FedNow & Real-Time Payments (RTP)</div>
                <div>• ZUGFeRD 2.2 / Factur-X Standard</div>
              </div>
            </div>
          </div>

          <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-white flex items-center gap-2">
                <FileCode2 className="w-4 h-4 text-blue-400" />
                Live Validated UBL 2.1 XML Payload
              </h4>
              <button
                onClick={() => copyToClipboard(ublXml, 'ubl')}
                className="text-blue-400 hover:text-blue-300 flex items-center gap-1 font-mono text-[10px]"
              >
                {copiedKey === 'ubl' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                Copy XML
              </button>
            </div>

            <pre className="p-3 bg-slate-950 border border-slate-800 rounded font-mono text-[10px] text-slate-300 overflow-x-auto whitespace-pre max-h-[380px]">
              {ublXml}
            </pre>
          </div>
        </div>
      )}

      {/* 3. ERP ADAPTERS */}
      {activeTab === 'erp' && (
        <div className="space-y-4">
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-400">
            UTVN connectors deploy as lightweight middleware agents that intercept Purchase Orders and Invoices inside enterprise ERPs without changing employee daily workflows.
          </div>

          <div className="space-y-3">
            {erpIntegrations.map((erp, idx) => (
              <div
                key={idx}
                className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl text-xs space-y-2 hover:border-slate-700 transition-colors"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-xs">
                      {erp.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">{erp.name}</h4>
                      <span className="text-[11px] font-mono text-slate-400">
                        Protocol: {erp.protocol} · {erp.syncMode}
                      </span>
                    </div>
                  </div>

                  <span className="px-2.5 py-0.5 rounded font-mono text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {erp.status}
                  </span>
                </div>

                <p className="text-slate-300 text-xs pt-1">
                  {erp.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
