"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useAnimationControls, type Variants } from 'framer-motion';
import Image from 'next/image';

/**
 * @info
 * A component to render a single, simple stroke for the 'M'.
 * It has one color and an animation for "drawing" (pathLength).
 * Now accepts a 'delay' prop for staggered, overlapping animation.
 */
function AnimatedStroke({ path, color, controls, delay }: { path: string; color: string; controls: any; delay: number }) {
  const strokeVariants: Variants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: { 
        duration: 0.6, // Each stroke still takes 0.6s to draw
        ease: 'easeInOut' as const, 
        delay: delay // This is the new part for overlapping
      }
    },
  };

  return (
    <motion.path
      d={path}
      fill="transparent"
      stroke={color}
      strokeWidth="12" // Kept the thinner stroke
      strokeLinecap="butt" // For rectangle corners
      variants={strokeVariants}
      animate={controls}
      initial="hidden"
    />
  );
}

/**
 * @info
 * A full-screen intro animation featuring a "writing" 'M' logo
 * with 4 strokes, and text, which then fades out with a zoom-in effect.
 */
function IntroAnimation({ onComplete }: { onComplete: () => void }) {
  const [showText, setShowText] = useState(false);
  const [showMLSALogo, setShowMLSALogo] = useState(false); // New state for MLSA logo

  // Use the exact hex color you requested
  const MColor = "#060757";

  // "Closer" paths
  const path1 = "M 30 80 L 30 20"; // Length 60
  const path2 = "M 30 20 L 50 80"; // Length ~63
  const path3 = "M 50 80 L 70 20"; // Length ~63
  const path4 = "M 70 20 L 70 80"; // Length 60

  // Animation controls for each of the 4 paths
  const controls1 = useAnimationControls();
  const controls2 = useAnimationControls();
  const controls3 = useAnimationControls();
  const controls4 = useAnimationControls();

  useEffect(() => {
    // Start all M animations
    controls1.start("visible");
    controls2.start("visible");
    controls3.start("visible");
    controls4.start("visible");

    // Show the text after the 'M' has finished drawing
    const textTimer = setTimeout(() => {
      setShowText(true);
    }, 2300); // 1.7s (last delay) + 0.6s (draw duration) = 2.3s

    // Show the MLSA logo after the main screen fade-in is complete
    const mlsaLogoTimer = setTimeout(() => {
      setShowMLSALogo(true);
    }, 500); // After the initial 0.5s screen fade-in

    return () => {
      clearTimeout(textTimer);
      clearTimeout(mlsaLogoTimer);
    };
  }, [controls1, controls2, controls3, controls4]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black"
      // Added initial and animate for a fade-in effect for the whole screen
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }} // Quick fade-in for the whole screen
      // Exit animation: fade out and ZOOM IN
      exit={{ opacity: 0, scale: 1.5 }}
      onAnimationComplete={onComplete}
    >
      {/* MLSA Logo - positioned top-left */}
      <AnimatePresence>
        {showMLSALogo && (
          <motion.img
            src="https://www.mlsakiit.com/_next/image?url=/mlsaLogo2.png&w=828&q=75"
            alt="MLSA MIET Logo"
            className="absolute top-4 left-4 h-12 w-auto md:h-16 z-10" // Adjust size as needed
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.5 }}
          />
        )}
      </AnimatePresence>

      {/* Container for the SVG to set a max size */}
      <div className="w-full max-w-xs md:max-w-md">
        <motion.svg
          viewBox="0 0 100 100" // Adjusted viewBox for new paths
          className="w-full h-auto overflow-visible"
        >
          {/* Render the 4 animated strokes with staggered delays */}
          <AnimatedStroke path={path1} color={MColor} controls={controls1} delay={0.5} />
          <AnimatedStroke path={path2} color={MColor} controls={controls2} delay={0.9} /> 
          <AnimatedStroke path={path3} color={MColor} controls={controls3} delay={1.3} />
          <AnimatedStroke path={path4} color={MColor} controls={controls4} delay={1.7} />
        </motion.svg>
      </div>

      {/* The "Creepy" text animation - will only appear when showText is true */}
      <AnimatePresence>
        {showText && (
          <motion.h1
            // Using inline style to avoid config file
            className="mt-4 text-2xl md:text-3xl text-white"
            style={{ fontFamily: 'Eater', fontWeight: '200', fontSize: '30px' }} // Inline style for font
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            MLSA Originals
          </motion.h1>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// --- NEW TYPING ANIMATION HOOK ---
function useTypingEffect(fullText: string, speed: number = 50, startDelay: number = 0) {
  const [text, setText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    // Start after the initial delay
    const startTimeout = setTimeout(() => {
      let i = 0;
      const interval = setInterval(() => {
        setText(fullText.substring(0, i + 1));
        i++;
        if (i > fullText.length) {
          clearInterval(interval);
          setIsComplete(true);
        }
      }, speed);
      return () => clearInterval(interval);
    }, startDelay);
    
    return () => clearTimeout(startTimeout);
  }, [fullText, speed, startDelay]);

  return { text, isComplete };
}


// --- NEW TYPED LINE COMPONENT ---
function TypedLine({ 
  text, 
  prefix = "", 
  color = "text-green-400", 
  startDelay = 0, 
  onComplete = () => {} 
}: { 
  text: string; 
  prefix?: string; 
  color?: string; 
  startDelay?: number; 
  onComplete?: () => void;
}) {
  const { text: typedText, isComplete } = useTypingEffect(text, 50, startDelay);

  // We still use onComplete to chain animations, but it's triggered by isComplete
  useEffect(() => {
    if (isComplete) {
      onComplete();
    }
  }, [isComplete, onComplete]);

  return (
    <p>
      {/* FIX: Escaped the '>' character */}
      <span className="text-gray-400">{prefix}</span>
      <span className={color}>{typedText}</span>
    </p>
  );
}

// --- NEW ANIMATED LOADER COMPONENT ---
function AnimatedLoader({ startDelay = 0, onComplete = () => {} }: { startDelay?: number; onComplete?: () => void; }) {
  const [progress, setProgress] = useState(0);
  const max = 10;

  useEffect(() => {
    const startTimeout = setTimeout(() => {
      const interval = setInterval(() => {
        setProgress(p => {
          if (p >= max) {
            clearInterval(interval);
            onComplete(); // Fire onComplete when loader is full
            return max;
          }
          return p + 1;
        });
      }, 100);
      return () => clearInterval(interval);
    }, startDelay);
    return () => clearTimeout(startTimeout);
  }, [startDelay, onComplete]);

  const loader = `[${'█'.repeat(progress)}${'.'.repeat(max - progress)}]`;
  return (
    <p>
      {/* FIX: Escaped the '>' character */}
      <span className="text-gray-400">{'> '}</span>
      <span className="text-green-400">Attempting to reinitialize MIET NODE {loader}</span>
    </p>
  );
}


// --- NEW STRANGER THINGS LANDING PAGE COMPONENT ---

function StrangerLandingPage() {
  const [guess, setGuess] = useState("");
  const [message, setMessage] = useState("");
  const [step, setStep] = useState(0); // State to manage typing waterfall
  const [startTerminal, setStartTerminal] = useState(false); // NEW: State to trigger animation

  const targetWord = "RUN";
  const hashedWord = "UlVO"; // "RUN" in Base64

  const checkAnswer = () => {
    if (guess.toUpperCase() === targetWord) {
      setMessage("SUCCESS: YOU CRACKED THE CODE. ACCESS GRANTED.");
    } else {
      setMessage("ERROR: INCORRECT. ACCESS DENIED.");
    }
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    checkAnswer();
  };

  // NEW: Define the style for the new background image
  const sectionsBackgroundStyle = {
    backgroundImage: 'url(/bg.png)', // <-- REPLACE THIS
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed'
  };

  // --- FIX: Wrap all onComplete handlers in useCallback ---
  const handleStep0 = useCallback(() => setTimeout(() => setStep(1), 500), []);
  const handleStep1 = useCallback(() => setTimeout(() => setStep(2), 500), []);
  const handleStep2 = useCallback(() => setTimeout(() => setStep(3), 300), []);
  const handleStep3 = useCallback(() => setTimeout(() => setStep(4), 500), []);
  const handleStep4 = useCallback(() => setTimeout(() => setStep(5), 100), []);
  const handleStep5 = useCallback(() => setTimeout(() => setStep(6), 500), []);


  return (
    <motion.div 
      className="text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.5 }} // Fade in after intro fades out
      // REMOVED: Shared background image from here
    >
      {/* SECTION 1: HERO (Full screen, original background image)
      */}
       <section 
        className="relative flex flex-col min-h-[75vh] sm:min-h-[85vh] md:min-h-screen text-white p-4 overflow-hidden"
      >
        {/* Background image constrained by responsive width container */}
        <div className="absolute inset-0 z-0 flex justify-center">
          <div className="relative h-full w-[95%] sm:w-[95%] md:w-full">
            <Image
              src="/samarambh-backg.jpg"
              alt="Background"
              sizes="(max-width: 768px) 90vw, (max-width: 1280px) 95vw, 100vw"
              priority
              unoptimized
              fill
              className="object-cover object-[center_30%] scale-110 sm:scale-110 md:scale-105 lg:scale-100 transition-transform duration-500"
            />
          </div>
        </div>
        {/* Semi-transparent overlay for readability */}
        {/* <div className="absolute inset-0 bg-black/40 z-10"></div> */}
        
        {/* Header with MLSA Logo */}
        <header className="relative z-20 w-full p-4">
          <img
            src="https://www.mlsakiit.com/_next/image?url=/mlsaLogo2.png&w=828&q=75"
            alt="MLSA MIET Logo"
            className="h-12 w-auto md:h-16"
          />
        </header>
        
        {/* Hero Content (Flicker Text) - REMOVED FROM HERE */}
        
        {/* Optional: "Scroll Down" arrow to hint at more content */}
        <div className="absolute bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 z-20">
          <a href="#title-section" className="animate-bounce">
            <svg className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </a>
        </div>
      </section>

      {/* NEW SECTION 2: TITLE (Moved from Hero)
      */}
      <section 
        id="title-section" // Link target for scroll arrow
        className="relative z-10 flex flex-col items-center justify-center text-center bg-black/75 py-20 md:py-32" // Added transparency
        style={sectionsBackgroundStyle} // NEW: Added new background
      >
        <h1 
          className="text-4xl md:text-6xl text-red-600 flicker-text"
          style={{ fontFamily: 'Bungee, cursive' }}
        >
          MLSA MIET
        </h1>
        <h2 
          className="text-3xl md:text-5xl text-white mt-2"
          style={{ fontFamily: 'Bungee, cursive' }}
        >
          PRESENTS
        </h2>
      </section>

      {/* --- SECTION 3: HASHING GAME (RE-STRUCTURED) ---
      */}
      <section 
        id="game-section" // ID for the scroll-down link
        className="relative z-10 flex flex-col items-center justify-center bg-black/75 p-8 md:p-12 pb-20 md:pb-32" // Added transparency
        style={sectionsBackgroundStyle} // NEW: Added new background
      >
        {/* Kept the original red-bordered container */}
        <div className="p-6 md:p-8 bg-black border-2 border-red-900 rounded-lg shadow-2xl shadow-red-900/50 w-full max-w-lg">
          {/* Kept the original title */}
          <h3 
            className="text-2xl md:text-3xl text-red-500 flicker-text text-center"
            style={{ fontFamily: 'Bungee, cursive' }}
          >
            THE HASHING CHALLENGE
          </h3>
          {/* Kept the original description */}
          <p className="mt-4 text-gray-300 text-center" style={{ fontFamily: 'Inter, sans-serif' }}>
            The signal is corrupted. Decrypt the message to proceed.
          </p>

          {/* NEW: Terminal window inserted inside the card */}
          {/* NEW: Added onViewportEnter to trigger animation */}
          <motion.div 
            className="p-4 bg-black h-96 overflow-y-auto mt-6 border border-gray-700 rounded"
            style={{ fontFamily: 'Roboto Mono, monospace' }}
            onViewportEnter={() => setStartTerminal(true)}
            viewport={{ once: true, amount: 0.5 }} // Trigger once when 50% is visible
          >
            {/* The typing animation waterfall with delays */}
            {/* NEW: Only render if 'startTerminal' is true */}
            {startTerminal && <TypedLine 
              text="welcome to MIET LAB" 
              prefix={"> "} 
              onComplete={handleStep0} // Use memoized handler
            />}
            
            {startTerminal && step >= 1 && <TypedLine 
              text="CONNECTION LOST..." 
              prefix={"> "} 
              startDelay={0} 
              onComplete={handleStep1} // Use memoized handler
            />}
            
            {startTerminal && step >= 2 && <AnimatedLoader 
              startDelay={0} 
              onComplete={handleStep2} // Use memoized handler
            />}
            
            {startTerminal && step >= 3 && <TypedLine 
              text="WARNING: SYSTEM INTEGRITY" 
              prefix={"> "} 
              startDelay={0} 
              onComplete={handleStep3} // Use memoized handler
            />}
            
            {startTerminal && step >= 4 && <TypedLine 
              text="Neural firewall breached." 
              prefix="[OK] " 
              color="text-green-400" 
              startDelay={0} 
              onComplete={handleStep4} // Use memoized handler
            />}
            
            {startTerminal && step >= 5 && <TypedLine 
              text="Rift stabilization offline" 
              prefix="[ERR] " 
              color="text-red-500" 
              startDelay={0} 
              onComplete={handleStep5} // Use memoized handler
            />}

            {/* Hashing Challenge Input - appears at the end */}
            {startTerminal && step >= 6 && (
              <div className="mt-2">
                {/* The Hashed Word */}
                <div className="my-4 p-2 bg-gray-900 border border-gray-700 rounded-md">
                  <p className="text-sm text-gray-400">ENCRYPTED MESSAGE:</p>
                  <p className="text-xl text-green-400">{hashedWord}</p>
                </div>
                
                {/* The Input Form */}
                <form onSubmit={handleFormSubmit}>
                  <label htmlFor="accessCode" className="text-gray-400">
                    Enter the Acess Code
                  </label>
                  <input 
                    id="accessCode"
                    type="text"
                    value={guess}
                    onChange={(e) => {
                      setGuess(e.target.value.toUpperCase());
                      setMessage(""); // Clear message on new input
                    }}
                    autoFocus
                    className="ml-2 bg-transparent border-none text-white text-sm uppercase focus:outline-none w-1/2"
                    style={{ fontFamily: 'Roboto Mono, monospace' }}
                  />
                  {/* Hidden button to allow "Enter" key submission */}
                  <button type="submit" className="hidden"></button>
                </form>

                {/* Success/Error Message */}
                {message && (
                  <p 
                    className={`mt-2 ${message.startsWith("SUCCESS") ? 'text-green-400' : 'text-red-500'}`}
                  >
                    {message}
                  </p>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </section>
    </motion.div>
  );
}


/**
 * @info
 * This is the main App component.
 * It controls whether the intro or the main site content is visible.
 */
export default function App() {
  const [showIntro, setShowIntro] = useState(true);

  // Hide the intro after a delay
  useEffect(() => {
    // Total intro time:
    // 0.5s (fade-in)
    // + 1.7s (last delay) + 0.6s (draw time) = 2.3s
    // + 0.7s (text fade-in)
    // + 1.0s (hold time)
    // = 4.5s
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 4500); // 4.5 seconds total before triggering the 1s exit animation

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative w-full min-h-screen bg-black">
      <AnimatePresence>
        {showIntro && <IntroAnimation onComplete={() => {}} />}
      </AnimatePresence>

      {/* This is your main landing page content. */}
      {/* --- MODIFIED SECTION --- */}
      {/* This now renders your Stranger Things landing page! */}
      {!showIntro && (
        <StrangerLandingPage />
      )}
    </div>
  );
}

