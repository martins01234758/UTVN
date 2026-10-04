# UTVN Core Architecture & Function Reference Guide

This document provides a detailed breakdown of the 11 core architectural modules and cryptographic functions powering the **Universal Transaction Verification Network (UTVN)**.

---

## 1. Network Ledger
* **Component**: [`src/components/DashboardView.tsx`](../src/components/DashboardView.tsx)
* **Underlying Model**: [`src/types/utvn.ts`](../src/types/utvn.ts)
* **What it means**: 
  The single, immutable, multi-party source of truth for all corporate transactions across buyers, suppliers, logistics providers, and settlement banks.
* **How it works**:
  - Aggregates all registered transactions with unique Universal Transaction Identifiers (UTID).
  - Displays real-time status across the transaction lifecycle (`CREATED`, `MATCH_IN_PROGRESS`, `VERIFIED`, `PAYMENT_PENDING`, `PAYMENT_EXECUTED`, `BLOCKED`).
  - Incorporates an **Advanced Multi-Criteria Search & Filter Suite**:
    - Universal full-text search (matching UTIDs, legal names, invoice IDs, PO IDs, GSTINs, and bank accounts).
    - Timeframe filters (`Today`, `This Week`, `This Month`, and custom calendar date ranges).
    - 4-Tier Risk Categorization (Tier 1 Verified to Tier 4 High Threat).
    - Dynamic counterparty selector isolating specific buyers and sellers.
    - Forensic drawer with 4-Way Match status, gross amount tiers, settlement state, and regional currency corridors.
  - Clicking any transaction opens a deep inspection drawer showing the complete audit block hash chain, raw payload JSON, tax validation records, and downloadable PDF receipts.

---

## 2. CI/CD Ingestion Pipeline
* **Component**: [`src/components/PipelineView.tsx`](../src/components/PipelineView.tsx)
* **Service Engine**: [`src/services/pipelineEngine.ts`](../src/services/pipelineEngine.ts)
* **What it means**:
  Continuous Ingestion and Continuous Dispatch pipeline designed to bridge legacy enterprise software (Google Sheets, Microsoft Excel, ERP webhooks) into the cryptographic ledger in real time.
* **How it works**:
  - Provides pre-configured, production-ready script templates:
    - **Google Apps Script (`onEdit` trigger)**: Streams invoice updates directly from Google Sheets to UTVN webhooks.
    - **Excel Office Scripts / Power Automate**: Captures corporate spreadsheet modifications.
    - **REST API Endpoints**: Accepts direct ERP payloads (`POST /api/v1/ingest`).
  - **Interactive Pipeline Simulator**: Allows operators to fire test payloads (clean sheets, update events, or simulated bank fraud) to observe end-to-end processing.
  - **Real-Time Telemetry & Log Invariant**: Emits millisecond-precision pipeline audit logs recording payload checksums, validation latency, risk engine scoring, and database writes without data truncation.

---

## 3. Pre-Payment Gate
* **Component**: [`src/components/PaymentBeforeReleaseView.tsx`](../src/components/PaymentBeforeReleaseView.tsx)
* **What it means**:
  An automated cryptographic circuit breaker that physically halts banking disbursements until four non-negotiable verification gates are cleared.
* **How it works**:
  Traditional ERP systems process payments asynchronously based purely on calendar due dates, leaving companies vulnerable to wire fraud, duplicate billing, and phantom shipments. The Pre-Payment Gate enforces four mandatory gate checks before releasing wires:
  1. **Gate 1: Zero-Discrepancy 4-Way Match**: Confirms complete alignment among PO, Invoice, Goods Receipt Note (GRN), and Proof of Delivery (POD).
  2. **Gate 2: Forensic Risk Threshold**: Ensures the automated risk score is below 20 with zero critical or high-severity fraud flags.
  3. **Gate 3: Whitelisted Beneficiary Verification**: Matches the target bank account and IFSC/IBAN against authenticated vendor banking history to prevent account-takeover fraud.
  4. **Gate 4: Tax Portal IRN Confirmation**: Verifies the Government Invoice Registration Portal (IRP/NIC) cryptographic signature and registration status.
  - Transactions that pass all 4 gates receive a one-click `Release & Execute Payment` clearance; failed transactions are permanently `BLOCKED`.

---

## 4. 4-Way Match
* **Component**: [`src/components/TransactionLifecycleView.tsx`](../src/components/TransactionLifecycleView.tsx)
* **What it means**:
  The gold standard of corporate accounts payable verification, going beyond traditional 2-way (PO + Invoice) or 3-way (PO + Invoice + Receipt) matching by integrating physical proof of delivery and acceptance.
