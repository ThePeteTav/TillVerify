import SalesEntryForm from '../SalesEntryForm';

export default function SalesEntryFormExample() {
  return (
    <SalesEntryForm
      onSalesDataChange={(data) => console.log('Sales data changed:', data)}
      onSubmit={() => console.log('Submit sales data triggered')}
      isLoading={false}
    />
  );
}