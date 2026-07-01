import { useState } from 'react';
import { AppShell } from './components/AppShell';
import { CheckingScreen } from './components/CheckingScreen';
import { ContractorQuestionsScreen } from './components/ContractorQuestionsScreen';
import { LandingScreen } from './components/LandingScreen';
import { ResultScreen } from './components/ResultScreen';
import { StartCheckScreen } from './components/StartCheckScreen';
import { ThingsToReviewScreen } from './components/ThingsToReviewScreen';
import { UpdatedRecommendationScreen } from './components/UpdatedRecommendationScreen';
import { VendorReplyScreen } from './components/VendorReplyScreen';

type Screen =
  | 'landing'
  | 'start'
  | 'checking'
  | 'result'
  | 'review'
  | 'questions'
  | 'reply'
  | 'updated';

const screenStep: Record<Screen, number> = {
  landing: 1,
  start: 2,
  checking: 3,
  result: 4,
  review: 5,
  questions: 6,
  reply: 7,
  updated: 8,
};

export default function App() {
  const [screen, setScreen] = useState<Screen>('landing');

  return (
    <AppShell currentStep={screenStep[screen]} totalSteps={8}>
      {screen === 'landing' && <LandingScreen onNext={() => setScreen('start')} />}
      {screen === 'start' && <StartCheckScreen onNext={() => setScreen('checking')} />}
      {screen === 'checking' && <CheckingScreen onNext={() => setScreen('result')} />}
      {screen === 'result' && <ResultScreen onNext={() => setScreen('review')} />}
      {screen === 'review' && <ThingsToReviewScreen onNext={() => setScreen('questions')} />}
      {screen === 'questions' && <ContractorQuestionsScreen onNext={() => setScreen('reply')} />}
      {screen === 'reply' && <VendorReplyScreen onNext={() => setScreen('updated')} />}
      {screen === 'updated' && <UpdatedRecommendationScreen />}
    </AppShell>
  );
}
