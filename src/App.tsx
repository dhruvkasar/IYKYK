import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { generateRiddle } from './services/gemini';
import { initAudio, playCorrect, playWrong, playHint, toggleBgm, isPlayingBgm } from './lib/audio';
import { Star, Volume2, VolumeX, Sparkles, ArrowRight, Lightbulb, Trophy, Brain, Microscope, Landmark, Tv, Cat, Github, Instagram, Smartphone, AlertTriangle, Share2, Flame } from 'lucide-react';
import StickerPeel from './components/StickerPeel';
import IntroAnimation from './components/IntroAnimation';

type GameState = 'intro' | 'menu' | 'playing' | 'solved' | 'failed';

class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: Error | null}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-cream text-ink font-sans">
          <div className="bg-white p-8 rounded-3xl border-4 border-ink hard-shadow max-w-md w-full text-center">
            <AlertTriangle size={48} className="mx-auto mb-4 text-red-500" />
            <h2 className="text-2xl font-bold mb-4">Oops! Something went wrong.</h2>
            <p className="text-ink/70 mb-6">{this.state.error?.message || "An unexpected error occurred."}</p>
            <button 
              onClick={() => window.location.reload()}
              className="w-full py-3 bg-violet text-white font-bold rounded-xl border-2 border-ink hard-shadow-sm hover:translate-y-1 hover:shadow-none transition-all"
            >
              Reload Game
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const CATEGORIES = [
  { id: 'desi', name: 'Desi Relatable Reel Riddles', icon: Smartphone, color: 'bg-hot-pink', text: 'text-pink-900' },
  { id: 'overthinkers', name: 'Overthinkers Club: Only Legends Solve This', icon: Brain, color: 'bg-violet', text: 'text-white' },
  { id: 'pop_culture', name: 'Pop Culture', icon: Tv, color: 'bg-amber', text: 'text-amber-900' },
];

const DIFFICULTIES = ['Easy', 'Medium', 'Hard', 'Genius'];

export default function AppWrapper() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}

