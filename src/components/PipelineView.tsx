import React, { useState, useEffect } from 'react';
import { 
  GitBranch, Terminal, Play, CheckCircle2, AlertTriangle, ShieldAlert,
  Copy, Check, RefreshCw, FileSpreadsheet, FileCode2, ExternalLink,
  Cpu, ArrowRight, ShieldCheck, Clock, Zap, Database, Lock, Eye, EyeOff
} from 'lucide-react';
import { UniversalTransaction, RiskLevel } from '../types/utvn';
import { 
  executeIngestionPipeline, 
  pipelineTelemetry, 
  PipelineLogEntry, 
  PipelineExecutionResult,
  getGoogleAppsScriptTemplate,
  getExcelOfficeScriptTemplate 
} from '../services/pipelineEngine';

interface PipelineViewProps {
  transactions: UniversalTransaction[];
  onTransactionCreated: (tx: UniversalTransaction) => void;
  onSelectTransaction: (tx: UniversalTransaction) => void;
}

export const PipelineView: React.FC<PipelineViewProps> = ({
  transactions,
  onTransactionCreated,
  onSelectTransaction,
}) => {
  const [activeTab, setActiveTab] = useState<'simulator' | 'logs' | 'sheets_guide' | 'excel_guide' | 'api_guide'>('simulator');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<PipelineExecutionResult | null>(null);
  const [selectedLog, setSelectedLog] = useState<PipelineLogEntry | null>(null);
  const [logs, setLogs] = useState<PipelineLogEntry[]>(pipelineTelemetry.recentLogs);

  // Preset payload selection for simulator
  const [selectedPreset, setSelectedPreset] = useState<'sheets_clean' | 'excel_update' | 'bank_fraud' | 'custom'>('sheets_clean');
  const [payloadText, setPayloadText] = useState('');

  const PRESETS = {
    sheets_clean: {
      source: "GOOGLE_SHEETS",
      event: "INVOICE_CREATED",
      sheetMetadata: {
        spreadsheetId: "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
        sheetName: "AP_Invoices_Q4",
        rowNumber: 15,
        updatedBy: "finance-analyst@enterprise.com",
        timestamp: new Date().toISOString()
      },
      invoice: {
        invoiceId: `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        invoiceDate: new Date().toISOString().substring(0, 10),
        purchaseOrderId: "PO-2026-4412",
        buyerName: "Tata Consultancy Services Ltd",
        buyerGstin: "27AAACT2727Q1ZW",
        sellerName: "Infosys BPM Logistics",
        sellerGstin: "29AAACI4567A1Z3",
        amount: 385000,
        currency: "INR",
        hsnCode: "998313",
        beneficiaryAccount: "ICIC0005544-223344",
        beneficiaryIfsc: "ICIC0005544",
        grnId: "GRN-WH1-8892",
        paymentTerms: "NET 30"
      }
    },
    excel_update: {
      source: "EXCEL_OFFICE_SCRIPTS",
      event: "INVOICE_UPDATED",
      sheetMetadata: {
        workbookName: "Q4_Vendor_Payables.xlsx",
        sheetName: "Payables",
        rowNumber: 28,
        updatedBy: "controller@corp.com",
        timestamp: new Date().toISOString()
      },
      invoice: {
        invoiceId: `INV-XLS-${Math.floor(1000 + Math.random() * 9000)}`,
        invoiceDate: new Date().toISOString().substring(0, 10),
        purchaseOrderId: "PO-2026-9021",
        buyerName: "Reliance Industries Limited",
        buyerGstin: "24AAACR5055K1Z8",
        sellerName: "Larsen & Toubro Heavy Eng",
        sellerGstin: "27AAACL0149P1Z2",
        amount: 1250000,
        currency: "INR",
        hsnCode: "730890",
        beneficiaryAccount: "HDFC0009988-554433",
        beneficiaryIfsc: "HDFC0009988",
        grnId: "GRN-MUM-441",
        paymentTerms: "NET 45"
      }
    },
    bank_fraud: {
      source: "GOOGLE_SHEETS",
      event: "INVOICE_UPDATED",
      sheetMetadata: {
        spreadsheetId: "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
        sheetName: "Pending_Wires",
        rowNumber: 3,
        updatedBy: "unverified-external@compromised-vendor.com",
        timestamp: new Date().toISOString()
      },
      invoice: {
        invoiceId: "INV-2026-FRAUD-TEST",
        invoiceDate: new Date().toISOString().substring(0, 10),
        purchaseOrderId: "PO-2026-1102",
        buyerName: "Hindustan Unilever Limited",
        buyerGstin: "27AAACH1384L1ZT",
        sellerName: "Avery Dennison Packaging",
        sellerGstin: "29AAACA5591A1Z9",
        amount: 890000,
        currency: "INR",
        hsnCode: "481910",
        beneficiaryAccount: "UNKNOWN-SWISS-OFFSHORE-998811",
        beneficiaryIfsc: "OFFSHORE999",
        grnId: "GRN-NONE",
        paymentTerms: "IMMEDIATE"
      }
    }
  };

  useEffect(() => {
    if (selectedPreset !== 'custom') {
      setPayloadText(JSON.stringify(PRESETS[selectedPreset], null, 2));
    }
  }, [selectedPreset]);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleRunSimulation = async () => {
    setIsExecuting(true);
    setExecutionResult(null);

    try {
      const parsedPayload = JSON.parse(payloadText);
      
      // Call backend API /api/v1/pipeline/simulate or execute directly in client
      let result: PipelineExecutionResult;
      try {
        const resp = await fetch('/api/v1/pipeline/simulate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(parsedPayload)
        });
        if (resp.ok) {
          result = await resp.json();
        } else {
          result = executeIngestionPipeline(parsedPayload, transactions);
        }
      } catch (e) {
        result = executeIngestionPipeline(parsedPayload, transactions);
      }

      setExecutionResult(result);
      setLogs([...pipelineTelemetry.recentLogs]);

      if (result.success && result.transaction) {
        onTransactionCreated(result.transaction);
      }
    } catch (err: any) {
      alert('Invalid JSON payload: ' + err.message);
    } finally {
      setIsExecuting(false);
    }
  };

  const originUrl = typeof window !== 'undefined' ? window.location.origin : 'https://utvn.network';
  const webhookUrl = `${originUrl}/api/v1/pipeline/webhook`;
  const sheetsScript = getGoogleAppsScriptTemplate(originUrl, pipelineTelemetry.apiKey);
  const excelScript = getExcelOfficeScriptTemplate(originUrl, pipelineTelemetry.apiKey);

  return (
    <div className="space-y-6">
      {/* Top Banner & Telemetry Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg border border-blue-500/20">
                <GitBranch className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Automated Ingestion Pipeline (CI/CD for Excel, Sheets & ERP)
              </h2>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <Zap className="w-3 h-3 text-emerald-400" />
                WEBHOOK ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Deterministic real-time pipeline triggered when an enterprise company uploads or updates an invoice in Google Sheets, Microsoft Excel 365, or their internal billing application.
            </p>
          </div>

          {/* Quick Endpoint & Secret Pill */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-xs font-mono">
              <span className="text-slate-500">ENDPOINT:</span>
              <span className="text-blue-400 truncate max-w-[220px]" title={webhookUrl}>
                /api/v1/pipeline/webhook
              </span>
              <button
                onClick={() => copyToClipboard(webhookUrl, 'webhook-url')}
                className="text-slate-400 hover:text-white transition-colors"
                title="Copy Webhook URL"
              >
                {copiedKey === 'webhook-url' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-xs font-mono">
              <span className="text-slate-500">SECRET:</span>
              <span className="text-slate-300">
                {showApiKey ? pipelineTelemetry.apiKey : 'utvn_••••••••••••'}
              </span>
              <button
                onClick={() => setShowApiKey(!showApiKey)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                {showApiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => copyToClipboard(pipelineTelemetry.apiKey, 'api-key')}
                className="text-slate-400 hover:text-white transition-colors"
                title="Copy API Token"
              >
                {copiedKey === 'api-key' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* 4 Telemetry Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-800/80">
          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg">
            <span className="text-[11px] text-slate-400 block font-medium">Total Webhook Ingests</span>
            <span className="text-lg font-bold text-white font-mono">{pipelineTelemetry.totalProcessed}</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Events processed</span>
          </div>

          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg">
            <span className="text-[11px] text-slate-400 block font-medium">Reconciled & Committed</span>
            <span className="text-lg font-bold text-emerald-400 font-mono">{pipelineTelemetry.successfulSyncs}</span>
            <span className="text-[10px] text-emerald-600 block mt-0.5">100% Invariant Pass</span>
          </div>

          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg">
            <span className="text-[11px] text-slate-400 block font-medium">Sentinel Intercepted</span>
            <span className="text-lg font-bold text-rose-400 font-mono">{pipelineTelemetry.flaggedOrBlocked}</span>
            <span className="text-[10px] text-rose-500 block mt-0.5">Bank alterations locked</span>
          </div>

          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg">
            <span className="text-[11px] text-slate-400 block font-medium">Mean Processing Latency</span>
            <span className="text-lg font-bold text-blue-400 font-mono">{pipelineTelemetry.avgLatencyMs} ms</span>
            <span className="text-[10px] text-blue-500 block mt-0.5">Sub-50ms deterministic</span>
          </div>
        </div>
      </div>

      {/* 6-Stage Pipeline Architecture Flow Visualizer */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto shadow-md">
        <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center justify-between">
          <span>Automated 6-Stage Invariance Verification Cycle</span>
          <span className="text-[10px] text-slate-500 font-normal">Executed on every sheet edit or webhook post</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2 min-w-[700px]">
          {[
            { step: '01', title: 'Webhook Ingest', desc: 'Google Sheets / Excel / REST API', icon: '📥', color: 'border-blue-500/40 text-blue-400' },
            { step: '02', title: 'Schema Invariant', desc: 'Payload structure & Auth token check', icon: '🛡️', color: 'border-purple-500/40 text-purple-400' },
            { step: '03', title: '4-Way Diff Engine', desc: 'PO vs Invoice vs GRN vs Bank Master', icon: '⚖️', color: 'border-cyan-500/40 text-cyan-400' },
            { step: '04', title: 'Sentinel Fraud Scan', desc: '16-Point deterministic checks', icon: '🔍', color: 'border-amber-500/40 text-amber-400' },
            { step: '05', title: 'SHA-256 Hash Block', desc: 'Canonical UTID & Merkle link', icon: '🔗', color: 'border-emerald-500/40 text-emerald-400' },
            { step: '06', title: 'Ledger Commit', desc: 'Real-time broadcast & Sheet sync', icon: '⚡', color: 'border-indigo-500/40 text-indigo-400' },
          ].map((st, i) => (
            <div key={i} className={`p-2.5 bg-slate-950/70 border rounded-lg ${st.color} flex flex-col justify-between`}>
              <div className="flex items-center justify-between text-[10px] opacity-70">
                <span className="font-mono">STAGE {st.step}</span>
                <span>{st.icon}</span>
              </div>
              <div className="font-bold text-xs text-white mt-1">{st.title}</div>
              <div className="text-[10px] text-slate-400 mt-0.5 leading-tight">{st.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-800 bg-slate-900/60 p-1.5 rounded-lg text-xs overflow-x-auto">
        <button
          onClick={() => setActiveTab('simulator')}
          className={`px-3 py-2 rounded-md font-semibold transition-colors flex items-center gap-1.5 ${
            activeTab === 'simulator' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Play className="w-3.5 h-3.5" />
          Interactive Webhook Simulator
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`px-3 py-2 rounded-md font-semibold transition-colors flex items-center gap-1.5 ${
            activeTab === 'logs' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          Live Ingestion Logs ({logs.length})
        </button>
        <button
          onClick={() => setActiveTab('sheets_guide')}
          className={`px-3 py-2 rounded-md font-semibold transition-colors flex items-center gap-1.5 ${
            activeTab === 'sheets_guide' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
          Google Sheets Auto-Sync Script
        </button>
        <button
          onClick={() => setActiveTab('excel_guide')}
          className={`px-3 py-2 rounded-md font-semibold transition-colors flex items-center gap-1.5 ${
            activeTab === 'excel_guide' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-teal-400" />
          Microsoft Excel 365 Connector
        </button>
        <button
          onClick={() => setActiveTab('api_guide')}
          className={`px-3 py-2 rounded-md font-semibold transition-colors flex items-center gap-1.5 ${
            activeTab === 'api_guide' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileCode2 className="w-3.5 h-3.5 text-purple-400" />
          REST API / cURL / SDK
        </button>
      </div>

      {/* TAB 1: INTERACTIVE WEBHOOK SIMULATOR */}
      {activeTab === 'simulator' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Input Payload & Preset Selector */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-blue-400" />
                  Incoming Webhook Request Payload
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Test how the pipeline automatically verifies and reconciles updates from spreadsheets
                </p>
              </div>

              <button
                onClick={handleRunSimulation}
                disabled={isExecuting}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors shadow-sm disabled:opacity-50"
              >
                {isExecuting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isExecuting ? 'Running Pipeline...' : 'Trigger Pipeline Ingestion'}</span>
              </button>
            </div>

            {/* Presets */}
            <div className="flex items-center gap-1.5 overflow-x-auto text-[11px]">
              <span className="text-slate-500 font-medium">Preset:</span>
              <button
                onClick={() => setSelectedPreset('sheets_clean')}
                className={`px-2.5 py-1 rounded border transition-colors whitespace-nowrap ${
                  selectedPreset === 'sheets_clean'
                    ? 'bg-blue-950/60 border-blue-500 text-blue-300 font-semibold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                Google Sheets Edit (Clean PO Match)
              </button>
              <button
                onClick={() => setSelectedPreset('excel_update')}
                className={`px-2.5 py-1 rounded border transition-colors whitespace-nowrap ${
                  selectedPreset === 'excel_update'
                    ? 'bg-teal-950/60 border-teal-500 text-teal-300 font-semibold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                Excel 365 Row Edit
              </button>
              <button
                onClick={() => setSelectedPreset('bank_fraud')}
                className={`px-2.5 py-1 rounded border transition-colors whitespace-nowrap ${
                  selectedPreset === 'bank_fraud'
                    ? 'bg-rose-950/60 border-rose-500 text-rose-300 font-semibold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                🚨 Altered Bank Account (Fraud Sentinel)
              </button>
            </div>

            {/* JSON Code Area */}
            <div className="relative">
              <textarea
                value={payloadText}
                onChange={(e) => {
                  setPayloadText(e.target.value);
                  setSelectedPreset('custom');
                }}
                rows={15}
                className="w-full bg-slate-950 text-slate-200 font-mono text-xs p-3.5 rounded-lg border border-slate-800 focus:outline-none focus:border-blue-500 transition-colors"
                spellCheck={false}
              />
            </div>
          </div>

          {/* Right: Pipeline Execution Output */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-400" />
              Automated CI/CD Pipeline Execution Trace
            </h3>

            {executionResult ? (
              <div className="space-y-4">
                {/* Status banner */}
                <div className={`p-4 rounded-xl border flex items-center justify-between ${
                  executionResult.stageResults.sentinelFraudScan.riskLevel === 'VERIFIED'
                    ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-200'
                    : executionResult.stageResults.sentinelFraudScan.riskLevel === 'BLOCKED'
                    ? 'bg-rose-950/40 border-rose-800/80 text-rose-200'
                    : 'bg-amber-950/40 border-amber-800/80 text-amber-200'
                }`}>
                  <div className="flex items-center gap-3">
                    {executionResult.stageResults.sentinelFraudScan.riskLevel === 'VERIFIED' ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                    ) : (
                      <ShieldAlert className="w-6 h-6 text-rose-400 shrink-0" />
                    )}
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider">
                        {executionResult.stageResults.sentinelFraudScan.riskLevel === 'VERIFIED'
                          ? 'PIPELINE COMMIT SUCCESSFUL: 4-WAY INVARIANCE VERIFIED'
                          : 'PIPELINE EXECUTION HALTED: SENTINEL INTERCEPTION'}
                      </div>
                      <div className="text-[11px] opacity-90 mt-0.5">
                        Execution ID: <span className="font-mono">{executionResult.executionId}</span> · Duration: {executionResult.durationMs}ms
                      </div>
                    </div>
                  </div>

                  {executionResult.transaction && (
                    <button
                      onClick={() => onSelectTransaction(executionResult.transaction!)}
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors shadow-sm shrink-0"
                    >
                      Inspect in Ledger
                    </button>
                  )}
                </div>

                {/* Stage Execution Checklist */}
                <div className="space-y-2 text-xs">
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-emerald-400 font-bold">STAGE 1 & 2:</span>
                      <span className="text-slate-300">Schema Invariant & API Secret Authentication</span>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded font-mono text-[10px]">PASS (HTTP 200)</span>
                  </div>

                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-emerald-400 font-bold">STAGE 3:</span>
                      <span className="text-slate-300">4-Way Document Reconciliation (PO, Invoice, GRN, Bank)</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded font-mono text-[10px] ${
                      executionResult.stageResults.reconciliationMatch.passed
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-rose-500/20 text-rose-300'
                    }`}>
                      {executionResult.stageResults.reconciliationMatch.passed ? '100% MATCH' : 'DISCREPANCY FLAGGED'}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-emerald-400 font-bold">STAGE 4:</span>
                      <span className="text-slate-300">16-Point Sentinel Fraud Engine Evaluation</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                      executionResult.stageResults.sentinelFraudScan.riskLevel === 'VERIFIED'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-rose-500/20 text-rose-300'
                    }`}>
                      SCORE: {executionResult.stageResults.sentinelFraudScan.riskScore}/100 ({executionResult.stageResults.sentinelFraudScan.riskLevel})
                    </span>
                  </div>

                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-emerald-400 font-bold">STAGE 5:</span>
                      <span className="text-slate-300">Canonical UTID Minting & SHA-256 Hash Chaining</span>
                    </div>
                    <span className="font-mono text-[11px] text-blue-400 font-bold">
                      {executionResult.stageResults.utidMinting.utid}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-emerald-400 font-bold">STAGE 6:</span>
                      <span className="text-slate-300">Universal Ledger State Committed & Broadcast</span>
                    </div>
                    <span className="font-mono text-[10px] text-slate-400 truncate max-w-[150px]">
                      {executionResult.stageResults.auditCommit.blockHash}
                    </span>
                  </div>
                </div>

                {/* Response Payload */}
                <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 text-xs font-mono">
                  <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">
                    HTTP Response Body (Returned to Google Sheet / Excel)
                  </div>
                  <pre className="text-emerald-400 text-[11px] overflow-x-auto max-h-40">
                    {JSON.stringify({
                      success: executionResult.success,
                      utid: executionResult.stageResults.utidMinting.utid,
                      verdict: executionResult.stageResults.sentinelFraudScan.riskLevel,
                      riskScore: executionResult.stageResults.sentinelFraudScan.riskScore,
                      auditHash: executionResult.stageResults.auditCommit.blockHash,
                      message: executionResult.transaction?.riskSummary
                    }, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-slate-500 border border-dashed border-slate-800 rounded-xl space-y-3">
                <Cpu className="w-10 h-10 text-slate-600 mx-auto" />
                <p className="text-xs">
                  Select a test preset and click <strong className="text-white">Trigger Pipeline Ingestion</strong> to watch the automated 6-stage CI/CD reconciliation cycle run live.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: LIVE INGESTION LOGS */}
      {activeTab === 'logs' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-400" />
                Live Ingestion Webhook Event Stream
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Chronological ledger of incoming invoice events received from enterprise spreadsheets & ERP apps
              </p>
            </div>
            <button
              onClick={() => setLogs([...pipelineTelemetry.recentLogs])}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
              title="Refresh Logs"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Source Connector</th>
                  <th className="py-3 px-4">Origin Sheet / Workbook</th>
                  <th className="py-3 px-4">Assigned UTID</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Latency</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.source === 'GOOGLE_SHEETS' 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : log.source === 'EXCEL_OFFICE_SCRIPTS'
                          ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20'
                          : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                      }`}>
                        {log.source.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300 font-medium">
                      {log.sheetOrApp}
                    </td>
                    <td className="py-3 px-4 font-mono text-blue-400 font-semibold">
                      {log.utid}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.status === 'SUCCESS'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : log.status === 'REJECTED'
                          ? 'bg-rose-500/20 text-rose-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-400">
                      {log.durationMs}ms
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="px-2 py-1 text-[11px] text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors"
                      >
                        Inspect Payload
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: GOOGLE SHEETS SETUP GUIDE & SCRIPT */}
      {activeTab === 'sheets_guide' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">
                  Google Sheets Real-Time Automated Webhook Connector
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Install this Google Apps Script trigger into your Google Sheet. Whenever an invoice is edited or pasted, it fires to UTVN and automatically populates the UTID and verification verdict.
              </p>
            </div>

            <button
              onClick={() => copyToClipboard(sheetsScript, 'sheets-code')}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm shrink-0"
            >
              {copiedKey === 'sheets-code' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedKey === 'sheets-code' ? 'Copied to Clipboard!' : 'Copy Apps Script Code'}</span>
            </button>
          </div>

          {/* 3 Simple Setup Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-1.5">
              <span className="font-mono text-xs font-bold text-emerald-400">STEP 1</span>
              <h4 className="text-xs font-bold text-white">Open Apps Script</h4>
              <p className="text-[11px] text-slate-400">
                In your Google Spreadsheet, click on <strong className="text-slate-200">Extensions</strong> in the top menu, then select <strong className="text-slate-200">Apps Script</strong>.
              </p>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-1.5">
              <span className="font-mono text-xs font-bold text-emerald-400">STEP 2</span>
              <h4 className="text-xs font-bold text-white">Paste & Save</h4>
              <p className="text-[11px] text-slate-400">
                Delete existing placeholder code, paste the script below, and click <strong className="text-slate-200">Save (Disk icon)</strong>. Your API key and endpoint are already pre-filled.
              </p>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-1.5">
              <span className="font-mono text-xs font-bold text-emerald-400">STEP 3</span>
              <h4 className="text-xs font-bold text-white">Edit & Auto-Sync</h4>
              <p className="text-[11px] text-slate-400">
                Type or paste an invoice in your sheet. The script automatically executes on cell edit, verifies 4-way matching, and writes back the UTID into Column K.
              </p>
            </div>
          </div>

          {/* Script Code Viewer */}
          <div className="relative">
            <div className="flex items-center justify-between px-4 py-2 bg-slate-950 border border-b-0 border-slate-800 rounded-t-lg text-xs text-slate-400 font-mono">
              <span>Code.gs (Pre-configured with your webhook URL & Bearer Token)</span>
              <button
                onClick={() => copyToClipboard(sheetsScript, 'sheets-code')}
                className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
              >
                <Copy className="w-3.5 h-3.5" /> Copy Code
              </button>
            </div>
            <pre className="p-4 bg-slate-950 text-slate-300 font-mono text-[11px] rounded-b-lg border border-slate-800 overflow-x-auto max-h-96">
              {sheetsScript}
            </pre>
          </div>
        </div>
      )}

      {/* TAB 4: MICROSOFT EXCEL 365 GUIDE */}
      {activeTab === 'excel_guide' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-teal-400" />
                <h3 className="text-base font-bold text-white">
                  Microsoft Excel 365 & Power Automate Webhook Connector
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Office Script for Excel Online or Power Automate flow. Automatically fires whenever a row is modified in corporate OneDrive / SharePoint Excel workbooks.
              </p>
            </div>

            <button
              onClick={() => copyToClipboard(excelScript, 'excel-code')}
              className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm shrink-0"
            >
              {copiedKey === 'excel-code' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedKey === 'excel-code' ? 'Copied to Clipboard!' : 'Copy Office Script'}</span>
            </button>
          </div>

          <div className="relative">
            <div className="flex items-center justify-between px-4 py-2 bg-slate-950 border border-b-0 border-slate-800 rounded-t-lg text-xs text-slate-400 font-mono">
              <span>UTVN_AutoSync.ts (Excel Office Script)</span>
              <button
                onClick={() => copyToClipboard(excelScript, 'excel-code')}
                className="text-teal-400 hover:text-teal-300 font-semibold flex items-center gap-1"
              >
                <Copy className="w-3.5 h-3.5" /> Copy Code
              </button>
            </div>
            <pre className="p-4 bg-slate-950 text-slate-300 font-mono text-[11px] rounded-b-lg border border-slate-800 overflow-x-auto max-h-96">
              {excelScript}
            </pre>
          </div>
        </div>
      )}

      {/* TAB 5: REST API / CURL / SDK */}
      {activeTab === 'api_guide' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileCode2 className="w-5 h-5 text-purple-400" />
              Direct ERP & Invoicing App Webhook Integration
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Connect SAP S/4HANA, Oracle NetSuite, QuickBooks, or custom billing services directly using standard REST HTTP POST.
            </p>
          </div>

          {/* cURL Snippet */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-300 font-semibold">
              <span>cURL Command</span>
              <button
                onClick={() => copyToClipboard(`curl -X POST "${webhookUrl}" \\
  -H "Content-Type: application/json" \\
  -H "x-utvn-token: ${pipelineTelemetry.apiKey}" \\
  -d '${JSON.stringify(PRESETS.sheets_clean, null, 2)}'`, 'curl')}
                className="text-blue-400 hover:text-blue-300 flex items-center gap-1 font-mono text-[11px]"
              >
                <Copy className="w-3.5 h-3.5" /> Copy cURL
              </button>
            </div>
            <pre className="p-4 bg-slate-950 text-emerald-400 font-mono text-[11px] rounded-lg border border-slate-800 overflow-x-auto">
{`curl -X POST "${webhookUrl}" \\
  -H "Content-Type: application/json" \\
  -H "x-utvn-token: ${pipelineTelemetry.apiKey}" \\
  -d '{
    "source": "ENTERPRISE_API",
    "event": "INVOICE_CREATED",
    "invoice": {
      "invoiceId": "INV-2026-9041",
      "purchaseOrderId": "PO-2026-1184",
      "buyerName": "Tata Consultancy Services Ltd",
      "sellerName": "Infosys BPM Logistics",
      "amount": 450000,
      "currency": "INR",
      "beneficiaryAccount": "ICIC0005544-223344"
    }
  }'`}
            </pre>
          </div>
        </div>
      )}

      {/* Payload Inspection Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h4 className="font-bold text-white text-sm">Webhook Payload Inspector</h4>
                <p className="text-[11px] text-slate-400 font-mono">{selectedLog.id} · {selectedLog.source}</p>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="px-2 py-1 text-slate-400 hover:text-white text-xs bg-slate-800 rounded"
              >
                Close
              </button>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono max-h-80 overflow-y-auto">
              <pre className="text-slate-300 text-[11px]">{JSON.stringify(selectedLog.payload, null, 2)}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
