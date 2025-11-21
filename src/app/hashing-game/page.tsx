"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Orbitron, Rajdhani } from 'next/font/google';
import { useConvexAuth, useQuery, useMutation } from "convex/react";
import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { api } from "../../../convex/_generated/api";

const orbitron = Orbitron({ subsets: ['latin'], weight: ['400', '700', '900'] });
const rajdhani = Rajdhani({ subsets: ['latin'], weight: ['500', '600', '700'] });

// --- CHALLENGE DATA ---
type Challenge = {
  id: number;
  hash: string;
  original: string;
  type: "Base64" | "MD4" | "DES" | "AES"; 
  hint: string;
  span?: number; 
};


const CHALLENGES: Challenge[] = [
  { id: 1, hash: "U1lTVEVN", original: "SYSTEM", type: "Base64", hint: "Standard-64", span: 1 },
  { id: 2, hash: "TmV4dEpT", original: "NEXTJS", type: "Base64", hint: "Standard-64", span: 1 },
  { id: 11, hash: "8d3776b381f792577d965c53f47499f9", original: "LINUX", type: "MD4", hint: "Legacy-128", span: 2 },
  { id: 21, hash: "3b7a9f8c2d1e5b4a6f0e8d2c9b1a3f5e", original: "NETWORK", type: "AES", hint: "Military-256", span: 2 },
  { id: 3, hash: "Q1JZUFRP", original: "CRYPTO", type: "Base64", hint: "Standard-64", span: 1 },
  { id: 4, hash: "U0VSVkVS", original: "SERVER", type: "Base64", hint: "Standard-64", span: 1 },
  { id: 5, hash: "REVCVUc=", original: "DEBUG", type: "Base64", hint: "Standard-64", span: 1 },
  { id: 13, hash: "f3282652c7f27d284579222d0408229d", original: "GITHUB", type: "MD4", hint: "Legacy-128", span: 2 },
  { id: 6, hash: "V0VCMw==", original: "WEB3", type: "Base64", hint: "Standard-64", span: 1 },
  { id: 22, hash: "9a2b3c4d5e6f708192a3b4c5d6e7f809", original: "SECURITY", type: "AES", hint: "Military-256", span: 2 },
  { id: 23, hash: "81dc9bdb52d04dc2", original: "ENCRYPTION", type: "DES", hint: "Retro-56", span: 2 },
  { id: 7, hash: "QkxPQ0s=", original: "BLOCK", type: "Base64", hint: "Standard-64", span: 1 },
  { id: 8, hash: "Q0hBSU4=", original: "CHAIN", type: "Base64", hint: "Standard-64", span: 1 },
  { id: 9, hash: "VE9LRU4=", original: "TOKEN", type: "Base64", hint: "Standard-64", span: 1 },
  { id: 10, hash: "REVQTE9Z", original: "DEPLOY", type: "Base64", hint: "Standard-64", span: 1 },
  { id: 16, hash: "e10adc3949ba59abbe56e057f20f883e", original: "123456", type: "MD4", hint: "Legacy-128", span: 2 },
  { id: 17, hash: "046745c72f13b9747492124624412434", original: "CODER", type: "MD4", hint: "Legacy-128", span: 2 },
  { id: 18, hash: "db512914a57d223515c881483156e158", original: "TAILWIND", type: "MD4", hint: "Legacy-128", span: 2 },
  { id: 24, hash: "ff00a2b3c4d5e6f7", original: "FIREWALL", type: "DES", hint: "Retro-56", span: 2 },
];

