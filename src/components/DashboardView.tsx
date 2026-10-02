import React, { useState } from 'react';
import { 
  ShieldCheck, ShieldAlert, AlertTriangle, CheckCircle2, 
  Search, Filter, ArrowUpRight, Lock, Activity, Landmark, 
  Layers, RefreshCw, FileText, Download, PlayCircle
} from 'lucide-react';
import { UniversalTransaction, RiskLevel } from '../types/utvn';

interface DashboardViewProps {
  transactions: UniversalTransaction[];
  onSelectTransaction: (tx: UniversalTransaction) => void;
  onNavigateToLifecycle: () => void;
  onNavigateToFraudEngine: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  transactions,
  onSelectTransaction,
  onNavigateToLifecycle,
  onNavigateToFraudEngine,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('ALL');
  const [regionFilter, setRegionFilter] = useState<string>('ALL');

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = 
      tx.utid.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.buyer.legalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.seller.legalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.invoiceId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.purchaseOrderId.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRisk = riskFilter === 'ALL' || tx.overallRiskLevel === riskFilter;
    
    const matchesRegion = 
      regionFilter === 'ALL' || 
      (regionFilter === 'IND' && tx.currency === 'INR') ||
      (regionFilter === 'EU' && tx.currency === 'EUR') ||
      (regionFilter === 'US' && tx.currency === 'USD');

