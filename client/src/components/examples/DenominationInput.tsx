import DenominationInput from '../DenominationInput';

export default function DenominationInputExample() {
  return (
    <DenominationInput
      onCountsChange={(counts, total) => console.log('Counts changed:', counts, total)}
      onSubmit={() => console.log('Submit cash count triggered')}
      isLoading={false}
    />
  );
}