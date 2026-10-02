import React, { useState } from 'react';
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
import { UniversalTransaction, UserRole } from './types/utvn';
import { mockTransactions } from './data/mockData';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [activeRole, setActiveRole] = useState<UserRole>('FINANCE_ADMIN');
  const [transactions, setTransactions] = useState<UniversalTransaction[]>(mockTransactions);
  const [selectedTransaction, setSelectedTransaction] = useState<UniversalTransaction | null>(null);
  const [isNewTxModalOpen, setIsNewTxModalOpen] = useState<boolean>(false);

  const handleCreateTransaction = (newTx: UniversalTransaction) => {
    setTransactions(prev => [newTx, ...prev]);
    setSelectedTransaction(newTx);
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* 3-Zone Top Navigation Contract */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        activeRole={activeRole}
        setActiveRole={setActiveRole}
        onOpenNewTxModal={() => setIsNewTxModalOpen(true)}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentTab === 'dashboard' && (
          <DashboardView
            transactions={transactions}
            onSelectTransaction={(tx) => setSelectedTransaction(tx)}
            onNavigateToLifecycle={() => setCurrentTab('lifecycle')}
            onNavigateToFraudEngine={() => setCurrentTab('fraud-engine')}
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

      {/* New Transaction Creation Modal */}
      <NewTransactionModal
        isOpen={isNewTxModalOpen}
        onClose={() => setIsNewTxModalOpen(false)}
        onCreated={handleCreateTransaction}
      />

      {/* Quiet, Clean Enterprise Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 text-xs text-slate-500 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-bold text-slate-300">UTVN</span>
            <span aria-hidden="true">·</span>
            <span>Universal Transaction Verification Network</span>
            <span aria-hidden="true">·</span>
            <span>Federated Architecture Protocol v2.4</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>India GST / NIC IRP Ready</span>
            <span aria-hidden="true">·</span>
            <span>OpenPEPPOL BIS 3.0</span>
            <span aria-hidden="true">·</span>
            <span>ISO 20022 Compliant</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
