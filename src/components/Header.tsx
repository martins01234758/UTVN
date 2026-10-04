import React, { useState, useRef, useEffect } from 'react';
import { 
  ShieldCheck, GitBranch, Menu, X, 
  FileSpreadsheet, LogIn, Scan, TableProperties, 
  Layers, Lock, Globe, Award, Zap, Activity, CheckCircle2,
  ChevronDown, Wrench, Sparkles, SlidersHorizontal, Terminal
} from 'lucide-react';
import { UserRole } from '../types/utvn';
import { User as FirebaseUser } from 'firebase/auth';

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
  onOpenNewTxModal: () => void;
  onOpenSheetsModal: () => void;
  onOpenAuthModal: () => void;
  onOpenBulkModal: () => void;
  currentUser: FirebaseUser | null;
  appMode: 'production' | 'demo';
  setAppMode: (mode: 'production' | 'demo') => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  activeRole,
  setActiveRole,
  onOpenNewTxModal,
  onOpenSheetsModal,
  onOpenAuthModal,
  onOpenBulkModal,
  currentUser,
  appMode,
  setAppMode,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuditDropdownOpen, setIsAuditDropdownOpen] = useState(false);
  const [isDevDropdownOpen, setIsDevDropdownOpen] = useState(false);
  const auditRef = useRef<HTMLDivElement>(null);
  const devRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (auditRef.current && !auditRef.current.contains(event.target as Node)) {
        setIsAuditDropdownOpen(false);
      }
      if (devRef.current && !devRef.current.contains(event.target as Node)) {
        setIsDevDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ---------------------------------------------------------------------------
  // 1. KEEP LIVE IN MAIN NAVIGATION: Role-Gated Core Business Operations
  // ---------------------------------------------------------------------------
  const getCoreTabsForRole = (role: UserRole) => {
    switch (role) {
      case 'BUYER':
        return [
          { id: 'dashboard', label: 'Network Ledger', icon: ShieldCheck, badge: 'AP Overview' },
          { id: 'lifecycle', label: '4-Way Match', icon: Layers, badge: 'PO & GRN' },
          { id: 'pre-release', label: 'Pre-Payment Gate', icon: Lock, badge: 'Disbursement Authorization' },
        ];
      case 'SELLER':
        return [
          { id: 'dashboard', label: 'Network Ledger', icon: ShieldCheck, badge: 'AR Receivables' },
          { id: 'lifecycle', label: '4-Way Match', icon: Layers, badge: 'Dispatch & POD' },
        ];
      case 'BANK_PROVIDER':
        return [
          { id: 'dashboard', label: 'Network Ledger', icon: ShieldCheck, badge: 'Financing Book' },
          { id: 'pre-release', label: 'Pre-Payment Gate', icon: Lock, badge: 'Escrow Release' },
          { id: 'fraud-engine', label: '16-Point Fraud Engine', icon: Activity, isAlert: true, badge: 'Underwriting' },
        ];
      case 'FINANCE_ADMIN':
      default:
        return [
          { id: 'dashboard', label: 'Network Ledger', icon: ShieldCheck },
          { id: 'pre-release', label: 'Pre-Payment Gate', icon: Lock },
          { id: 'lifecycle', label: '4-Way Match', icon: Layers },
          { id: 'fraud-engine', label: '16-Point Fraud Engine', icon: Activity, isAlert: true },
        ];
    }
  };

  // ---------------------------------------------------------------------------
  // 2. ROLE-GATED: Audit & Compliance Architecture (Only for FINANCE_ADMIN)
  // ---------------------------------------------------------------------------
  const roleGatedAuditTools = [
    { id: 'tree', label: 'Topology Tree DAG', icon: GitBranch, desc: 'Cryptographic document lineage & parent-child dependencies' },
    { id: 'portals', label: 'Role Portals (RBAC)', icon: Award, desc: 'Simulated multi-party operational cockpits' },
    { id: 'trust-model', label: 'Trust & Cryptography', icon: ShieldCheck, desc: 'Zero-trust Merkle proofs & asymmetric keys' },
    { id: 'interop', label: 'Global / India Stack', icon: Globe, desc: 'GST e-invoice IRN & PEPPOL UBL 2.1 cross-border' },
  ];

  // ---------------------------------------------------------------------------
  // 3. HIDE OR MOVE TO DEVELOPER / ADMIN MODE (Webhooks & Telemetry)
  // ---------------------------------------------------------------------------
  const developerTools = [
    { id: 'pipeline', label: 'Webhooks & Ingestion', icon: Terminal, desc: 'Live spreadsheet & ERP sync telemetry' },
  ];

  // Full Tab List for Sandbox / Demo Mode (Unlocks all 10 modules)
  const allDemoTabs = [
    { id: 'dashboard', label: 'Network Ledger', icon: ShieldCheck },
    { id: 'pipeline', label: 'CI/CD Pipeline', icon: GitBranch, hasPulse: true },
    { id: 'pre-release', label: 'Pre-Payment Gate', icon: Lock },
    { id: 'lifecycle', label: '4-Way Match', icon: Layers },
    { id: 'fraud-engine', label: '16-Point Fraud Engine', icon: Activity, isAlert: true },
    { id: 'tree', label: 'Topology Tree DAG', icon: GitBranch },
    { id: 'portals', label: 'Role Portals', icon: Award },
    { id: 'trust-model', label: 'Trust & Cryptography', icon: ShieldCheck },
    { id: 'interop', label: 'Global / India Stack', icon: Globe },
    { id: 'strategy', label: 'MVP Blueprint', icon: Zap },
  ];

  const coreProductionTabs = getCoreTabsForRole(activeRole);
  const isCurrentTabInAudit = roleGatedAuditTools.some(tool => tool.id === currentTab);
  const isCurrentTabInDev = developerTools.some(tool => tool.id === currentTab);

  return (
    <header className="sticky top-0 z-40 bg-white shadow-xs">
      {/* ========================================================================= */}
      {/* TIER 1: GLOBAL BRAND, APP MODE TOGGLE, ROLE, UTILITIES & PRIMARY ACTIONS  */}
      {/* ========================================================================= */}
      <div className="border-b border-slate-200/90 bg-white/95 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
          
          {/* Left: Brand & Mode Segmented Switch */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <button 
              onClick={() => { setCurrentTab('dashboard'); setIsMobileMenuOpen(false); }}
              className="flex items-center gap-2.5 text-left group focus:outline-none"
            >
              <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-emerald-700 via-emerald-600 to-teal-500 flex items-center justify-center shadow-sm shadow-emerald-600/30 text-white ring-1 ring-emerald-500/20 transition-transform group-hover:scale-105 duration-200">
                <ShieldCheck className="w-4.5 h-4.5" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-base font-black tracking-tight text-slate-900">
                  UTVN
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  v2.4
                </span>
              </div>
            </button>

            {/* Application Mode Switcher: Live Production vs Sandbox / Demo */}
            <div className="hidden sm:flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 shadow-2xs">
              <button
                type="button"
                onClick={() => setAppMode('production')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                  appMode === 'production'
                    ? 'bg-white text-emerald-800 shadow-xs border border-slate-200/80 font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Live Enterprise Production Mode: Streamlined for core business operations"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Live App</span>
              </button>
              <button
                type="button"
                onClick={() => setAppMode('demo')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                  appMode === 'demo'
                    ? 'bg-white text-amber-900 shadow-xs border border-slate-200/80 font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Sandbox Demo Mode: Full access to all simulators, architecture blueprints & DAG views"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                <span>Sandbox / Demo</span>
              </button>
            </div>
          </div>

          {/* Tier 1 Right: Role Selector, Cloud Sync, User Auth & Scan Primary CTA */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            
            {/* Simulation Persona Selector */}
            <div className="hidden lg:flex items-center bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs shadow-2xs">
              <span className="text-slate-400 font-medium mr-1.5 text-[11px] uppercase tracking-wider">
                {appMode === 'production' ? 'Workspace Role:' : 'Simulate:'}
              </span>
              <select
                value={activeRole}
                onChange={(e) => setActiveRole(e.target.value as UserRole)}
                className="bg-transparent text-emerald-800 font-bold focus:outline-none cursor-pointer text-xs"
              >
                <option value="FINANCE_ADMIN" className="bg-white text-slate-800">Finance & Risk Admin</option>
                <option value="BUYER" className="bg-white text-slate-800">Buyer (Enterprise AP)</option>
                <option value="SELLER" className="bg-white text-slate-800">Seller (Vendor AR)</option>
                <option value="BANK_PROVIDER" className="bg-white text-slate-800">Settlement Bank</option>
              </select>
            </div>

            {/* Sheets & Cloud Sync Button */}
            <button
              onClick={onOpenSheetsModal}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50/70 hover:bg-emerald-100/80 border border-emerald-200/90 rounded-lg transition-colors whitespace-nowrap"
              title="Google Sheets & Cloud Sync"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Sheets Sync</span>
              {currentUser ? (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" title="Connected"></span>
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
              )}
            </button>

            {/* Bulk Sheet Button */}
            <button
              onClick={onOpenBulkModal}
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors whitespace-nowrap"
              title="Import Bulk Invoices"
            >
              <TableProperties className="w-3.5 h-3.5 text-slate-500" />
              <span>Bulk Invoices</span>
            </button>

            {/* User Account / Sign In */}
            <button
              onClick={onOpenAuthModal}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors whitespace-nowrap shadow-2xs"
              title="Account Authentication"
            >
              {currentUser ? (
                <>
                  <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center justify-center text-[10px] font-bold">
                    {currentUser.displayName ? currentUser.displayName[0].toUpperCase() : 'U'}
                  </div>
                  <span className="hidden sm:inline max-w-[80px] truncate text-slate-800">
                    {currentUser.displayName || currentUser.email?.split('@')[0] || 'User'}
                  </span>
                </>
              ) : (
                <>
                  <LogIn className="w-3.5 h-3.5 text-slate-500" />
                  <span className="hidden sm:inline">Sign In</span>
                </>
              )}
            </button>

            {/* Primary Action Button: Scan & Mint */}
            <button
              onClick={onOpenNewTxModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg hover:from-emerald-500 hover:to-teal-500 transition-all duration-200 shadow-sm shadow-emerald-600/30 whitespace-nowrap active:scale-95"
              title="Scan Invoice or Mint UTVN"
            >
              <Scan className="w-3.5 h-3.5" />
              <span>+ Scan & Mint</span>
            </button>

            {/* Mobile Hamburger Menu */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TIER 2: WORKFLOW NAVIGATION & PROTOCOL MODULES STRIP                      */}
      {/* ========================================================================= */}
      <div className={`border-b backdrop-blur-md transition-colors ${
        appMode === 'production' 
          ? 'border-slate-200/80 bg-slate-50/70' 
          : 'border-amber-200/80 bg-amber-50/40'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-10 flex items-center justify-between gap-4 overflow-x-auto scrollbar-none">
          
          {/* Left: Navigation Buttons */}
          <nav className="flex items-center gap-1 text-xs font-medium text-slate-600 shrink-0">
            
            {/* ------------------------------------------------------------- */}
            {/* MODE A: LIVE PRODUCTION NAVIGATION                            */}
            {/* ------------------------------------------------------------- */}
            {appMode === 'production' ? (
              <div className="flex items-center gap-1">
                {/* 1. Core Live Operations (Role-Gated to relevant workflows) */}
                {coreProductionTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = currentTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setCurrentTab(tab.id)}
                      className={`px-3 py-1 rounded-md transition-all duration-150 whitespace-nowrap flex items-center gap-1.5 text-xs ${
                        isActive
                          ? 'bg-white text-emerald-900 font-bold border border-emerald-200/80 shadow-2xs'
                          : 'hover:text-slate-900 hover:bg-white/80 text-slate-700'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${tab.isAlert ? 'text-rose-500' : isActive ? 'text-emerald-700' : 'text-slate-400'}`} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}

                {/* 2. Role-Gated: Audit & Compliance (Only for FINANCE_ADMIN) */}
                {activeRole === 'FINANCE_ADMIN' && (
                  <>
                    <div className="h-4 w-px bg-slate-200 mx-1 shrink-0" />

                    <div className="relative" ref={auditRef}>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAuditDropdownOpen(!isAuditDropdownOpen);
                          setIsDevDropdownOpen(false);
                        }}
                        className={`px-2.5 py-1 rounded-md transition-all duration-150 whitespace-nowrap flex items-center gap-1.5 text-xs border ${
                          isCurrentTabInAudit
                            ? 'bg-emerald-50 text-emerald-900 font-bold border-emerald-300 shadow-2xs'
                            : 'bg-transparent hover:bg-white/80 border-transparent text-slate-600 hover:text-slate-900'
                        }`}
                        title="Role-Gated: Compliance, cryptographic verification, and lineage trees"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Audit & Compliance</span>
                        <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isAuditDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {isAuditDropdownOpen && (
                        <div className="absolute left-0 top-full mt-1.5 w-76 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-fade-in">
                          <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 flex items-center justify-between">
                            <span>Role-Gated Compliance Modules</span>
                            <span className="text-emerald-700 font-mono">ADMIN ONLY</span>
                          </div>
                          {roleGatedAuditTools.map((tool) => {
                            const Icon = tool.icon;
                            const isToolActive = currentTab === tool.id;
                            return (
                              <button
                                key={tool.id}
                                type="button"
                                onClick={() => {
                                  setCurrentTab(tool.id);
                                  setIsAuditDropdownOpen(false);
                                }}
                                className={`w-full px-3 py-2 text-left flex items-start gap-2.5 transition-colors ${
                                  isToolActive ? 'bg-emerald-50 text-emerald-900' : 'hover:bg-slate-50 text-slate-700'
                                }`}
                              >
                                <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${isToolActive ? 'text-emerald-700' : 'text-slate-400'}`} />
                                <div className="flex-1 min-w-0">
                                  <div className="text-xs font-semibold text-slate-900">{tool.label}</div>
                                  <div className="text-[11px] text-slate-500 truncate">{tool.desc}</div>
                                </div>
                                {isToolActive && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5"></span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* 3. Developer / Webhooks Telemetry (Moved to Admin Menu in Live App) */}
                    <div className="relative" ref={devRef}>
                      <button
                        type="button"
                        onClick={() => {
                          setIsDevDropdownOpen(!isDevDropdownOpen);
                          setIsAuditDropdownOpen(false);
                        }}
                        className={`px-2 py-1 rounded-md transition-all duration-150 whitespace-nowrap flex items-center gap-1.5 text-xs border ${
                          isCurrentTabInDev
                            ? 'bg-slate-100 text-slate-900 font-bold border-slate-300 shadow-2xs'
                            : 'bg-transparent hover:bg-white/80 border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                        title="Developer Mode: Webhooks & Ingestion Telemetry"
                      >
                        <Terminal className="w-3.5 h-3.5 text-slate-500" />
                        <span>Webhooks</span>
                        <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isDevDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {isDevDropdownOpen && (
                        <div className="absolute left-0 top-full mt-1.5 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-fade-in">
                          <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                            Developer & Ingestion Tools
                          </div>
                          {developerTools.map((tool) => {
                            const Icon = tool.icon;
                            const isToolActive = currentTab === tool.id;
                            return (
                              <button
                                key={tool.id}
                                type="button"
                                onClick={() => {
                                  setCurrentTab(tool.id);
                                  setIsDevDropdownOpen(false);
                                }}
                                className={`w-full px-3 py-2 text-left flex items-start gap-2.5 transition-colors ${
                                  isToolActive ? 'bg-slate-100 text-slate-900' : 'hover:bg-slate-50 text-slate-700'
                                }`}
                              >
                                <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${isToolActive ? 'text-slate-800' : 'text-slate-400'}`} />
                                <div className="flex-1 min-w-0">
                                  <div className="text-xs font-semibold text-slate-900">{tool.label}</div>
                                  <div className="text-[11px] text-slate-500 truncate">{tool.desc}</div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            ) : (
              /* ------------------------------------------------------------- */
              /* MODE B: SANDBOX / DEMO NAVIGATION (All 10 Tabs Unlocked)      */
              /* ------------------------------------------------------------- */
              <div className="flex items-center gap-1">
                {allDemoTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = currentTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setCurrentTab(tab.id)}
                      className={`px-2.5 py-1 rounded-md transition-all duration-150 whitespace-nowrap flex items-center gap-1.5 text-xs ${
                        isActive
                          ? 'bg-white text-emerald-900 font-bold border border-emerald-300 shadow-2xs'
                          : 'hover:text-slate-900 hover:bg-white/80 text-slate-600'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${tab.isAlert ? 'text-rose-500' : isActive ? 'text-emerald-700' : 'text-slate-400'}`} />
                      <span>{tab.label}</span>
                      {tab.hasPulse && (
                        <span className="flex h-1.5 w-1.5 relative ml-0.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-600"></span>
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </nav>

          {/* Right: Integrity & Mode Badges */}
          <div className="hidden lg:flex items-center gap-2 text-[11px] font-mono shrink-0">
            {appMode === 'demo' && (
              <span className="flex items-center gap-1 text-amber-800 font-semibold bg-amber-100/80 px-2 py-0.5 rounded border border-amber-300">
                <Sparkles className="w-3 h-3 text-amber-600" />
                <span>Sandbox Mode (All 10 Modules)</span>
              </span>
            )}
            
            <span className="flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>SHA-256 Ledger Sealed</span>
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MOBILE / TABLET NAVIGATION DRAWER                                         */}
      {/* ========================================================================= */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-200 bg-white/98 backdrop-blur-2xl px-4 py-4 space-y-3 shadow-xl max-h-[85vh] overflow-y-auto">
          {/* Mode Switcher in mobile drawer */}
          <div className="flex items-center justify-between p-2.5 bg-slate-100 rounded-xl">
            <span className="text-xs font-semibold text-slate-700">Environment:</span>
            <div className="flex items-center bg-white p-0.5 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => setAppMode('production')}
                className={`px-2 py-1 text-xs font-bold rounded ${appMode === 'production' ? 'bg-emerald-600 text-white' : 'text-slate-600'}`}
              >
                Live App
              </button>
              <button
                type="button"
                onClick={() => setAppMode('demo')}
                className={`px-2 py-1 text-xs font-bold rounded ${appMode === 'demo' ? 'bg-amber-600 text-white' : 'text-slate-600'}`}
              >
                Sandbox
              </button>
            </div>
          </div>

          {/* Role selector in mobile drawer */}
          <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-xs text-slate-600 font-medium">Active Simulation Role:</span>
            <select
              value={activeRole}
              onChange={(e) => setActiveRole(e.target.value as UserRole)}
              className="bg-transparent text-emerald-800 font-bold text-xs focus:outline-none"
            >
              <option value="FINANCE_ADMIN" className="bg-white text-slate-800">Finance & Risk Admin</option>
              <option value="BUYER" className="bg-white text-slate-800">Buyer (Enterprise AP)</option>
              <option value="SELLER" className="bg-white text-slate-800">Seller (Vendor AR)</option>
              <option value="BANK_PROVIDER" className="bg-white text-slate-800">Settlement Bank</option>
            </select>
          </div>

          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
            Core Operations ({activeRole})
          </div>

          <div className="grid grid-cols-2 gap-2">
            {coreProductionTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => { setCurrentTab(tab.id); setIsMobileMenuOpen(false); }}
                  className={`p-2.5 rounded-lg text-left text-xs font-semibold flex items-center gap-2 transition-all ${
                    isActive ? 'bg-emerald-600 text-white' : 'bg-slate-50 text-slate-700 border border-slate-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Role-gated audit items in mobile */}
          {activeRole === 'FINANCE_ADMIN' && (
            <>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1 pt-2">
                Audit & Compliance (Admin Only)
              </div>

              <div className="grid grid-cols-1 gap-1.5">
                {roleGatedAuditTools.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = currentTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => { setCurrentTab(tab.id); setIsMobileMenuOpen(false); }}
                      className={`p-2.5 rounded-lg text-left text-xs font-semibold transition-all flex items-center justify-between ${
                        isActive ? 'bg-emerald-600 text-white' : 'bg-slate-50 text-slate-700 border border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{tab.label}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">AUDIT</span>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {appMode === 'demo' && (
            <>
              <div className="text-[11px] font-bold text-amber-600 uppercase tracking-wider px-1 pt-2">
                Sandbox Mode Modules
              </div>
              <div className="grid grid-cols-1 gap-1.5">
                <button
                  onClick={() => { setCurrentTab('strategy'); setIsMobileMenuOpen(false); }}
                  className={`p-2.5 rounded-lg text-left text-xs font-semibold transition-all flex items-center justify-between ${
                    currentTab === 'strategy' ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-900 border border-amber-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-amber-600" />
                    <span>MVP Blueprint (Strategy)</span>
                  </div>
                  <span className="text-[10px] text-amber-600 font-mono">SANDBOX</span>
                </button>
                <button
                  onClick={() => { setCurrentTab('pipeline'); setIsMobileMenuOpen(false); }}
                  className={`p-2.5 rounded-lg text-left text-xs font-semibold transition-all flex items-center justify-between ${
                    currentTab === 'pipeline' ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-900 border border-amber-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <GitBranch className="w-3.5 h-3.5 text-amber-600" />
                    <span>CI/CD Ingestion Simulator</span>
                  </div>
                  <span className="text-[10px] text-amber-600 font-mono">SANDBOX</span>
                </button>
              </div>
            </>
          )}

          <div className="pt-2 border-t border-slate-200 flex items-center gap-2">
            <button
              onClick={() => { onOpenSheetsModal(); setIsMobileMenuOpen(false); }}
              className="flex-1 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg text-center"
            >
              Sheets Sync
            </button>
            <button
              onClick={() => { onOpenBulkModal(); setIsMobileMenuOpen(false); }}
              className="flex-1 py-2 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg text-center"
            >
              Bulk Invoices
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
