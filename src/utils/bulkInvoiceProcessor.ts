import { UniversalTransaction, PartyIdentity, LineItem } from '../types/utvn';
import { generateUTID, generateIRN } from './cryptoSim';
import { evaluateTransactionFraud, FraudEngineEvaluation } from './fraudEngine';
import { matchScannedCompany, CompanyMatchResult } from './companyDirectory';

export interface BulkInvoiceRow {
  rowId: string;
  sellerName: string;
  sellerTaxId: string;
  buyerName: string;
  buyerTaxId: string;
  invoiceNumber: string;
  invoiceDate: string;
  poNumber: string;
  poDate: string;
  amount: number;
  currency: string;
  bankAccount: string;
  ifscOrIban: string;
  bankName: string;
  itemDescription: string;
  
  // Enriched Auto-Matched Data
  matchResult?: CompanyMatchResult;
  fraudEvaluation?: FraudEngineEvaluation;
  generatedUtid?: string;
  status: 'PENDING_EVAL' | 'VERIFIED' | 'NEEDS_REVIEW' | 'BLOCKED';
  validationMessage?: string;
}

export const SAMPLE_BULK_SHEET_DATA: BulkInvoiceRow[] = [
  {
    rowId: 'ROW-01',
    sellerName: 'Tata Steel Industrial Products Ltd',
    sellerTaxId: '20AAACT2702H1ZZ',
    buyerName: 'Larsen & Toubro Heavy Infrastructure Ltd',
    buyerTaxId: '27AAACL0149R1Z1',
    invoiceNumber: 'INV-2026-TS-10491',
    invoiceDate: '2026-10-02',
    poNumber: 'PO-2026-LT-44120',
    poDate: '2026-09-22',
    amount: 5200000,
    currency: 'INR',
    bankAccount: '000405009821034',
    ifscOrIban: 'SBIN0000125',
    bankName: 'State Bank of India Commercial Branch',
    itemDescription: 'Heavy Structural Steel Beams & Angle Sections',
    status: 'PENDING_EVAL',
  },
  {
    rowId: 'ROW-02',
    sellerName: 'Siemens AG Power & Gas',
    sellerTaxId: 'DE129274202',
    buyerName: 'Larsen & Toubro Heavy Infrastructure Ltd',
    buyerTaxId: '27AAACL0149R1Z1',
    invoiceNumber: 'INV-2026-SIE-9921',
    invoiceDate: '2026-10-01',
    poNumber: 'PO-2026-LT-33100',
    poDate: '2026-09-15',
    amount: 86000,
    currency: 'EUR',
    bankAccount: 'DE89370400440532013000',
    ifscOrIban: 'DEUTDEDDXXX',
    bankName: 'Deutsche Bank AG Frankfurt',
    itemDescription: 'Industrial Gas Turbine Pressure Regulators',
    status: 'PENDING_EVAL',
  },
  {
    rowId: 'ROW-03',
    sellerName: 'Apex Cloud Technologies Ltd',
    sellerTaxId: '29AABCA4589E1Z8',
    buyerName: 'Larsen & Toubro Heavy Infrastructure Ltd',
    buyerTaxId: '27AAACL0149R1Z1',
    invoiceNumber: 'INV-2026-AC-88192',
    invoiceDate: '2026-10-02',
    poNumber: 'PO-2026-LT-90112',
    poDate: '2026-09-20',
    amount: 1450000,
    currency: 'INR',
    // Tampered Account Number (different from historical registered 50200049182910)
    bankAccount: '99881122334455',
    ifscOrIban: 'HDFC0000999',
    bankName: 'HDFC Bank - Altered Phishing Account',
    itemDescription: 'Annual Cloud ERP Multi-Tenant License',
    status: 'PENDING_EVAL',
  },
  {
    rowId: 'ROW-04',
    sellerName: 'Tata Steel Industrial Products Ltd',
    sellerTaxId: '20AAACT2702H1ZZ',
    buyerName: 'Larsen & Toubro Heavy Infrastructure Ltd',
    buyerTaxId: '27AAACL0149R1Z1',
    invoiceNumber: 'INV-2026-TS-10492',
    invoiceDate: '2026-10-02',
    poNumber: 'PO-2026-LT-44121',
    poDate: '2026-09-23',
    amount: 3100000,
    currency: 'INR',
    bankAccount: '000405009821034',
    ifscOrIban: 'SBIN0000125',
    bankName: 'State Bank of India Commercial Branch',
    itemDescription: 'Hot Rolled Coils (IS 2062 Grade)',
    status: 'PENDING_EVAL',
  },
  {
    rowId: 'ROW-05',
    sellerName: 'Nova Robotics Systems Pvt Ltd',
    sellerTaxId: '33AABCN1234K1Z5',
    buyerName: 'Larsen & Toubro Heavy Infrastructure Ltd',
    buyerTaxId: '27AAACL0149R1Z1',
    invoiceNumber: 'INV-2026-NOV-201',
    invoiceDate: '2026-10-01',
    poNumber: 'PO-2026-LT-77180',
    poDate: '2026-09-26',
    amount: 1980000,
    currency: 'INR',
    bankAccount: '11223344556677',
    ifscOrIban: 'KKBK0000812',
    bankName: 'Kotak Mahindra Bank Chennai',
    itemDescription: 'Autonomous Factory Transport AGV Drivetrains',
    status: 'PENDING_EVAL',
  },
  {
    rowId: 'ROW-06',
    sellerName: 'Global PetroChem Logistics LLC',
    sellerTaxId: '12-3456789',
    buyerName: 'Larsen & Toubro Heavy Infrastructure Ltd',
    buyerTaxId: '27AAACL0149R1Z1',
    invoiceNumber: 'INV-2026-GPC-5512',
    invoiceDate: '2026-09-29',
    poNumber: 'PO-2026-LT-55100',
    poDate: '2026-09-10',
    amount: 125000,
    currency: 'USD',
    bankAccount: '109827364512',
    ifscOrIban: 'CHASUS33',
    bankName: 'JPMorgan Chase Bank New York',
    itemDescription: 'Specialized High-Grade Polymer Lubricants',
    status: 'PENDING_EVAL',
  },
];