    return matchesSearch && matchesRisk && matchesRegion;
  });

  const getRiskBadge = (level: RiskLevel) => {
    switch (level) {
      case 'VERIFIED':
        return (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>VERIFIED</span>
          </div>
        );
      case 'LOW_RISK':
        return (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>LOW RISK</span>
          </div>
        );
      case 'NEEDS_REVIEW':
        return (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>NEEDS REVIEW</span>
          </div>
        );
      case 'HIGH_RISK':
        return (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-orange-400">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>HIGH RISK</span>
          </div>
        );
      case 'BLOCKED':
        return (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-400">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>BLOCKED</span>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Macro Network Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Verified Network Volume</span>
            <span className="font-mono text-emerald-400">+18.4% MoM</span>
          </div>
          <div className="text-2xl font-bold font-mono tracking-tight text-white tabular-nums">
            ₹48,290,410,000
          </div>
          <div className="text-[11px] text-slate-500">
            14,280 B2B transactions settled across 18 banking rails
          </div>
        </div>

        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Fraud Intercepted Value</span>
            <span className="font-mono text-rose-400">100% Intercept Rate</span>
          </div>
          <div className="text-2xl font-bold font-mono tracking-tight text-rose-300 tabular-nums">
            ₹1,420,800,000
          </div>
          <div className="text-[11px] text-slate-500">
            Blocked bank account mutations, duplicate IRNs & ghost invoices
          </div>
        </div>

        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>16-Point Verification Latency</span>
            <span className="font-mono text-blue-400">Real-Time SLA</span>
          </div>
          <div className="text-2xl font-bold font-mono tracking-tight text-blue-300 tabular-nums">
            1.24s
          </div>
          <div className="text-[11px] text-slate-500">
            Automated 4-way match + IRP portal query + anomaly score
          </div>
        </div>

        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Connected Enterprise Corridors</span>
            <span className="font-mono text-purple-400">Multi-ERP</span>
          </div>
          <div className="text-2xl font-bold font-mono tracking-tight text-purple-300 tabular-nums">
            8,492 Nodes
          </div>
          <div className="text-[11px] text-slate-500">
            SAP, Oracle, Zoho, Tally & Peppol federated endpoints
          </div>
        </div>
      </div>

      {/* Interactive Quick Action Hero Banner */}
      <div className="p-5 bg-gradient-to-r from-blue-950/40 via-slate-900 to-indigo-950/40 border border-blue-900/40 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Universal Transaction Verification Active
            </h3>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl">
            Every transaction is bound by a deterministic Universal Transaction ID (UTID) tying together Buyer KYC, Seller Authorized Signatories, 4-Way Mathematical Matching, Tax Portal IRN hashes, and Penny-Drop Beneficiary Validation.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onNavigateToLifecycle}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm shadow-blue-600/30"
          >
            <PlayCircle className="w-3.5 h-3.5" />
            Launch 4-Way Matcher
          </button>
          <button
            onClick={onNavigateToFraudEngine}
            className="px-3.5 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Activity className="w-3.5 h-3.5 text-blue-400" />
            16-Check Fraud Lab
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/60 p-3 border border-slate-800 rounded-xl">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by UTID, buyer, supplier, invoice #, PO #..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 font-sans"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto text-xs">
          {/* Risk Filter Buttons */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5">
            <button
              onClick={() => setRiskFilter('ALL')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                riskFilter === 'ALL' ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setRiskFilter('VERIFIED')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                riskFilter === 'VERIFIED' ? 'bg-emerald-950/80 text-emerald-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Verified
            </button>
            <button
              onClick={() => setRiskFilter('NEEDS_REVIEW')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                riskFilter === 'NEEDS_REVIEW' ? 'bg-amber-950/80 text-amber-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Review
            </button>
            <button
              onClick={() => setRiskFilter('HIGH_RISK')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                riskFilter === 'HIGH_RISK' ? 'bg-orange-950/80 text-orange-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              High Risk
            </button>
            <button
              onClick={() => setRiskFilter('BLOCKED')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                riskFilter === 'BLOCKED' ? 'bg-rose-950/80 text-rose-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Blocked
            </button>
          </div>

          {/* Region Filter */}
          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 px-3 py-1.5 rounded-lg text-xs focus:outline-none"
          >
            <option value="ALL">Global / All Corridors</option>
            <option value="IND">India (GSTIN / IRN)</option>
            <option value="EU">Europe (Peppol / UBL)</option>
            <option value="US">North America (US Tax)</option>
          </select>
        </div>
      </div>

      {/* Main Ledger Table */}
      <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/60 shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-900/90 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Universal Transaction ID (UTID)</th>
                <th className="py-3 px-4">Trading Corridor</th>
                <th className="py-3 px-4">Linked PO & Invoice</th>
                <th className="py-3 px-4 text-right">Gross Amount</th>
                <th className="py-3 px-4 text-center">4-Way Match</th>
                <th className="py-3 px-4">Risk Evaluation</th>
                <th className="py-3 px-4 text-right">Settlement State</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    No transactions match your query or filter criteria.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr
                    key={tx.utid}
                    onClick={() => onSelectTransaction(tx)}
                    className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-4 font-mono">
                      <div className="font-semibold text-blue-400 group-hover:text-blue-300 flex items-center gap-1">
                        {tx.utid}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {tx.auditTrail.length} Hash Blocks
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-200 truncate max-w-[200px]">
                        {tx.buyer.tradeName || tx.buyer.legalName}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1 truncate max-w-[200px]">
                        <span className="text-slate-500">to</span> {tx.seller.tradeName || tx.seller.legalName}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px]">
                      <div className="text-slate-300">{tx.purchaseOrderId}</div>
                      <div className="text-slate-500">{tx.invoiceId}</div>
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono tabular-nums">
                      <div className="font-semibold text-white">
                        {tx.totalAmount.toLocaleString()} {tx.currency}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {tx.paymentDetails.paymentRail} Direct
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      {tx.lineItems.every(i => i.matchStatus === 'EXACT_MATCH') && tx.deliveryConfirmation?.inspectionStatus === 'ACCEPTED' ? (
                        <span className="font-mono text-[11px] font-semibold text-emerald-400">100% OK</span>
                      ) : (
                        <span className="font-mono text-[11px] font-semibold text-rose-400">
                          {tx.lineItems.find(i => i.matchStatus !== 'EXACT_MATCH')?.matchStatus || 'GRN_GAP'}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <div>{getRiskBadge(tx.overallRiskLevel)}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5 font-mono">
                        Score: {tx.riskScore}/100 · {tx.fraudChecks.filter(c => !c.passed).length} Flags
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="font-mono font-medium text-slate-300">
                        {tx.status}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {tx.paymentDetails.status}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectTransaction(tx);
                        }}
                        className="px-2.5 py-1 text-[11px] font-semibold text-blue-400 hover:text-white hover:bg-blue-600/30 border border-blue-800/40 rounded transition-colors"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
