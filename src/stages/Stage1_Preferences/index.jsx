import { useState } from 'react';
import Step1_Tags from './Step1_Tags';
import Step3_WeightReview from './Step3_WeightReview';
import { inferWeights } from '../../data/attributeMap';

export default function Stage1_Preferences({
  selectedTags, setSelectedTags,
  weights, setWeights,
  goTo, athletes, attributeMeta,
}) {
  const [step, setStep] = useState(1);

  function handleTagsNext() {
    const inferred = inferWeights(selectedTags);
    setWeights(inferred);
    setStep(2);
  }

  function handleWeightConfirm(finalWeights) {
    setWeights(finalWeights);
    goTo(2);
  }

  const dotStyle = (n) => ({
    width: 8, height: 8, borderRadius: '50%',
    backgroundColor: step === n ? '#F59E0B' : '#2a2a2a',
    border: `2px solid ${step === n ? '#F59E0B' : step > n ? '#F59E0B' : '#4b5563'}`,
    transition: 'all 300ms ease',
  });

  return (
    <div style={{ minHeight: '100vh', padding: '60px 20px 40px' }}>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 40 }}>
        {[1, 2].map(n => <div key={n} style={dotStyle(n)} />)}
      </div>

      {step === 1 && (
        <Step1_Tags
          selectedTags={selectedTags}
          setSelectedTags={setSelectedTags}
          onNext={handleTagsNext}
        />
      )}
      {step === 2 && (
        <Step3_WeightReview
          weights={weights}
          setWeights={setWeights}
          selectedTags={selectedTags}
          athletes={athletes}
          attributeMeta={attributeMeta}
          onConfirm={handleWeightConfirm}
          onBack={() => setStep(1)}
        />
      )}
    </div>
  );
}