/**
 * Parses raw CSV / TSV text into BulkInvoiceRow records
 */
export function parseDelimitedSheet(text: string): BulkInvoiceRow[] {
  const lines = text.trim().split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return [];

  const delimiter = lines[0].includes('\t') ? '\t' : ',';
  const headers = lines[0].split(delimiter).map((h) => h.trim().toLowerCase().replace(/['"]/g, ''));

  const rows: BulkInvoiceRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(delimiter).map((c) => c.trim().replace(/^["']|["']$/g, ''));
    if (cols.length < 3) continue;

    // Helper to find column by aliases
    const getVal = (aliases: string[], fallback: string = ''): string => {
      for (const alias of aliases) {
        const idx = headers.findIndex((h) => h.includes(alias));
        if (idx !== -1 && cols[idx] !== undefined && cols[idx].length > 0) {
          return cols[idx];
        }
      }
      return fallback;
    };

    const sellerName = getVal(['seller', 'vendor', 'supplier'], 'Vendor Entity ' + i);
    const sellerTaxId = getVal(['gstin', 'vat', 'tax id', 'ein', 'taxid'], '20AAACT2702H1ZZ');
    const buyerName = getVal(['buyer', 'client', 'customer'], 'Larsen & Toubro Heavy Infrastructure Ltd');
    const buyerTaxId = getVal(['buyer tax', 'buyer gstin'], '27AAACL0149R1Z1');
    const invoiceNumber = getVal(['invoice #', 'invoice no', 'invoice', 'inv'], 'INV-2026-BULK-' + (1000 + i));
    const invoiceDate = getVal(['invoice date', 'date', 'issue date'], new Date().toISOString().split('T')[0]);
    const poNumber = getVal(['po #', 'po no', 'po', 'order'], 'PO-2026-LT-' + (2000 + i));
    const poDate = getVal(['po date', 'order date'], new Date().toISOString().split('T')[0]);
    const amountStr = getVal(['amount', 'total', 'payable', 'gross'], '1000000');
    const amount = parseFloat(amountStr.replace(/[^0-9.-]/g, '')) || 1000000;
    const currency = getVal(['currency', 'curr'], 'INR').toUpperCase();
    const bankAccount = getVal(['bank account', 'account', 'acc', 'iban'], '000405009821034');
    const ifscOrIban = getVal(['ifsc', 'swift', 'bic'], 'SBIN0000125');
    const bankName = getVal(['bank name', 'bank'], 'Primary Remittance Bank');
    const itemDescription = getVal(['item', 'description', 'goods', 'service'], 'Procured Industrial Assemblies');

    rows.push({
      rowId: `ROW-${i.toString().padStart(2, '0')}`,
      sellerName,
      sellerTaxId,
      buyerName,
      buyerTaxId,
      invoiceNumber,
      invoiceDate,
      poNumber,
      poDate,
      amount,
      currency,
      bankAccount,
      ifscOrIban,
      bankName,
      itemDescription,
      status: 'PENDING_EVAL',
    });
  }

  return rows;
}

/**
 * Converts array of values from Google Sheets API into BulkInvoiceRow records
 */
export function parseGoogleSheetsValues(values: any[][]): BulkInvoiceRow[] {
  if (!values || values.length < 2) return [];

  const headers = values[0].map((h) => String(h || '').trim().toLowerCase());
  const rows: BulkInvoiceRow[] = [];

  for (let i = 1; i < values.length; i++) {
    const cols = values[i] || [];
    if (cols.length === 0) continue;

    const getVal = (aliases: string[], fallback: string = ''): string => {
      for (const alias of aliases) {
        const idx = headers.findIndex((h) => h.includes(alias));
        if (idx !== -1 && cols[idx] !== undefined && String(cols[idx]).length > 0) {
          return String(cols[idx]).trim();
        }
      }
      return fallback;
    };

    const sellerName = getVal(['seller', 'vendor', 'supplier'], 'Vendor ' + i);
    const sellerTaxId = getVal(['gstin', 'vat', 'tax id', 'ein'], '20AAACT2702H1ZZ');
    const buyerName = getVal(['buyer', 'client'], 'Larsen & Toubro Heavy Infrastructure Ltd');
    const buyerTaxId = getVal(['buyer gstin', 'buyer tax'], '27AAACL0149R1Z1');
    const invoiceNumber = getVal(['invoice', 'inv'], 'INV-GS-' + (1000 + i));
    const invoiceDate = getVal(['invoice date', 'date'], new Date().toISOString().split('T')[0]);
    const poNumber = getVal(['po', 'order'], 'PO-GS-' + (2000 + i));
    const poDate = getVal(['po date'], new Date().toISOString().split('T')[0]);
    const amountStr = getVal(['amount', 'total', 'payable'], '1000000');
    const amount = parseFloat(amountStr.replace(/[^0-9.-]/g, '')) || 1000000;
    const currency = getVal(['currency'], 'INR').toUpperCase();
    const bankAccount = getVal(['bank account', 'account', 'acc'], '000405009821034');
    const ifscOrIban = getVal(['ifsc', 'iban'], 'SBIN0000125');
    const bankName = getVal(['bank name', 'bank'], 'Remittance Bank');
    const itemDescription = getVal(['description', 'items'], 'Procured Material Line Item');

    rows.push({
      rowId: `GS-ROW-${i.toString().padStart(2, '0')}`,
      sellerName,
      sellerTaxId,
      buyerName,
      buyerTaxId,
      invoiceNumber,
      invoiceDate,
      poNumber,
      poDate,
      amount,
      currency,
      bankAccount,
      ifscOrIban,
      bankName,
      itemDescription,
      status: 'PENDING_EVAL',
    });
  }

  return rows;
}

/**
 * Enriches and runs fraud analysis on every row in the bulk sheet
 */
export function evaluateBulkSheetRows(
  rows: BulkInvoiceRow[],
  existingTransactions: UniversalTransaction[]
): BulkInvoiceRow[] {
  return rows.map((row) => {
    // 1. Check company memory and auto-render
    const match = matchScannedCompany(
      row.sellerName,
      row.sellerTaxId,
      row.bankAccount,
      existingTransactions
    );

    const hasBankDiscrepancy = match.isMatch && !match.bankAccountMatchesHistorical;

    // 2. Build temporary transaction to run the 16-point fraud engine
    const tempTx: Partial<UniversalTransaction> = {
      utid: 'UTVN-BATCH-' + row.rowId,
      totalAmount: row.amount,
      currency: row.currency,
      buyer: {
        id: 'ORG-BYR-1004',
        legalName: row.buyerName,
        country: row.currency === 'INR' ? 'India' : 'Germany',
        taxId: row.buyerTaxId,
        corporateRegistryId: 'L99999MH1946PLC004768',
        riskScore: 3,
        kycStatus: 'VERIFIED',
        bankAccounts: [],
        authorizedSignatories: [],
        tenureMonths: 48,
        totalVolumeProcessed: 500000000,
      },
      seller: match.isMatch && match.matchedCompany ? match.matchedCompany : {
        id: 'ORG-SUP-' + row.rowId,
        legalName: row.sellerName,
        country: row.currency === 'INR' ? 'India' : 'Germany',
        taxId: row.sellerTaxId,
        corporateRegistryId: 'U72900KA2021PTC148900',
        riskScore: 40,
        kycStatus: 'PENDING',
        bankAccounts: [],
        authorizedSignatories: [],
        tenureMonths: 1,
        totalVolumeProcessed: row.amount,
      },
      purchaseId: 'PR-2026-' + row.rowId,
      purchaseOrderId: row.poNumber,
      poIssueDate: row.poDate,
      invoiceId: row.invoiceNumber,
      invoiceDate: row.invoiceDate,
      lineItems: [
        {
          id: 'LI-BATCH-' + row.rowId,
          description: row.itemDescription,
          hsnOrSacCode: row.currency === 'INR' ? '72163300' : '84119900',
          poQuantity: 10,
          invoiceQuantity: 10,
          receivedQuantity: 10,
          unitPrice: row.amount / 10,
          taxRatePercent: 18,
          poTotal: row.amount,
          invoiceTotal: row.amount,
          currency: row.currency,
          matchStatus: 'EXACT_MATCH',
        },
      ],
      taxInfo: {
        regime: row.currency === 'INR' ? 'INDIA_GST' : 'EU_PEPPOL_VAT',
        taxAmount: row.amount * 0.18,
        isTaxPortalVerified: true,
      },
      paymentDetails: {
        paymentId: 'PAY-BATCH-' + row.rowId,
        paymentRail: row.currency === 'INR' ? 'RTGS' : 'SEPA',
        beneficiaryAccount: row.bankAccount,
        beneficiaryIfscOrIban: row.ifscOrIban,
        beneficiaryName: row.sellerName,
        nameMatchConfidence: hasBankDiscrepancy ? 30 : 99,
        bankAccountChangeDetected: hasBankDiscrepancy,
        status: hasBankDiscrepancy ? 'BLOCKED' : 'PENDING_APPROVAL',
      },
      auditTrail: [],
    };

    const fraudEval = evaluateTransactionFraud(tempTx);

    let status: BulkInvoiceRow['status'] = 'VERIFIED';
    let validationMessage = match.isMatch
      ? `Auto-rendered verified company records (${match.historicalTransactionCount} past txns). 16-point audit clear.`
      : 'First-time supplier. New vendor verification protocol initiated.';

    if (hasBankDiscrepancy) {
      status = 'BLOCKED';
      validationMessage = `BLOCKED: Bank account diversion detected! Scanned ${row.bankAccount} does not match historical ${match.historicalPrimaryAccount}.`;
    } else if (fraudEval.riskLevel === 'HIGH_RISK' || fraudEval.riskLevel === 'NEEDS_REVIEW') {
      status = 'NEEDS_REVIEW';
      validationMessage = fraudEval.summary;
    }

    return {
      ...row,
      matchResult: match,
      fraudEvaluation: fraudEval,
      status,
      validationMessage,
    };
  });
}

/**
 * Converts validated BulkInvoiceRows into production UniversalTransactions
 */
export function convertBulkRowsToUniversalTransactions(
  rows: BulkInvoiceRow[],
  existingTransactions: UniversalTransaction[]
): UniversalTransaction[] {
  return rows.map((row) => {
    const region = row.currency === 'INR' ? 'IND' : 'EU';
    const utid = generateUTID(region);
    const irn = generateIRN(row.sellerTaxId, row.invoiceNumber);

    const match = row.matchResult || matchScannedCompany(
      row.sellerName,
      row.sellerTaxId,
      row.bankAccount,
      existingTransactions
    );

    const hasBankDiscrepancy = match.isMatch && !match.bankAccountMatchesHistorical;

    const sellerObj: PartyIdentity = match.isMatch && match.matchedCompany ? {
      ...match.matchedCompany,
    } : {
      id: 'ORG-SUP-' + Math.floor(1000 + Math.random() * 9000),
      legalName: row.sellerName,
      country: row.currency === 'INR' ? 'India' : 'Germany',
      taxId: row.sellerTaxId,
      corporateRegistryId: 'U72900KA2021PTC148900',
      riskScore: 35,
      kycStatus: 'PENDING',
      bankAccounts: [
        {
          accountNumber: row.bankAccount,
          ifscOrIban: row.ifscOrIban,
          bankName: row.bankName,
          isPrimary: true,
          verifiedAt: new Date().toISOString().split('T')[0],
          pennyDropMatch: false,
        },
      ],
      authorizedSignatories: [
        {
          id: 'SIG-BULK',
          name: 'Authorized Vendor Signatory',
          email: 'remittance@' + row.sellerName.toLowerCase().replace(/[^a-z]/g, '') + '.com',
          designation: 'Commercial Accounts Lead',
          signingLimit: 5000000,
          hasDigitalSignature: false,
        },
      ],
      tenureMonths: 1,
      totalVolumeProcessed: row.amount,
    };

    const baseTx: Partial<UniversalTransaction> = {
      utid,
      status: hasBankDiscrepancy ? 'BLOCKED' : 'MATCHING_VERIFIED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      currency: row.currency,
      totalAmount: row.amount,
      buyer: {
        id: 'ORG-BYR-1004',
        legalName: row.buyerName,
        country: row.currency === 'INR' ? 'India' : 'Germany',
        taxId: row.buyerTaxId,
        corporateRegistryId: 'L99999MH1946PLC004768',
        riskScore: 3,
        kycStatus: 'VERIFIED',
        bankAccounts: [
          {
            accountNumber: '912020048192019',
            ifscOrIban: 'HDFC0000060',
            bankName: 'HDFC Bank Ltd, Mumbai Corporate',
            isPrimary: true,
            verifiedAt: '2024-01-15',
            pennyDropMatch: true,
          },
        ],
        authorizedSignatories: [
          {
            id: 'SIG-1',
            name: 'Rajesh K. Varma',
            email: 'rajesh.varma@enterprise.com',
            designation: 'VP Procurement',
            signingLimit: 10000000,
            hasDigitalSignature: true,
          },
        ],
        tenureMonths: 48,
        totalVolumeProcessed: 500000000,
      },
      seller: sellerObj,
      purchaseId: 'PR-2026-BULK-' + Math.floor(10000 + Math.random() * 90000),
      purchaseOrderId: row.poNumber,
      poIssueDate: row.poDate,
      invoiceId: row.invoiceNumber,
      invoiceDate: row.invoiceDate,
      paymentTerms: 'NET 30 Days',
      lineItems: [
        {
          id: 'LI-BULK-' + row.rowId,
          description: row.itemDescription,
          hsnOrSacCode: row.currency === 'INR' ? '72163300' : '84119900',
          poQuantity: 10,
          invoiceQuantity: 10,
          receivedQuantity: 10,
          unitPrice: row.amount / 10,
          taxRatePercent: row.currency === 'INR' ? 18 : 19,
          poTotal: row.amount,
          invoiceTotal: row.amount,
          currency: row.currency,
          matchStatus: 'EXACT_MATCH',
        },
      ],
      taxInfo: {
        regime: row.currency === 'INR' ? 'INDIA_GST' : 'EU_PEPPOL_VAT',
        sellerGstin: row.sellerTaxId,
        buyerGstin: row.buyerTaxId,
        irn,
        taxAmount: row.amount * 0.18,
        isTaxPortalVerified: true,
      },
      deliveryConfirmation: {
        receiptId: 'GRN-2026-DEL-' + Math.floor(1000 + Math.random() * 9000),
        deliveryDate: new Date().toISOString().split('T')[0],
        receivedBy: 'Warehouse Logistics Incharge',
        warehouseLocation: 'Bulk Import Bay',
        trackingNumber: 'TRK-BULK-' + Math.floor(1000 + Math.random() * 9000),
        geofenceVerified: true,
        rfidOrBarcodeScanned: true,
        inspectionStatus: 'ACCEPTED',
      },
      paymentDetails: {
        paymentId: 'PAY-2026-BULK-' + Math.floor(10000 + Math.random() * 90000),
        paymentRail: row.currency === 'INR' ? 'RTGS' : 'SEPA',
        beneficiaryAccount: row.bankAccount,
        beneficiaryIfscOrIban: row.ifscOrIban,
        beneficiaryName: row.sellerName,
        nameMatchConfidence: hasBankDiscrepancy ? 35 : 99.2,
        bankAccountChangeDetected: hasBankDiscrepancy,
        previousAccount: match.historicalPrimaryAccount ? `${match.historicalPrimaryAccount} (Verified Historical Master)` : undefined,
        status: hasBankDiscrepancy ? 'BLOCKED' : 'PENDING_APPROVAL',
      },
      auditTrail: [
        {
          id: 'AUD-BULK-' + row.rowId,
          timestamp: new Date().toISOString(),
          action: 'BULK_SHEET_BATCH_IMPORT_VERIFIED',
          actor: {
            userId: 'usr-bulk-engine',
            userName: 'UTVN Enterprise Bulk Sheet Processor',
            role: 'AUTOMATED_BATCH_PROCESSOR',
            authMethod: 'API_TOKEN',
          },
          previousHash: '0000000000000000000000000000000000000000000000000000000000000000',
          currentHash: 'b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8',
          payloadSummary: `Bulk imported invoice ${row.invoiceNumber} for ${row.sellerName}. Matched company: ${match.isMatch ? match.matchedCompany?.legalName : 'None (New)'}.`,
        },
      ],
    };

    const evaluation = evaluateTransactionFraud(baseTx);
    return {
      ...(baseTx as any),
      overallRiskLevel: evaluation.riskLevel,
      riskScore: evaluation.riskScore,
      fraudChecks: evaluation.checks,
      riskSummary: evaluation.summary,
      recommendedAction: evaluation.recommendedAction,
    };
  });
}
