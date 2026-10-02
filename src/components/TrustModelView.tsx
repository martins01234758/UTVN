import React, { useState } from 'react';
import { 
  ShieldCheck, Lock, Key, Server, Network, Layers, 
  CheckCircle2, AlertTriangle, ArrowRight, Database, 
  FileCheck, UserCheck, Landmark, Truck, Check, EyeOff
} from 'lucide-react';

export const TrustModelView: React.FC = () => {
  const [selectedArch, setSelectedArch] = useState<'centralized' | 'federated' | 'blockchain'>('federated');
  const [activeTrustLayer, setActiveTrustLayer] = useState<number>(1);

  const trustLayers = [
    {
      level: 1,
      title: 'Syntactic ID Generation',
      truthLevel: 'Minimal Trust',
      color: 'text-slate-400',
      description: 'Generating a UTID (e.g. UTVN-2026-IND-89412) is merely an indexing mechanism. Anyone can mint an identifier. It proves nothing about whether goods exist, whether the invoice is real, or whether the bank account belongs to a fraudster.',
      pitfall: 'Fatal Fallacy: Believing that because a transaction has an ID or barcode, it is verified.'
    },
    {
      level: 2,
      title: 'Mathematical & Data Verification',
      truthLevel: 'Syntactic Consistency',
      color: 'text-blue-400',
      description: 'Reconciles numerical quantities, line-item HSN tax rates, currency codes, price contracts, and total calculations across PO and Invoice. Confirms internal consistency, but cannot detect fictitious collusive purchases.',
      pitfall: 'Limitation: Two conspirators can create a perfectly matched fake invoice.'
    },
    {
      level: 3,
      title: 'Legal Identity & Registry Verification',
      truthLevel: 'Entity Legitimacy',
      color: 'text-indigo-400',
      description: 'Cross-checks Buyer and Seller against National Corporate Registries (CIN, LEI, GSTIN, DUNS), Ultimate Beneficial Ownership (UBO), active tax standing, and watchlists. Eliminates ghost shell companies.',
      pitfall: 'Limitation: Legitimate companies can still experience business email compromise (BEC).'
    },
    {
      level: 4,
      title: 'Transaction & Signatory Authorization',
      truthLevel: 'Human Authority',
      color: 'text-purple-400',
      description: 'Validates that the specific human user issuing the PO or Invoice has legal Delegation of Authority (DoA) within ERP, authenticated via hardware FIDO2 passkeys, SAML SSO, and Class 3 Digital Signature Certificates (DSC/X.509).',
      pitfall: 'Prevents rogue employee overbilling and unauthorized purchase commitments.'
    },
    {
      level: 5,
      title: 'Physical Delivery & Bank Ownership Verification',
      truthLevel: 'Cryptographic Ground Truth',
      color: 'text-emerald-400',
      description: 'The definitive defense: Physical goods confirmed via weighbridge IoT & geofenced RFID scan (GRN); Payment destination independently verified via bank penny-drop API directly with RBI/NPCI clearing, matching the legal entity name >95%.',
      pitfall: 'Closes the loop: Fraudsters cannot divert money to personal accounts even with compromised emails.'
    }
  ];

  const independentVerifications = [
    {
      title: 'Buyer Identity Verification',
      mechanism: 'Government Corporate Registry + Active Tax Status',
      howItWorks: 'Automated lookup against Ministry of Corporate Affairs (MCA/CIN), Legal Entity Identifier (LEI/GLEIF), and active GST portal status. Refreshed daily.',
      icon: UserCheck
    },
    {
      title: 'Seller Identity Verification',
      mechanism: 'KYC Master + Ultimate Beneficial Owner (UBO)',
      howItWorks: 'Verification of incorporation documents, physical site audit logs, and beneficiary registry. Pre-screens against domestic and global sanction watchlists.',
      icon: FileCheck
    },
    {
      title: 'Purchase Creation Authority',
      mechanism: 'Enterprise SSO + Delegation of Authority (DoA)',
      howItWorks: 'Cryptographically checks buyer internal ERP role limits (e.g. VP signing cap ₹10M). Requires hardware FIDO2 MFA token for PO broadcast.',
      icon: Key
    },
    {
      title: 'Invoice Issuance Authority',
      mechanism: 'Class 3 Digital Signature Certificate (DSC)',
      howItWorks: 'Supplier authorized signatory must sign the invoice payload using X.509 cryptographic smartcard or cryptographic HSM signing service.',
      icon: Lock
    },
    {
      title: 'Invoice Authenticity',
      mechanism: 'Government IRP Portal 64-Char IRN Signature',
      howItWorks: 'UTVN queries the National Invoice Registration Portal (NIC/IRP) directly. If the IRN does not match the official QR signature or has already been used, it is blocked.',
      icon: ShieldCheck
    },
    {
      title: 'Payment Account Ownership',
      mechanism: 'Bank Penny-Drop API + NPCI Name Fuzzy Match',
      howItWorks: 'Before any payment executes, a micro-deposit ($0.01 / ₹1) is pulsed to the destination account. Bank returns the registered account holder name, requiring >90% match.',
      icon: Landmark
    },
    {
      title: 'Goods/Service Fulfillment',
      mechanism: 'Geofenced Weighbridge & RFID Goods Receipt (GRN)',
      howItWorks: 'Physical warehouse receipt is signed off via tamper-evident barcode scanner at GPS-verified warehouse gate. For services, milestones require milestone certs.',
      icon: Truck
    }
  ];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
        <span className="text-[11px] font-mono text-blue-400 font-semibold uppercase">
          Zero-Trust B2B Security Architecture
        </span>
        <h2 className="text-xl font-bold text-white">
          Why Generating an ID Is Never Enough: The Trust Model
        </h2>
        <p className="text-xs text-slate-300 max-w-4xl leading-relaxed">
          In fraud prevention, the most dangerous cognitive error is assuming syntactic identifiers create trust. An attacker can easily generate a 32-character UUID or QR code for a counterfeit invoice. True verification requires independent, out-of-band validation across five distinct operational layers.
        </p>
      </div>

      {/* 5-Layer Trust Hierarchy */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-5">
        <h3 className="text-sm font-bold text-white">
          The 5-Tier Verification Hierarchy: From Synthetic ID to Ground Truth
        </h3>

        <div className="space-y-3">
          {trustLayers.map((layer) => (
            <div
              key={layer.level}
              onClick={() => setActiveTrustLayer(layer.level)}
              className={`p-4 rounded-xl border text-xs cursor-pointer transition-all ${
                activeTrustLayer === layer.level
                  ? 'bg-slate-950 border-blue-500 shadow-md shadow-blue-900/30'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-sm font-bold text-slate-500">
                    Tier 0{layer.level}
                  </span>
                  <span className="font-bold text-white text-sm">
                    {layer.title}
                  </span>
                </div>
                <span className={`font-mono text-xs font-semibold ${layer.color}`}>
                  Level: {layer.truthLevel}
                </span>
              </div>

              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                {layer.description}
              </p>

              <div className="mt-2 text-[11px] text-amber-300/90 font-mono bg-amber-950/30 p-2 rounded border border-amber-900/40">
                {layer.pitfall}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 7 Independent Verification Pillars */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
        <h3 className="text-sm font-bold text-white">
          The 7 Independent Out-of-Band Verification Pillars
        </h3>
        <p className="text-xs text-slate-400">
          How UTVN independently audits each entity and transaction artifact without relying on self-reported vendor claims.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {independentVerifications.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={idx}
                className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl text-xs space-y-2"
              >
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-blue-600/20 text-blue-400">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-white text-xs">{pillar.title}</h4>
                </div>
                <div className="text-[11px] font-mono text-blue-300">
                  {pillar.mechanism}
                </div>
                <p className="text-slate-400 text-xs leading-relaxed">
                  {pillar.howItWorks}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Centralized vs Federated vs Distributed Architectural Comparison */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white">
              Architectural Evaluation: Centralized vs. Federated vs. Distributed (DLT)
            </h3>
            <p className="text-xs text-slate-400">
              Examining why enterprise B2B requires a Federated Hybrid architecture over pure public blockchain.
            </p>
          </div>

          <div className="flex items-center gap-1 bg-slate-950 p-1 border border-slate-800 rounded-lg text-xs">
            <button
              onClick={() => setSelectedArch('centralized')}
              className={`px-3 py-1 rounded font-semibold transition-colors ${
                selectedArch === 'centralized' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Centralized
            </button>
            <button
              onClick={() => setSelectedArch('federated')}
              className={`px-3 py-1 rounded font-semibold transition-colors ${
                selectedArch === 'federated' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Federated (Recommended)
            </button>
            <button
              onClick={() => setSelectedArch('blockchain')}
              className={`px-3 py-1 rounded font-semibold transition-colors ${
                selectedArch === 'blockchain' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Public Blockchain / DLT
            </button>
          </div>
        </div>

        {/* Selected Architecture Deep Dive */}
        {selectedArch === 'federated' && (
          <div className="p-5 bg-blue-950/20 border border-blue-900/50 rounded-xl space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <Network className="w-4 h-4 text-blue-400" />
                The Recommended Model: Federated Trust Hub with Cryptographic Proof Logs
              </h4>
              <span className="font-mono text-emerald-400 font-semibold">PRODUCTION VIABLE</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              <strong>How it works:</strong> Independent participant nodes (large enterprises, banks, ERP providers, tax gateways) maintain cryptographic audit proofs in their own systems, while a lightweight federated registry coordinates real-time unspent invoice uniqueness, duplicate hash prevention, and beneficiary changes.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-slate-300">
              <div className="p-3 bg-slate-900/80 rounded border border-slate-800">
                <span className="font-semibold text-white block mb-1">Latency & Throughput:</span>
                1.2s verification latency, &gt;15,000 transactions/sec without gas fees or proof-of-work delays.
              </div>
              <div className="p-3 bg-slate-900/80 rounded border border-slate-800">
                <span className="font-semibold text-white block mb-1">Enterprise Privacy & GDPR:</span>
                Competitive commercial data (unit prices, client names) stays strictly inside ERP nodes. Only zero-knowledge cryptographic hashes pass through the federated hub.
              </div>
              <div className="p-3 bg-slate-900/80 rounded border border-slate-800">
                <span className="font-semibold text-white block mb-1">Legal Recourse:</span>
                Clear jurisdictional compliance with India DPDP Act, EU GDPR, and RBI banking confidentiality regulations.
              </div>
            </div>
          </div>
        )}

        {selectedArch === 'centralized' && (
          <div className="p-5 bg-slate-950 border border-slate-800 rounded-xl space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <Server className="w-4 h-4 text-slate-400" />
                Centralized SaaS Architecture (e.g. Coupa, Ariba Model)
              </h4>
              <span className="font-mono text-amber-400 font-semibold">HIGH COUNTERPARTY RISK</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              <strong>How it works:</strong> A single corporate entity runs the entire database, stores all invoices, and processes all approvals in one centralized relational cluster.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-slate-300">
              <div className="p-3 bg-slate-900/80 rounded border border-slate-800">
                <span className="font-semibold text-white block mb-1">Single Point of Failure:</span>
                A database compromise or rogue insider at the central provider can alter banking records across thousands of companies.
              </div>
              <div className="p-3 bg-slate-900/80 rounded border border-slate-800">
                <span className="font-semibold text-white block mb-1">Vendor Lock-In:</span>
                Suppliers refuse to register if they must create accounts on 10 different closed proprietary buyer portals.
              </div>
              <div className="p-3 bg-slate-900/80 rounded border border-slate-800">
                <span className="font-semibold text-white block mb-1">Antitrust & Confidentiality:</span>
                Enterprises are reluctant to upload their sensitive supply chain pricing matrices to a third-party commercial platform.
              </div>
            </div>
          </div>
        )}

        {selectedArch === 'blockchain' && (
          <div className="p-5 bg-slate-950 border border-slate-800 rounded-xl space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <Database className="w-4 h-4 text-purple-400" />
                Pure Distributed Ledger / Public Blockchain
              </h4>
              <span className="font-mono text-rose-400 font-semibold">IMPRACTICAL FOR ENTERPRISE</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              <strong>How it works:</strong> All transactions are broadcast to an immutable peer-to-peer blockchain (e.g. Ethereum or Hyperledger Fabric).
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-slate-300">
              <div className="p-3 bg-slate-900/80 rounded border border-slate-800">
                <span className="font-semibold text-white block mb-1">Privacy & Competitive Leak:</span>
                Public ledgers leak transaction velocity and trading corridor volume to competitors even with pseudonymity.
              </div>
              <div className="p-3 bg-slate-900/80 rounded border border-slate-800">
                <span className="font-semibold text-white block mb-1">GDPR Right to Be Forgotten:</span>
                Directly violates European GDPR and Indian DPDP mandates regarding data deletion and amendment.
              </div>
              <div className="p-3 bg-slate-900/80 rounded border border-slate-800">
                <span className="font-semibold text-white block mb-1">Latency & Cost:</span>
                Block finality times (15s–10min) and gas volatility are unacceptable for real-time treasury clearing.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
