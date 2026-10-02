import { getAccessToken } from '../lib/firebase';
import { UniversalTransaction } from '../types/utvn';

export interface ExportResult {
  spreadsheetId: string;
  spreadsheetUrl: string;
  rowsExported: number;
}

/**
 * Creates a formatted UTVN Universal Transaction Verification Ledger in Google Sheets
 */
export async function exportTransactionsToGoogleSheets(
  transactions: UniversalTransaction[],
  sheetTitle: string = 'UTVN - Universal Transaction Verification Ledger'
): Promise<ExportResult> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Google Authentication required. Please sign in with your Google account.');
  }

  // 1. Create a new Google Spreadsheet
  const createResponse = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title: `${sheetTitle} (${new Date().toISOString().split('T')[0]})`,
      },
      sheets: [
        {
          properties: {
            title: 'Verified Transactions',
            gridProperties: {
              frozenRowCount: 1,
            },
          },
        },
      ],
    }),
  });

  if (!createResponse.ok) {
    const errorData = await createResponse.json().catch(() => ({}));
    throw new Error(`Failed to create Google Spreadsheet: ${errorData.error?.message || createResponse.statusText}`);
  }

  const spreadsheetData = await createResponse.json();
  const spreadsheetId = spreadsheetData.spreadsheetId;
  const spreadsheetUrl = spreadsheetData.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  // 2. Prepare headers and rows matching UTVN 8-tier verification invariant
  const headers = [
    'Universal Transaction ID (UTID)',
    'Lifecycle Status',
    'Risk Verdict',
    'Risk Score',
    'Buyer Name',
    'Buyer ID / Tax ID',
    'Seller Name',
    'Seller ID / Tax ID',
    'Purchase ID',
    'PO ID',
    'Invoice ID',
    'GRN Delivery Ref',
    'Tax / IRN Hash',
    'Amount',
    'Currency',
    'Bank Settlement / UTR',
    'Explainable Risk Summary',
    'Created At',
  ];

  const rows = transactions.map((t) => [
    t.utid,
    t.status,
    t.overallRiskLevel,
    t.riskScore,
    t.buyer.legalName,
    `${t.buyer.id} (${t.buyer.taxId || 'N/A'})`,
    t.seller.legalName,
    `${t.seller.id} (${t.seller.taxId || 'N/A'})`,
    t.purchaseId,
    t.purchaseOrderId,
    t.invoiceId,
    t.deliveryConfirmation?.receiptId || 'Pending',
    t.taxInfo?.irn || 'Pending',
    t.totalAmount,
    t.currency,
    t.paymentDetails?.settlementReference || 'Unpaid',
    t.riskSummary,
    t.createdAt,
  ]);

  const values = [headers, ...rows];

  // 3. Write data to the created spreadsheet
  const writeResponse = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'Verified Transactions'!A1?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values,
      }),
    }
  );

  if (!writeResponse.ok) {
    const errorData = await writeResponse.json().catch(() => ({}));
    throw new Error(`Failed to populate spreadsheet cells: ${errorData.error?.message || writeResponse.statusText}`);
  }

  // 4. Format header row styling (Dark Navy background, White text, Bold)
  try {
    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          {
            repeatCell: {
              range: {
                sheetId: 0,
                startRowIndex: 0,
                endRowIndex: 1,
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: { red: 0.08, green: 0.12, blue: 0.22 },
                  textFormat: { bold: true, foregroundColor: { red: 1, green: 1, blue: 1 }, fontSize: 10 },
                  horizontalAlignment: 'CENTER',
                },
              },
              fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)',
            },
          },
          {
            autoResizeDimensions: {
              dimensions: {
                sheetId: 0,
                dimension: 'COLUMNS',
                startIndex: 0,
                endIndex: headers.length,
              },
            },
          },
        ],
      }),
    });
  } catch (formatErr) {
    console.warn('Formatting spreadsheet warning (data was saved):', formatErr);
  }

  return {
    spreadsheetId,
    spreadsheetUrl,
    rowsExported: transactions.length,
  };
}

/**
 * Appends a verified transaction to an existing Google Spreadsheet
 */
export async function appendTransactionToSheet(
  spreadsheetId: string,
  t: UniversalTransaction
): Promise<boolean> {
  const token = await getAccessToken();
  if (!token) throw new Error('Authentication required');

  const row = [
    t.utid,
    t.status,
    t.overallRiskLevel,
    t.riskScore,
    t.buyer.legalName,
    `${t.buyer.id} (${t.buyer.taxId || 'N/A'})`,
    t.seller.legalName,
    `${t.seller.id} (${t.seller.taxId || 'N/A'})`,
    t.purchaseId,
    t.purchaseOrderId,
    t.invoiceId,
    t.deliveryConfirmation?.receiptId || 'Pending',
    t.taxInfo?.irn || 'Pending',
    t.totalAmount,
    t.currency,
    t.paymentDetails?.settlementReference || 'Unpaid',
    t.riskSummary,
    t.createdAt,
  ];

  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'Verified Transactions'!A1:append?valueInputOption=USER_ENTERED`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [row],
      }),
    }
  );

  return res.ok;
}

/**
 * Reads data from an external Google Sheet
 */
export async function fetchSheetValues(spreadsheetId: string, range: string): Promise<any[][]> {
  const token = await getAccessToken();
  if (!token) throw new Error('Authentication required');

  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(`Failed to read sheet: ${errorData.error?.message || res.statusText}`);
  }

  const data = await res.json();
  return data.values || [];
}