function App() {
  const [gameState, setGameState] = useState<GameState>('intro');
  const [stars, setStars] = useState(0);
  const [streak, setStreak] = useState(0);
  const [freeHints, setFreeHints] = useState(1);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [difficulty, setDifficulty] = useState('Easy');
  const [currentRiddle, setCurrentRiddle] = useState<{ riddle: string, answer: string, hint: string, fun_fact: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const [bgmOn, setBgmOn] = useState(false);
  const [earnedStar, setEarnedStar] = useState(false);
  const [chances, setChances] = useState(3);
  const [openCreator, setOpenCreator] = useState<string | null>(null);

  const handleToggleBgm = async () => {
    const isPlaying = await toggleBgm();
    setBgmOn(isPlaying);
  };

  const startGame = async () => {
    initAudio();
    setGameState('playing');
    setLoading(true);
    setError(null);
    setShowHint(false);
    setUserAnswer('');
    setChances(3);
    try {
      const riddle = await generateRiddle(category.name, difficulty);
      setCurrentRiddle(riddle);
    } catch (err: any) {
      setError(err.message || 'Failed to generate riddle. Try again!');
      setGameState('menu');
    } finally {
      setLoading(false);
    }
  };

  const nextRiddle = async () => {
    setGameState('playing');
    setLoading(true);
    setError(null);
    setShowHint(false);
    setUserAnswer('');
    setEarnedStar(false);
    setChances(3);
    try {
      const riddle = await generateRiddle(category.name, difficulty);
      setCurrentRiddle(riddle);
    } catch (err: any) {
      setError(err.message || 'Failed to generate riddle. Try again!');
    } finally {
      setLoading(false);
    }
  };

  const checkAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentRiddle || !userAnswer.trim()) return;

    // Simple check: if user answer is contained in the actual answer or vice versa
    const normalizedUser = userAnswer.toLowerCase().trim();
    const normalizedActual = currentRiddle.answer.toLowerCase().trim();
    
    // Remove punctuation
    const cleanUser = normalizedUser.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").trim();
    const cleanActual = normalizedActual.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").trim();

    // Remove common articles for comparison
    const removeArticles = (str: string) => str.replace(/^(a|an|the)\s+/g, "").replace(/\s+/g, "");
    
    const userNoArticles = removeArticles(cleanUser);
    const actualNoArticles = removeArticles(cleanActual);

    // Check exact match after removing articles and spaces
    let isCorrect = userNoArticles === actualNoArticles;
    
    // If not exact, check if one contains the other (only if the word is reasonably long to prevent false positives)
    if (!isCorrect) {
      if (actualNoArticles.length >= 3 && userNoArticles.includes(actualNoArticles)) {
        isCorrect = true;
      } else if (userNoArticles.length >= 3 && actualNoArticles.includes(userNoArticles)) {
        isCorrect = true;
      }
    }

    if (isCorrect) {
      playCorrect();
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#8B5CF6', '#F472B6', '#FBBF24', '#34D399']
      });
      setStars(s => s + 1);
      setStreak(s => s + 1);
      setEarnedStar(true);
      setGameState('solved');
    } else {
      playWrong();
      setShake(true);
      setTimeout(() => setShake(false), 500);
      
      if (chances > 1) {
        setChances(c => c - 1);
      } else {
        setChances(0);
        setStreak(0);
        setGameState('failed');
      }
    }
  };

  const shareRiddle = async () => {
    if (!currentRiddle) return;
    const text = `🧠 IYKYK Riddle:\n"${currentRiddle.riddle}"\n\nAnswer: ${currentRiddle.answer}\n🔥 My Streak: ${streak}\nCan you beat me?`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'IYKYK Riddle',
          text: text,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(text);
      alert('Riddle copied to clipboard! Share it with your friends.');
    }
  };

  const useHint = () => {
    if (freeHints > 0 && !showHint) {
      setFreeHints(h => h - 1);
      setShowHint(true);
      playHint();
    } else if (stars >= 1 && !showHint) {
      setStars(s => s - 1);
      setShowHint(true);
      playHint();
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center py-8 px-4 overflow-x-hidden relative">
      <AnimatePresence>
        {gameState === 'intro' && (
          <IntroAnimation key="intro" onComplete={() => setGameState('menu')} />
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="w-full max-w-4xl flex justify-between items-center mb-12">
        <button 
          onClick={() => setGameState('menu')}
          className="flex items-center gap-2 group focus:outline-none"
          aria-label="Return to menu"
        >
          <StickerPeel
            width="auto"
            rotate={0}
            peelBackHoverPct={30}
            peelBackActivePct={40}
            shadowIntensity={0.2}
            lightingIntensity={0.1}
            peelDirection={0}
          >
            <h1 className="text-2xl font-extrabold tracking-tight bg-white px-3 py-1 rounded-lg border-2 border-ink shadow-sm">IYKYK</h1>
          </StickerPeel>
        </button>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full hard-shadow-sm border-2 border-ink">
            <Flame className={`text-orange-500 fill-orange-500 ${streak > 0 ? 'animate-pulse' : ''}`} size={20} />
            <span className="font-bold text-lg">{streak}</span>
          </div>
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full hard-shadow-sm border-2 border-ink">
            <Star className={`text-amber fill-amber ${earnedStar ? 'animate-spin-star' : ''}`} size={20} />
            <span className="font-bold text-lg">{stars}</span>
          </div>
          <button 
            onClick={handleToggleBgm}
            aria-label={bgmOn ? "Mute background music" : "Play background music"}
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center hard-shadow-sm border-2 border-ink hover-wiggle focus:outline-none focus:ring-2 focus:ring-violet"
          >
            {bgmOn ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
        </div>
      </header>

      <main className="w-full max-w-2xl flex-1 flex flex-col items-center">
        <AnimatePresence mode="wait">
          {gameState === 'menu' && (
            <motion.div 
              key="menu"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full flex flex-col items-center"
            >
              <div className="relative mb-12 text-center">
                <Sparkles className="absolute -top-6 -left-8 text-amber animate-pulse" size={32} />
                <Sparkles className="absolute -bottom-4 -right-8 text-hot-pink animate-pulse" size={24} />
                <h2 className="text-5xl md:text-7xl font-extrabold text-ink mb-4 leading-tight">
                  IYKYK <br/> RIDDLES
                </h2>
                <p className="text-lg font-medium text-ink/70">
                  Infinite riddles. Earn stars. Unlock your genius.
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-100 text-red-800 rounded-xl border-2 border-red-300 font-medium">
                  {error}
                </div>
              )}

              <div className="w-full bg-white p-6 md:p-8 rounded-3xl border-4 border-ink hard-shadow mb-8">
                <h3 className="text-xl font-bold mb-4">1. Choose Category</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setCategory(cat)}
                      className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-ink transition-all ${
                        category.id === cat.id 
                          ? `${cat.color} ${cat.text} hard-shadow-sm scale-105` 
                          : 'bg-cream text-ink hover:bg-gray-100'
                      }`}
                    >
                      <cat.icon size={32} className="mb-2" />
                      <span className="font-bold">{cat.name}</span>
                    </button>
                  ))}
                </div>

                <h3 className="text-xl font-bold mb-4">2. Select Difficulty</h3>
                <div className="flex flex-wrap gap-3 mb-8">
                  {DIFFICULTIES.map((diff, i) => (
                    <button
                      key={diff}
                      onClick={() => setDifficulty(diff)}
                      className={`relative px-6 py-3 rounded-full border-2 border-ink font-bold transition-all ${
                        difficulty === diff
                          ? 'bg-ink text-cream hard-shadow-sm'
                          : 'bg-white text-ink hover:bg-gray-100'
                      }`}
                    >
                      {diff}
                      {diff === 'Genius' && (
                        <span className="absolute -top-3 -right-2 bg-hot-pink text-white text-[10px] px-2 py-1 rounded-full border border-ink transform rotate-12 font-extrabold whitespace-nowrap">
                          MOST POPULAR
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                <button
                  onClick={startGame}
                  disabled={loading}
                  className="w-full py-4 bg-mint text-emerald-900 text-xl font-extrabold rounded-full border-4 border-ink hard-shadow-hover transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'LOADING...' : 'PLAY NOW'} <ArrowRight />
                </button>
              </div>
            </motion.div>
          )}

          {(gameState === 'playing' || gameState === 'solved' || gameState === 'failed') && (
            <motion.div 
              key="game"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full flex flex-col items-center"
            >
              {/* Connector line */}
              <div className="h-12 border-l-4 border-dashed border-ink/30 mb-4"></div>

              {loading ? (
                <div className="w-full bg-white p-12 rounded-3xl border-4 border-ink hard-shadow flex flex-col items-center justify-center min-h-[300px]">
                  <div className="w-16 h-16 border-8 border-cream border-t-violet rounded-full animate-spin mb-4"></div>
                  <h3 className="text-xl font-bold text-ink animate-pulse">Consulting the AI Oracle...</h3>
                </div>
              ) : currentRiddle ? (
                <div className="w-full relative">
                  {/* Decorative background shapes */}
                  <div className="absolute -inset-4 bg-violet/20 rounded-[40px] -z-10 transform rotate-2"></div>
                  <div className="absolute -inset-4 bg-amber/20 rounded-[40px] -z-10 transform -rotate-2"></div>
                  
                  <div className={`w-full bg-white p-6 md:p-12 rounded-3xl border-4 border-ink hard-shadow mb-8 transition-transform ${shake ? 'animate-shake border-red-500' : ''}`}>
                    <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
                      <div className="flex flex-wrap gap-2">
                        <span className={`px-4 py-1 rounded-full border-2 border-ink text-sm font-bold ${category.color} ${category.text}`}>
                          {category.name}
                        </span>
                        <span className="px-4 py-1 rounded-full border-2 border-ink bg-gray-100 text-ink text-sm font-bold">
                          {difficulty}
                        </span>
                      </div>
                      <span className="px-4 py-1 rounded-full border-2 border-ink bg-red-100 text-red-600 text-sm font-bold flex items-center gap-1">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <span key={i} className={i < chances ? '' : 'opacity-30 grayscale'}>❤️</span>
                        ))}
                      </span>
                    </div>
                    
                    <h2 className="text-xl md:text-3xl font-bold leading-relaxed mb-8 text-center">
                      "{currentRiddle.riddle}"
                    </h2>

                    <AnimatePresence>
                      {showHint && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="mb-8 p-4 bg-amber/20 border-2 border-amber rounded-xl flex items-start gap-3"
                        >
                          <Lightbulb className="text-amber shrink-0 mt-1" />
                          <p className="font-medium text-amber-900">{currentRiddle.hint}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {gameState === 'playing' ? (
                      <form onSubmit={checkAnswer} className="flex flex-col gap-4">
                        <div className="relative">
                          <input
                            type="text"
                            value={userAnswer}
                            onChange={(e) => setUserAnswer(e.target.value)}
                            placeholder="Type your answer..."
                            className="w-full pl-6 pr-28 md:pr-32 py-4 text-base md:text-lg font-bold bg-cream border-4 border-ink rounded-full focus:outline-none focus:ring-4 focus:ring-violet/30 transition-all"
                            autoFocus
                          />
                          <button 
                            type="submit"
                            disabled={!userAnswer.trim()}
                            className="absolute right-2 top-2 bottom-2 px-4 md:px-6 bg-violet text-white font-bold rounded-full border-2 border-ink hover:bg-violet/90 transition-all active:scale-95 text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Submit
                          </button>
                        </div>
                        
                        <div className="flex flex-wrap justify-between items-center gap-4 mt-2">
                          <button
                            type="button"
                            onClick={() => {
                              setChances(0);
                              setStreak(0);
                              setGameState('failed');
                            }}
                            className="text-sm font-bold text-ink/60 hover:text-ink underline underline-offset-4"
                          >
                            Give up
                          </button>
                          
                          {!showHint && (
                            <button
                              type="button"
                              onClick={useHint}
                              disabled={stars < 1 && freeHints < 1}
                              className={`text-sm font-bold flex items-center gap-1 px-3 py-1 rounded-full border-2 ${
                                stars >= 1 || freeHints >= 1
                                  ? 'border-ink bg-amber/20 text-amber-900 hover:bg-amber/30' 
                                  : 'border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed'
                              }`}
                            >
                              <Lightbulb size={16} />
                              {freeHints > 0 ? 'Hint (1 Free)' : <>Hint (Costs 1 <Star size={12} className="inline fill-current" />)</>}
                            </button>
                          )}
                        </div>
                      </form>
                    ) : (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center text-center"
                      >
                        {gameState === 'solved' ? (
                          <div className="inline-block px-6 py-2 bg-mint border-2 border-ink rounded-full font-bold text-emerald-900 mb-4 transform -rotate-2">
                            Correct! +1 Star
                          </div>
                        ) : (
                          <div className="inline-block px-6 py-2 bg-red-400 border-2 border-ink rounded-full font-bold text-white mb-4 transform -rotate-2">
                            Out of chances! Streak lost.
                          </div>
                        )}
                        <p className="text-xl font-bold mb-2">Answer: <span className="text-violet">{currentRiddle.answer}</span></p>
                        <p className="text-ink/70 font-medium mb-8 bg-cream p-4 rounded-xl border-2 border-ink/10">
                          <span className="font-bold block mb-1">Fun Fact:</span>
                          {currentRiddle.fun_fact}
                        </p>
                        
                        <div className="flex flex-col sm:flex-row gap-3 w-full mb-4">
                          <button
                            onClick={shareRiddle}
                            className="flex-1 py-4 bg-white text-ink text-lg font-bold rounded-full border-4 border-ink hard-shadow-hover transition-all flex items-center justify-center gap-2"
                          >
                            <Share2 size={20} /> SHARE
                          </button>
                          <button
                            onClick={nextRiddle}
                            className="flex-[2] py-4 bg-hot-pink text-white text-xl font-extrabold rounded-full border-4 border-ink hard-shadow-hover transition-all flex items-center justify-center gap-2"
                          >
                            NEXT RIDDLE <ArrowRight />
                          </button>
                        </div>
                        <button
                          onClick={() => setGameState('menu')}
                          className="text-sm font-bold text-ink/60 hover:text-ink underline underline-offset-4"
                        >
                          Return to Menu
                        </button>
                      </motion.div>
                    )}
                  </div>
                </div>
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="mt-auto pt-12 pb-4 text-center font-bold text-ink/80 flex items-center justify-center gap-2 relative z-20">
        <span>built by</span>
        
        <div className="relative">
          <button 
            onClick={() => setOpenCreator(openCreator === 'aditya' ? null : 'aditya')}
            className="text-violet hover:text-violet/80 underline decoration-2 underline-offset-4 focus:outline-none focus:ring-2 focus:ring-violet rounded-sm"
          >
            aditya
          </button>
          <AnimatePresence>
            {openCreator === 'aditya' && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.9 }}
                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-white border-2 border-ink hard-shadow-sm rounded-xl p-2 flex gap-2"
              >
                <a href="https://github.com/adimestry" target="_blank" rel="noopener noreferrer" aria-label="Aditya's GitHub" className="p-2 hover:bg-gray-100 rounded-lg text-ink transition-colors">
                  <Github size={20} />
                </a>
                <a href="https://www.instagram.com/aditya_mestry_x007/" target="_blank" rel="noopener noreferrer" aria-label="Aditya's Instagram" className="p-2 hover:bg-pink-100 rounded-lg text-hot-pink transition-colors">
                  <Instagram size={20} />
                </a>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <span>and</span>

        <div className="relative">
          <button 
            onClick={() => setOpenCreator(openCreator === 'dhruv' ? null : 'dhruv')}
            className="text-hot-pink hover:text-hot-pink/80 underline decoration-2 underline-offset-4 focus:outline-none focus:ring-2 focus:ring-hot-pink rounded-sm"
          >
            dhruv
          </button>
          <AnimatePresence>
            {openCreator === 'dhruv' && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.9 }}
                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-white border-2 border-ink hard-shadow-sm rounded-xl p-2 flex gap-2"
              >
                <a href="https://github.com/dhruvkasar" target="_blank" rel="noopener noreferrer" aria-label="Dhruv's GitHub" className="p-2 hover:bg-gray-100 rounded-lg text-ink transition-colors">
                  <Github size={20} />
                </a>
                <a href="https://www.instagram.com/dhruvvkasar/" target="_blank" rel="noopener noreferrer" aria-label="Dhruv's Instagram" className="p-2 hover:bg-pink-100 rounded-lg text-hot-pink transition-colors">
                  <Instagram size={20} />
                </a>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </footer>
    </div>
  );
}
