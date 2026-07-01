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
import { defaultLanguage, quoteCheckContent, type Language } from './data/quoteCheckContent';

type Screen =
  | 'landing'
  | 'start'
  | 'checking'
  | 'result'
  | 'review'
  | 'questions'
  | 'reply'
  | 'updated';

const screenOrder: Screen[] = [
  'landing',
  'start',
  'checking',
  'result',
  'review',
  'questions',
  'reply',
  'updated',
];

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
  const [language, setLanguage] = useState<Language>(defaultLanguage);
  const content = quoteCheckContent[language];

  const goBack = () => {
    const currentIndex = screenOrder.indexOf(screen);

    if (currentIndex > 0) {
      setScreen(screenOrder[currentIndex - 1]);
    }
  };

  return (
    <AppShell
      brand={content.brand}
      currentStep={screenStep[screen]}
      language={language}
      onBack={screen === 'landing' ? undefined : goBack}
      onLanguageChange={setLanguage}
      shell={content.shell}
      totalSteps={8}
    >
      {screen === 'landing' && (
        <LandingScreen content={content.landing} onNext={() => setScreen('start')} />
      )}
      {screen === 'start' && (
        <StartCheckScreen content={content.startCheck} onNext={() => setScreen('checking')} />
      )}
      {screen === 'checking' && (
        <CheckingScreen content={content.checking} onNext={() => setScreen('result')} />
      )}
      {screen === 'result' && (
        <ResultScreen content={content.result} onNext={() => setScreen('review')} />
      )}
      {screen === 'review' && (
        <ThingsToReviewScreen content={content.review} onNext={() => setScreen('questions')} />
      )}
      {screen === 'questions' && (
        <ContractorQuestionsScreen content={content.questions} onNext={() => setScreen('reply')} />
      )}
      {screen === 'reply' && (
        <VendorReplyScreen content={content.vendorReply} onNext={() => setScreen('updated')} />
      )}
      {screen === 'updated' && (
        <UpdatedRecommendationScreen content={content.updatedRecommendation} />
      )}
    </AppShell>
  );
}
