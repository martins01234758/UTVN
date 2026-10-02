import React, { useState } from 'react';
import { 
  ShieldCheck, ShieldAlert, AlertTriangle, CheckCircle2, 
  Flame, Play, Bug, Network, Cpu, FileSearch, Scale,
  Eye, Check, RefreshCw, AlertCircle
} from 'lucide-react';
import { mockTransactions } from '../data/mockData';
import { evaluateTransactionFraud } from '../utils/fraudEngine';

export const FraudEngineView: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'DETERMINISTIC' | 'ML_ANOMALY' | 'GRAPH_ANALYSIS' | 'DOCUMENT_FORENSICS'>('ALL');
  
  // Threat simulation state
  const [simulatedVector, setSimulatedVector] = useState<number>(7); // default: Check 7 (Bank Account Change)
  const [vendorTenure, setVendorTenure] = useState<number>(36);
  const [bankModified, setBankModified] = useState<boolean>(true);
  const [fuzzyScore, setFuzzyScore] = useState<number>(34);
  const [qtyDelta, setQtyDelta] = useState<number>(20); // 20 units overbilled
  const [duplicateIrn, setDuplicateIrn] = useState<boolean>(false);
  const [manipulatedPdf, setManipulatedPdf] = useState<boolean>(false);
  const [rapidApprovals, setRapidApprovals] = useState<boolean>(false);

  // Run dynamic evaluation based on simulator
  const activeTx = mockTransactions[0];
  const dynamicEvaluation = evaluateTransactionFraud({
    ...activeTx,
    invoiceId: duplicateIrn ? 'INV-TS-2026-DUP' : manipulatedPdf ? 'INV-TAMPER-01' : 'INV-TS-2026-NORMAL',
    purchaseOrderId: 'PO-2026-LT-88192',
    lineItems: [
      {
        ...activeTx.lineItems[0],
        invoiceQuantity: activeTx.lineItems[0].poQuantity + (qtyDelta > 0 ? qtyDelta : 0),
        receivedQuantity: activeTx.lineItems[0].poQuantity
      }
    ],
    seller: {
      ...activeTx.seller,
      tenureMonths: vendorTenure,
      riskScore: vendorTenure < 1 ? 75 : 12
    },
    taxInfo: {
      ...activeTx.taxInfo,
      isTaxPortalVerified: !duplicateIrn,
      taxDiscrepancyNotes: manipulatedPdf ? 'PDF_FONT_INCONSISTENCY: OCR mismatch detected in bank account block.' : undefined
    },
    paymentDetails: {
      ...activeTx.paymentDetails,
      bankAccountChangeDetected: bankModified,
      beneficiaryAccount: bankModified ? '998800112233' : activeTx.paymentDetails.beneficiaryAccount,
      nameMatchConfidence: fuzzyScore
    },
    auditTrail: rapidApprovals ? [
      ...activeTx.auditTrail,
      {
        id: 'AUD-ANOMALY',
        timestamp: '2026-10-02T02:15:00Z',
        action: 'RAPID_OFF_HOURS_OVERRIDE',
        actor: {
          userId: 'usr-unknown',
          userName: 'Night Shift Admin',
          role: 'ADMIN',
          authMethod: 'API_TOKEN'
        },
        previousHash: '0000',
        currentHash: '1111',
        payloadSummary: 'Unusual off-hours self-approval bypass triggered.'
      }
    ] : activeTx.auditTrail
  });

  const categories = [
    {
      id: 'DETERMINISTIC',
      name: 'Deterministic Rules (8)',
      icon: Scale,
      desc: 'Hard Boolean assertions: duplicate invoice hashes, PO matches, math reconcile, KYC vendor master, bank penny-drop match, tax portal verification.'
    },
    {
      id: 'ML_ANOMALY',
      name: 'ML & Anomaly Scoring (4)',
      icon: Cpu,
      desc: 'Statistical outlier detection: transaction amount vs historical 90-day corridor baseline, invoice burst velocity, non-sequential numbering gaps.'
    },
    {
      id: 'GRAPH_ANALYSIS',
      name: 'Graph Network Topology (3)',
      icon: Network,
      desc: 'Entity relationship graph: circular billing detection, common beneficial ownership across buyer/seller (conflict of interest), unusual approval workflows.'
    },
    {
      id: 'DOCUMENT_FORENSICS',
      name: 'Document Forensics & Vision OCR (1)',
      icon: FileSearch,
      desc: 'PDF layer kerning analysis, font substitution identification, OCR bounding box checksum vs text stream reconciliation.'
    }
  ];

  const filteredChecks = dynamicEvaluation.checks.filter(c => {
    return selectedCategory === 'ALL' || c.category === selectedCategory;
  });

  return (
    <div className="space-y-6">
      {/* Overview & Architecture Hero */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-mono text-blue-400 font-semibold block uppercase tracking-wider">
              Autonomous Risk Sentinel
            </span>
            <h2 className="text-xl font-bold text-white mt-0.5">
              16-Point Multi-Layered Fraud Detection Architecture
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              Unlike generic AI scoring that outputs opaque probabilities, UTVN operates a hybrid defense engine combining deterministic business rules, statistical outlier models, entity graph analysis, and document forensic OCR.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-right">
              <span className="text-[10px] text-slate-500 block uppercase">Overall Verdict</span>
              <span className={`font-mono text-sm font-bold ${
                dynamicEvaluation.riskLevel === 'BLOCKED' ? 'text-rose-400' : dynamicEvaluation.riskLevel === 'VERIFIED' ? 'text-emerald-400' : 'text-amber-400'
              }`}>
                {dynamicEvaluation.riskLevel}
              </span>
            </div>
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-right">
              <span className="text-[10px] text-slate-500 block uppercase">Composite Score</span>
              <span className="font-mono text-sm font-bold text-white">
                {dynamicEvaluation.riskScore}/100
              </span>
            </div>
          </div>
        </div>

        {/* 4 Architectural Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-2">
          {categories.map(cat => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(isSelected ? 'ALL' : cat.id as any)}
                className={`p-3.5 rounded-lg border text-left transition-all ${
                  isSelected
                    ? 'bg-blue-950/40 border-blue-500 text-white shadow-md shadow-blue-900/30'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2 font-semibold text-xs text-white">
                  <Icon className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>{cat.name}</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                  {cat.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Threat Simulation Sandbox */}
      <div className="p-5 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-400" />
            <h3 className="text-sm font-bold text-white">
              Live Adversarial Threat Simulation Lab
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Mutate payload parameters to test automated sentinel traps
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg">
            <label className="text-slate-400 block font-medium">Bank Account Mutation:</label>
            <div className="mt-2 flex items-center gap-2">
              <input
                type="checkbox"
                checked={bankModified}
                onChange={(e) => {
                  setBankModified(e.target.checked);
                  if (e.target.checked) setFuzzyScore(34);
                  else setFuzzyScore(99.6);
                }}
                className="rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-0"
              />
              <span className={bankModified ? 'text-rose-400 font-semibold' : 'text-slate-400'}>
                {bankModified ? 'Altered (Attack)' : 'Primary Verified'}
              </span>
            </div>
          </div>

          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg">
            <label className="text-slate-400 block font-medium">Fuzzy Name Match: {fuzzyScore}%</label>
            <input
              type="range"
              min="10"
              max="100"
              value={fuzzyScore}
              onChange={(e) => setFuzzyScore(Number(e.target.value))}
              className="w-full mt-2 accent-blue-500"
            />
          </div>

          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg">
            <label className="text-slate-400 block font-medium">Overbilled Quantity (MT): +{qtyDelta}</label>
            <input
              type="range"
              min="0"
              max="50"
              value={qtyDelta}
              onChange={(e) => setQtyDelta(Number(e.target.value))}
              className="w-full mt-2 accent-blue-500"
            />
          </div>

          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg">
            <label className="text-slate-400 block font-medium">Vendor History:</label>
            <select
              value={vendorTenure}
              onChange={(e) => setVendorTenure(Number(e.target.value))}
              className="w-full mt-1.5 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200"
            >
              <option value="0">Day 1 (First-time vendor)</option>
              <option value="3">3 Months (Trial tier)</option>
              <option value="36">36 Months (Established)</option>
            </select>
          </div>

          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg">
            <label className="text-slate-400 block font-medium">Duplicate IRN Hash:</label>
            <div className="mt-2 flex items-center gap-2">
              <input
                type="checkbox"
                checked={duplicateIrn}
                onChange={(e) => setDuplicateIrn(e.target.checked)}
                className="rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-0"
              />
              <span className={duplicateIrn ? 'text-rose-400 font-semibold' : 'text-slate-400'}>
                {duplicateIrn ? 'Recycled Hash' : 'Unique IRN'}
              </span>
            </div>
          </div>

          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg">
            <label className="text-slate-400 block font-medium">Manipulated PDF OCR:</label>
            <div className="mt-2 flex items-center gap-2">
              <input
                type="checkbox"
                checked={manipulatedPdf}
                onChange={(e) => setManipulatedPdf(e.target.checked)}
                className="rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-0"
              />
              <span className={manipulatedPdf ? 'text-rose-400 font-semibold' : 'text-slate-400'}>
                {manipulatedPdf ? 'Altered Layers' : 'Pristine Vector'}
              </span>
            </div>
          </div>
        </div>

        {/* Explainable Verdict Box */}
        <div className={`p-4 rounded-lg border text-xs flex items-start gap-3 ${
          dynamicEvaluation.riskLevel === 'BLOCKED'
            ? 'bg-rose-950/30 border-rose-900/60 text-rose-200'
            : dynamicEvaluation.riskLevel === 'HIGH_RISK'
            ? 'bg-orange-950/30 border-orange-900/60 text-orange-200'
            : dynamicEvaluation.riskLevel === 'NEEDS_REVIEW'
            ? 'bg-amber-950/30 border-amber-900/60 text-amber-200'
            : 'bg-emerald-950/30 border-emerald-900/60 text-emerald-200'
        }`}>
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm">
                Real-Time Sentinel Verdict: {dynamicEvaluation.riskLevel}
              </span>
              <span className="font-mono text-[11px] font-semibold">
                Action: {dynamicEvaluation.recommendedAction}
              </span>
            </div>
            <p className="text-xs opacity-90 leading-relaxed">
              {dynamicEvaluation.summary}
            </p>
          </div>
        </div>
      </div>

      {/* The 16 Fraud Check Inspection Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-semibold text-slate-300">
            Showing {filteredChecks.length} of 16 Checks ({selectedCategory} Filter)
          </span>
          <span className="font-mono">
            {dynamicEvaluation.checks.filter(c => !c.passed).length} Violations Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredChecks.map((check, idx) => (
            <div
              key={check.id}
              className={`p-4 rounded-xl border text-xs space-y-2 transition-all ${
                check.passed
                  ? 'bg-slate-900/70 border-slate-800 text-slate-300'
                  : check.severity === 'CRITICAL'
                  ? 'bg-rose-950/30 border-rose-800/60 text-rose-200 shadow-sm shadow-rose-900/20'
                  : check.severity === 'HIGH'
                  ? 'bg-orange-950/30 border-orange-800/60 text-orange-200'
                  : 'bg-amber-950/30 border-amber-800/60 text-amber-200'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-slate-500">
                      {check.id.replace('chk-', '#')}
                    </span>
                    <span className="font-bold text-white text-sm">
                      {check.title}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                    Code: {check.code} · Layer: {check.category}
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  {check.passed ? (
                    <span className="text-emerald-400 font-bold font-mono text-[11px] flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> PASSED
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-rose-500/20 text-rose-300">
                      {check.severity}
                    </span>
                  )}
                </div>
              </div>

              <p className={`text-xs leading-relaxed ${check.passed ? 'text-slate-400' : 'font-medium'}`}>
                {check.explanation}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
