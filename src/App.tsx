import { useEffect, useState } from 'react';
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

const screenPhase: Record<Screen, number | null> = {
  landing: null,
  start: 0,
  checking: 1,
  result: 1,
  review: 1,
  questions: 2,
  reply: 3,
  updated: 3,
};

export default function App() {
  const [screen, setScreen] = useState<Screen>('landing');
  const [language, setLanguage] = useState<Language>(defaultLanguage);
  const content = quoteCheckContent[language];
  const currentPhase = screenPhase[screen];

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [screen]);

  const goBack = () => {
    const currentIndex = screenOrder.indexOf(screen);

    if (currentIndex > 0) {
      setScreen(screenOrder[currentIndex - 1]);
    }
  };

  return (
    <AppShell
      brand={content.brand}
      currentPhase={currentPhase}
      language={language}
      onBack={screen === 'landing' ? undefined : goBack}
      onLanguageChange={setLanguage}
      shell={content.shell}
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
