import React, { useState } from 'react';
import { 
  ShieldCheck, GitBranch, Menu, X, 
  FileSpreadsheet, LogIn, Scan, TableProperties, 
  Layers, Lock, Globe, Award, Zap, Activity, CheckCircle2,
  Cpu
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
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Group 1: Core Lifecycle & Verification Operations
  const coreTabs = [
    { id: 'dashboard', label: 'Network Ledger', icon: ShieldCheck },
    { id: 'pipeline', label: 'CI/CD Pipeline', icon: GitBranch, hasPulse: true },
    { id: 'pre-release', label: 'Pre-Payment Gate', icon: Lock },
    { id: 'lifecycle', label: '4-Way Match', icon: Layers },
    { id: 'fraud-engine', label: '16-Point Fraud Engine', icon: Activity, isAlert: true },
  ];

  // Group 2: Advanced Architecture, Protocols & Topology
  const architectureTabs = [
    { id: 'tree', label: 'Topology Tree DAG', icon: GitBranch },
    { id: 'portals', label: 'Role Portals', icon: Award },
    { id: 'trust-model', label: 'Trust & Cryptography', icon: ShieldCheck },
    { id: 'interop', label: 'Global / India Stack', icon: Globe },
    { id: 'strategy', label: 'MVP Blueprint', icon: Zap },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white shadow-xs">
      {/* ========================================================================= */}
      {/* TIER 1: GLOBAL BRAND, UTILITY, PERSONA SIMULATION & PRIMARY ACTIONS       */}
      {/* ========================================================================= */}
      <div className="border-b border-slate-200/90 bg-white/95 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
          
          {/* Brand & Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
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
                <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-slate-300"></span>
                <span className="text-[11px] text-slate-500 font-medium hidden md:inline-block">
                  Universal Transaction Verification Network
                </span>
              </div>
            </button>
          </div>

          {/* Tier 1 Right: Utility, Role Simulator, Account & Primary CTA */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            
            {/* Simulation Persona Selector */}
            <div className="hidden lg:flex items-center bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs shadow-2xs">
              <span className="text-slate-400 font-medium mr-1.5 text-[11px] uppercase tracking-wider">Role:</span>
              <select
                value={activeRole}
                onChange={(e) => setActiveRole(e.target.value as UserRole)}
                className="bg-transparent text-emerald-800 font-bold focus:outline-none cursor-pointer text-xs"
              >
                <option value="FINANCE_ADMIN" className="bg-white text-slate-800">Finance & Risk Admin</option>
                <option value="BUYER" className="bg-white text-slate-800">Buyer (Enterprise)</option>
                <option value="SELLER" className="bg-white text-slate-800">Seller (Vendor)</option>
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
      <div className="border-b border-slate-200/80 bg-slate-50/70 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-10 flex items-center justify-between gap-4 overflow-x-auto scrollbar-none">
          
          {/* Left: Operations & Architecture Navigation Tabs */}
          <nav className="flex items-center gap-1 text-xs font-medium text-slate-600 shrink-0">
            
            {/* Section 1: Operations */}
            <div className="flex items-center gap-1">
              {coreTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = currentTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setCurrentTab(tab.id)}
                    className={`px-2.5 py-1 rounded-md transition-all duration-150 whitespace-nowrap flex items-center gap-1.5 text-xs ${
                      isActive
                        ? 'bg-white text-emerald-900 font-bold border border-emerald-200/80 shadow-2xs'
                        : 'hover:text-slate-900 hover:bg-white/80'
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

            {/* Subtle Divider */}
            <div className="h-4 w-px bg-slate-200 mx-1 shrink-0" />

            {/* Section 2: Architecture & Topology */}
            <div className="flex items-center gap-1">
              {architectureTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = currentTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setCurrentTab(tab.id)}
                    className={`px-2.5 py-1 rounded-md transition-all duration-150 whitespace-nowrap flex items-center gap-1.5 text-xs ${
                      isActive
                        ? 'bg-white text-emerald-900 font-bold border border-emerald-200/80 shadow-2xs'
                        : 'hover:text-slate-900 hover:bg-white/80 text-slate-600'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-700' : 'text-slate-400'}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Right: Network Integrity Status Pill */}
          <div className="hidden xl:flex items-center gap-2 text-[11px] text-slate-500 font-mono shrink-0">
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
          {/* Role selector in mobile drawer */}
          <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-xs text-slate-600 font-medium">Active Simulation Role:</span>
            <select
              value={activeRole}
              onChange={(e) => setActiveRole(e.target.value as UserRole)}
              className="bg-transparent text-emerald-800 font-bold text-xs focus:outline-none"
            >
              <option value="FINANCE_ADMIN" className="bg-white text-slate-800">Finance & Risk Admin</option>
              <option value="BUYER" className="bg-white text-slate-800">Buyer (Enterprise)</option>
              <option value="SELLER" className="bg-white text-slate-800">Seller (Vendor)</option>
              <option value="BANK_PROVIDER" className="bg-white text-slate-800">Settlement Bank</option>
            </select>
          </div>

          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
            Core Operations
          </div>

          <div className="grid grid-cols-2 gap-2">
            {coreTabs.map((tab) => {
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

          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1 pt-2">
            Architecture & Protocols
          </div>

          <div className="grid grid-cols-1 gap-1.5">
            {architectureTabs.map((tab) => {
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
                  <span className="text-[10px] text-slate-400 font-mono">ACTIVE</span>
                </button>
              );
            })}
          </div>

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


