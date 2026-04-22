import { useState, useMemo, useCallback } from 'react';
import { footballAthletes, footballAttributeMeta } from './data/football';
import { chessAthletes, chessAttributeMeta } from './data/chess';
import { boxingAthletes, boxingAttributeMeta } from './data/boxing';
import { normalizeAthletes } from './utils/normalize';
import { computeAllSportScores, computeOverallScores } from './utils/scoring';
import ProgressBar from './components/ProgressBar';
import Stage0_Intro from './stages/Stage0_Intro';
import Stage1_Preferences from './stages/Stage1_Preferences/index';
import Stage2_SportDives from './stages/Stage2_SportDives/index';
import Stage3_CrossSport from './stages/Stage3_CrossSport/index';
import Stage4_Verdict from './stages/Stage4_Verdict/index';

const normalizedFootball = normalizeAthletes(footballAthletes, footballAttributeMeta);
const normalizedChess    = normalizeAthletes(chessAthletes, chessAttributeMeta);
const normalizedBoxing   = normalizeAthletes(boxingAthletes, boxingAttributeMeta);

const initialWeights = { dominance: 0.25, longevity: 0.25, accolades: 0.25, eraDifficulty: 0.25 };

export default function App() {
  const [currentStage, setCurrentStage] = useState(0);
  const [currentSport, setCurrentSport] = useState('football');
  const [selectedTags, setSelectedTags] = useState([]);
  const [weights, setWeights] = useState(initialWeights);
  const [selectedAthletes, setSelectedAthletes] = useState({
    football: [normalizedFootball[0].id, normalizedFootball[1].id],
    chess: [normalizedChess[0].id, normalizedChess[1].id],
    boxing: [normalizedBoxing[0].id, normalizedBoxing[1].id],
  });

  const sportScores = useMemo(() => computeAllSportScores({
    football: normalizedFootball,
    chess: normalizedChess,
    boxing: normalizedBoxing,
  }, {
    football: footballAttributeMeta,
    chess: chessAttributeMeta,
    boxing: boxingAttributeMeta,
  }, weights), [weights]);

  const overallScores = useMemo(() =>
    computeOverallScores(sportScores, weights),
  [sportScores, weights]);

  const goTo = useCallback((stage) => setCurrentStage(stage), []);

  const sharedProps = {
    currentStage, goTo,
    currentSport, setCurrentSport,
    selectedTags, setSelectedTags,
    weights, setWeights,
    selectedAthletes, setSelectedAthletes,
    sportScores, overallScores,
    athletes: { football: normalizedFootball, chess: normalizedChess, boxing: normalizedBoxing },
    attributeMeta: { football: footballAttributeMeta, chess: chessAttributeMeta, boxing: boxingAttributeMeta },
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f0f0f', color: '#e5e5e5' }}>
      {currentStage > 0 && <ProgressBar currentStage={currentStage} goTo={goTo} />}
      {currentStage === 0 && <Stage0_Intro goTo={goTo} />}
      {currentStage === 1 && <Stage1_Preferences {...sharedProps} />}
      {currentStage === 2 && <Stage2_SportDives {...sharedProps} />}
      {currentStage === 3 && <Stage3_CrossSport {...sharedProps} />}
      {currentStage === 4 && <Stage4_Verdict {...sharedProps} />}
    </div>
  );
}