* **How it works**:
  Simultaneously evaluates and reconciles four core artifacts:
  1. **Purchase Order (PO)**: Buyer-authorized line items, quantities, and agreed unit prices.
  2. **Commercial Invoice**: Seller-submitted billing request, payment terms, and tax breakdown.
  3. **Goods Receipt Note (GRN)**: Receiving warehouse dock log certifying physical package count.
  4. **Proof of Delivery & Quality Inspection (POD)**: On-site digital sign-off confirming acceptable condition and zero damage.
  - Any variance (e.g. billed 100 units but warehouse received 95 units, or price billed at ₹4,500 vs PO price of ₹4,000) is flagged with variance delta calculations and automated price-quantity tolerance checks.

---

## 5. 16-Point Fraud Engine
* **Component**: [`src/components/FraudEngineView.tsx`](../src/components/FraudEngineView.tsx)
* **Forensic Logic**: [`src/utils/fraudEngine.ts`](../src/utils/fraudEngine.ts)
* **What it means**:
  A comprehensive forensic inspection engine evaluating 16 discrete threat vectors spanning deterministic rules, statistical anomalies, graph relationships, and document forensics.
* **How it works**:
  Evaluates every transaction against 16 automated checks:
  1. `chk-01` **Duplicate Invoice Hash**: Detects repeated invoice IDs or payload fingerprints across the entire network.
  2. `chk-02` **Duplicate Purchase Order ID**: Prevents re-billing against an already fulfilled PO.
  3. `chk-03` **Invoice Amount vs PO Match**: Flags invoice totals that exceed approved PO limits by >5%.
  4. `chk-04` **Quantity 3-Way Cross-Verification**: Identifies invoices billing for more items than logged in the warehouse GRN.
  5. `chk-05` **Line-Item Price Spikes**: Highlights unit prices elevated >15% over historical procurement contracts.
  6. `chk-06` **Tax ID (GSTIN/VAT) Checksum**: Validates state codes, PAN formatting, and checksum algorithms.
  7. `chk-07` **E-Invoice IRN Verification**: Verifies the 64-character SHA-256 hash registered with tax authorities.
  8. `chk-08` **Beneficiary Bank Account Change**: Flags any payment routed to an account modified within the last 30 days.
  9. `chk-09` **Round-Dollar Amount Anomaly**: Flags artificially rounded large payments typical of fictitious invoices.
  10. `chk-10` **Shell Company / Age Risk**: Detects vendor entities incorporated less than 90 days prior.
  11. `chk-11` **Circular Trading Cycle**: Scans graph topology for cyclic invoice routing intended to inflate revenue or reclaim fraudulent input tax credits.
  12. `chk-12` **Ghost Vendor Matching**: Compares vendor addresses and tax records against sanctioned or inactive registries.
  13. `chk-13` **Geographic Routing Anomaly**: Identifies mismatched shipping, billing, and bank jurisdictions.
  14. `chk-14` **High-Velocity Invoicing**: Detects rapid bursts of invoices from the same supplier in a short window.
  15. `chk-15` **Split Invoice Structuring**: Identifies transactions deliberately split just below managerial approval thresholds.
  16. `chk-16` **Weekend & Off-Hours Issuance**: Identifies invoices minted outside normal corporate business hours.
  - Combines results into a composite **Risk Score (0–100)** and outputs clear actions: `PROCEED`, `MANUAL_CFO_REVIEW`, `VERIFY_BENEFICIARY`, or `HALT_TRANSACTION`.

---

## 6. Topology Tree DAG
* **Component**: [`src/components/TransactionTreeView.tsx`](../src/components/TransactionTreeView.tsx)
* **What it means**:
  A Directed Acyclic Graph (DAG) representing the complete genealogical lineage and document dependency tree for every transaction.
* **How it works**:
  - Maps parent-to-child relationships from **Master Contract / Framework Agreement** -> **Purchase Order (PO)** -> **Commercial Invoice(s)** -> **Goods Receipt Note (GRN)** -> **Proof of Delivery (POD)** -> **Tax IRN Filing** -> **Bank Wire Disbursement**.
  - Renders dependency status badges (Verified, Pending, Failed) for each node.
  - Allows forensic auditors to visually spot broken linkages, orphaned invoices, or missing verification nodes across complex multi-shipment orders.

---

## 7. Role Portals
* **Component**: [`src/components/RolePortalsView.tsx`](../src/components/RolePortalsView.tsx)
* **What it means**:
  Role-Based Access Control (RBAC) operational cockpit providing tailored interfaces for each network participant.
