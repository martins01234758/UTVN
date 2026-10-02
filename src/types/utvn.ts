export type RiskLevel = 'VERIFIED' | 'LOW_RISK' | 'NEEDS_REVIEW' | 'HIGH_RISK' | 'BLOCKED';

export type TransactionStatus = 
  | 'PO_CREATED'
  | 'SELLER_ACCEPTED'
  | 'INVOICE_SUBMITTED'
  | 'MATCHING_VERIFIED'
  | 'DELIVERY_CONFIRMED'
  | 'RISK_FLAGGED'
  | 'PAYMENT_PENDING'
  | 'PAYMENT_EXECUTED'
  | 'BLOCKED'
  | 'REJECTED';

export type UserRole = 'BUYER' | 'SELLER' | 'FINANCE_ADMIN' | 'BANK_PROVIDER';

export interface PartyIdentity {
  id: string;
  legalName: string;
  tradeName?: string;
  country: string;
  taxId: string; // GSTIN in India, EIN/VAT in US/EU
  corporateRegistryId: string; // CIN / LEI / DUNS
  lei?: string; // Legal Entity Identifier
  riskScore: number; // 0 - 100
  kycStatus: 'VERIFIED' | 'PENDING' | 'SUSPENDED';
  bankAccounts: {
    accountNumber: string;
    ifscOrIban: string;
    bankName: string;
    isPrimary: boolean;
    verifiedAt: string;
    pennyDropMatch: boolean;
  }[];
  authorizedSignatories: {
    id: string;
    name: string;
    email: string;
    designation: string;
    signingLimit: number;
    hasDigitalSignature: boolean;
  }[];
  tenureMonths: number;
  totalVolumeProcessed: number;
}

export interface LineItem {
  id: string;
  description: string;
  hsnOrSacCode: string;
  poQuantity: number;
  invoiceQuantity: number;
  receivedQuantity: number;
  unitPrice: number;
  taxRatePercent: number;
  poTotal: number;
  invoiceTotal: number;
  currency: string;
  matchStatus: 'EXACT_MATCH' | 'QTY_MISMATCH' | 'PRICE_MISMATCH' | 'TAX_MISMATCH';
}

export interface TaxInfo {
  regime: 'INDIA_GST' | 'EU_PEPPOL_VAT' | 'US_SALES_TAX';
  sellerGstin?: string;
  buyerGstin?: string;
  irn?: string; // 64-char hex hash
  irnAckNo?: string;
  irnAckDate?: string;
  qrCodePayload?: string;
  peppolEndpointId?: string;
  ublSchemeId?: string;
  taxAmount: number;
  isTaxPortalVerified: boolean;
  taxDiscrepancyNotes?: string;
}

export interface DeliveryConfirmation {
  receiptId: string; // GRN (Goods Receipt Note)
  deliveryDate: string;
  receivedBy: string;
  warehouseLocation: string;
  trackingNumber: string;
  geofenceVerified: boolean;
  rfidOrBarcodeScanned: boolean;
  inspectionStatus: 'ACCEPTED' | 'PARTIALLY_ACCEPTED' | 'REJECTED';
}

export interface PaymentDetails {
  paymentId: string;
  paymentRail: 'NEFT' | 'RTGS' | 'UPI_B2B' | 'SWIFT' | 'SEPA' | 'ACH';
  beneficiaryAccount: string;
  beneficiaryIfscOrIban: string;
  beneficiaryName: string;
  nameMatchConfidence: number; // Percentage
  bankAccountChangeDetected: boolean;
  previousAccount?: string;
  escrowToken?: string;
  settlementReference?: string;
  settledAt?: string;
  status: 'PENDING_APPROVAL' | 'BENEFICIARY_VERIFIED' | 'RELEASED' | 'BLOCKED' | 'FAILED';
}

export interface FraudCheckResult {
  id: string;
  code: string;
  title: string;
  category: 'DETERMINISTIC' | 'ML_ANOMALY' | 'GRAPH_ANALYSIS' | 'DOCUMENT_FORENSICS';
  passed: boolean;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  explanation: string;
  details?: Record<string, any>;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: string;
  actor: {
    userId: string;
    userName: string;
    role: string;
    ipAddress?: string;
    authMethod: 'MFA_PASSKEY' | 'DSC_SMARTCARD' | 'SSO_SAML' | 'API_TOKEN';
  };
  previousHash: string;
  currentHash: string;
  payloadSummary: string;
}

export interface UniversalTransaction {
  utid: string; // e.g. UTVN-2026-IND-89412
  status: TransactionStatus;
  overallRiskLevel: RiskLevel;
  riskScore: number; // 0 - 100 (higher = riskier)
  createdAt: string;
  updatedAt: string;
  currency: string;
  totalAmount: number;
  
  // Parties
  buyer: PartyIdentity;
  seller: PartyIdentity;
  
  // Referenced IDs (Exact Tree Structure)
  purchaseId: string; // Purchase / Requisition ID
  purchaseOrderId: string; // PO ID
  poIssueDate: string;
  invoiceId: string; // Invoice ID
  invoiceDate: string;
  paymentTerms: string;
  
  // Details
  lineItems: LineItem[];
  taxInfo: TaxInfo;
  deliveryConfirmation?: DeliveryConfirmation;
  paymentDetails: PaymentDetails;
  
  // Verification & Risk Engine
  fraudChecks: FraudCheckResult[];
  riskSummary: string;
  recommendedAction: 'PROCEED' | 'MANUAL_CFO_REVIEW' | 'VERIFY_BENEFICIARY' | 'HALT_TRANSACTION';
  
  // Audit Trail
  auditTrail: AuditLogEntry[];
}
