import React, { useState } from 'react';
import { 
  AlertTriangle, ShieldAlert, CheckCircle2, DollarSign, 
  TrendingUp, Target, Scale, Database, Code2, Rocket, 
  HelpCircle, Check, X, Layers, Lightbulb, Users
} from 'lucide-react';

export const StrategicMvpEvaluationView: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'critique' | 'mvp' | 'competitive' | 'business'>('critique');

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-2">
        <span className="text-[11px] font-mono text-emerald-700 font-bold uppercase">
          Rigorous Strategic Blueprint & Critical Audit
        </span>
        <h2 className="text-xl font-bold text-slate-900">
          Strategic Viability, Honest Critique & Realistic MVP
        </h2>
        <p className="text-xs text-slate-600 max-w-4xl leading-relaxed">
          Fintech networks frequently fail due to unrealistic adoption assumptions (e.g. "every bank and vendor must join on Day 1"). This section provides an unvarnished critical evaluation, technical vulnerability analysis, and an India-first MVP roadmap.
        </p>

        {/* Sub-tabs */}
        <div className="flex items-center gap-2 pt-3 border-t border-slate-100 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveSubTab('critique')}
            className={`px-3.5 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeSubTab === 'critique' ? 'bg-rose-50 text-rose-700 border border-rose-200 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            Critical Evaluation & Vulnerabilities
          </button>
          <button
            onClick={() => setActiveSubTab('mvp')}
            className={`px-3.5 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeSubTab === 'mvp' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Rocket className="w-3.5 h-3.5" />
            Realistic India-First MVP Blueprint
          </button>
          <button
            onClick={() => setActiveSubTab('competitive')}
            className={`px-3.5 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeSubTab === 'competitive' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            Competitive Teardown & Genuine Gap
          </button>
          <button
            onClick={() => setActiveSubTab('business')}
            className={`px-3.5 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeSubTab === 'business' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
            Business Model & TAM / SAM / SOM
          </button>
        </div>
      </div>

      {/* 1. CRITICAL HONEST EVALUATION */}
      {activeSubTab === 'critique' && (
        <div className="space-y-6 text-xs">
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-1 text-rose-950">
            <h3 className="font-bold text-rose-900 text-sm flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              Unsparing Technical & Commercial Critique
            </h3>
            <p className="text-rose-800 leading-relaxed">
              Most B2B verification startups fail not from code bugs, but from the two-sided network effect cold start, false-positive paralysis, and human override collusions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2 shadow-2xs">
              <span className="font-bold text-rose-700 text-xs">1. The Cold-Start Network Effect Trap</span>
              <p className="text-slate-600 leading-relaxed">
                <strong>Weakness:</strong> If Buyer requires Seller to be on UTVN, but Seller refuses to integrate yet another portal, the network stalls. Suppliers already hate having 15 different customer portals (Coupa, Ariba, Taulia).
              </p>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-slate-700 text-[11px] leading-relaxed">
                <strong className="text-slate-900">The Fix:</strong> UTVN must be <em>one-sided adoptable</em>. The buyer installs UTVN to verify invoices against Government GST/IRP APIs and bank account APIs without requiring the vendor to install anything.
              </div>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2 shadow-2xs">
              <span className="font-bold text-rose-700 text-xs">2. False Positives Shutting Down Legitimate Operations</span>
              <p className="text-slate-600 leading-relaxed">
                <strong>Weakness:</strong> B2B procurement is messy. Legitimate suppliers change bank accounts during mergers, split shipments across multiple trucks, and round pennies differently for taxes. If UTVN blocks $5M steel shipments falsely, CFOs will disable the tool.
              </p>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-slate-700 text-[11px] leading-relaxed">
                <strong className="text-slate-900">The Fix:</strong> Graduated friction. Never hard-block low-risk operational mismatches. Provide out-of-band automated callback workflows instead of halting assembly lines.
              </div>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2 shadow-2xs">
              <span className="font-bold text-rose-700 text-xs">3. Regulatory & Commercial Privacy Resistance</span>
              <p className="text-slate-600 leading-relaxed">
                <strong>Weakness:</strong> Enterprises refuse to share pricing, quantities, or vendor terms with an outside ledger for fear of data leakage to competitors. Under India DPDP and EU GDPR, storing PII on unchangeable ledgers is illegal.
              </p>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-slate-700 text-[11px] leading-relaxed">
                <strong className="text-slate-900">The Fix:</strong> Zero-Knowledge Data Minimization. Store only blind cryptographic hashes (SHA-256) and validity proofs on the network. Raw commercial line items remain inside enterprise ERP boundaries.
              </div>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2 shadow-2xs">
              <span className="font-bold text-rose-700 text-xs">4. Sophisticated Insider Bypass Vectors</span>
              <p className="text-slate-600 leading-relaxed">
                <strong>Weakness:</strong> How clever fraudsters defeat rules:
                <br />• <em>Collusion:</em> Corrupt VP Procurement creates a real PO, collusive vendor issues a real e-invoice with valid GSTIN, warehouse stamps fake delivery. All 16 checks pass.
                <br />• <em>Smurfing:</em> Splitting $5M unauthorized payments into 10 smaller $490k transactions under auto-approval thresholds.
              </p>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-slate-700 text-[11px] leading-relaxed">
                <strong className="text-slate-900">The Fix:</strong> Entity Graph Relationship Clustering (identifying common beneficial owners / addresses between employees and vendors) and cumulative rolling velocity throttles.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. REALISTIC MVP BLUEPRINT */}
      {activeSubTab === 'mvp' && (
        <div className="space-y-6 text-xs">
          <div className="p-5 bg-emerald-50/50 border border-emerald-200 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">
                The Practical Launchpad: Why India First?
              </h3>
              <span className="font-mono text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200 font-bold">ZERO-VENDOR ADOPTION OVERHEAD</span>
            </div>
            <p className="text-slate-700 leading-relaxed">
              In most countries, electronic invoicing is voluntary and fragmented. <strong>In India, B2B e-invoicing is legally mandatory for businesses &gt;₹5 Crore.</strong> Every invoice must already be submitted to the Government IRP, which assigns a unique 64-character IRN and digitally signed QR code.
              <br /><br />
              <strong>The MVP Strategy:</strong> Sell exclusively to large Indian enterprise buyers (e.g. EPC, automotive, pharma). Hook into their AP inbox. Read the QR code, query the NIC IRP portal, and perform instant penny-drop bank verification. <em>Not a single supplier needs to change their workflow!</em>
            </p>
          </div>

          {/* MVP Technical Specifications */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3 shadow-2xs">
              <h4 className="font-bold text-slate-900 text-xs flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-600" />
                Core MVP Database Schema (PostgreSQL + Append-Only Log)
              </h4>
              <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 font-mono text-[10px] text-slate-300 space-y-1 overflow-x-auto">
                <div>CREATE TABLE universal_transactions (</div>
                <div className="pl-3">utid VARCHAR(64) PRIMARY KEY,</div>
                <div className="pl-3">buyer_gstin VARCHAR(15) NOT NULL,</div>
                <div className="pl-3">seller_gstin VARCHAR(15) NOT NULL,</div>
                <div className="pl-3">po_number VARCHAR(64) NOT NULL,</div>
                <div className="pl-3">invoice_number VARCHAR(64) NOT NULL,</div>
                <div className="pl-3">irn_hash CHAR(64) UNIQUE NOT NULL,</div>
                <div className="pl-3">invoice_amount NUMERIC(15,2) NOT NULL,</div>
                <div className="pl-3">beneficiary_account VARCHAR(34) NOT NULL,</div>
                <div className="pl-3">beneficiary_ifsc VARCHAR(11) NOT NULL,</div>
                <div className="pl-3">penny_drop_name_match NUMERIC(5,2),</div>
                <div className="pl-3">risk_verdict VARCHAR(20) NOT NULL,</div>
                <div className="pl-3">ledger_merkle_root CHAR(64) NOT NULL,</div>
                <div className="pl-3">created_at TIMESTAMPTZ DEFAULT NOW()</div>
                <div>);</div>
              </div>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3 shadow-2xs">
              <h4 className="font-bold text-slate-900 text-xs flex items-center gap-2">
                <Code2 className="w-4 h-4 text-emerald-600" />
                Core REST APIs for MVP Integration
              </h4>
              <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 font-mono text-[10px] text-slate-300 space-y-2 overflow-x-auto">
                <div>
                  <span className="text-emerald-400">POST</span> /api/v1/verify-invoice
                  <div className="text-slate-400 pl-2">Ingests PDF or JSON; decodes QR, verifies IRN with IRP, checks duplicate DB.</div>
                </div>
                <div>
                  <span className="text-emerald-400">POST</span> /api/v1/bank-ownership-check
                  <div className="text-slate-400 pl-2">Triggers micro penny-drop to IFSC/Account; returns fuzzy name match score.</div>
                </div>
                <div>
                  <span className="text-emerald-400">GET</span> /api/v1/transaction-verdict/:utid
                  <div className="text-slate-400 pl-2">Returns explainable score: VERIFIED, NEEDS_REVIEW, or BLOCKED.</div>
                </div>
                <div>
                  <span className="text-emerald-400">POST</span> /api/v1/payment-token/authorize
                  <div className="text-slate-400 pl-2">Issues signed cryptographic settlement payload to corporate bank.</div>
                </div>
              </div>
            </div>
          </div>

          {/* Rollout Timeline */}
          <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3 shadow-2xs">
            <h4 className="font-bold text-slate-900 text-xs">
              6-Month Pilot Implementation Plan (Complexity: Medium, 4 Full-Stack Engineers)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-slate-700">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-emerald-700 block mb-1">Month 1-2: Core Engine</span>
                Build GST IRP integration, 64-char IRN parser, and automated penny-drop banking connector (Cashfree / RazorpayX API).
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-emerald-700 block mb-1">Month 3: ERP Middleware</span>
                Ship lightweight SAP S/4HANA and Tally connector to mirror incoming invoices automatically.
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-emerald-700 block mb-1">Month 4-5: Enterprise Pilot</span>
                Deploy with 2 anchor enterprise buyers in Mumbai/Pune processing 15,000 monthly supplier invoices in shadow mode.
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-emerald-700 block mb-1">Month 6: Bank Authorization</span>
                Partner with HDFC/ICICI Corporate Banking to enable automated payment holds on anomalous accounts.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. COMPETITIVE ANALYSIS */}
      {activeSubTab === 'competitive' && (
        <div className="space-y-5 text-xs">
          <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-1 shadow-2xs">
            <h3 className="font-bold text-slate-900 text-sm">
              Landscape Comparison: What Exists vs. What UTVN Solves
            </h3>
            <p className="text-slate-600">
              Enterprises already use AP automation and invoice scanners. Here is the exact structural failure of existing categories.
            </p>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3">Product Category</th>
                  <th className="py-3 px-3">Leading Incumbents</th>
                  <th className="py-3 px-3">What They Solve</th>
                  <th className="py-3 px-3 text-rose-700">The Fatal Gap They Miss</th>
                  <th className="py-3 px-3 text-emerald-700">UTVN Moat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                <tr>
                  <td className="py-3 px-3 font-semibold text-slate-900">AP Automation & OCR</td>
                  <td className="py-3 px-3 text-slate-500">Tipalti, AvidXchange, Medius</td>
                  <td className="py-3 px-3">Scans PDFs, types data into ERP, cuts manual bookkeeping.</td>
                  <td className="py-3 px-3 text-rose-700">Only reads what is printed on the PDF. If an attacker tampers with the bank IBAN, OCR reads the fake IBAN faithfully!</td>
                  <td className="py-3 px-3 text-emerald-700 font-medium">Cross-checks bank account against out-of-band registry & government IRP, not the PDF text.</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-semibold text-slate-900">Procure-to-Pay Portals</td>
                  <td className="py-3 px-3 text-slate-500">SAP Ariba, Coupa, Jaggaer</td>
                  <td className="py-3 px-3">Catalogs, RFQs, internal approval hierarchies.</td>
                  <td className="py-3 px-3 text-rose-700">Walled gardens. Only works if the supplier logs into the buyer's proprietary portal. 60% of vendors refuse to adopt.</td>
                  <td className="py-3 px-3 text-emerald-700 font-medium">Federated neutral verification. Works across any ERP via government e-invoice anchor without forcing vendor portals.</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-semibold text-slate-900">Tax E-Invoicing Gateways</td>
                  <td className="py-3 px-3 text-slate-500">ClearTax, Cygnet, Avalara</td>
                  <td className="py-3 px-3">Uploads invoice data to government to get IRN and QR code.</td>
                  <td className="py-3 px-3 text-rose-700">Pure tax compliance. Does NOT verify payment destination accounts, Goods Receipt Notes, or internal PO pricing variances.</td>
                  <td className="py-3 px-3 text-emerald-700 font-medium">Closes the triangle: Binds the Government IRN directly to bank account validation and physical delivery sign-off.</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-semibold text-slate-900">Vendor Banking Checkers</td>
                  <td className="py-3 px-3 text-slate-500">Trustpair, NSKNS</td>
                  <td className="py-3 px-3">Checks supplier bank account ownership against databases.</td>
                  <td className="py-3 px-3 text-rose-700">Static master data audit only. Does not perform transactional 4-way matching or detect duplicate IRN re-use.</td>
                  <td className="py-3 px-3 text-emerald-700 font-medium">Real-time transactional binding: every single invoice has its payment token locked to the verified account.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. BUSINESS MODEL & MARKET SIZING */}
      {activeSubTab === 'business' && (
        <div className="space-y-6 text-xs">
          {/* Revenue Streams */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2 shadow-2xs">
              <span className="font-bold text-slate-900 text-sm block">1. Per-Transaction Verification Fee</span>
              <p className="text-slate-600">
                Micro-fee per verified transaction cleared through UTVN:
              </p>
              <div className="font-mono text-emerald-700 font-bold text-base">
                ₹15 - ₹50 ($0.20 - $0.65) / Invoice
              </div>
              <p className="text-[11px] text-slate-500">
                Paid by buyer treasury. Negligible against average B2B invoice size of ₹450,000 ($5,400).
              </p>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2 shadow-2xs">
              <span className="font-bold text-slate-900 text-sm block">2. Enterprise ERP Connector SaaS</span>
              <p className="text-slate-600">
                Annual license for native SAP, Oracle Fusion, and Dynamics 365 real-time sentinel plugins:
              </p>
              <div className="font-mono text-emerald-700 font-bold text-base">
                ₹1,200,000 ($14,500) / Enterprise / Year
              </div>
              <p className="text-[11px] text-slate-500">
                Includes automated 16-point anomaly engine and CFO dual-signoff portal.
              </p>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2 shadow-2xs">
              <span className="font-bold text-slate-900 text-sm block">3. Bank Gateway & Escrow Fee</span>
              <p className="text-slate-600">
                Basis-point fee on transactions utilizing UTVN Verified Payment Instruction (VPI) with fraud warranty:
              </p>
              <div className="font-mono text-emerald-700 font-bold text-base">
                2 bps (0.02%) on settled volume
              </div>
              <p className="text-[11px] text-slate-500">
                Shared with commercial settlement banks in exchange for zero-fraud liability guarantee.
              </p>
            </div>
          </div>

          {/* Market Sizing */}
          <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4">
            <h4 className="font-bold text-slate-900 text-sm">
              Total Addressable Market (TAM / SAM / SOM)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-slate-700">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[11px] text-slate-500 font-semibold uppercase block">Global B2B Invoicing TAM</span>
                <span className="font-mono text-xl font-bold text-slate-900">550 Billion Invoices/Yr</span>
                <p className="text-[11px] text-slate-600 pt-1 leading-relaxed">
                  Global annual B2B transaction value exceeds $120 Trillion. Est. fraud losses exceed $350 Billion annually.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[11px] text-slate-500 font-semibold uppercase block">India Serviceable Market (SAM)</span>
                <span className="font-mono text-xl font-bold text-emerald-700">2.4 Billion Invoices/Yr</span>
                <p className="text-[11px] text-slate-600 pt-1 leading-relaxed">
                  Indian e-invoicing portal processes &gt;200M B2B invoices per month under GST mandate. Potential revenue: ₹3,600 Crore ($430M).
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[11px] text-slate-500 font-semibold uppercase block">Initial Obtainable Beachhead (SOM)</span>
                <span className="font-mono text-xl font-bold text-emerald-700">12 Million Invoices/Yr</span>
                <p className="text-[11px] text-slate-600 pt-1 leading-relaxed">
                  Targeting top 50 EPC, automotive, and infrastructure conglomerates in India. Projected ARR: ₹24 Crore ($2.9M) in Year 2.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
