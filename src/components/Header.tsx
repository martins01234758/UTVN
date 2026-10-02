import { ShieldCheck, Network, Sparkles, Building2, Landmark, CheckCircle2, FileSpreadsheet, LogIn, User as UserIcon, Scan, TableProperties, GitBranch } from 'lucide-react';
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
            onClick={() => setCurrentTab('pipeline')}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              currentTab === 'pipeline' ? 'text-white bg-blue-600 font-semibold shadow-sm' : 'text-blue-400 hover:text-blue-300 hover:bg-slate-800/50'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>CI/CD Pipeline</span>
            <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 rounded text-[10px] font-mono">Live</span>
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
            onClick={onOpenSheetsModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-400 bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-800/60 rounded-lg transition-colors whitespace-nowrap"
            title="Google Sheets, Firestore Cloud Sync, and Architecture Status"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Sheets & Cloud</span>
            <span className="md:hidden">Cloud</span>
            {currentUser ? (
              <span className="w-2 h-2 rounded-full bg-emerald-400" title="Connected to Google Account"></span>
            ) : (
              <span className="w-2 h-2 rounded-full bg-slate-500" title="Not connected"></span>
            )}
          </button>

          <button
            onClick={onOpenAuthModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800/90 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors whitespace-nowrap"
            title="Authenticate with Google, Microsoft, Apple, Email, or Mobile"
          >
            {currentUser ? (
              <>
                <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center text-[10px] font-bold">
                  {currentUser.displayName ? currentUser.displayName[0].toUpperCase() : 'U'}
                </div>
                <span className="hidden sm:inline max-w-[100px] truncate">
                  {currentUser.displayName || currentUser.email?.split('@')[0] || currentUser.phoneNumber || 'User'}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              </>
            ) : (
              <>
                <LogIn className="w-3.5 h-3.5 text-blue-400" />
                <span>Sign In</span>
              </>
            )}
          </button>

          <button
            onClick={onOpenBulkModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-purple-300 bg-purple-950/40 hover:bg-purple-900/50 border border-purple-800/60 rounded-lg transition-colors whitespace-nowrap"
            title="Import bulk invoice sheet from Google Sheets or CSV"
          >
            <TableProperties className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden xl:inline">Bulk Sheet</span>
            <span className="xl:hidden">Bulk</span>
          </button>

          <button
            onClick={onOpenNewTxModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors shadow-sm shadow-blue-600/30 whitespace-nowrap"
            title="Scan an invoice or make a verified UTVN transaction"
          >
            <Scan className="w-3.5 h-3.5" />
            <span>Scan & Make UTVN</span>
          </button>
        </div>
      </div>
    </header>
  );
};
