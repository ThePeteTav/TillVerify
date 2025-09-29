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

  const totalChecks = 
    parseFloat(reconciliation.check1Amount || '0') + 
    parseFloat(reconciliation.check2Amount || '0') + 
    parseFloat(reconciliation.check3Amount || '0');
  
  const totalDeposit = parseFloat(reconciliation.cashCount) + totalChecks;

  const checkDetails = [];
  if (reconciliation.check1Amount && parseFloat(reconciliation.check1Amount) > 0) {
    checkDetails.push(`Check #${reconciliation.check1Number || 'N/A'}: ${reconciliation.check1Name || 'N/A'} - $${parseFloat(reconciliation.check1Amount).toFixed(2)} (${reconciliation.check1Date || 'N/A'})`);
  }
  if (reconciliation.check2Amount && parseFloat(reconciliation.check2Amount) > 0) {
    checkDetails.push(`Check #${reconciliation.check2Number || 'N/A'}: ${reconciliation.check2Name || 'N/A'} - $${parseFloat(reconciliation.check2Amount).toFixed(2)} (${reconciliation.check2Date || 'N/A'})`);
  }
  if (reconciliation.check3Amount && parseFloat(reconciliation.check3Amount) > 0) {
    checkDetails.push(`Check #${reconciliation.check3Number || 'N/A'}: ${reconciliation.check3Name || 'N/A'} - $${parseFloat(reconciliation.check3Amount).toFixed(2)} (${reconciliation.check3Date || 'N/A'})`);
  }

  await sheet.addRow({
    'Reconciliation ID': reconciliation.id,
    'Date': new Date(reconciliation.createdAt).toLocaleString(),
    'Employee': reconciliation.userName,
    'Email': reconciliation.userEmail,
    'Starting Cash': `$${parseFloat(reconciliation.startingCash).toFixed(2)}`,
    'Cash Sales': `$${parseFloat(reconciliation.cashSales).toFixed(2)}`,
    'Check Sales': `$${parseFloat(reconciliation.checkSales).toFixed(2)}`,
    'Cash Out': `$${parseFloat(reconciliation.cashOut).toFixed(2)}`,
    'Cash Count': `$${parseFloat(reconciliation.cashCount).toFixed(2)}`,
    'Total Checks': `$${totalChecks.toFixed(2)}`,
    'Total Deposit': `$${totalDeposit.toFixed(2)}`,
    'Expected Deposit': `$${(parseFloat(reconciliation.startingCash) + parseFloat(reconciliation.cashSales) + parseFloat(reconciliation.checkSales) - parseFloat(reconciliation.cashOut)).toFixed(2)}`,
    'Difference': `$${parseFloat(reconciliation.difference).toFixed(2)}`,
    'Status': reconciliation.status,
    'Check Details': checkDetails.join('; '),
    'Notes': reconciliation.notes || '',
  });
}
