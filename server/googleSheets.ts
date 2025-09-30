import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import type { Reconciliation } from '@shared/schema';

export async function submitToGoogleSheets(
  reconciliation: Reconciliation,
  spreadsheetId: string
): Promise<void> {
  if (!spreadsheetId) {
    throw new Error('Google Sheet ID not configured in settings');
  }

  const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;

  if (!serviceAccountEmail || !privateKey) {
    throw new Error('Google Sheets credentials not configured. Please set GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_PRIVATE_KEY environment variables.');
  }

  const serviceAccountAuth = new JWT({
    email: serviceAccountEmail,
    key: privateKey.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const doc = new GoogleSpreadsheet(spreadsheetId, serviceAccountAuth);
  await doc.loadInfo();

  const sheet = doc.sheetsByIndex[0];
  if (!sheet) {
    throw new Error('No sheets found in the spreadsheet');
  }

  const actualCash = parseFloat(reconciliation.cashCount) - parseFloat(reconciliation.startingCash);
  const actualChecks = 
    parseFloat(reconciliation.check1Amount || '0') + 
    parseFloat(reconciliation.check2Amount || '0') + 
    parseFloat(reconciliation.check3Amount || '0');
  const totalDeposit = actualCash + actualChecks;
  
  const expectedCash = parseFloat(reconciliation.cashSales);
  const expectedChecks = parseFloat(reconciliation.checkSales);
  const cashDiff = actualCash - expectedCash;
  const checkDiff = actualChecks - expectedChecks;

  await sheet.addRow({
    'Reconciliation ID': reconciliation.id,
    'Date': new Date(reconciliation.createdAt).toLocaleString(),
    'Employee': reconciliation.userName,
    'Email': reconciliation.userEmail,
    'Status': reconciliation.status,
    '': '',
    'Cash Sales': `$${parseFloat(reconciliation.cashSales).toFixed(2)}`,
    'Check Sales': `$${parseFloat(reconciliation.checkSales).toFixed(2)}`,
    'Cash Out': `$${parseFloat(reconciliation.cashOut).toFixed(2)}`,
    'Starting Cash': `$${parseFloat(reconciliation.startingCash).toFixed(2)}`,
    ' ': '',
    'Pennies': reconciliation.pennies,
    'Nickels': reconciliation.nickels,
    'Dimes': reconciliation.dimes,
    'Quarters': reconciliation.quarters,
    '$1 Bills': reconciliation.ones,
    '$5 Bills': reconciliation.fives,
    '$10 Bills': reconciliation.tens,
    '$20 Bills': reconciliation.twenties,
    '$50 Bills': reconciliation.fifties,
    '$100 Bills': reconciliation.hundreds,
    '  ': '',
    'Check 1 Amount': reconciliation.check1Amount ? `$${parseFloat(reconciliation.check1Amount).toFixed(2)}` : '$0.00',
    'Check 1 Number': reconciliation.check1Number || '',
    'Check 1 Name': reconciliation.check1Name || '',
    'Check 1 Date': reconciliation.check1Date || '',
    'Check 2 Amount': reconciliation.check2Amount ? `$${parseFloat(reconciliation.check2Amount).toFixed(2)}` : '$0.00',
    'Check 2 Number': reconciliation.check2Number || '',
    'Check 2 Name': reconciliation.check2Name || '',
    'Check 2 Date': reconciliation.check2Date || '',
    'Check 3 Amount': reconciliation.check3Amount ? `$${parseFloat(reconciliation.check3Amount).toFixed(2)}` : '$0.00',
    'Check 3 Number': reconciliation.check3Number || '',
    'Check 3 Name': reconciliation.check3Name || '',
    'Check 3 Date': reconciliation.check3Date || '',
    '   ': '',
    'Expected Cash': `$${expectedCash.toFixed(2)}`,
    'Actual Cash': `$${actualCash.toFixed(2)}`,
    'Cash Difference': `$${cashDiff.toFixed(2)}`,
    'Expected Checks': `$${expectedChecks.toFixed(2)}`,
    'Actual Checks': `$${actualChecks.toFixed(2)}`,
    'Check Difference': `$${checkDiff.toFixed(2)}`,
    '    ': '',
    'Deposit Cash': `$${actualCash.toFixed(2)}`,
    'Deposit Checks': `$${actualChecks.toFixed(2)}`,
    'Total Deposit': `$${totalDeposit.toFixed(2)}`,
    'Overall Difference': `$${parseFloat(reconciliation.difference).toFixed(2)}`,
    '     ': '',
    'Notes': reconciliation.notes || '',
  });
}
