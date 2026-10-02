import { UniversalTransaction } from '../types/utvn';
import { evaluateTransactionFraud } from '../utils/fraudEngine';

const baseTransactions: Omit<UniversalTransaction, 'fraudChecks' | 'riskSummary' | 'recommendedAction' | 'overallRiskLevel' | 'riskScore'>[] = [
  {
    utid: 'UTVN-2026-IND-89412-A9F2',
    status: 'PAYMENT_EXECUTED',
    createdAt: '2026-09-28T09:30:00Z',
    updatedAt: '2026-10-01T14:15:22Z',
    currency: 'INR',
    totalAmount: 4850000,
    buyer: {
      id: 'ORG-BYR-1004',
      legalName: 'Larsen & Toubro Heavy Infrastructure Ltd',
      tradeName: 'L&T Heavy Civil',
      country: 'India',
      taxId: '27AAACL0149R1Z1',
      corporateRegistryId: 'L99999MH1946PLC004768',
      lei: '335800QW9V620W9M1050',
      riskScore: 4,
      kycStatus: 'VERIFIED',
      bankAccounts: [
        {
          accountNumber: '912020048192019',
          ifscOrIban: 'HDFC0000060',
          bankName: 'HDFC Bank Ltd, Mumbai Corporate Branch',
          isPrimary: true,
          verifiedAt: '2024-01-15',
          pennyDropMatch: true
        }
      ],
      authorizedSignatories: [
        {
          id: 'SIG-01',
          name: 'Rajesh K. Varma',
          email: 'rajesh.varma@larsentoubro.com',
          designation: 'VP Procurement & Supply Chain',
          signingLimit: 10000000,
          hasDigitalSignature: true
        },
        {
          id: 'SIG-02',
          name: 'Sunita Ramanathan',
          email: 'sunita.r@larsentoubro.com',
          designation: 'Chief Financial Officer',
          signingLimit: 50000000,
          hasDigitalSignature: true
        }
      ],
      tenureMonths: 48,
      totalVolumeProcessed: 980000000
    },
    seller: {
      id: 'ORG-SUP-3091',
      legalName: 'Tata Steel Industrial Products Ltd',
      tradeName: 'Tata Steel Tubes Division',
      country: 'India',
      taxId: '20AAACT2702H1ZZ',
      corporateRegistryId: 'L27100MH1907PLC000260',
      lei: '335800B891104ZJ29811',
      riskScore: 2,
      kycStatus: 'VERIFIED',
      bankAccounts: [
        {
          accountNumber: '000405001928',
          ifscOrIban: 'ICIC0000004',
          bankName: 'ICICI Bank Ltd, Nariman Point',
          isPrimary: true,
          verifiedAt: '2023-04-10',
          pennyDropMatch: true
        }
      ],
      authorizedSignatories: [
        {
          id: 'SIG-SUP-01',
          name: 'Arunav Sengupta',
          email: 'arunav.sengupta@tatasteel.com',
          designation: 'Commercial Director',
          signingLimit: 25000000,
          hasDigitalSignature: true
        }
      ],
      tenureMonths: 60,
      totalVolumeProcessed: 1420000000
    },
    purchaseId: 'PR-2026-LT-09141',
    purchaseOrderId: 'PO-2026-LT-88192',
    poIssueDate: '2026-09-25',
    invoiceId: 'INV-TS-2026-09418',
    invoiceDate: '2026-09-28',
    paymentTerms: 'NET 30 Days',
    lineItems: [
      {
        id: 'LI-01',
        description: 'Structural Steel Hollow Sections Grade E350 - 150x150x6mm',
        hsnOrSacCode: '73066100',
        poQuantity: 50,
        invoiceQuantity: 50,
        receivedQuantity: 50,
        unitPrice: 82000,
        taxRatePercent: 18,
        poTotal: 4100000,
        invoiceTotal: 4100000,
        currency: 'INR',
        matchStatus: 'EXACT_MATCH'
      }
    ],
    taxInfo: {
      regime: 'INDIA_GST',
      sellerGstin: '20AAACT2702H1ZZ',
      buyerGstin: '27AAACL0149R1Z1',
      irn: 'b7c3d9a1f4e8201b5a92cf6481023a9b1c5e6f7d8a90123456789abcdef01234',
      irnAckNo: '112610940192',
      irnAckDate: '2026-09-28 10:45:12',
      qrCodePayload: 'eyJTZWxsZXJHU1RJTiI6IjIwQUFBQ1QyNzAySDFaWiIsIkJ1eWVyR1NUSU4iOiIyN0FBQUNMMDE0OVIxWjEiLCJEb2NObyI6IklOVi1UUy0yMDI2LTA5NDE4IiwiVG90SW52VmFsIjo0ODUwMDAwfQ==',
      taxAmount: 750000,
      isTaxPortalVerified: true
    },
    deliveryConfirmation: {
      receiptId: 'GRN-2026-MUM-48201',
      deliveryDate: '2026-09-29',
      receivedBy: 'Vikram Joshi (Site Store Manager)',
      warehouseLocation: 'L&T Mumbai Metro Yard 4B, Wadala',
      trackingNumber: 'TRK-TATA-LOG-90412',
      geofenceVerified: true,
      rfidOrBarcodeScanned: true,
      inspectionStatus: 'ACCEPTED'
    },
    paymentDetails: {
      paymentId: 'PAY-2026-HDFC-991204',
      paymentRail: 'RTGS',
      beneficiaryAccount: '000405001928',
      beneficiaryIfscOrIban: 'ICIC0000004',
      beneficiaryName: 'Tata Steel Industrial Products Ltd',
      nameMatchConfidence: 99.8,
      bankAccountChangeDetected: false,
      escrowToken: 'ESCROW-TOK-99214-SIGNED',
      settlementReference: 'RTGS-RBI-20261001-0941892',
      settledAt: '2026-10-01T14:15:20Z',
      status: 'RELEASED'
    },
    auditTrail: [
      {
        id: 'AUD-01',
        timestamp: '2026-09-25T11:20:00Z',
        action: 'PO_CREATED_ERP_SYNC',
        actor: {
          userId: 'usr-rajesh-lt',
          userName: 'Rajesh K. Varma',
          role: 'BUYER_SIGNATORY',
          authMethod: 'MFA_PASSKEY'
        },
        previousHash: '0000000000000000000000000000000000000000000000000000000000000000',
        currentHash: '7a9c8b4e1f2a3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e',
        payloadSummary: 'Generated Purchase Order PO-2026-LT-88192 for INR 4,100,000 + GST'
      },
      {
        id: 'AUD-02',
        timestamp: '2026-09-28T10:50:00Z',
        action: 'EINVOICE_IRN_VALIDATED',
        actor: {
          userId: 'sys-utvn-tax-bridge',
          userName: 'NIC IRP Tax Bridge Gateway',
          role: 'TAX_AUTHORITY',
          authMethod: 'API_TOKEN'
        },
        previousHash: '7a9c8b4e1f2a3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e',
        currentHash: '1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c',
        payloadSummary: '64-character IRN validated against GST e-Invoicing Portal registry. Signature OK.'
      },
      {
        id: 'AUD-03',
        timestamp: '2026-09-29T16:00:00Z',
        action: 'GRN_DELIVERY_CONFIRMED',
        actor: {
          userId: 'usr-vikram-lt',
          userName: 'Vikram Joshi',
          role: 'WAREHOUSE_RECEIVER',
          authMethod: 'SSO_SAML'
        },
        previousHash: '1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c',
        currentHash: '8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e8d7c6b5a4f3e2d1c0b9a8f7e',
        payloadSummary: 'Physical 50 tons steel hollow sections received, weighbridge & RFID verified.'
      },
      {
        id: 'AUD-04',
        timestamp: '2026-10-01T14:15:22Z',
        action: 'PAYMENT_SETTLED_RTGS',
        actor: {
          userId: 'sys-hdfc-clearing',
          userName: 'HDFC Corporate Treasury Rail',
          role: 'BANK_OPERATOR',
          authMethod: 'DSC_SMARTCARD'
        },
        previousHash: '8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e8d7c6b5a4f3e2d1c0b9a8f7e',
        currentHash: '3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e',
        payloadSummary: 'Final RTGS settlement reference RTGS-RBI-20261001-0941892 registered in immutable log.'
      }
    ]
  },
  {
    utid: 'UTVN-2026-IND-73104-E4B1',
    status: 'RISK_FLAGGED',
    createdAt: '2026-10-01T08:15:00Z',
    updatedAt: '2026-10-02T06:30:10Z',
    currency: 'INR',
    totalAmount: 12500000,
    buyer: {
      id: 'ORG-BYR-2019',
      legalName: 'Godrej Consumer Products Ltd',
      tradeName: 'Godrej Corporate',
      country: 'India',
      taxId: '27AAACG0582L1ZV',
      corporateRegistryId: 'L32100MH2000PLC129805',
      riskScore: 5,
      kycStatus: 'VERIFIED',
      bankAccounts: [
        {
          accountNumber: '50200018274019',
          ifscOrIban: 'HDFC0000001',
          bankName: 'HDFC Bank, Fort Branch',
          isPrimary: true,
          verifiedAt: '2024-02-01',
          pennyDropMatch: true
        }
      ],
      authorizedSignatories: [
        {
          id: 'SIG-BYR-21',
          name: 'Nitin Deshmukh',
          email: 'nitin.d@godrejcp.com',
          designation: 'General Manager Treasury',
          signingLimit: 20000000,
          hasDigitalSignature: true
        }
      ],
      tenureMonths: 36,
      totalVolumeProcessed: 640000000
    },
    seller: {
      id: 'ORG-SUP-8821',
      legalName: 'Polymer Packaging Solutions Private Ltd',
      tradeName: 'Polymer Pack Ltd',
      country: 'India',
      taxId: '24AABCP9012M1ZM',
      corporateRegistryId: 'U25200GJ2015PTC082910',
      riskScore: 78,
      kycStatus: 'VERIFIED',
      bankAccounts: [
        {
          accountNumber: '921020014782012',
          ifscOrIban: 'UTIB0000214',
          bankName: 'Axis Bank Ltd, Ahmedabad',
          isPrimary: true,
          verifiedAt: '2025-01-10',
          pennyDropMatch: true
        }
      ],
      authorizedSignatories: [
        {
          id: 'SIG-SUP-81',
          name: 'Mukesh Patel',
          email: 'mukesh@polymer-solutions-in.com', // suspicious domain variant!
          designation: 'Finance Executive',
          signingLimit: 5000000,
          hasDigitalSignature: false
        }
      ],
      tenureMonths: 18,
      totalVolumeProcessed: 45000000
    },
    purchaseId: 'PR-2026-GCPL-38290',
    purchaseOrderId: 'PO-2026-GCPL-40912',
    poIssueDate: '2026-09-20',
    invoiceId: 'INV-PPS-2026-TAMPER-08',
    invoiceDate: '2026-10-01',
    paymentTerms: 'Immediate / Advance Request',
    lineItems: [
      {
        id: 'LI-01',
        description: 'HDPE Granules Grade F04550 - 50 MT Containers',
        hsnOrSacCode: '39012000',
        poQuantity: 50,
        invoiceQuantity: 50,
        receivedQuantity: 0, // Not received yet!
        unitPrice: 211864,
        taxRatePercent: 18,
        poTotal: 10593220,
        invoiceTotal: 12500000,
        currency: 'INR',
        matchStatus: 'PRICE_MISMATCH'
      }
    ],
    taxInfo: {
      regime: 'INDIA_GST',
      sellerGstin: '24AABCP9012M1ZM',
      buyerGstin: '27AAACG0582L1ZV',
      irn: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      taxAmount: 1906780,
      isTaxPortalVerified: false,
      taxDiscrepancyNotes: 'PDF_FONT_INCONSISTENCY: Layer analysis shows banking block modified with Adobe Illustrator 2026; OCR mismatch detected.'
    },
    paymentDetails: {
      paymentId: 'PAY-2026-PENDING-73104',
      paymentRail: 'RTGS',
      beneficiaryAccount: '99881100223344', // Brand new altered account!
      beneficiaryIfscOrIban: 'SBIN0009941',
      beneficiaryName: 'Polymer Pack Trading Corp', // Mismatch!
      nameMatchConfidence: 42.1,
      bankAccountChangeDetected: true,
      previousAccount: '921020014782012 (Axis Bank)',
      status: 'BLOCKED'
    },
    auditTrail: [
      {
        id: 'AUD-01',
        timestamp: '2026-09-20T14:10:00Z',
        action: 'PO_CREATED_ERP_SYNC',
        actor: {
          userId: 'usr-nitin-gcpl',
          userName: 'Nitin Deshmukh',
          role: 'BUYER_SIGNATORY',
          authMethod: 'MFA_PASSKEY'
        },
        previousHash: '0000000000000000000000000000000000000000000000000000000000000000',
        currentHash: '5e4d3c2b1a0f9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d',
        payloadSummary: 'Purchase Order created for HDPE raw materials.'
      },
      {
        id: 'AUD-02',
        timestamp: '2026-10-01T08:15:00Z',
        action: 'INVOICE_SUBMITTED_WITH_BANK_CHANGE',
        actor: {
          userId: 'usr-unverified-vendor-agent',
          userName: 'Vendor Portal Uploader',
          role: 'SELLER_SIGNATORY',
          authMethod: 'API_TOKEN'
        },
        previousHash: '5e4d3c2b1a0f9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d',
        currentHash: '9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b',
        payloadSummary: 'CRITICAL ALERT: Submitted invoice contains unverified bank account. UTVN automated freeze triggered.'
      }
    ]
  },
  {
    utid: 'UTVN-2026-EU-51209-C8D3',
    status: 'RISK_FLAGGED',
    createdAt: '2026-09-30T13:45:00Z',
    updatedAt: '2026-10-02T05:10:00Z',
    currency: 'EUR',
    totalAmount: 345000,
    buyer: {
      id: 'ORG-BYR-5022',
      legalName: 'Siemens Energy AG',
      tradeName: 'Siemens Energy Operations',
      country: 'Germany',
      taxId: 'DE815829104',
      corporateRegistryId: 'HRB 256840',
      lei: '529900B551O7Q24G6V47',
      riskScore: 2,
      kycStatus: 'VERIFIED',
      bankAccounts: [
        {
          accountNumber: 'DE89370400440532013000',
          ifscOrIban: 'DEUTDEDDXXX',
          bankName: 'Deutsche Bank Frankfurt',
          isPrimary: true,
          verifiedAt: '2023-01-10',
          pennyDropMatch: true
        }
      ],
      authorizedSignatories: [
        {
          id: 'SIG-EU-01',
          name: 'Dr. Klaus Becker',
          email: 'klaus.becker@siemens-energy.com',
          designation: 'Head of Turbomachinery Procurement',
          signingLimit: 1500000,
          hasDigitalSignature: true
        }
      ],
      tenureMonths: 72,
      totalVolumeProcessed: 420000000
    },
    seller: {
      id: 'ORG-SUP-4109',
      legalName: 'Vandenberg Precision Forgings BV',
      tradeName: 'Vandenberg Forging',
      country: 'Netherlands',
      taxId: 'NL859201948B01',
      corporateRegistryId: 'KVK 74819201',
      riskScore: 48,
      kycStatus: 'VERIFIED',
      bankAccounts: [
        {
          accountNumber: 'NL91ABNA0417164300',
          ifscOrIban: 'ABNANL2A',
          bankName: 'ABN AMRO Rotterdam',
          isPrimary: true,
          verifiedAt: '2024-03-20',
          pennyDropMatch: true
        }
      ],
      authorizedSignatories: [
        {
          id: 'SIG-SUP-EU-2',
          name: 'Lars Van Dijk',
          email: 'l.vandijk@vandenberg-forging.nl',
          designation: 'Commercial Manager',
          signingLimit: 500000,
          hasDigitalSignature: true
        }
      ],
      tenureMonths: 14,
      totalVolumeProcessed: 1800000
    },
    purchaseId: 'PR-2026-SE-77120',
    purchaseOrderId: 'PO-2026-SE-9081',
    poIssueDate: '2026-09-15',
    invoiceId: 'INV-VBF-2026-0412',
    invoiceDate: '2026-09-30',
    paymentTerms: 'NET 45 Days',
    lineItems: [
      {
        id: 'LI-01',
        description: 'Titanium Rotor Blade Forgings Spec TB-400X',
        hsnOrSacCode: '84069000',
        poQuantity: 400,
        invoiceQuantity: 500, // Overbilled 100 units!
        receivedQuantity: 400,
        unitPrice: 690,
        taxRatePercent: 0,
        poTotal: 276000,
        invoiceTotal: 345000, // 69,000 EUR discrepancy!
        currency: 'EUR',
        matchStatus: 'QTY_MISMATCH'
      }
    ],
    taxInfo: {
      regime: 'EU_PEPPOL_VAT',
      peppolEndpointId: '9944:NL859201948B01',
      ublSchemeId: 'urn:oasis:names:specification:ubl:schema:xsd:Invoice-2',
      taxAmount: 0,
      isTaxPortalVerified: true
    },
    deliveryConfirmation: {
      receiptId: 'GRN-2026-BER-0912',
      deliveryDate: '2026-09-28',
      receivedBy: 'Stefan Meyer (Incoming Inspection Berlin)',
      warehouseLocation: 'Huttenstraße 12, 10553 Berlin',
      trackingNumber: 'DB-SCHENKER-948120',
      geofenceVerified: true,
      rfidOrBarcodeScanned: true,
      inspectionStatus: 'PARTIALLY_ACCEPTED'
    },
    paymentDetails: {
      paymentId: 'PAY-2026-SEPA-51209',
      paymentRail: 'SEPA',
      beneficiaryAccount: 'NL91ABNA0417164300',
      beneficiaryIfscOrIban: 'ABNANL2A',
      beneficiaryName: 'Vandenberg Precision Forgings BV',
      nameMatchConfidence: 99.1,
      bankAccountChangeDetected: false,
      status: 'PENDING_APPROVAL'
    },
    auditTrail: [
      {
        id: 'AUD-01',
        timestamp: '2026-09-15T10:00:00Z',
        action: 'PO_ISSUED_SAP_CONNECTOR',
        actor: {
          userId: 'usr-klaus-becker',
          userName: 'Dr. Klaus Becker',
          role: 'BUYER_SIGNATORY',
          authMethod: 'DSC_SMARTCARD'
        },
        previousHash: '0000000000000000000000000000000000000000000000000000000000000000',
        currentHash: '4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b',
        payloadSummary: 'Issued Purchase Order for 400 pcs rotor blades.'
      },
      {
        id: 'AUD-02',
        timestamp: '2026-09-30T13:50:00Z',
        action: 'PEPPOL_UBL_RECEIVED',
        actor: {
          userId: 'sys-peppol-access-point',
          userName: 'Peppol OpenPEPPOL AP-004',
          role: 'TAX_AUTHORITY',
          authMethod: 'API_TOKEN'
        },
        previousHash: '4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b',
        currentHash: '6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e',
        payloadSummary: 'Received UBL 2.1 invoice for 500 pcs (delta: +100 pcs). 3-way match failed.'
      }
    ]
  },
  {
    utid: 'UTVN-2026-USA-39182-F7A6',
    status: 'PAYMENT_PENDING',
    createdAt: '2026-10-01T15:20:00Z',
    updatedAt: '2026-10-02T07:12:00Z',
    currency: 'USD',
    totalAmount: 240000,
    buyer: {
      id: 'ORG-BYR-7710',
      legalName: 'Pfizer Global Operations Inc',
      tradeName: 'Pfizer BioPharma',
      country: 'United States',
      taxId: '13-2515638',
      corporateRegistryId: 'DE-0048192',
      lei: '213800X9L4P210081290',
      riskScore: 1,
      kycStatus: 'VERIFIED',
      bankAccounts: [
        {
          accountNumber: '88201948102',
          ifscOrIban: 'CHASUS33',
          bankName: 'JPMorgan Chase NY',
          isPrimary: true,
          verifiedAt: '2022-05-14',
          pennyDropMatch: true
        }
      ],
      authorizedSignatories: [
        {
          id: 'SIG-US-01',
          name: 'Sarah Jenkins',
          email: 'sarah.jenkins@pfizer.com',
          designation: 'Director Strategic Sourcing',
          signingLimit: 500000,
          hasDigitalSignature: true
        }
      ],
      tenureMonths: 80,
      totalVolumeProcessed: 950000000
    },
    seller: {
      id: 'ORG-SUP-9901',
      legalName: 'Apex Nano-Filtration Tech LLC',
      tradeName: 'Apex Filtration',
      country: 'United States',
      taxId: '84-3910291',
      corporateRegistryId: 'TX-8041920',
      riskScore: 28,
      kycStatus: 'VERIFIED',
      bankAccounts: [
        {
          accountNumber: '4410294819',
          ifscOrIban: 'BOFAUS3N',
          bankName: 'Bank of America Austin',
          isPrimary: true,
          verifiedAt: '2026-09-10',
          pennyDropMatch: true
        }
      ],
      authorizedSignatories: [
        {
          id: 'SIG-SUP-US-1',
          name: 'Dr. Michael Chang',
          email: 'm.chang@apexnanofiltration.com',
          designation: 'Managing Member',
          signingLimit: 300000,
          hasDigitalSignature: true
        }
      ],
      tenureMonths: 0.5, // First-time vendor!
      totalVolumeProcessed: 25000 // Low historical baseline!
    },
    purchaseId: 'PR-2026-PF-44019',
    purchaseOrderId: 'PO-2026-PF-11029',
    poIssueDate: '2026-09-24',
    invoiceId: 'INV-ANF-2026-004',
    invoiceDate: '2026-10-01',
    paymentTerms: 'NET 30 Days',
    lineItems: [
      {
        id: 'LI-01',
        description: 'Single-Use Bioreactor Filter Membranes 0.2 Micron Gamma Irradiated',
        hsnOrSacCode: '84212900',
        poQuantity: 120,
        invoiceQuantity: 120,
        receivedQuantity: 120,
        unitPrice: 2000,
        taxRatePercent: 0,
        poTotal: 240000,
        invoiceTotal: 240000,
        currency: 'USD',
        matchStatus: 'EXACT_MATCH'
      }
    ],
    taxInfo: {
      regime: 'US_SALES_TAX',
      taxAmount: 0,
      isTaxPortalVerified: true
    },
    deliveryConfirmation: {
      receiptId: 'GRN-2026-KAL-4019',
      deliveryDate: '2026-09-29',
      receivedBy: 'Marcus Brody (QA Receiving)',
      warehouseLocation: 'Kalamazoo Bio Logistics Hub B',
      trackingNumber: 'FDX-PRIO-0019284',
      geofenceVerified: true,
      rfidOrBarcodeScanned: true,
      inspectionStatus: 'ACCEPTED'
    },
    paymentDetails: {
      paymentId: 'PAY-2026-ACH-39182',
      paymentRail: 'ACH',
      beneficiaryAccount: '4410294819',
      beneficiaryIfscOrIban: 'BOFAUS3N',
      beneficiaryName: 'Apex Nano-Filtration Tech LLC',
      nameMatchConfidence: 98.6,
      bankAccountChangeDetected: false,
      status: 'PENDING_APPROVAL'
    },
    auditTrail: [
      {
        id: 'AUD-01',
        timestamp: '2026-09-24T18:00:00Z',
        action: 'PO_CREATED_ORACLE_FUSION',
        actor: {
          userId: 'usr-sarah-jenkins',
          userName: 'Sarah Jenkins',
          role: 'BUYER_SIGNATORY',
          authMethod: 'MFA_PASSKEY'
        },
        previousHash: '0000000000000000000000000000000000000000000000000000000000000000',
        currentHash: '2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c',
        payloadSummary: 'Issued PO for filter membranes to newly qualified supplier.'
      },
      {
        id: 'AUD-02',
        timestamp: '2026-10-01T15:30:00Z',
        action: 'FIRST_TIME_VENDOR_EVALUATED',
        actor: {
          userId: 'sys-utvn-risk-corridor',
          userName: 'UTVN Anomaly Detection Cluster',
          role: 'ADMIN',
          authMethod: 'API_TOKEN'
        },
        previousHash: '2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c',
        currentHash: '7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d',
        payloadSummary: 'Flagged for First-Time Supplier High-Value Threshold ($240k > $50k initial limit). Dual-signoff required.'
      }
    ]
  },
  {
    utid: 'UTVN-2026-IND-62840-B1E9',
    status: 'BLOCKED',
    createdAt: '2026-10-02T04:10:00Z',
    updatedAt: '2026-10-02T04:10:05Z',
    currency: 'INR',
    totalAmount: 1820000,
    buyer: {
      id: 'ORG-BYR-1004',
      legalName: 'Larsen & Toubro Heavy Infrastructure Ltd',
      tradeName: 'L&T Heavy Civil',
      country: 'India',
      taxId: '27AAACL0149R1Z1',
      corporateRegistryId: 'L99999MH1946PLC004768',
      riskScore: 4,
      kycStatus: 'VERIFIED',
      bankAccounts: [
        {
          accountNumber: '912020048192019',
          ifscOrIban: 'HDFC0000060',
          bankName: 'HDFC Bank Ltd',
          isPrimary: true,
          verifiedAt: '2024-01-15',
          pennyDropMatch: true
        }
      ],
      authorizedSignatories: [
        {
          id: 'SIG-01',
          name: 'Rajesh K. Varma',
          email: 'rajesh.varma@larsentoubro.com',
          designation: 'VP Procurement & Supply Chain',
          signingLimit: 10000000,
          hasDigitalSignature: true
        }
      ],
      tenureMonths: 48,
      totalVolumeProcessed: 980000000
    },
    seller: {
      id: 'ORG-SUP-1142',
      legalName: 'Apex Electrical Conduit Systems LLP',
      tradeName: 'Apex Conduits',
      country: 'India',
      taxId: '27AAPFA1029K1ZX',
      corporateRegistryId: 'AAB-9412',
      riskScore: 82,
      kycStatus: 'SUSPENDED',
      bankAccounts: [
        {
          accountNumber: '200192841029',
          ifscOrIban: 'PUNB0021400',
          bankName: 'Punjab National Bank Pune',
          isPrimary: true,
          verifiedAt: '2024-08-10',
          pennyDropMatch: false
        }
      ],
      authorizedSignatories: [
        {
          id: 'SIG-SUP-LLP',
          name: 'Ramesh Chawla',
          email: 'r.chawla@apexconduits-fake.in',
          designation: 'Designated Partner',
          signingLimit: 2000000,
          hasDigitalSignature: false
        }
      ],
      tenureMonths: 4,
      totalVolumeProcessed: 1200000
    },
    purchaseId: 'PR-2026-LT-09141-DUP',
    purchaseOrderId: 'PO-2026-LT-88192-DUP', // Duplicate PO!
    poIssueDate: '2026-09-25',
    invoiceId: 'INV-2026-0941-REISSUE', // Duplicate invoice!
    invoiceDate: '2026-10-02',
    paymentTerms: 'NET 15 Days',
    lineItems: [
      {
        id: 'LI-01',
        description: 'Galvanized Rigid Steel Conduits Class 4 32mm',
        hsnOrSacCode: '73079990',
        poQuantity: 1000,
        invoiceQuantity: 1000,
        receivedQuantity: 0,
        unitPrice: 1542,
        taxRatePercent: 18,
        poTotal: 1542000,
        invoiceTotal: 1820000,
        currency: 'INR',
        matchStatus: 'EXACT_MATCH'
      }
    ],
    taxInfo: {
      regime: 'INDIA_GST',
      sellerGstin: '27AAPFA1029K1ZX',
      buyerGstin: '27AAACL0149R1Z1',
      irn: 'b7c3d9a1f4e8201b5a92cf6481023a9b1c5e6f7d8a90123456789abcdef01234', // Recycled IRN!
      taxAmount: 278000,
      isTaxPortalVerified: false,
      taxDiscrepancyNotes: 'DUPLICATE_IRN_COLLISION: This IRN has already been settled under UTID UTVN-2026-IND-89412-A9F2 on 2026-10-01.'
    },
    paymentDetails: {
      paymentId: 'PAY-2026-REJECTED-62840',
      paymentRail: 'NEFT',
      beneficiaryAccount: '200192841029',
      beneficiaryIfscOrIban: 'PUNB0021400',
      beneficiaryName: 'Apex Shell Trading Account',
      nameMatchConfidence: 31.0,
      bankAccountChangeDetected: false,
      status: 'BLOCKED'
    },
    auditTrail: [
      {
        id: 'AUD-01',
        timestamp: '2026-10-02T04:10:05Z',
        action: 'AUTOMATED_INTERCEPT_DUPLICATE_INVOICE',
        actor: {
          userId: 'sys-utvn-ledger-guard',
          userName: 'UTVN Hash Invariant Sentinel',
          role: 'ADMIN',
          authMethod: 'API_TOKEN'
        },
        previousHash: '0000000000000000000000000000000000000000000000000000000000000000',
        currentHash: 'ff99887766554433221100aabbccddeeff00112233445566778899aabbccddee',
        payloadSummary: 'Instant Block: Duplicate IRN detected in global unspent transaction tree. Suspended seller account.'
      }
    ]
  }
];

export const mockTransactions: UniversalTransaction[] = baseTransactions.map(tx => {
  const evalResult = evaluateTransactionFraud(tx);
  return {
    ...tx,
    overallRiskLevel: evalResult.riskLevel,
    riskScore: evalResult.riskScore,
    fraudChecks: evalResult.checks,
    riskSummary: evalResult.summary,
    recommendedAction: evalResult.recommendedAction
  };
});
