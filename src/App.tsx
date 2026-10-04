import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { TransactionLifecycleView } from './components/TransactionLifecycleView';
import { FraudEngineView } from './components/FraudEngineView';
import { RolePortalsView } from './components/RolePortalsView';
import { TrustModelView } from './components/TrustModelView';
import { InteroperabilityView } from './components/InteroperabilityView';
import { StrategicMvpEvaluationView } from './components/StrategicMvpEvaluationView';
import { TransactionTreeView } from './components/TransactionTreeView';
import { PaymentBeforeReleaseView } from './components/PaymentBeforeReleaseView';
import { TransactionDetailModal } from './components/TransactionDetailModal';
import { NewTransactionModal } from './components/NewTransactionModal';
import { GoogleSheetsSyncModal } from './components/GoogleSheetsSyncModal';
import { AuthModal } from './components/AuthModal';
import { BulkInvoiceSheetModal } from './components/BulkInvoiceSheetModal';
import { PipelineView } from './components/PipelineView';
import { UniversalTransaction, UserRole } from './types/utvn';
import { mockTransactions } from './data/mockData';
import { initAuth, testConnection } from './lib/firebase';
import { User as FirebaseUser } from 'firebase/auth';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [activeRole, setActiveRole] = useState<UserRole>('FINANCE_ADMIN');
  const [transactions, setTransactions] = useState<UniversalTransaction[]>(mockTransactions);
  const [selectedTransaction, setSelectedTransaction] = useState<UniversalTransaction | null>(null);
  const [isNewTxModalOpen, setIsNewTxModalOpen] = useState<boolean>(false);
  const [isSheetsModalOpen, setIsSheetsModalOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);

  useEffect(() => {
    // Validate Firestore connection on app boot as required by skill
    testConnection();

    // Initialize Firebase Auth listener for Google account session
    const unsubscribe = initAuth(
      (user) => setCurrentUser(user),
      () => setCurrentUser(null)
    );

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const handleCreateTransaction = (newTx: UniversalTransaction) => {
    setTransactions(prev => [newTx, ...prev]);
    setSelectedTransaction(newTx);
  };

  const handleBatchCreated = (newTxns: UniversalTransaction[]) => {
    setTransactions(prev => [...newTxns, ...prev]);
    if (newTxns.length > 0) {
      setSelectedTransaction(newTxns[0]);
    }
  };

  const handleApprovePayment = (utid: string) => {
    setTransactions(prev => prev.map(tx => {
      if (tx.utid === utid) {
        return {
          ...tx,
          status: 'PAYMENT_EXECUTED',
          paymentDetails: {
            ...tx.paymentDetails,
            status: 'RELEASED',
            settledAt: new Date().toISOString(),
            settlementReference: `RTGS-RBI-${new Date().toISOString().split('T')[0].replace(/-/g,'')}-${Math.floor(100000 + Math.random() * 900000)}`
          },
          auditTrail: [
            ...tx.auditTrail,
            {
              id: `AUD-APP-${Date.now()}`,
              timestamp: new Date().toISOString(),
              action: 'PAYMENT_AUTHORIZED_CFO_DUAL_KEY',
              actor: {
                userId: 'usr-cfo-override',
                userName: 'CFO Authorized Signatory',
                role: 'CHIEF_FINANCIAL_OFFICER',
                authMethod: 'DSC_SMARTCARD'
              },
              previousHash: tx.auditTrail[tx.auditTrail.length - 1]?.currentHash || '0000',
              currentHash: 'b4a8e291c0f4d38271a9b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3',
              payloadSummary: 'Payment released after verified out-of-band CFO confirmation.'
            }
          ]
        };
      }
      return tx;
    }));

    if (selectedTransaction?.utid === utid) {
      setSelectedTransaction(prev => prev ? {
        ...prev,
        status: 'PAYMENT_EXECUTED',
        paymentDetails: { ...prev.paymentDetails, status: 'RELEASED' }
      } : null);
    }
  };

  const handleHaltTransaction = (utid: string) => {
    setTransactions(prev => prev.map(tx => {
      if (tx.utid === utid) {
        return {
          ...tx,
          status: 'REJECTED',
          overallRiskLevel: 'BLOCKED',
          paymentDetails: {
            ...tx.paymentDetails,
            status: 'BLOCKED'
          },
          auditTrail: [
            ...tx.auditTrail,
            {
              id: `AUD-HALT-${Date.now()}`,
              timestamp: new Date().toISOString(),
              action: 'TRANSACTION_FROZEN_MANUAL_SENTINEL',
              actor: {
                userId: 'usr-compliance-officer',
                userName: 'Senior Fraud Investigator',
                role: 'COMPLIANCE_OFFICER',
                authMethod: 'MFA_PASSKEY'
              },
              previousHash: tx.auditTrail[tx.auditTrail.length - 1]?.currentHash || '0000',
              currentHash: 'ff00ff00ff00ff00ff00ff00ff00ff00ff00ff00ff00ff00ff00ff00ff00ff00',
              payloadSummary: 'Transaction placed under formal fraud investigation. Beneficiary account frozen.'
            }
          ]
        };
      }
      return tx;
    }));

    if (selectedTransaction?.utid === utid) {
      setSelectedTransaction(prev => prev ? {
        ...prev,
        status: 'REJECTED',
        overallRiskLevel: 'BLOCKED',
        paymentDetails: { ...prev.paymentDetails, status: 'BLOCKED' }
      } : null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* 3-Zone Top Navigation Contract */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        activeRole={activeRole}
        setActiveRole={setActiveRole}
        onOpenNewTxModal={() => setIsNewTxModalOpen(true)}
        onOpenSheetsModal={() => setIsSheetsModalOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenBulkModal={() => setIsBulkModalOpen(true)}
        currentUser={currentUser}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div key={currentTab} className="animate-fade-in">
          {currentTab === 'dashboard' && (
            <DashboardView
              transactions={transactions}
              onSelectTransaction={(tx) => setSelectedTransaction(tx)}
              onNavigateToLifecycle={() => setCurrentTab('lifecycle')}
              onNavigateToFraudEngine={() => setCurrentTab('fraud-engine')}
              onNavigateToPipeline={() => setCurrentTab('pipeline')}
              onOpenSheetsSync={() => setIsSheetsModalOpen(true)}
              onOpenBulkImport={() => setIsBulkModalOpen(true)}
            />
          )}

          {currentTab === 'pipeline' && (
            <PipelineView
              transactions={transactions}
              onTransactionCreated={(tx) => {
                setTransactions(prev => [tx, ...prev]);
                setSelectedTransaction(tx);
              }}
              onSelectTransaction={(tx) => setSelectedTransaction(tx)}
            />
          )}

          {currentTab === 'pre-release' && (
            <PaymentBeforeReleaseView />
          )}

          {currentTab === 'tree' && (
            <TransactionTreeView
              transactions={transactions}
              onSelectTransaction={(tx) => setSelectedTransaction(tx)}
            />
          )}

          {currentTab === 'lifecycle' && (
            <TransactionLifecycleView
              onTransactionCreated={(tx) => {
                setTransactions(prev => [tx, ...prev]);
                setSelectedTransaction(tx);
              }}
            />
          )}

          {currentTab === 'fraud-engine' && (
            <FraudEngineView />
          )}

          {currentTab === 'portals' && (
            <RolePortalsView
              initialRole={activeRole}
              onSelectTransaction={(tx) => setSelectedTransaction(tx)}
            />
          )}

          {currentTab === 'trust-model' && (
            <TrustModelView />
          )}

          {currentTab === 'interop' && (
            <InteroperabilityView />
          )}

          {currentTab === 'strategy' && (
            <StrategicMvpEvaluationView />
          )}
        </div>
      </main>

      {/* Detail Inspection Modal */}
      {selectedTransaction && (
        <TransactionDetailModal
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
          onApprovePayment={handleApprovePayment}
          onHaltTransaction={handleHaltTransaction}
        />
      )}

      {/* New Transaction Creation & Invoice Scanner Modal */}
      {isNewTxModalOpen && (
        <NewTransactionModal
          isOpen={isNewTxModalOpen}
          onClose={() => setIsNewTxModalOpen(false)}
          onCreated={handleCreateTransaction}
          existingTransactions={transactions}
        />
      )}

      {/* Google Sheets & Cloud Sync Modal */}
      {isSheetsModalOpen && (
        <GoogleSheetsSyncModal
          isOpen={isSheetsModalOpen}
          onClose={() => setIsSheetsModalOpen(false)}
          transactions={transactions}
          currentUser={currentUser}
          onAuthChange={setCurrentUser}
          onOpenAuthModal={() => {
            setIsSheetsModalOpen(false);
            setIsAuthModalOpen(true);
          }}
          onOpenBulkImport={() => {
            setIsSheetsModalOpen(false);
            setIsBulkModalOpen(true);
          }}
        />
      )}

      {/* Enterprise Multi-Provider Auth Modal (Google, Microsoft, Apple, Email, Mobile OTP) */}
      {isAuthModalOpen && (
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          currentUser={currentUser}
          onAuthSuccess={(user) => {
            setCurrentUser(user);
            setIsAuthModalOpen(false);
          }}
        />
      )}

      {/* Bulk Invoice Sheet Importer Modal (Google Sheets, CSV, Auto-Matching, Batch UTID) */}
      {isBulkModalOpen && (
        <BulkInvoiceSheetModal
          isOpen={isBulkModalOpen}
          onClose={() => setIsBulkModalOpen(false)}
          existingTransactions={transactions}
          onBatchCreated={handleBatchCreated}
          currentUser={currentUser}
          onOpenAuthModal={() => {
            setIsBulkModalOpen(false);
            setIsAuthModalOpen(true);
          }}
        />
      )}

      {/* Quiet, Clean Enterprise Footer */}
      <footer className="border-t border-slate-200 bg-white text-xs text-slate-500 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-extrabold text-slate-900 tracking-wide">UTVN</span>
            <span className="text-slate-300" aria-hidden="true">·</span>
            <span className="text-slate-600 font-medium">Universal Transaction Verification Network</span>
            <span className="text-slate-300" aria-hidden="true">·</span>
            <span className="font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px] font-semibold border border-emerald-200">
              Protocol v2.4 ONLINE
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium">
            <span>India GST / NIC IRP</span>
            <span className="text-slate-300" aria-hidden="true">·</span>
            <span>OpenPEPPOL BIS 3.0</span>
            <span className="text-slate-300" aria-hidden="true">·</span>
            <span>ISO 20022 Compliant</span>
            <span className="text-slate-300" aria-hidden="true">·</span>
            <span className="font-mono text-emerald-700">Zero Invariant Drift</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
