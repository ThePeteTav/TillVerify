import ReconciliationResults from '../ReconciliationResults';

export default function ReconciliationResultsExample() {
  // todo: remove mock functionality
  const mockSalesData = {
    totalSales: 1250.75,
    cashSales: 435.25,
    cardSales: 815.50,
    cashOut: 100.00,
    startingCash: 200.00,
    notes: 'Busy day with lunch rush. Customer paid with exact change for large order.'
  };

  const mockDenominationCounts = {
    hundreds: 3,
    fifties: 2,
    twenties: 8,
    tens: 15,
    fives: 20,
    ones: 35,
    quarters: 40,
    dimes: 30,
    nickels: 25,
    pennies: 100
  };

  const mockCashCount = 535.25; // Expected: 535.25 (perfect match)

  return (
    <ReconciliationResults
      salesData={mockSalesData}
      cashCount={mockCashCount}
      denominationCounts={mockDenominationCounts}
      onGeneratePDF={() => console.log('Generate PDF triggered')}
      onExportExcel={() => console.log('Export Excel triggered')}
      isGeneratingReport={false}
    />
  );
}