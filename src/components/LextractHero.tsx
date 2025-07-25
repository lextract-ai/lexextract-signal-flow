import { useEffect, useState, useRef } from "react";
import { KeywordCloud } from "./KeywordCloud";

export const LextractHero = () => {
  const [animationCycle, setAnimationCycle] = useState(0);
  const [scannerProgress, setScannerProgress] = useState(0);
  const headingRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationCycle(prev => prev + 1);
      setScannerProgress(0); // Reset scanner progress
    }, 8000); // Reset beam every 8 seconds
    
    return () => clearInterval(interval);
  }, []);

  // Track scanner progress for keyword highlighting
  useEffect(() => {
    const startDelay = 2000; // Scanner starts at 2s
    const scanDuration = 6000; // Scanner takes 6s to cross screen
    
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        setScannerProgress(prev => {
          const next = prev + (16 / scanDuration); // 16ms intervals
          if (next >= 1) {
            clearInterval(interval);
            return 1;
          }
          return next;
        });
      }, 16);
      
      return () => clearInterval(interval);
    }, startDelay);
    
    return () => clearTimeout(timer);
  }, [animationCycle]);

  return (
    <div className="relative w-full h-screen bg-lextract-background overflow-hidden font-sans">
      {/* Background Texture */}
      <div className="absolute inset-0 bg-gradient-to-br from-lextract-background via-white to-lextract-background" />
      
      {/* Keyword Cloud */}
      <KeywordCloud 
        animationCycle={animationCycle}
        scannerProgress={scannerProgress}
        headingRef={headingRef}
      />
      
      {/* Vertical Beam Sweep (Left to Right) */}
      <div 
        className="absolute inset-0 vertical-beam-sweep z-10"
        key={`beam-${animationCycle}`}
      />
      
      {/* Enhanced Grid Overlay with Scanlines */}
      <div 
        className="absolute inset-0 opacity-[0.12] z-5"
        style={{
          backgroundImage: `
            linear-gradient(hsl(var(--lextract-signature-dark) / 0.2) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--lextract-signature-dark) / 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />
      
      {/* Vertical Scanlines */}
      <div 
        className="absolute inset-0 opacity-[0.08] z-5"
        style={{
          backgroundImage: `linear-gradient(90deg, transparent 0%, hsl(var(--lextract-signature-dark) / 0.15) 50%, transparent 100%)`,
          backgroundSize: '3px 100%',
          animation: 'scanlineMove 12s linear infinite'
        }}
      />
      
      {/* Main Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-40 px-8">
        <div ref={headingRef} className="text-center max-w-4xl">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-light text-lextract-signature-dark mb-6 tracking-tight leading-tight font-roboto">
            Intelligent automation of{' '}
            <span className="text-lextract-signature-dark font-medium">legal due diligence</span>
          </h1>
          <p className="text-lg md:text-xl text-lextract-signature-dark font-light tracking-wide leading-relaxed max-w-2xl mx-auto font-roboto">
            Streamline complex legal processes with AI-driven precision and ease.
          </p>
        </div>
      </div>
      
      {/* Signal Wave Pattern at Bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-1 z-10">
        <div className="signal-wave h-full origin-left" />
      </div>
    </div>
  );
};