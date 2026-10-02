import { PartyIdentity, UniversalTransaction } from '../types/utvn';
import { mockTransactions } from '../data/mockData';

export interface ScannedInvoiceData {
  fileName?: string;
  sellerName: string;
  sellerTaxId: string;
  buyerName: string;
  buyerTaxId: string;
  invoiceNumber: string;
  invoiceDate: string;
  poNumber: string;
  poDate?: string;
  totalAmount: number;
  currency: string;
  bankAccount: string;
  ifscOrIban: string;
  bankName: string;
  itemsDescription: string;
  rawText?: string;
}

export interface CompanyMatchResult {
  isMatch: boolean;
  matchType: 'EXACT_TAX_ID' | 'NAME_MATCH' | 'FUZZY_MATCH' | 'NONE';
  confidence: number; // 0 - 100
  matchedCompany: PartyIdentity | null;
  historicalTransactionCount: number;
  historicalVolume: number;
  bankAccountMatchesHistorical: boolean;
  historicalPrimaryAccount?: string;
  alerts: string[];
}

/**
 * Extracts all unique companies from active transactions
 */
export function getKnownCompanies(transactions: UniversalTransaction[] = mockTransactions): PartyIdentity[] {
  const map = new Map<string, PartyIdentity>();

  transactions.forEach((tx) => {
    if (tx.seller?.taxId) {
      map.set(tx.seller.taxId.toUpperCase(), tx.seller);
    }
    if (tx.buyer?.taxId) {
      map.set(tx.buyer.taxId.toUpperCase(), tx.buyer);
    }
  });

  return Array.from(map.values());
}

/**
 * Checks if a scanned invoice corresponds to an existing company
 * and returns auto-renderable verified metadata
 */
export function matchScannedCompany(
  sellerName: string,
  sellerTaxId: string,
  scannedBankAccount: string,
  transactions: UniversalTransaction[] = mockTransactions
): CompanyMatchResult {
  const cleanTaxId = sellerTaxId.trim().toUpperCase();
  const cleanName = sellerName.trim().toLowerCase();

  let matchedCompany: PartyIdentity | null = null;
  let matchType: 'EXACT_TAX_ID' | 'NAME_MATCH' | 'FUZZY_MATCH' | 'NONE' = 'NONE';
  let confidence = 0;

  // 1. Search by Tax ID (Highest precision)
  for (const tx of transactions) {
    if (tx.seller.taxId && cleanTaxId && tx.seller.taxId.toUpperCase() === cleanTaxId) {
      matchedCompany = tx.seller;
      matchType = 'EXACT_TAX_ID';
      confidence = 99;
      break;
    }
  }

  // 2. Search by Legal Name or Trade Name
  if (!matchedCompany && cleanName.length > 3) {
    for (const tx of transactions) {
      const sellerLegal = tx.seller.legalName.toLowerCase();
      const sellerTrade = (tx.seller.tradeName || '').toLowerCase();

      if (sellerLegal === cleanName || (sellerTrade && sellerTrade === cleanName)) {
        matchedCompany = tx.seller;
        matchType = 'NAME_MATCH';
        confidence = 92;
        break;
      }

      // Substring fuzzy matching
      if (sellerLegal.includes(cleanName) || cleanName.includes(sellerLegal)) {
        matchedCompany = tx.seller;
        matchType = 'FUZZY_MATCH';
        confidence = 85;
        break;
      }
    }
  }

  if (!matchedCompany) {
    return {
      isMatch: false,
      matchType: 'NONE',
      confidence: 0,
      matchedCompany: null,
      historicalTransactionCount: 0,
      historicalVolume: 0,
      bankAccountMatchesHistorical: false,
      alerts: ['New / First-Time Supplier: No previous verified invoice record found in UTVN registry.'],
    };
  }

  // Count past transactions and volume
  const pastTxns = transactions.filter(
    (t) => t.seller.taxId === matchedCompany?.taxId || t.seller.legalName === matchedCompany?.legalName
  );
  const totalVol = pastTxns.reduce((acc, curr) => acc + curr.totalAmount, 0);

  // Check if bank account matches historical registered account
  const primaryAccount = matchedCompany.bankAccounts.find((b) => b.isPrimary) || matchedCompany.bankAccounts[0];
  const registeredAccNum = primaryAccount ? primaryAccount.accountNumber : '';
  const cleanScannedAcc = scannedBankAccount.replace(/\s+/g, '');
  const bankMatches = registeredAccNum ? registeredAccNum.includes(cleanScannedAcc) || cleanScannedAcc.includes(registeredAccNum) : true;

  const alerts: string[] = [];
  if (!bankMatches && cleanScannedAcc) {
    alerts.push(`CRITICAL: Scanned bank account (${cleanScannedAcc}) DOES NOT MATCH historical verified account on file (${registeredAccNum})! Possible payment diversion fraud.`);
  } else {
    alerts.push(`Verified Supplier Profile: ${pastTxns.length} historical transactions successfully settled.`);
  }

  return {
    isMatch: true,
    matchType,
    confidence,
    matchedCompany,
    historicalTransactionCount: pastTxns.length,
    historicalVolume: totalVol,
    bankAccountMatchesHistorical: bankMatches,
    historicalPrimaryAccount: registeredAccNum,
    alerts,
  };
}

