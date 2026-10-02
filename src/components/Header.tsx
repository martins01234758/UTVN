import React from 'react';
import { ShieldCheck, Network, Sparkles, Building2, Landmark, CheckCircle2 } from 'lucide-react';
import { UserRole } from '../types/utvn';

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
  onOpenNewTxModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  activeRole,
  setActiveRole,
  onOpenNewTxModal,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur-md sticky top-0 z-40">
      {/* Primary Top Bar Contract: Brand | Nav Links | Actions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20 text-white shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); setCurrentTab('dashboard'); }} 
              className="text-lg font-bold tracking-tight text-white flex items-center gap-2 hover:text-blue-400 transition-colors"
            >
              UTVN
              <span className="text-xs font-normal text-slate-400 hidden sm:inline">
                Universal Transaction Verification Network
              </span>
            </a>
          </div>
        </div>

        {/* Zone 2: Navigation Links (Single-line, clean text hover) */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2 text-sm font-medium text-slate-400">
          <button
            onClick={() => setCurrentTab('dashboard')}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
              currentTab === 'dashboard' ? 'text-white bg-slate-800/80 font-semibold' : 'hover:text-slate-200'
            }`}
          >
            Network Ledger
          </button>
          <button
            onClick={() => setCurrentTab('pre-release')}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
              currentTab === 'pre-release' ? 'text-white bg-slate-800/80 font-semibold' : 'hover:text-slate-200'
            }`}
          >
            Pre-Payment Release
          </button>
          <button
            onClick={() => setCurrentTab('tree')}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
              currentTab === 'tree' ? 'text-white bg-slate-800/80 font-semibold' : 'hover:text-slate-200'
            }`}
          >
            Transaction Tree
          </button>
          <button
            onClick={() => setCurrentTab('lifecycle')}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
              currentTab === 'lifecycle' ? 'text-white bg-slate-800/80 font-semibold' : 'hover:text-slate-200'
            }`}
          >
            4-Way Lifecycle Matcher
          </button>
          <button
            onClick={() => setCurrentTab('fraud-engine')}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
              currentTab === 'fraud-engine' ? 'text-white bg-slate-800/80 font-semibold' : 'hover:text-slate-200'
            }`}
          >
            16-Point Fraud Engine
          </button>
          <button
            onClick={() => setCurrentTab('portals')}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
              currentTab === 'portals' ? 'text-white bg-slate-800/80 font-semibold' : 'hover:text-slate-200'
            }`}
          >
            Role Portals
          </button>
          <button
            onClick={() => setCurrentTab('trust-model')}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
              currentTab === 'trust-model' ? 'text-white bg-slate-800/80 font-semibold' : 'hover:text-slate-200'
            }`}
          >
            Trust Model & Arch
          </button>
          <button
            onClick={() => setCurrentTab('interop')}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
              currentTab === 'interop' ? 'text-white bg-slate-800/80 font-semibold' : 'hover:text-slate-200'
            }`}
          >
            Global / India Stack
          </button>
          <button
            onClick={() => setCurrentTab('strategy')}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
              currentTab === 'strategy' ? 'text-white bg-slate-800/80 font-semibold' : 'hover:text-slate-200'
            }`}
          >
            MVP & Critical Analysis
          </button>
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-3">
          {/* Persona selector for role simulation */}
          <div className="hidden sm:flex items-center bg-slate-900 border border-slate-800 rounded-lg p-1 text-xs">
            <span className="text-slate-400 px-2 font-medium">Role:</span>
            <select
              value={activeRole}
              onChange={(e) => setActiveRole(e.target.value as UserRole)}
              className="bg-transparent text-blue-400 font-semibold focus:outline-none cursor-pointer pr-1"
            >
              <option value="BUYER" className="bg-slate-900 text-slate-200">Buyer (Enterprise)</option>
              <option value="SELLER" className="bg-slate-900 text-slate-200">Seller (Vendor)</option>
              <option value="FINANCE_ADMIN" className="bg-slate-900 text-slate-200">Finance & Risk Admin</option>
              <option value="BANK_PROVIDER" className="bg-slate-900 text-slate-200">Settlement Bank</option>
            </select>
          </div>

          <button
            onClick={onOpenNewTxModal}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors shadow-sm shadow-blue-600/30 whitespace-nowrap"
          >
            + Create Verification
          </button>
        </div>
      </div>
    </header>
  );
};
