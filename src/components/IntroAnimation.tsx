import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';

interface IntroAnimationProps {
  onComplete: () => void;
}

const IntroAnimation: React.FC<IntroAnimationProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState(0);
  const text = "IYKYK";

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 400);   // Line draws
    const t2 = setTimeout(() => setPhase(2), 1000);  // Box opens
    const t3 = setTimeout(() => setPhase(3), 2400);  // Scale up
    const t4 = setTimeout(() => onComplete(), 3000); // Complete

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink overflow-hidden"
      exit={{ opacity: 0, transition: { duration: 0.6, ease: "easeInOut" } }}
    >
      <motion.div
        className="flex items-center justify-center bg-cream overflow-hidden"
        initial={{ width: 0, height: 2, borderRadius: "4px" }}
        animate={{ 
          width: phase >= 1 ? 320 : 0, 
          height: phase >= 2 ? 140 : 2,
          scale: phase >= 3 ? 50 : 1,
          borderRadius: phase >= 3 ? "50%" : "4px"
        }}
        transition={{ 
          width: { duration: 0.6, ease: [0.85, 0, 0.15, 1] },
          height: { duration: 0.6, ease: [0.85, 0, 0.15, 1] },
          scale: { duration: 1, ease: [0.85, 0, 0.15, 1] },
          borderRadius: { duration: 0.5 }
        }}
      >
        <div className="flex space-x-1 overflow-hidden px-4 py-2">
          {text.split('').map((char, i) => (
            <motion.span
              key={i}
              className="text-6xl font-extrabold text-ink tracking-tight"
              initial={{ y: 80, opacity: 0 }}
              animate={{ 
                y: phase === 2 ? 0 : (phase >= 3 ? -20 : 80), 
                opacity: phase === 2 ? 1 : 0,
                scale: phase >= 3 ? 0.9 : 1
              }}
              transition={{ 
                y: { duration: 0.6, delay: phase === 2 ? i * 0.08 : 0, ease: [0.2, 0.65, 0.3, 0.9] },
                opacity: { duration: 0.4, delay: phase === 2 ? i * 0.08 : 0 },
                scale: { duration: 0.5 }
              }}
            >
              {char}
            </motion.span>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default IntroAnimation;