export default function HashingGamePage() {
  const { isAuthenticated } = useConvexAuth();
  const { user } = useUser(); 
  
  // --- BACKEND HOOKS ---
  const storeUser = useMutation(api.games.storeUser);
  const submitSolve = useMutation(api.games.submitSolve);
  const leaderboard = useQuery(api.games.getLeaderboard) || [];
  const solvedIds = useQuery(api.games.getUserProgress) || [];

  // --- LOCAL STATE ---
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [feedback, setFeedback] = useState<"idle" | "success" | "error">("idle");
  const [showMobileLeaderboard, setShowMobileLeaderboard] = useState(false); // New: Mobile Toggle

  useEffect(() => {
    if (isAuthenticated) {
      storeUser();
    }
  }, [isAuthenticated, storeUser]);

  const selectedChallenge = CHALLENGES.find(c => c.id === selectedId);
  const isSolved = (id: number) => solvedIds.includes(id);

  const handleSelect = (id: number) => {
    if (!isAuthenticated) return;
    if (!isSolved(id)) {
      setSelectedId(id);
      setInputValue("");
      setFeedback("idle");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChallenge) return;

    if (inputValue.trim().toUpperCase() === selectedChallenge.original.toUpperCase()) {
      setFeedback("success");
      await submitSolve({ 
        challengeId: selectedChallenge.id, 
        points: 100 
      });
      setTimeout(() => {
        setSelectedId(null);
        setFeedback("idle");
      }, 1000);
    } else {
      setFeedback("error");
      setTimeout(() => setFeedback("idle"), 1500);
    }
  };

  return (
    // Added overflow-hidden to prevent body scroll when modal/sidebar is open
    <div className="h-screen bg-[#0a0a0a] text-white relative overflow-hidden flex flex-col">
      
      {/* --- HEADER --- */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/80 backdrop-blur-md z-40 flex-shrink-0">
        <div className="flex items-center gap-4">
            {/* Mobile Leaderboard Toggle */}
            <button 
              onClick={() => setShowMobileLeaderboard(true)}
              className="md:hidden p-2 text-yellow-500 border border-yellow-500/30 rounded hover:bg-yellow-900/20"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
              </svg>
            </button>

            <Link href="/">
              <div className="relative w-10 h-10 md:w-12 md:h-12 cursor-pointer">
                <Image src="/mlsa.jpg" alt="MLSA Logo" fill className="object-contain"/>
              </div>
            </Link>
            <span className={`${orbitron.className} hidden md:block text-xl font-bold tracking-wider text-blue-500`}>
              MLSA <span className="text-white">DECRYPT</span>
            </span>
        </div>

        {/* AUTH */}
        <div className="flex items-center gap-4">
           {isAuthenticated ? (
             <div className="flex items-center gap-3 px-4 py-2 bg-blue-900/20 border border-blue-500/30 rounded-full">
                <UserButton afterSignOutUrl="/" />
                <span className={`${orbitron.className} text-blue-400 text-sm tracking-widest`}>
                  {user?.username || user?.firstName || "AGENT"}
                </span>
             </div>
           ) : (
             <SignInButton mode="modal" forceRedirectUrl="/">
                <button className={`${orbitron.className} text-red-500 hover:text-red-400 transition-colors animate-pulse`}>
                  LOGIN_REQUIRED
                </button>
             </SignInButton>
           )}
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        
        {/* --- LEADERBOARD SIDEBAR (DESKTOP) --- */}
        {/* Hidden on mobile, visible on md+ */}
        <aside className="hidden md:block w-1/4 lg:w-1/5 border-r border-white/10 bg-black/40 p-6 overflow-y-auto custom-scrollbar">
           <h2 className={`${orbitron.className} text-xl text-yellow-500 mb-6 flex items-center gap-2 sticky top-0 bg-black/90 p-2 z-10`}>
             <span className="text-2xl">🏆</span> HALL OF FAME
           </h2>
           {leaderboard.length === 0 && (
             <div className="text-gray-500 text-sm italic">Syncing Neural Net...</div>
           )}
           <div className="space-y-4 pb-20">
             {leaderboard.map((entry, index) => (
               <div key={entry._id} className="bg-white/5 p-3 rounded border border-white/10 flex items-center justify-between group hover:border-yellow-500/50 transition-colors">
                 <div className="flex items-center gap-3">
                   <span className={`${orbitron.className} text-2xl font-bold text-gray-600 group-hover:text-yellow-500`}>
                     #{index + 1}
                   </span>
                   <div>
                     <p className={`${rajdhani.className} font-bold text-white leading-tight max-w-[100px] truncate`}>
                       {entry.name}
                     </p>
                     <div className="flex gap-3 text-xs text-gray-500 font-mono mt-1">
                        <span className="text-blue-400">PTS: {entry.score}</span>
                        <span className="text-green-400">✓ {entry.solvedChallenges?.length || 0}</span>
                     </div>
                   </div>
                 </div>
               </div>
             ))}
           </div>
        </aside>

        {/* --- LEADERBOARD SIDEBAR (MOBILE DRAWER) --- */}
        <AnimatePresence>
          {showMobileLeaderboard && (
            <>
              {/* Backdrop */}
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setShowMobileLeaderboard(false)}
                className="fixed inset-0 bg-black/80 z-50 md:hidden backdrop-blur-sm"
              />
              {/* Drawer */}
              <motion.aside 
                initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed inset-y-0 left-0 w-3/4 max-w-xs bg-[#0a0a0a] border-r border-blue-500/30 z-50 p-6 overflow-y-auto md:hidden"
              >
                 <div className="flex justify-between items-center mb-6">
                   <h2 className={`${orbitron.className} text-xl text-yellow-500 flex items-center gap-2`}>
                     <span className="text-2xl">🏆</span> RANKING
                   </h2>
                   <button onClick={() => setShowMobileLeaderboard(false)} className="text-gray-500 p-2">✕</button>
                 </div>
                 
                 <div className="space-y-4">
                   {leaderboard.map((entry, index) => (
                     <div key={entry._id} className="bg-white/5 p-3 rounded border border-white/10 flex items-center justify-between">
                       <div className="flex items-center gap-3">
                         <span className={`${orbitron.className} text-xl font-bold text-gray-600`}>#{index + 1}</span>
                         <div>
                           <p className={`${rajdhani.className} font-bold text-white truncate max-w-[120px]`}>{entry.name}</p>
                           <span className="text-xs text-blue-400 font-mono">PTS: {entry.score}</span>
                         </div>
                       </div>
                     </div>
                   ))}
                 </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* --- GAME GRID AREA --- */}
        <section className="flex-1 p-6 md:p-10 overflow-y-auto h-full">
          <div className="flex justify-between items-end mb-8">
             <div>
               <h1 className={`${orbitron.className} text-2xl md:text-4xl font-bold text-white mb-2`}>
                 HASHING GRID
               </h1>
               <p className={`${rajdhani.className} text-gray-400 text-sm md:text-base`}>
                 Identify the algorithm. Breach the firewall.
               </p>
             </div>
             <div className="text-right">
               <p className={`${orbitron.className} text-2xl text-blue-500`}>
                 {solvedIds.length} / {CHALLENGES.length}
               </p>
               <p className="text-[10px] md:text-xs text-gray-500 uppercase tracking-widest">Decrypted</p>
             </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-32">
            {CHALLENGES.map((challenge) => {
              const solved = isSolved(challenge.id);
              return (
                <motion.button
                  key={challenge.id}
                  onClick={() => handleSelect(challenge.id)}
                  disabled={solved || !isAuthenticated}
                  className={`
                    relative h-24 md:h-28 rounded-lg border-2 flex flex-col items-center justify-center p-2 md:p-4 overflow-hidden transition-all duration-300
                    ${challenge.span === 2 ? 'col-span-2' : 'col-span-1'}
                    ${solved 
                      ? "bg-green-900/20 border-green-500/50 cursor-default" 
                      : !isAuthenticated 
                        ? "bg-red-900/10 border-red-900/30 opacity-50 cursor-not-allowed"
                        : "bg-gray-900/40 border-gray-700 hover:border-blue-500 hover:bg-blue-900/10 cursor-pointer"
                    }
                  `}
                  whileHover={(!solved && isAuthenticated) ? { scale: 1.02 } : {}}
                  whileTap={(!solved && isAuthenticated) ? { scale: 0.98 } : {}}
                >
                  <div className={`absolute top-2 right-2 w-2 h-2 rounded-full ${solved ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-red-500'}`}></div>
                  
                  <span className={`
                    ${rajdhani.className} font-mono text-sm md:text-base break-all text-center w-full px-2
                    ${solved ? 'text-green-400' : 'text-gray-300'}
                  `}>
                    {solved ? "ACCESS GRANTED" : challenge.hash}
                  </span>
                  
                  {solved && (
                    <span className="absolute bottom-1 text-[8px] md:text-[10px] uppercase tracking-widest text-green-600 font-bold">
                      VERIFIED
                    </span>
                  )}
                </motion.button>
              );
            })}
          </div>
        </section>

      </div>

      {/* --- INPUT MODAL (FIXED CENTER) --- */}
      {/* z-50 ensures it's above everything. Fixed inset-0 centers it relative to viewport */}
      <AnimatePresence>
        {selectedId && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md md:max-w-lg bg-[#0a0a0a] border border-blue-500/30 rounded-xl p-6 md:p-8 shadow-2xl relative"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
              <button onClick={() => setSelectedId(null)} className="absolute top-4 right-4 text-gray-500 hover:text-white p-2">✕</button>

              <div className="text-center space-y-6">
                <div>
                  <p className="text-blue-500 text-xs tracking-[0.2em] mb-3 uppercase font-bold">
                    Protocol: {selectedChallenge?.hint}
                  </p>
                  <div className="bg-black/50 p-3 rounded border border-white/10 break-all max-h-32 overflow-y-auto">
                    <h2 className={`${orbitron.className} text-lg md:text-2xl text-white`}>
                      {selectedChallenge?.hash}
                    </h2>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <input 
                    type="text" autoFocus value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Enter decrypted value..."
                    className="w-full bg-gray-900/50 border border-gray-600 focus:border-blue-500 focus:bg-black text-center text-lg py-3 rounded-lg text-white outline-none font-mono transition-all"
                  />
                  <button type="submit" className={`
                    w-full py-3 rounded-lg font-bold tracking-widest uppercase transition-all duration-300
                    ${feedback === 'success' ? 'bg-green-600 text-white' : 
                      feedback === 'error' ? 'bg-red-600 text-white' : 
                      'bg-blue-600 hover:bg-blue-500 text-white'}
                  `}>
                    {feedback === 'success' ? 'ACCESS GRANTED' : feedback === 'error' ? 'INVALID HASH' : 'UNLOCK BLOCK'}
                  </button>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}