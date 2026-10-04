import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, ShieldAlert, AlertTriangle, CheckCircle2, 
  Search, PlayCircle, FileSpreadsheet, TableProperties, FileDown, GitBranch,
  Activity, Copy, Check, ExternalLink, ArrowUpRight,
  Calendar, Building2, SlidersHorizontal, RotateCcw, X, Hash, DollarSign,
  ChevronDown, Filter, Layers, Clock, Scan
} from 'lucide-react';
import { UniversalTransaction, RiskLevel } from '../types/utvn';
import { exportTransactionAuditPdf } from '../services/pdfReceiptService';

interface DashboardViewProps {
  transactions: UniversalTransaction[];
  onSelectTransaction: (tx: UniversalTransaction) => void;
  onNavigateToLifecycle: () => void;
  onNavigateToFraudEngine: () => void;
  onNavigateToPipeline?: () => void;
  onOpenSheetsSync?: () => void;
  onOpenBulkImport?: () => void;
  onOpenScanInvoice?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  transactions,
  onSelectTransaction,
  onNavigateToLifecycle,
  onNavigateToFraudEngine,
  onNavigateToPipeline,
  onOpenSheetsSync,
  onOpenBulkImport,
  onOpenScanInvoice,
}) => {
  // Primary Search Query
  const [searchQuery, setSearchQuery] = useState('');
  
  // Date & Timeframe Filters: 'ALL' | 'TODAY' | 'WEEK' | 'MONTH' | 'CUSTOM'
  const [dateFilter, setDateFilter] = useState<'ALL' | 'TODAY' | 'WEEK' | 'MONTH' | 'CUSTOM'>('ALL');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Risk / Threat Severity Tier Filters (High 1, 2, 3, 4)
  // 'ALL' | 'TIER_1' (Verified) | 'TIER_2' (Low) | 'TIER_3' (Needs Review) | 'TIER_4' (High Risk / Blocked)
  const [riskTierFilter, setRiskTierFilter] = useState<string>('ALL');

  // Company Name Filter
  const [companyFilter, setCompanyFilter] = useState<string>('ALL');

  // Invoice / Document Reference Specific Filter
  const [invoiceQuery, setInvoiceQuery] = useState('');

  // Additional Details Filters ("many other details")
  const [matchStatusFilter, setMatchStatusFilter] = useState<string>('ALL'); // ALL | MATCHED | DISCREPANCY
  const [amountRangeFilter, setAmountRangeFilter] = useState<string>('ALL'); // ALL | UNDER_10L | 10L_50L | 50L_1CR | ABOVE_1CR
  const [settlementFilter, setSettlementFilter] = useState<string>('ALL'); // ALL | RELEASED | PENDING | BLOCKED
  const [taxIrnFilter, setTaxIrnFilter] = useState<string>('ALL'); // ALL | VERIFIED | UNVERIFIED
  const [regionFilter, setRegionFilter] = useState<string>('ALL'); // ALL | IND | EU | US

  // Advanced Filters Drawer Toggle
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [copiedUtid, setCopiedUtid] = useState<string | null>(null);

  const copyToClipboard = (text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedUtid(text);
    setTimeout(() => setCopiedUtid(null), 2000);
  };

  // Dynamically extract unique company names across all transactions
  const uniqueCompanies = useMemo(() => {
    const set = new Set<string>();
    transactions.forEach(tx => {
      if (tx.buyer?.legalName) set.add(tx.buyer.legalName);
      if (tx.seller?.legalName) set.add(tx.seller.legalName);
    });
    return Array.from(set).sort();
  }, [transactions]);

  // Reset all filters to default
  const handleResetFilters = () => {
    setSearchQuery('');
    setDateFilter('ALL');
    setCustomStartDate('');
    setCustomEndDate('');
    setRiskTierFilter('ALL');
    setCompanyFilter('ALL');
    setInvoiceQuery('');
    setMatchStatusFilter('ALL');
    setAmountRangeFilter('ALL');
    setSettlementFilter('ALL');
    setTaxIrnFilter('ALL');
    setRegionFilter('ALL');
  };

  // Check how many active filters are applied
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchQuery.trim()) count++;
    if (dateFilter !== 'ALL') count++;
    if (riskTierFilter !== 'ALL') count++;
    if (companyFilter !== 'ALL') count++;
    if (invoiceQuery.trim()) count++;
    if (matchStatusFilter !== 'ALL') count++;
    if (amountRangeFilter !== 'ALL') count++;
    if (settlementFilter !== 'ALL') count++;
    if (taxIrnFilter !== 'ALL') count++;
    if (regionFilter !== 'ALL') count++;
    return count;
  }, [searchQuery, dateFilter, riskTierFilter, companyFilter, invoiceQuery, matchStatusFilter, amountRangeFilter, settlementFilter, taxIrnFilter, regionFilter]);

  // Core Multi-Criteria Filter Evaluation
  const filteredTransactions = useMemo(() => {
    const now = new Date();

    return transactions.filter(tx => {
      // 1. Universal Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesUniversal = 
          tx.utid.toLowerCase().includes(q) ||
          tx.buyer.legalName.toLowerCase().includes(q) ||
          tx.seller.legalName.toLowerCase().includes(q) ||
          tx.invoiceId.toLowerCase().includes(q) ||
          tx.purchaseOrderId.toLowerCase().includes(q) ||
          tx.buyer.taxId.toLowerCase().includes(q) ||
          tx.seller.taxId.toLowerCase().includes(q) ||
          (tx.paymentDetails?.beneficiaryAccount && tx.paymentDetails.beneficiaryAccount.includes(q)) ||
          (tx.paymentDetails?.beneficiaryIfscOrIban && tx.paymentDetails.beneficiaryIfscOrIban.toLowerCase().includes(q)) ||
          (tx.taxInfo?.irn && tx.taxInfo.irn.toLowerCase().includes(q));

        if (!matchesUniversal) return false;
      }

      // 2. Date / Timeframe Filter
      if (dateFilter !== 'ALL') {
        const txDate = new Date(tx.createdAt || tx.invoiceDate);
        const diffMs = now.getTime() - txDate.getTime();
        const diffDays = diffMs / (1000 * 60 * 60 * 24);

        if (dateFilter === 'TODAY') {
          // Created within the last 24 hours or calendar today
          if (diffDays > 1.2 && txDate.getDate() !== now.getDate()) return false;
        } else if (dateFilter === 'WEEK') {
          // Created within the last 7 days
          if (diffDays > 7.5) return false;
        } else if (dateFilter === 'MONTH') {
          // Created within the last 30 days
          if (diffDays > 31) return false;
        } else if (dateFilter === 'CUSTOM') {
          if (customStartDate) {
            const start = new Date(customStartDate);
            start.setHours(0, 0, 0, 0);
            if (txDate < start) return false;
          }
          if (customEndDate) {
            const end = new Date(customEndDate);
            end.setHours(23, 59, 59, 999);
            if (txDate > end) return false;
          }
        }
      }

      // 3. Risk / Threat Severity Tier (High 1, 2, 3, 4)
      if (riskTierFilter !== 'ALL') {
        const score = tx.riskScore ?? 0;
        const level = tx.overallRiskLevel;

        if (riskTierFilter === 'TIER_1') {
          // Tier 1: Verified (Score 0-10 or VERIFIED)
          if (level !== 'VERIFIED' && score > 10) return false;
        } else if (riskTierFilter === 'TIER_2') {
          // Tier 2: Low Risk (Score 11-30 or LOW_RISK)
          if (level !== 'LOW_RISK' && (score <= 10 || score > 30)) return false;
        } else if (riskTierFilter === 'TIER_3') {
          // Tier 3: Medium / Needs Review (Score 31-60 or NEEDS_REVIEW)
          if (level !== 'NEEDS_REVIEW' && (score <= 30 || score > 60)) return false;
        } else if (riskTierFilter === 'TIER_4') {
          // Tier 4: High Risk / Blocked Critical (Score > 60 or HIGH_RISK / BLOCKED)
          if (level !== 'HIGH_RISK' && level !== 'BLOCKED' && score <= 60) return false;
        }
      }

      // 4. Company Name Filter (matches either buyer or seller)
      if (companyFilter !== 'ALL') {
        const isBuyerMatch = tx.buyer.legalName === companyFilter;
        const isSellerMatch = tx.seller.legalName === companyFilter;
        if (!isBuyerMatch && !isSellerMatch) return false;
      }

      // 5. Specific Invoice / PO Number Filter
      if (invoiceQuery.trim()) {
        const invQ = invoiceQuery.toLowerCase();
        const matchesDoc = 
          tx.invoiceId.toLowerCase().includes(invQ) ||
          tx.purchaseOrderId.toLowerCase().includes(invQ);
        if (!matchesDoc) return false;
      }

      // 6. 4-Way Match Status
      if (matchStatusFilter !== 'ALL') {
        const isSound = tx.lineItems.every(i => i.matchStatus === 'EXACT_MATCH') && tx.deliveryConfirmation?.inspectionStatus === 'ACCEPTED';
        if (matchStatusFilter === 'MATCHED' && !isSound) return false;
        if (matchStatusFilter === 'DISCREPANCY' && isSound) return false;
      }

      // 7. Gross Amount Range Filter
      if (amountRangeFilter !== 'ALL') {
        const amt = tx.totalAmount;
        if (amountRangeFilter === 'UNDER_10L' && amt >= 1000000) return false;
        if (amountRangeFilter === '10L_50L' && (amt < 1000000 || amt >= 5000000)) return false;
        if (amountRangeFilter === '50L_1CR' && (amt < 5000000 || amt >= 10000000)) return false;
        if (amountRangeFilter === 'ABOVE_1CR' && amt < 10000000) return false;
      }

      // 8. Settlement State Filter
      if (settlementFilter !== 'ALL') {
        const pStatus = tx.paymentDetails?.status;
        if (settlementFilter === 'RELEASED') {
          if (pStatus !== 'RELEASED' && tx.status !== 'PAYMENT_EXECUTED') return false;
        } else if (settlementFilter === 'PENDING') {
          if (pStatus !== 'PENDING_APPROVAL' && pStatus !== 'BENEFICIARY_VERIFIED' && tx.status !== 'PAYMENT_PENDING') return false;
        } else if (settlementFilter === 'BLOCKED') {
          if (pStatus !== 'BLOCKED' && pStatus !== 'FAILED' && tx.status !== 'REJECTED') return false;
        }
      }

      // 9. Tax / IRN Verification Filter
      if (taxIrnFilter !== 'ALL') {
        const isIrnOk = tx.taxInfo?.isTaxPortalVerified === true;
        if (taxIrnFilter === 'VERIFIED' && !isIrnOk) return false;
        if (taxIrnFilter === 'UNVERIFIED' && isIrnOk) return false;
      }

      // 10. Region / Currency Corridor
      if (regionFilter !== 'ALL') {
        if (regionFilter === 'IND' && tx.currency !== 'INR') return false;
        if (regionFilter === 'EU' && tx.currency !== 'EUR') return false;
        if (regionFilter === 'US' && tx.currency !== 'USD') return false;
      }

      return true;
    });
  }, [
    transactions,
    searchQuery,
    dateFilter,
    customStartDate,
    customEndDate,
    riskTierFilter,
    companyFilter,
    invoiceQuery,
    matchStatusFilter,
    amountRangeFilter,
    settlementFilter,
    taxIrnFilter,
    regionFilter
  ]);

  const getRiskBadge = (level: RiskLevel) => {
    switch (level) {
      case 'VERIFIED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>VERIFIED</span>
          </span>
        );
      case 'LOW_RISK':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
            <span>LOW RISK</span>
          </span>
        );
      case 'NEEDS_REVIEW':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>NEEDS REVIEW</span>
          </span>
        );
      case 'HIGH_RISK':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-orange-50 text-orange-800 border border-orange-200">
            <AlertTriangle className="w-3.5 h-3.5 text-orange-600" />
            <span>HIGH RISK</span>
          </span>
        );
      case 'BLOCKED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
            <span>BLOCKED</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Macro Network Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1 */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-1.5 transition-all duration-200 hover:border-emerald-500 hover:-translate-y-0.5 hover:shadow-md shadow-xs relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-600 to-teal-500" />
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Verified Network Volume</span>
            <span className="font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded text-[10px] font-bold">+18.4% MoM</span>
          </div>
          <div className="text-2xl font-extrabold font-mono tracking-tight text-slate-900 tabular-nums">
            ₹48,290,410,000
          </div>
          <div className="text-[11px] text-slate-500">
            14,280 B2B transactions settled across 18 banking rails
          </div>
        </div>

        {/* Stat 2 */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-1.5 transition-all duration-200 hover:border-rose-400 hover:-translate-y-0.5 hover:shadow-md shadow-xs relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 to-red-600" />
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Fraud Intercepted Value</span>
            <span className="font-mono text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded text-[10px] font-bold">100% Intercept Rate</span>
          </div>
          <div className="text-2xl font-extrabold font-mono tracking-tight text-rose-700 tabular-nums">
            ₹1,420,800,000
          </div>
          <div className="text-[11px] text-slate-500">
            Blocked bank account mutations, duplicate IRNs & ghost invoices
          </div>
        </div>

        {/* Stat 3 */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-1.5 transition-all duration-200 hover:border-emerald-400 hover:-translate-y-0.5 hover:shadow-md shadow-xs relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 to-emerald-600" />
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>16-Point Verification Latency</span>
            <span className="font-mono text-teal-700 bg-teal-50 border border-teal-200 px-1.5 py-0.5 rounded text-[10px] font-bold">Real-Time SLA</span>
          </div>
          <div className="text-2xl font-extrabold font-mono tracking-tight text-slate-900 tabular-nums">
            1.24s
          </div>
          <div className="text-[11px] text-slate-500">
            Automated 4-way match + IRP portal query + anomaly score
          </div>
        </div>

        {/* Stat 4 */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-1.5 transition-all duration-200 hover:border-slate-400 hover:-translate-y-0.5 hover:shadow-md shadow-xs relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-slate-700 to-slate-900" />
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Connected Enterprise Corridors</span>
            <span className="font-mono text-slate-700 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded text-[10px] font-bold">Multi-ERP</span>
          </div>
          <div className="text-2xl font-extrabold font-mono tracking-tight text-slate-900 tabular-nums">
            8,492 Nodes
          </div>
          <div className="text-[11px] text-slate-500">
            SAP, Oracle, Zoho, Tally & Peppol federated endpoints
          </div>
        </div>
      </div>

      {/* Quick Action Hero Banner */}
      <div className="p-5 bg-gradient-to-r from-emerald-50/90 via-teal-50/40 to-slate-50 border border-emerald-200 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
            </span>
            <h3 className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
              Universal Transaction Verification Active
            </h3>
          </div>
          <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
            Every transaction is bound by a deterministic Universal Transaction ID (UTID) tying together Buyer KYC, Seller Authorized Signatories, 4-Way Mathematical Matching, Tax Portal IRN hashes, and Penny-Drop Beneficiary Validation.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          {onOpenScanInvoice && (
            <button
              onClick={onOpenScanInvoice}
              className="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-xl transition-all duration-150 flex items-center gap-2 shadow-md shadow-emerald-600/30 active:scale-95"
            >
              <Scan className="w-4 h-4" />
              <span>Scan Invoice</span>
            </button>
          )}
          <button
            onClick={onNavigateToLifecycle}
            className="px-3.5 py-2 text-xs font-bold text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all duration-150 flex items-center gap-1.5 shadow-xs active:scale-95"
          >
            <PlayCircle className="w-4 h-4 text-emerald-600" />
            <span>Launch 4-Way Matcher</span>
          </button>
          <button
            onClick={onNavigateToFraudEngine}
            className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all duration-150 flex items-center gap-1.5 shadow-xs active:scale-95"
          >
            <Activity className="w-4 h-4 text-emerald-600" />
            <span>16-Check Fraud Lab</span>
          </button>
          {onNavigateToPipeline && (
            <button
              onClick={onNavigateToPipeline}
              className="px-3.5 py-2 text-xs font-bold text-emerald-800 bg-white hover:bg-emerald-50 border border-emerald-200 rounded-xl transition-all duration-150 flex items-center gap-1.5 shadow-xs active:scale-95"
            >
              <GitBranch className="w-4 h-4 text-emerald-600" />
              <span>CI/CD Pipeline</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ADVANCED MULTI-CRITERIA SEARCH & FILTER SUITE                             */}
      {/* ========================================================================= */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden divide-y divide-slate-100">
        
        {/* Primary Search & Quick Filters Bar */}
        <div className="p-3.5 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          
          {/* Universal Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by UTID, company, invoice #, PO #, tax ID, bank account, IFSC..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-0.5 rounded"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Filter Selectors */}
          <div className="flex items-center gap-2 overflow-x-auto text-xs shrink-0">
            
            {/* 1. Date / Timeframe Filter (Today / Week / Month / Custom) */}
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 gap-1.5 shadow-2xs">
              <Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value as any)}
                className="bg-transparent text-slate-800 font-semibold focus:outline-none cursor-pointer text-xs"
              >
                <option value="ALL">All Dates</option>
                <option value="TODAY">Today (24h)</option>
                <option value="WEEK">This Week (7 Days)</option>
                <option value="MONTH">This Month (30 Days)</option>
                <option value="CUSTOM">Custom Range...</option>
              </select>
            </div>

            {/* 2. Risk / High Severity Tier Filter (1, 2, 3, 4) */}
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 gap-1.5 shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <select
                value={riskTierFilter}
                onChange={(e) => setRiskTierFilter(e.target.value)}
                className="bg-transparent text-slate-800 font-semibold focus:outline-none cursor-pointer text-xs"
              >
                <option value="ALL">All Risk Tiers</option>
                <option value="TIER_1">Tier 1: Verified (Score ≤ 10)</option>
                <option value="TIER_2">Tier 2: Low Risk (11 - 30)</option>
                <option value="TIER_3">Tier 3: Needs Review (31 - 60)</option>
                <option value="TIER_4">Tier 4: High Threat / Blocked (&gt; 60)</option>
              </select>
            </div>

            {/* 3. Company Name Filter Dropdown */}
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 gap-1.5 shadow-2xs max-w-[190px]">
              <Building2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <select
                value={companyFilter}
                onChange={(e) => setCompanyFilter(e.target.value)}
                className="bg-transparent text-slate-800 font-semibold focus:outline-none cursor-pointer text-xs truncate"
              >
                <option value="ALL">All Companies</option>
                {uniqueCompanies.map((c) => (
                  <option key={c} value={c} className="truncate">{c}</option>
                ))}
              </select>
            </div>

            {/* 4. Advanced Filters Toggle Button */}
            <button
              onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                isAdvancedOpen || activeFiltersCount > 0
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 shadow-2xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 shadow-2xs'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-600" />
              <span>More Filters</span>
              {activeFiltersCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">
                  {activeFiltersCount}
                </span>
              )}
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isAdvancedOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Clear All Filter Button (when active) */}
            {activeFiltersCount > 0 && (
              <button
                onClick={handleResetFilters}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-xs font-semibold transition-colors shadow-2xs"
                title="Reset all filters to default"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Collapsible Advanced Filters Drawer */}
        {isAdvancedOpen && (
          <div className="p-4 bg-slate-50/70 border-t border-slate-100 space-y-4 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
              
              {/* Specific Invoice / PO Number Filter */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                  <Hash className="w-3 h-3 text-slate-400" />
                  Invoice / PO #
                </label>
                <input
                  type="text"
                  placeholder="e.g. INV-TS-2026, PO-88192"
                  value={invoiceQuery}
                  onChange={(e) => setInvoiceQuery(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-emerald-500 font-mono shadow-2xs"
                />
              </div>

              {/* 4-Way Match Status Filter */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                  <Layers className="w-3 h-3 text-slate-400" />
                  4-Way Match Status
                </label>
                <select
                  value={matchStatusFilter}
                  onChange={(e) => setMatchStatusFilter(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-emerald-500 font-semibold cursor-pointer shadow-2xs"
                >
                  <option value="ALL">All Match States</option>
                  <option value="MATCHED">Exact 4-Way Match (Sound)</option>
                  <option value="DISCREPANCY">Discrepancy / Mismatch Flagged</option>
                </select>
              </div>

              {/* Gross Amount Range Filter */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                  <DollarSign className="w-3 h-3 text-slate-400" />
                  Gross Amount Range
                </label>
                <select
                  value={amountRangeFilter}
                  onChange={(e) => setAmountRangeFilter(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-emerald-500 font-semibold cursor-pointer shadow-2xs"
                >
                  <option value="ALL">All Amounts</option>
                  <option value="UNDER_10L">&lt; ₹10 Lakhs (&lt; 1M)</option>
                  <option value="10L_50L">₹10 Lakhs - ₹50 Lakhs (1M - 5M)</option>
                  <option value="50L_1CR">₹50 Lakhs - ₹1 Crore (5M - 10M)</option>
                  <option value="ABOVE_1CR">&gt; ₹1 Crore (&gt; 10M)</option>
                </select>
              </div>

              {/* Settlement State Filter */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  Settlement State
                </label>
                <select
                  value={settlementFilter}
                  onChange={(e) => setSettlementFilter(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-emerald-500 font-semibold cursor-pointer shadow-2xs"
                >
                  <option value="ALL">All Settlement States</option>
                  <option value="RELEASED">Released / Settled</option>
                  <option value="PENDING">Pending / Outbox Queue</option>
                  <option value="BLOCKED">Blocked / Sentinel Intercept</option>
                </select>
              </div>

              {/* Trading Corridor / Currency */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                  Trading Corridor
                </label>
                <select
                  value={regionFilter}
                  onChange={(e) => setRegionFilter(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-emerald-500 font-semibold cursor-pointer shadow-2xs"
                >
                  <option value="ALL">All Global Corridors</option>
                  <option value="IND">India Stack (INR / GSTIN)</option>
                  <option value="EU">Europe (EUR / Peppol UBL)</option>
                  <option value="US">North America (USD)</option>
                </select>
              </div>
            </div>

            {/* Custom Date Pickers (visible if dateFilter is CUSTOM) */}
            {dateFilter === 'CUSTOM' && (
              <div className="p-3 bg-white border border-slate-200 rounded-xl flex flex-col sm:flex-row items-center gap-3">
                <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Custom Date Range:</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-500">From:</span>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:outline-none focus:border-emerald-500"
                  />
                  <span className="text-slate-500">To:</span>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Active Filter Chips & Results Count Bar */}
        <div className="px-4 py-2.5 bg-slate-50/50 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-slate-500 font-medium text-[11px]">
              Showing <strong className="text-slate-900 font-bold">{filteredTransactions.length}</strong> of <strong className="text-slate-700">{transactions.length}</strong> transactions
            </span>

            {/* Dynamic Active Filter Tag Pills */}
            {dateFilter !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                <span>Date: {dateFilter}</span>
                <button onClick={() => setDateFilter('ALL')} className="hover:text-emerald-950"><X className="w-3 h-3" /></button>
              </span>
            )}

            {riskTierFilter !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                <span>Risk: {riskTierFilter.replace('_', ' ')}</span>
                <button onClick={() => setRiskTierFilter('ALL')} className="hover:text-emerald-950"><X className="w-3 h-3" /></button>
              </span>
            )}

            {companyFilter !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                <span>Company: {companyFilter.split(' ')[0]}</span>
                <button onClick={() => setCompanyFilter('ALL')} className="hover:text-emerald-950"><X className="w-3 h-3" /></button>
              </span>
            )}

            {invoiceQuery && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                <span>Doc: {invoiceQuery}</span>
                <button onClick={() => setInvoiceQuery('')} className="hover:text-emerald-950"><X className="w-3 h-3" /></button>
              </span>
            )}

            {matchStatusFilter !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                <span>Match: {matchStatusFilter}</span>
                <button onClick={() => setMatchStatusFilter('ALL')} className="hover:text-emerald-950"><X className="w-3 h-3" /></button>
              </span>
            )}

            {amountRangeFilter !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                <span>Amount: {amountRangeFilter}</span>
                <button onClick={() => setAmountRangeFilter('ALL')} className="hover:text-emerald-950"><X className="w-3 h-3" /></button>
              </span>
            )}

            {settlementFilter !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                <span>Settlement: {settlementFilter}</span>
                <button onClick={() => setSettlementFilter('ALL')} className="hover:text-emerald-950"><X className="w-3 h-3" /></button>
              </span>
            )}

            {regionFilter !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                <span>Corridor: {regionFilter}</span>
                <button onClick={() => setRegionFilter('ALL')} className="hover:text-emerald-950"><X className="w-3 h-3" /></button>
              </span>
            )}
          </div>

          {/* Quick Integration Export Actions */}
          <div className="flex items-center gap-2">
            {onOpenSheetsSync && (
              <button
                onClick={onOpenSheetsSync}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold transition-colors shadow-2xs"
                title="Export filtered records to Google Sheets"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Sheets Export</span>
              </button>
            )}
            {onOpenBulkImport && (
              <button
                onClick={onOpenBulkImport}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold transition-colors shadow-2xs"
                title="Import bulk invoices"
              >
                <TableProperties className="w-3.5 h-3.5 text-slate-600" />
                <span>Bulk Sheet</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Ledger Table */}
      <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Universal Transaction ID (UTID)</th>
                <th className="py-3.5 px-4">Trading Corridor</th>
                <th className="py-3.5 px-4">Linked PO & Invoice</th>
                <th className="py-3.5 px-4 text-right">Gross Amount</th>
                <th className="py-3.5 px-4 text-center">4-Way Match</th>
                <th className="py-3.5 px-4">Risk Evaluation</th>
                <th className="py-3.5 px-4 text-right">Settlement State</th>
                <th className="py-3.5 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No transactions match your query or filter criteria.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr
                    key={tx.utid}
                    onClick={() => onSelectTransaction(tx)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-4 font-mono">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-emerald-700 group-hover:text-emerald-800">
                          {tx.utid}
                        </span>
                        <button
                          onClick={(e) => copyToClipboard(tx.utid, e)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-slate-600 transition-opacity rounded"
                          title="Copy UTID"
                        >
                          {copiedUtid === tx.utid ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 font-medium">
                        {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {tx.auditTrail.length} Hash Blocks
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800 truncate max-w-[200px]">
                        {tx.buyer.tradeName || tx.buyer.legalName}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 truncate max-w-[200px]">
                        <span className="text-slate-400">to</span> {tx.seller.tradeName || tx.seller.legalName}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px]">
                      <div className="text-slate-700 font-medium">{tx.purchaseOrderId}</div>
                      <div className="text-slate-400">{tx.invoiceId}</div>
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono tabular-nums">
                      <div className="font-extrabold text-slate-900">
                        {tx.totalAmount.toLocaleString()} {tx.currency}
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium">
                        {tx.paymentDetails.paymentRail} Direct
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      {tx.lineItems.every(i => i.matchStatus === 'EXACT_MATCH') && tx.deliveryConfirmation?.inspectionStatus === 'ACCEPTED' ? (
                        <span className="font-mono text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          100% OK
                        </span>
                      ) : (
                        <span className="font-mono text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                          {tx.lineItems.find(i => i.matchStatus !== 'EXACT_MATCH')?.matchStatus || 'GRN_GAP'}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <div>{getRiskBadge(tx.overallRiskLevel)}</div>
                      <div className="text-[10px] text-slate-500 mt-1 font-mono">
                        Score: {tx.riskScore}/100 · {tx.fraudChecks.filter(c => !c.passed).length} Flags
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="font-mono font-semibold text-slate-800 text-[11px]">
                        {tx.status}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono font-medium">
                        {tx.paymentDetails.status}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectTransaction(tx);
                          }}
                          className="px-2.5 py-1 text-[11px] font-semibold text-emerald-700 hover:text-white hover:bg-emerald-600 rounded-lg transition-colors border border-emerald-300 shadow-xs"
                        >
                          Inspect
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            exportTransactionAuditPdf(tx);
                          }}
                          className="p-1 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 border border-transparent hover:border-emerald-200 rounded-lg transition-colors"
                          title="Download Official Audit PDF Receipt"
                        >
                          <FileDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
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

