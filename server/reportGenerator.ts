import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import type { Reconciliation, Settings } from '@shared/schema';

export function generateReconciliationPDF(reconciliation: Reconciliation, settings?: Settings): Buffer {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const leftCol = 15;
  const rightCol = 110;
  let yPos = 20;
  
  if (settings?.companyLogo) {
    try {
      const imageFormat = settings.companyLogo.includes('data:image/jpeg') || settings.companyLogo.includes('data:image/jpg') ? 'JPEG' : 'PNG';
      doc.addImage(settings.companyLogo, imageFormat, leftCol, yPos, 40, 20);
      yPos += 25;
    } catch (error) {
      console.error('Error adding logo to PDF:', error);
    }
  }
  
  doc.setFontSize(18);
  doc.text('Cash Reconciliation Report', pageWidth / 2, yPos, { align: 'center' });
  yPos += 10;
  
  doc.setFontSize(9);
  doc.text(`Reconciliation ID: ${reconciliation.id}`, pageWidth / 2, yPos, { align: 'center' });
  yPos += 5;
  doc.text(`Date: ${new Date(reconciliation.createdAt).toLocaleString()}`, pageWidth / 2, yPos, { align: 'center' });
  yPos += 5;
  doc.text(`Employee: ${reconciliation.userName}`, pageWidth / 2, yPos, { align: 'center' });
  yPos += 5;
  doc.text(`Status: ${reconciliation.status.toUpperCase()}`, pageWidth / 2, yPos, { align: 'center' });
  yPos += 10;
  
  doc.setFontSize(10);
  doc.text(`Cash Sales: $${parseFloat(reconciliation.cashSales).toFixed(2)}`, leftCol + 2, yPos);
  doc.text(`Check Sales: $${parseFloat(reconciliation.checkSales).toFixed(2)}`, leftCol + 2, yPos + 5);
  doc.text(`Cash Out: $${parseFloat(reconciliation.cashOut).toFixed(2)}`, leftCol + 2, yPos + 10);
  doc.text(`Starting Cash: $${parseFloat(reconciliation.startingCash).toFixed(2)}`, leftCol + 2, yPos + 15);
  
  const denominations = [
    { label: '$100', count: reconciliation.hundreds, value: 100 },
    { label: '$50', count: reconciliation.fifties, value: 50 },
    { label: '$20', count: reconciliation.twenties, value: 20 },
    { label: '$10', count: reconciliation.tens, value: 10 },
    { label: '$5', count: reconciliation.fives, value: 5 },
    { label: '$1', count: reconciliation.ones, value: 1 },
    { label: 'Quarters', count: reconciliation.quarters, value: 0.25 },
    { label: 'Dimes', count: reconciliation.dimes, value: 0.10 },
    { label: 'Nickels', count: reconciliation.nickels, value: 0.05 },
    { label: 'Pennies', count: reconciliation.pennies, value: 0.01 },
  ];
  
  let rightYPos = yPos;
  denominations.forEach(denom => {
    if (denom.count > 0) {
      const total = denom.count * denom.value;
      doc.text(`${denom.label}: ${denom.count} × $${denom.value.toFixed(2)} = $${total.toFixed(2)}`, rightCol + 2, rightYPos);
      rightYPos += 5;
    }
  });
  
  yPos = Math.max(yPos + 25, rightYPos + 5);
  
  doc.setFontSize(12);
  doc.text('Checks', leftCol, yPos);
  yPos += 7;
  doc.setFontSize(9);
  
  if (reconciliation.check1Amount && parseFloat(reconciliation.check1Amount) > 0) {
    doc.text(`#${reconciliation.check1Number || 'N/A'}: ${reconciliation.check1Name || 'N/A'} ($${parseFloat(reconciliation.check1Amount).toFixed(2)}) ${reconciliation.check1Date || ''}`, leftCol + 2, yPos);
    yPos += 5;
  }
  if (reconciliation.check2Amount && parseFloat(reconciliation.check2Amount) > 0) {
    doc.text(`#${reconciliation.check2Number || 'N/A'}: ${reconciliation.check2Name || 'N/A'} ($${parseFloat(reconciliation.check2Amount).toFixed(2)}) ${reconciliation.check2Date || ''}`, leftCol + 2, yPos);
    yPos += 5;
  }
  if (reconciliation.check3Amount && parseFloat(reconciliation.check3Amount) > 0) {
    doc.text(`#${reconciliation.check3Number || 'N/A'}: ${reconciliation.check3Name || 'N/A'} ($${parseFloat(reconciliation.check3Amount).toFixed(2)}) ${reconciliation.check3Date || ''}`, leftCol + 2, yPos);
    yPos += 5;
  }
  
  yPos += 8;
  doc.setFontSize(12);
  doc.text('Reconciliation Results', leftCol, yPos);
  doc.text('Deposit Summary', rightCol, yPos);
  yPos += 7;
  doc.setFontSize(9);
  
  const expectedCash = parseFloat(reconciliation.cashSales);
  const actualCash = parseFloat(reconciliation.cashCount) - parseFloat(reconciliation.startingCash);
  const cashDiff = actualCash - expectedCash;
  const expectedChecks = parseFloat(reconciliation.checkSales);
  const actualChecks = 
    (reconciliation.check1Amount ? parseFloat(reconciliation.check1Amount) : 0) +
    (reconciliation.check2Amount ? parseFloat(reconciliation.check2Amount) : 0) +
    (reconciliation.check3Amount ? parseFloat(reconciliation.check3Amount) : 0);
  const checkDiff = actualChecks - expectedChecks;
  const totalDeposit = actualCash + actualChecks;
  
  doc.text(`Expected Cash: $${expectedCash.toFixed(2)}`, leftCol + 2, yPos);
  doc.text(`Cash: $${actualCash.toFixed(2)}`, rightCol + 2, yPos);
  yPos += 5;
  doc.text(`Actual Cash: $${actualCash.toFixed(2)}`, leftCol + 2, yPos);
  doc.text(`Checks: $${actualChecks.toFixed(2)}`, rightCol + 2, yPos);
  yPos += 5;
  doc.text(`Cash Diff: ${cashDiff >= 0 ? '+' : ''}$${cashDiff.toFixed(2)}`, leftCol + 2, yPos);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total: $${totalDeposit.toFixed(2)}`, rightCol + 2, yPos);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  yPos += 8;
  
  doc.text(`Expected Checks: $${expectedChecks.toFixed(2)}`, leftCol + 2, yPos);
  yPos += 5;
  doc.text(`Actual Checks: $${actualChecks.toFixed(2)}`, leftCol + 2, yPos);
  yPos += 5;
  doc.text(`Check Diff: ${checkDiff >= 0 ? '+' : ''}$${checkDiff.toFixed(2)}`, leftCol + 2, yPos);
  yPos += 10;
  
  const overallDiff = parseFloat(reconciliation.difference);
  doc.setFontSize(10);
  if (Math.abs(overallDiff) < 0.01) {
    doc.setTextColor(0, 128, 0);
    doc.text(`Status: Perfect Match`, leftCol, yPos);
  } else if (Math.abs(overallDiff) <= 5.00) {
    doc.setTextColor(255, 165, 0);
    doc.text(`Status: Within Tolerance (${overallDiff >= 0 ? '+' : ''}$${overallDiff.toFixed(2)})`, leftCol, yPos);
  } else {
    doc.setTextColor(255, 0, 0);
    doc.text(`Status: Discrepancy (${overallDiff >= 0 ? '+' : ''}$${overallDiff.toFixed(2)})`, leftCol, yPos);
  }
  doc.setTextColor(0, 0, 0);
  
  if (reconciliation.notes) {
    yPos += 10;
    doc.setFontSize(11);
    doc.text('Notes:', leftCol, yPos);
    yPos += 6;
    doc.setFontSize(9);
    const splitNotes = doc.splitTextToSize(reconciliation.notes, 180);
    doc.text(splitNotes, leftCol, yPos);
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