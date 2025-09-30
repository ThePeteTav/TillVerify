import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import type { Reconciliation } from '@shared/schema';

export function generateReconciliationPDF(reconciliation: Reconciliation): Buffer {
  const doc = new jsPDF();
  
  doc.setFontSize(20);
  doc.text('Cash Reconciliation Report', 105, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.text(`Reconciliation ID: ${reconciliation.id}`, 20, 30);
  doc.text(`Date: ${new Date(reconciliation.createdAt).toLocaleString()}`, 20, 37);
  doc.text(`Employee: ${reconciliation.userName}`, 20, 44);
  doc.text(`Email: ${reconciliation.userEmail}`, 20, 51);
  doc.text(`Status: ${reconciliation.status}`, 20, 58);
  
  doc.setFontSize(14);
  doc.text('Sales Summary', 20, 70);
  doc.setFontSize(10);
  doc.text(`Cash Sales: $${parseFloat(reconciliation.cashSales).toFixed(2)}`, 30, 80);
  doc.text(`Check Sales: $${parseFloat(reconciliation.checkSales).toFixed(2)}`, 30, 87);
  doc.text(`Cash Out: $${parseFloat(reconciliation.cashOut).toFixed(2)}`, 30, 94);
  doc.text(`Starting Cash: $${parseFloat(reconciliation.startingCash).toFixed(2)}`, 30, 101);
  
  doc.setFontSize(14);
  doc.text('Cash Count Breakdown', 20, 115);
  doc.setFontSize(10);
  const denominations = [
    { label: 'Pennies', count: reconciliation.pennies, value: 0.01 },
    { label: 'Nickels', count: reconciliation.nickels, value: 0.05 },
    { label: 'Dimes', count: reconciliation.dimes, value: 0.10 },
    { label: 'Quarters', count: reconciliation.quarters, value: 0.25 },
    { label: '$1 Bills', count: reconciliation.ones, value: 1 },
    { label: '$5 Bills', count: reconciliation.fives, value: 5 },
    { label: '$10 Bills', count: reconciliation.tens, value: 10 },
    { label: '$20 Bills', count: reconciliation.twenties, value: 20 },
    { label: '$50 Bills', count: reconciliation.fifties, value: 50 },
    { label: '$100 Bills', count: reconciliation.hundreds, value: 100 },
  ];
  
  let yPos = 125;
  denominations.forEach(denom => {
    if (denom.count > 0) {
      const total = denom.count * denom.value;
      doc.text(`${denom.label}: ${denom.count} × $${denom.value.toFixed(2)} = $${total.toFixed(2)}`, 30, yPos);
      yPos += 7;
    }
  });
  
  yPos += 5;
  doc.setFontSize(14);
  doc.text('Checks', 20, yPos);
  yPos += 10;
  doc.setFontSize(10);
  
  if (reconciliation.check1Amount && parseFloat(reconciliation.check1Amount) > 0) {
    doc.text(`Check #${reconciliation.check1Number || 'N/A'} - ${reconciliation.check1Name || 'N/A'} - ${reconciliation.check1Date || 'N/A'}: $${parseFloat(reconciliation.check1Amount).toFixed(2)}`, 30, yPos);
    yPos += 7;
  }
  if (reconciliation.check2Amount && parseFloat(reconciliation.check2Amount) > 0) {
    doc.text(`Check #${reconciliation.check2Number || 'N/A'} - ${reconciliation.check2Name || 'N/A'} - ${reconciliation.check2Date || 'N/A'}: $${parseFloat(reconciliation.check2Amount).toFixed(2)}`, 30, yPos);
    yPos += 7;
  }
  if (reconciliation.check3Amount && parseFloat(reconciliation.check3Amount) > 0) {
    doc.text(`Check #${reconciliation.check3Number || 'N/A'} - ${reconciliation.check3Name || 'N/A'} - ${reconciliation.check3Date || 'N/A'}: $${parseFloat(reconciliation.check3Amount).toFixed(2)}`, 30, yPos);
    yPos += 7;
  }
  
  yPos += 5;
  doc.setFontSize(14);
  doc.text('Reconciliation Results', 20, yPos);
  yPos += 10;
  doc.setFontSize(10);
  
  const expectedCash = parseFloat(reconciliation.cashSales);
  const actualCash = parseFloat(reconciliation.cashCount) - parseFloat(reconciliation.startingCash);
  const cashDiff = actualCash - expectedCash;
  
  doc.text(`Expected Cash: $${expectedCash.toFixed(2)}`, 30, yPos);
  yPos += 7;
  doc.text(`Actual Cash Count: $${actualCash.toFixed(2)}`, 30, yPos);
  yPos += 7;
  doc.text(`Cash Difference: ${cashDiff >= 0 ? '+' : ''}$${cashDiff.toFixed(2)}`, 30, yPos);
  yPos += 10;
  
  const expectedChecks = parseFloat(reconciliation.checkSales);
  const actualChecks = 
    (reconciliation.check1Amount ? parseFloat(reconciliation.check1Amount) : 0) +
    (reconciliation.check2Amount ? parseFloat(reconciliation.check2Amount) : 0) +
    (reconciliation.check3Amount ? parseFloat(reconciliation.check3Amount) : 0);
  const checkDiff = actualChecks - expectedChecks;
  
  doc.text(`Expected Checks: $${expectedChecks.toFixed(2)}`, 30, yPos);
  yPos += 7;
  doc.text(`Actual Checks: $${actualChecks.toFixed(2)}`, 30, yPos);
  yPos += 7;
  doc.text(`Check Difference: ${checkDiff >= 0 ? '+' : ''}$${checkDiff.toFixed(2)}`, 30, yPos);
  yPos += 10;
  
  doc.setFontSize(12);
  doc.text('Deposit', 30, yPos);
  yPos += 8;
  doc.setFontSize(10);
  doc.text(`Cash: $${actualCash.toFixed(2)}`, 35, yPos);
  yPos += 7;
  doc.text(`Checks: $${actualChecks.toFixed(2)}`, 35, yPos);
  yPos += 7;
  const totalDeposit = actualCash + actualChecks;
  doc.setFontSize(11);
  doc.text(`Total Deposit: $${totalDeposit.toFixed(2)}`, 35, yPos);
  yPos += 10;
  
  doc.setFontSize(10);
  const overallDiff = parseFloat(reconciliation.difference);
  
  if (Math.abs(overallDiff) < 0.01) {
    doc.setTextColor(0, 128, 0);
    doc.text(`Overall Status: Perfect Match`, 30, yPos);
  } else if (Math.abs(overallDiff) <= 5.00) {
    doc.setTextColor(255, 165, 0);
    doc.text(`Overall Status: Within Tolerance (${overallDiff >= 0 ? '+' : ''}$${overallDiff.toFixed(2)})`, 30, yPos);
  } else {
    doc.setTextColor(255, 0, 0);
    doc.text(`Overall Status: Discrepancy (${overallDiff >= 0 ? '+' : ''}$${overallDiff.toFixed(2)})`, 30, yPos);
  }
  
  doc.setTextColor(0, 0, 0);
  yPos += 7;
  
  if (reconciliation.notes) {
    yPos += 15;
    doc.setFontSize(14);
    doc.text('Notes', 20, yPos);
    yPos += 10;
    doc.setFontSize(10);
    const splitNotes = doc.splitTextToSize(reconciliation.notes, 170);
    doc.text(splitNotes, 30, yPos);
  }
  
  return Buffer.from(doc.output('arraybuffer'));
}

export function generateReconciliationExcel(reconciliations: Reconciliation[]): Buffer {
  const data = reconciliations.map(r => {
    const actualCash = parseFloat(r.cashCount) - parseFloat(r.startingCash);
    const actualChecks = 
      (r.check1Amount ? parseFloat(r.check1Amount) : 0) +
      (r.check2Amount ? parseFloat(r.check2Amount) : 0) +
      (r.check3Amount ? parseFloat(r.check3Amount) : 0);
    const totalDeposit = actualCash + actualChecks;
    
    return {
      'ID': r.id,
      'Date': r.createdAt.toISOString(),
      'Employee': r.userName,
      'Email': r.userEmail,
      'Status': r.status,
      '': '',
      'SALES SUMMARY': '',
      'Cash Sales': parseFloat(r.cashSales),
      'Check Sales': parseFloat(r.checkSales),
      'Cash Out': parseFloat(r.cashOut),
      'Starting Cash': parseFloat(r.startingCash),
      ' ': '',
      'CASH DENOMINATIONS': '',
      'Pennies': r.pennies,
      'Nickels': r.nickels,
      'Dimes': r.dimes,
      'Quarters': r.quarters,
      '$1 Bills': r.ones,
      '$5 Bills': r.fives,
      '$10 Bills': r.tens,
      '$20 Bills': r.twenties,
      '$50 Bills': r.fifties,
      '$100 Bills': r.hundreds,
      '  ': '',
      'CHECK DETAILS': '',
      'Check 1 Amount': r.check1Amount ? parseFloat(r.check1Amount) : 0,
      'Check 1 Number': r.check1Number || '',
      'Check 1 Name': r.check1Name || '',
      'Check 1 Date': r.check1Date || '',
      'Check 2 Amount': r.check2Amount ? parseFloat(r.check2Amount) : 0,
      'Check 2 Number': r.check2Number || '',
      'Check 2 Name': r.check2Name || '',
      'Check 2 Date': r.check2Date || '',
      'Check 3 Amount': r.check3Amount ? parseFloat(r.check3Amount) : 0,
      'Check 3 Number': r.check3Number || '',
      'Check 3 Name': r.check3Name || '',
      'Check 3 Date': r.check3Date || '',
      '   ': '',
      'RECONCILIATION': '',
      'Expected Cash': parseFloat(r.cashSales),
      'Actual Cash': actualCash,
      'Cash Difference': actualCash - parseFloat(r.cashSales),
      'Expected Checks': parseFloat(r.checkSales),
      'Actual Checks': actualChecks,
      'Check Difference': actualChecks - parseFloat(r.checkSales),
      '    ': '',
      'DEPOSIT': '',
      'Deposit Cash': actualCash,
      'Deposit Checks': actualChecks,
      'Total Deposit': totalDeposit,
      'Overall Difference': parseFloat(r.difference),
      '     ': '',
      'Notes': r.notes || '',
    };
  });
  
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Reconciliations');
  
  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  return buffer as Buffer;
}