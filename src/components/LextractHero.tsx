import { useEffect, useState } from "react";

const LEGAL_TERMS = [
  "Force Majeure", "Indemnification", "Liquidated Damages", "Material Adverse Change",
  "Change of Control", "Governing Law", "Termination", "AGB", "Shareholder Agreement",
  "Due Diligence", "Confidentiality", "Non-Disclosure", "Intellectual Property",
  "Breach of Contract", "Liability Cap", "Arbitration Clause", "Jurisdiction",
  "Severability", "Amendment", "Waiver", "Counterpart", "Electronic Signature",
  "Representations", "Warranties", "Covenants", "Conditions Precedent",
  "Merger", "Acquisition", "Joint Venture", "Partnership Agreement",
  "Stock Purchase", "Asset Purchase", "Escrow", "Earnout", "Closing Conditions"
];

const SIGNAL_TERMS = ["Change of Control", "Governing Law", "Termination", "AGB", "Shareholder Agreement"];

interface FloatingTextProps {
  text: string;
  isSignal: boolean;
  delay: number;
  x: number;
  y: number;
}

const FloatingText = ({ text, isSignal, delay, x, y }: FloatingTextProps) => {
  const [isTransformed, setIsTransformed] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isSignal) {
        setIsTransformed(true);
      }
    }, delay);
    
    return () => clearTimeout(timer);
  }, [isSignal, delay]);

  return (
    <div
      className={`absolute text-xs font-sans tracking-wider uppercase select-none whitespace-nowrap ${
        isSignal && isTransformed 
          ? 'text-signal-glow opacity-100 scale-110 z-20' 
          : 'text-noise'
      }`}
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: `translate(-50%, -50%)`,
        textShadow: isSignal && isTransformed ? '0 0 8px hsl(var(--lextract-signature-light) / 0.6)' : 'none'
      }}
    >
      {text}
    </div>
  );
};

export const LextractHero = () => {
  const [animationCycle, setAnimationCycle] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationCycle(prev => prev + 1);
    }, 8000); // Reset beam every 8 seconds
    
    return () => clearInterval(interval);
  }, []);

  const generateTextElements = () => {
    const elements = [];
    const usedPositions = new Set();
    
    // Create a grid system to prevent overlapping - reduced density
    const gridCols = 10;
    const gridRows = 8; // Increased rows to have more options while excluding center
    
    // Define exclusion zone for title/subtitle (center area)
    const excludeZone = {
      colStart: 2, // Exclude columns 2-7 (center 60% width)
      colEnd: 7,
      rowStart: 2, // Exclude rows 2-5 (center area)
      rowEnd: 5
    };
    
    // Reduced number of terms by ~40% (from 30 to 18)
    for (let i = 0; i < 18; i++) {
      const text = LEGAL_TERMS[Math.floor(Math.random() * LEGAL_TERMS.length)];
      const isSignal = SIGNAL_TERMS.includes(text);
      
      // Find an available grid position outside exclusion zone
      let gridPos;
      let attempts = 0;
      do {
        const col = Math.floor(Math.random() * gridCols);
        const row = Math.floor(Math.random() * gridRows);
        
        // Check if position is in exclusion zone
        const inExclusionZone = col >= excludeZone.colStart && 
                               col <= excludeZone.colEnd && 
                               row >= excludeZone.rowStart && 
                               row <= excludeZone.rowEnd;
        
        if (!inExclusionZone) {
          gridPos = `${col}-${row}`;
        }
        attempts++;
      } while ((!gridPos || usedPositions.has(gridPos)) && attempts < 100);
      
      if (attempts < 100 && gridPos) {
        usedPositions.add(gridPos);
        
        const [col, row] = gridPos.split('-').map(Number);
        const x = (col / gridCols) * 85 + 7.5; // 7.5% to 92.5% width
        const y = (row / gridRows) * 80 + 10; // 10% to 90% height
        const delay = Math.random() * 4000 + (isSignal ? 3000 : 0);
        
        elements.push(
          <FloatingText
            key={`${i}-${animationCycle}`}
            text={text}
            isSignal={isSignal}
            delay={delay}
            x={x}
            y={y}
          />
        );
      }
    }
    
    return elements;
  };

  return (
    <div className="relative w-full h-screen bg-lextract-background overflow-hidden font-sans">
      {/* Background Texture */}
      <div className="absolute inset-0 bg-gradient-to-br from-lextract-background via-white to-lextract-background" />
      
      {/* Floating Legal Text */}
      <div className="absolute inset-0">
        {generateTextElements()}
      </div>
      
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
        <div className="text-center max-w-4xl">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-light text-lextract-black mb-6 tracking-tight leading-tight">
            We build AI that{' '}
            <span className="text-lextract-signature-dark font-medium">speaks legal</span>
          </h1>
          <p className="text-lg md:text-xl text-lextract-text-secondary font-light tracking-wide leading-relaxed max-w-2xl mx-auto">
            Lextract helps deal lawyers cut through complexity with explainable, precision AI.
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