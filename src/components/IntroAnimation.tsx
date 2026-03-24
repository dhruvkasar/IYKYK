import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface IntroAnimationProps {
  onComplete: () => void;
}

const words = ["IF", "YOU", "KNOW", "YOU", "KNOW"];
const wordColors = ["text-hot-pink", "text-violet", "text-mint", "text-amber", "text-ink"];

const IntroAnimation: React.FC<IntroAnimationProps> = ({ onComplete }) => {
  const [wordIndex, setWordIndex] = useState(0);
  const [showAcronym, setShowAcronym] = useState(false);

  useEffect(() => {
    if (wordIndex < words.length) {
      const timer = setTimeout(() => {
        setWordIndex(wordIndex + 1);
      }, 250);
      return () => clearTimeout(timer);
    } else if (wordIndex === words.length && !showAcronym) {
      setShowAcronym(true);
    }
  }, [wordIndex, showAcronym]);

  useEffect(() => {
    if (showAcronym) {
      const timer = setTimeout(() => {
        onComplete();
      }, 2200);
      return () => clearTimeout(timer);
    }
  }, [showAcronym, onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-cream overflow-hidden"
      exit={{ y: "-100%", transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] } }}
    >
      <AnimatePresence>
        {!showAcronym && wordIndex < words.length && (
          <motion.div
            key={wordIndex}
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.5, position: 'absolute' }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={`absolute text-7xl md:text-9xl font-black tracking-tighter uppercase ${wordColors[wordIndex]}`}
          >
            {words[wordIndex]}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAcronym && (
          <motion.div
            key="acronym"
            className="flex flex-col items-center justify-center w-full h-full relative"
          >
            {/* Top Outline */}
            <div className="overflow-hidden -mb-6 md:-mb-16 opacity-30">
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                transition={{ duration: 0.8, delay: 0.1, ease: [0.76, 0, 0.24, 1] }}
                className="text-[20vw] md:text-[14vw] font-black text-transparent tracking-tighter leading-none"
                style={{ WebkitTextStroke: '3px #141414' }}
              >
                IYKYK
              </motion.div>
            </div>

            {/* Center Solid */}
            <div className="overflow-hidden z-10 relative">
              <motion.div
                initial={{ y: "100%", rotate: -2 }}
                animate={{ y: 0, rotate: 0 }}
                transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
                className="text-[28vw] md:text-[20vw] font-black text-hot-pink tracking-tighter leading-none drop-shadow-2xl"
                style={{ WebkitTextStroke: '4px #141414' }}
              >
                IYKYK
              </motion.div>
              
              {/* Subtitle overlaying the center text */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
                animate={{ opacity: 1, scale: 1, rotate: -2 }}
                transition={{ duration: 0.6, delay: 0.5, ease: [0.76, 0, 0.24, 1] }}
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full text-center flex justify-center"
              >
                <span className="bg-violet text-cream px-4 py-2 text-xs md:text-xl font-bold tracking-[0.3em] md:tracking-[0.5em] uppercase whitespace-nowrap border-4 border-ink hard-shadow">
                  If You Know You Know
                </span>
              </motion.div>
            </div>

            {/* Bottom Outline */}
            <div className="overflow-hidden -mt-6 md:-mt-16 opacity-30">
              <motion.div
                initial={{ y: "-100%" }}
                animate={{ y: 0 }}
                transition={{ duration: 0.8, delay: 0.1, ease: [0.76, 0, 0.24, 1] }}
                className="text-[20vw] md:text-[14vw] font-black text-transparent tracking-tighter leading-none"
                style={{ WebkitTextStroke: '3px #141414' }}
              >
                IYKYK
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default IntroAnimation;
