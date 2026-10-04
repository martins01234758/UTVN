# UTVN - Universal Transaction Verification Network

[![UTVN CI/CD Pipeline](https://github.com/martins01234758/UTVN/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/martins01234758/UTVN/actions/workflows/ci-cd.yml)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.0.0-emerald.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

An enterprise-grade, cryptographically verified financial ledger and transaction verification network engineered for multi-party reconciliation, 4-way matching, fraud prevention, and real-time settlement telemetry.

---

## 🚀 Key Modules & Architecture

1. **Dual-Tier Navigation Architecture**:
   - **Tier 1 (Global Identity & Integrations)**: Brand anchor (`UTVN v2.4`), Simulation Persona Switcher (`Admin | Buyer | Seller | Bank`), Live Google Sheets Sync beacon, Bulk Invoice Ingestion, Auth modal, and Quick Scan & Mint.
   - **Tier 2 (Operational Strip)**: Direct routing across Network Ledger, CI/CD Ingestion Pipeline, Pre-Payment Gate, 4-Way Matcher, and 16-Point Fraud Engine, paired with Architecture Modules (`DAG Topology`, `Role Portals`, `Trust Cryptography`, `India / PEPPOL Global Stack`, and `Strategic MVP Evaluation`).

2. **Advanced Multi-Criteria Ledger Suite**:
   - **Universal Real-Time Search**: Instant fuzzy & exact search matching UTID, Buyer, Seller, Invoice #, PO #, GSTIN / VAT IDs, Bank Account numbers, and IRN cryptographic hashes.
   - **Date & Horizon Filtering**: All Dates, Today (24h), This Week (7 Days), This Month (30 Days), or Custom Start & End Dates.
   - **Risk / Severity Tiers**:
     - `Tier 1`: Verified (Score ≤ 10)
     - `Tier 2`: Low Risk (Score 11–30)
     - `Tier 3`: Needs Review (Score 31–60)
     - `Tier 4`: High Threat / Critical Block (Score > 60)
   - **Counterparty Discovery**: Dynamic multi-company dropdown aggregating all active Buyers and Sellers.
   - **Forensic Drawer**: Detailed filters for 4-Way Match sound state, Gross Amount thresholds (<₹10L to >₹1Cr), Settlement status (Released, Pending, Blocked), Tax Portal IRN check, and Regional Corridors (INR, EUR, USD).
   - **Filter Badges & Instant Reset**: Removable interactive chips with dynamic record counts.

3. **Cryptographic Integrity & Telemetry**:
   - Every transaction is sealed with SHA-256 state roots, Merkle proofs, and immutable event trees.
   - Zero-truncation cryptographic logs accessible across all inspection modals.

---

## 🛠️ GitHub Actions CI/CD Pipeline

The repository includes an enterprise-grade GitHub Actions CI/CD workflow defined in [`.github/workflows/ci-cd.yml`](.github/workflows/ci-cd.yml):

* **Validation Stage (`validate`)**:
  - Matrix testing on Node.js `20.x` and `22.x`.
  - Clean dependency installation (`npm ci`).
  - Strict TypeScript schema and invariant checks (`npm run lint` / `tsc --noEmit`).
* **Build Stage (`build`)**:
  - Production compilation with Vite 8.
  - Verification of `dist/index.html` and bundled assets.
  - Generates and uploads downloadable deployment artifacts.
* **Continuous Deployment (`deploy-pages`)**:
  - Automatically deploys the latest production build to GitHub Pages on every push to `main`.
* **Automated Release (`release`)**:
  - Automatically packages and publishes a compressed tarball release when a version tag (`v*.*.*`) is pushed.

---

## 💻 Local Development

### Prerequisites
- **Node.js**: `>= 20.0.0`
- **npm**: `>= 10.0.0`

### Setup & Run
```bash
# Clone the repository
git clone https://github.com/martins01234758/UTVN.git
cd UTVN

# Install dependencies
npm install

# Start local development server (with Express backend & Vite frontend)
npm run dev

# Run TypeScript checks
npm run lint

# Compile production bundle
npm run build
```

---

## 📄 License
This project is open-source under the MIT License.