/**
 * Pre-configured realistic sample scanned invoices for quick demonstration
 */
export const SAMPLE_SCANNED_INVOICES: ScannedInvoiceData[] = [
  {
    fileName: 'INV-2026-TATA-STEEL-9842.pdf',
    sellerName: 'Tata Steel Industrial Products Ltd',
    sellerTaxId: '20AAACT2702H1ZZ',
    buyerName: 'Larsen & Toubro Heavy Infrastructure Ltd',
    buyerTaxId: '27AAACL0149R1Z1',
    invoiceNumber: 'INV-2026-TS-89412',
    invoiceDate: '2026-10-02',
    poNumber: 'PO-2026-LT-90412',
    poDate: '2026-09-25',
    totalAmount: 4850000,
    currency: 'INR',
    bankAccount: '000405009821034',
    ifscOrIban: 'SBIN0000125',
    bankName: 'State Bank of India, Commercial Branch',
    itemsDescription: 'Industrial Grade Reinforced Structural Steel Beams (IS 2062 E250BR)',
    rawText: `TAX INVOICE - ORIGINAL FOR RECIPIENT
Seller: Tata Steel Industrial Products Ltd
GSTIN: 20AAACT2702H1ZZ | CIN: L27100MH1907PLC000260
Bistupur, Jamshedpur, Jharkhand - 831001

Bill To: Larsen & Toubro Heavy Infrastructure Ltd
GSTIN: 27AAACL0149R1Z1
L&T House, Ballard Estate, Mumbai - 400001

Invoice No: INV-2026-TS-89412 | Date: 02-Oct-2026
Purchase Order No: PO-2026-LT-90412 | PO Date: 25-Sep-2026
Payment Terms: 30 Days Net

Description of Goods:
1. Structural Steel Beams IS 2062 - HSN: 72163300 - Qty: 50 MT - Rate: 82,203.39 - Total: 4,110,169.49
CGST @ 9%: 369,915.25 | SGST @ 9%: 369,915.25
Total Payable: INR 4,850,000.00

Bank Details for Remittance:
Bank Name: State Bank of India
A/C No: 000405009821034 | IFSC: SBIN0000125`,
  },
  {
    fileName: 'INV-2026-APEX-TAMPERED-BANK.pdf',
    sellerName: 'Apex Cloud Technologies Ltd',
    sellerTaxId: '29AABCA4589E1Z8',
    buyerName: 'Larsen & Toubro Heavy Infrastructure Ltd',
    buyerTaxId: '27AAACL0149R1Z1',
    invoiceNumber: 'INV-2026-AC-78912',
    invoiceDate: '2026-10-02',
    poNumber: 'PO-2026-LT-33219',
    poDate: '2026-09-20',
    totalAmount: 1820000,
    currency: 'INR',
    // Tampered account number (different from historical registered account: 50200049182910)
    bankAccount: '998877665544332',
    ifscOrIban: 'ICIC0000999',
    bankName: 'ICICI Bank, New Unknown Account',
    itemsDescription: 'Enterprise Cloud Infrastructure Annual Subscription & Support',
    rawText: `INVOICE FOR IT SERVICES
Supplier: Apex Cloud Technologies Ltd
GSTIN: 29AABCA4589E1Z8 | Bengaluru, Karnataka

Client: Larsen & Toubro Heavy Infrastructure Ltd
GSTIN: 27AAACL0149R1Z1

Invoice Ref: INV-2026-AC-78912 | PO Ref: PO-2026-LT-33219
Total: INR 1,820,000.00

*** NOTICE: PAYMENT DETAILS HAVE BEEN UPDATED ***
Please remit payments ONLY to our new treasury collection account:
Bank Name: ICICI Bank
Account Number: 998877665544332
IFSC Code: ICIC0000999`,
  },
  {
    fileName: 'INV-2026-SIEMENS-PEPPOL.xml',
    sellerName: 'Siemens AG Power & Gas',
    sellerTaxId: 'DE129274202',
    buyerName: 'Larsen & Toubro Heavy Infrastructure Ltd',
    buyerTaxId: '27AAACL0149R1Z1',
    invoiceNumber: 'INV-2026-SIE-44102',
    invoiceDate: '2026-10-01',
    poNumber: 'PO-2026-LT-88120',
    poDate: '2026-09-18',
    totalAmount: 94000,
    currency: 'EUR',
    bankAccount: 'DE89370400440532013000',
    ifscOrIban: 'DEUTDEDDXXX',
    bankName: 'Deutsche Bank AG Frankfurt',
    itemsDescription: 'High-Pressure Turbine Rotor Sensors & Gas Telemetry Units',
    rawText: `PEPPOL BIS BILLING 3.0 ELECTRONIC INVOICE
Supplier Legal Entity: Siemens AG Power & Gas
VAT ID: DE129274202 | Peppol Endpoint: 9930:DE129274202
Werner-von-Siemens-Strasse 1, 80333 Munich, Germany

Buyer: Larsen & Toubro Heavy Infrastructure Ltd
Invoice No: INV-2026-SIE-44102 | Issue Date: 2026-10-01
Order Reference: PO-2026-LT-88120
Payable Amount: EUR 94,000.00

Payment Means: SEPA Credit Transfer
IBAN: DE89370400440532013000
BIC: DEUTDEDDXXX`,
  },
  {
    fileName: 'INV-2026-NOVA-ROBOTICS-NEW.pdf',
    sellerName: 'Nova Robotics Systems Pvt Ltd',
    sellerTaxId: '33AABCN1234K1Z5',
    buyerName: 'Larsen & Toubro Heavy Infrastructure Ltd',
    buyerTaxId: '27AAACL0149R1Z1',
    invoiceNumber: 'INV-2026-NOV-10294',
    invoiceDate: '2026-10-02',
    poNumber: 'PO-2026-LT-99104',
    poDate: '2026-09-28',
    totalAmount: 1250000,
    currency: 'INR',
    bankAccount: '11223344556677',
    ifscOrIban: 'KKBK0000812',
    bankName: 'Kotak Mahindra Bank Chennai',
    itemsDescription: 'Automated Guided Vehicles (AGV) Lithium Battery Packs',
    rawText: `TAX INVOICE (FIRST-TIME SUPPLIER)
Seller: Nova Robotics Systems Pvt Ltd
GSTIN: 33AABCN1234K1Z5
Guindy Industrial Estate, Chennai, Tamil Nadu

Bill To: Larsen & Toubro Heavy Infrastructure Ltd
Invoice No: INV-2026-NOV-10294
PO No: PO-2026-LT-99104
Total: INR 1,250,000.00
A/C: 11223344556677 | IFSC: KKBK0000812`,
  },
];