* **How it works**:
  Simulates and renders customized workflows for four key personas:
  1. **Enterprise Buyer (AP)**: Focuses on PO dispatch, GRN match verification, invoice approval, and credit term management.
  2. **Vendor / Supplier (AR)**: Focuses on invoice generation, dispatch milestone updates, early payment discounting, and payment tracking.
  3. **Settlement Bank / Liquidity Partner**: Focuses on factoring risk assessment, beneficiary KYC verification, and escrow wire execution.
  4. **Compliance & Forensic Auditor**: Focuses on network-wide anomaly detection, tax reconciliation, and cryptographic proof verification.
  - Switching personas in the top header dynamically customizes the visible actions and data security views.

---

## 8. Trust & Cryptography
* **Component**: [`src/components/TrustModelView.tsx`](../src/components/TrustModelView.tsx)
* **Utility Module**: [`src/utils/cryptoSim.ts`](../src/utils/cryptoSim.ts)
* **What it means**:
  The mathematical security architecture ensuring zero-trust verification, tamper evidence, and non-repudiation across decentralized organizations.
* **How it works**:
  - **Asymmetric Key Pairs**: Every participant signs payload hashes using their private key; the network verifies authenticity using public keys.
  - **Merkle Proofs**: Transaction line items are hashed into binary Merkle trees, allowing lightweight verification of specific data points without exposing sensitive commercial terms.
  - **Cryptographic State Hash Chaining**: Every state modification produces a tamper-evident audit record where each block references the SHA-256 hash of the preceding block.
  - If any bad actor attempts to retroactively alter an invoice amount, bank account, or quantity, the cryptographic hash cascade breaks immediately.

---

## 9. Global / India Stack
* **Component**: [`src/components/InteroperabilityView.tsx`](../src/components/InteroperabilityView.tsx)
* **What it means**:
  Cross-border and multi-standard interoperability engine bridging national e-invoicing mandates and international trade formats.
* **How it works**:
  - **India Stack Integration**:
    - **GST E-Invoice & IRP**: Generates and verifies official 64-character Invoice Reference Numbers (IRNs).
    - **Signed QR Code**: Serializes standard JSON payload including Seller GSTIN, Buyer GSTIN, Doc Number, Tax Total, and IRN timestamp.
    - **E-Way Bill Alignment**: Cross-checks logistics vehicle numbers and transporter IDs with national transport registries.
  - **Global Trade Integration**:
    - **PEPPOL BIS Billing 3.0**: Synthesizes and parses European and international UBL 2.1 XML invoices.
    - **ISO 20022**: Standardizes financial payment messaging (`pacs.008` and `pain.001` formats).
    - Enables instantaneous cross-currency and cross-jurisdictional trade between India, Europe, and the United States.

---

## 10. MVP Blueprint
* **Component**: [`src/components/StrategicMvpEvaluationView.tsx`](../src/components/StrategicMvpEvaluationView.tsx)
* **What it means**:
  The enterprise deployment roadmap, architectural ROI analysis, and scalability blueprint for taking UTVN from prototype to production.
* **How it works**:
  - Outlines the 3-phase strategic implementation:
    - **Phase 1: Foundation**: Spreadsheet & webhook ingestion, distributed ledger, and basic 3-way match.
    - **Phase 2: Risk & Defense**: 16-point automated fraud engine, Pre-Payment Gate circuit breaker, and India Stack e-invoicing.
    - **Phase 3: Scale & Liquidity**: Bank API integrations, real-time discounting / dynamic factoring, and PEPPOL global corridors.
  - Provides enterprise readiness metrics: verification latency (<150ms), fraud reduction rate (98.4%), and accounts payable cycle reduction (from 14 days to real-time).

---

## 11. SHA-256 Ledger Sealed
* **Header Status**: [`src/components/Header.tsx`](../src/components/Header.tsx)
* **Hash Computation**: [`src/utils/cryptoSim.ts`](../src/utils/cryptoSim.ts#L34-L42)
* **What it means**:
  A live cryptographic guarantee confirming that the distributed ledger's sequence of blocks is cryptographically intact, verified, and sealed against tampering.
* **How it works**:
  1. Every new transaction or state transition is converted into a deterministic normalized payload string:
     ```
     Payload = UTID | Timestamp | TotalAmount | Currency | BuyerGSTIN | SellerGSTIN | BeneficiaryAccount
     ```
  2. The block computes its block hash using SHA-256 chaining:
     ```
     CurrentBlockHash = SHA-256(PreviousBlockHash + "|" + Timestamp + "|" + Payload)
     ```
  3. The network validates that:
     $$\text{Hash}(B_n.\text{prev}) == B_{n-1}.\text{hash}$$
  4. When all blocks form an unbroken, cryptographically valid sequence, the system displays the **`SHA-256 Ledger Sealed`** badge with a pulsing green indicator.
  5. If even a single character in any historical record is altered, the resulting hash mismatch invalidates the chain, triggering an immediate security alert.
