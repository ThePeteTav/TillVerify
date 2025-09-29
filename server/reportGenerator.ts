import jsPDF from 'jspdf';
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
  
  const expected = parseFloat(reconciliation.expectedCash);
  const actual = parseFloat(reconciliation.cashCount);
  const diff = parseFloat(reconciliation.difference);
  
  doc.text(`Expected Cash: $${expected.toFixed(2)}`, 30, yPos);
  yPos += 7;
  doc.text(`Actual Cash Count: $${actual.toFixed(2)}`, 30, yPos);
  yPos += 7;
  
  if (Math.abs(diff) < 0.01) {
    doc.setTextColor(0, 128, 0);
    doc.text(`Difference: $${diff.toFixed(2)} (Perfect Match)`, 30, yPos);
  } else if (Math.abs(diff) <= 5.00) {
    doc.setTextColor(255, 165, 0);
    doc.text(`Difference: ${diff >= 0 ? '+' : ''}$${diff.toFixed(2)} (Within Tolerance)`, 30, yPos);
  } else {
    doc.setTextColor(255, 0, 0);
    doc.text(`Difference: ${diff >= 0 ? '+' : ''}$${diff.toFixed(2)} (Discrepancy)`, 30, yPos);
  }
  
  doc.setTextColor(0, 0, 0);
  
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
  const data = reconciliations.map(r => ({
    'ID': r.id,
    'Date': r.createdAt.toISOString(),
    'Employee': r.userName,
    'Email': r.userEmail,
    'Cash Sales': parseFloat(r.cashSales),
    'Check Sales': parseFloat(r.checkSales),
    'Cash Out': parseFloat(r.cashOut),
    'Starting Cash': parseFloat(r.startingCash),
    'Expected Cash': parseFloat(r.expectedCash),
    'Actual Cash': parseFloat(r.cashCount),
    'Difference': parseFloat(r.difference),
    'Status': r.status,
    'Notes': r.notes || '',
  }));
  
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Reconciliations');
  
  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  return buffer as Buffer;
}