export const tagWeights = {
  // Keep mappings mostly one-to-one so categories stay easier to explain.
  'Consistency':          { longevity: 0.16 },
  'Peak Dominance':       { dominance: 0.18 },
  'Titles & Trophies':    { accolades: 0.18 },
  'Longevity':            { longevity: 0.18 },
  'Rivalry':              { eraDifficulty: 0.16 },
  'Beating the Odds':     { eraDifficulty: 0.18 },
  'Records':              { dominance: 0.16 },
  'Era Difficulty':       { eraDifficulty: 0.18 },
  'Mental Strength':      { dominance: 0.14 },
  'Innovation':           { eraDifficulty: 0.14 },
  'Impact on the Sport':  { accolades: 0.14 },
  'Clutch Performance':   { dominance: 0.16 },
};

export const questionPool = [
  {
    id: 'q_dominance_vs_longevity',
    tags: ['Peak Dominance', 'Longevity', 'Consistency'],
    question: 'Which impresses you more?',
    a: { title: '3 back-to-back titles in 4 years', desc: 'A short but overwhelming peak' },
    b: { title: '1 title across a 15-year top-3 career', desc: 'Remarkable consistency over time' },
    maps: { a: { dominance: 0.15 }, b: { longevity: 0.15 } },
  },
  {
    id: 'q_accolades_vs_era',
    tags: ['Titles & Trophies', 'Era Difficulty', 'Rivalry', 'Beating the Odds'],
    question: 'What matters more to you?',
    a: { title: 'A record-breaking trophy cabinet', desc: 'More titles than anyone in the sport\'s history' },
    b: { title: 'Dominating an era of elite competition', desc: 'Winning despite facing the toughest rivals ever' },
    maps: { a: { accolades: 0.15 }, b: { eraDifficulty: 0.15 } },
  },
  {
    id: 'q_peak_vs_consistency',
    tags: ['Peak Dominance', 'Consistency', 'Records'],
    question: 'Which career story is more impressive?',
    a: { title: 'An unstoppable 5-year peak', desc: 'Near-perfect performance at the absolute top' },
    b: { title: 'Sustained excellence for 15+ years', desc: 'Always competitive, never declining' },
    maps: { a: { dominance: 0.12 }, b: { longevity: 0.12 } },
  },
  {
    id: 'q_records_vs_impact',
    tags: ['Records', 'Impact on the Sport', 'Innovation'],
    question: 'What defines greatness more?',
    a: { title: 'Shattering statistical records', desc: 'Numbers that may never be matched' },
    b: { title: 'Changing the sport forever', desc: 'Revolutionizing how the game is played' },
    maps: { a: { dominance: 0.1, accolades: 0.05 }, b: { eraDifficulty: 0.1, accolades: 0.05 } },
  },
  {
    id: 'q_clutch_vs_longevity',
    tags: ['Clutch Performance', 'Mental Strength', 'Longevity'],
    question: 'Which is the hallmark of a GOAT?',
    a: { title: 'Delivering in the biggest moments', desc: 'Finals, last seconds, must-win matches — they always delivered' },
    b: { title: 'Never fading, always performing', desc: 'Consistent greatness across decades' },
    maps: { a: { dominance: 0.1, accolades: 0.05 }, b: { longevity: 0.12 } },
  },
];

export function getQuestionsForTags(selectedTags) {
  const scored = questionPool.map(q => ({
    ...q,
    score: q.tags.filter(t => selectedTags.includes(t)).length,
  }));
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 3);
}

export function inferWeights(selectedTags, pairwiseAnswers) {
  const deltas = { dominance: 0, longevity: 0, accolades: 0, eraDifficulty: 0 };
  selectedTags.forEach(tag => {
    const tw = tagWeights[tag] || {};
    Object.entries(tw).forEach(([k, v]) => { deltas[k] += v; });
  });
  (pairwiseAnswers || []).forEach(({ questionId, choice }) => {
    const q = questionPool.find(q => q.id === questionId);
    if (!q) return;
    const maps = q.maps[choice] || {};
    Object.entries(maps).forEach(([k, v]) => { deltas[k] += v; });
  });
  const base = { dominance: 0.25, longevity: 0.25, accolades: 0.25, eraDifficulty: 0.25 };
  const raw = Object.fromEntries(
    Object.keys(base).map(k => [k, Math.max(0.05, base[k] + deltas[k])])
  );
  const total = Object.values(raw).reduce((a, b) => a + b, 0);
  return Object.fromEntries(Object.keys(raw).map(k => [k, raw[k] / total]));
}
