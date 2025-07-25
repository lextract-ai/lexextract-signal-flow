import { useEffect, useState, useMemo } from "react";

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
  x: number;
  y: number;
  animationCycle: number;
}

const FloatingText = ({ text, isSignal, x, y, animationCycle }: FloatingTextProps) => {
  const [scannerProgress, setScannerProgress] = useState(0);
  
  useEffect(() => {
    const startTime = Date.now();
    const duration = 8000; // 8 seconds beam sweep
    
    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setScannerProgress(progress);
      
      if (progress < 1) {
        requestAnimationFrame(updateProgress);
      }
    };
    
    updateProgress();
  }, [animationCycle]);

  // Calculate if scanner has passed this text position
  const scannerX = scannerProgress * 100;
  const hasBeenScanned = scannerX >= x;
  const isCurrentlyScanning = scannerX >= x - 5 && scannerX <= x + 5;
  
  // Determine text state
  let textClass = 'text-lextract-noise opacity-60';
  
  if (isSignal) {
    if (isCurrentlyScanning) {
      textClass = 'text-lextract-electric opacity-100 scale-105 shadow-sm';
    } else if (hasBeenScanned) {
      textClass = 'text-lextract-teal opacity-90 scale-102';
    }
  } else if (isCurrentlyScanning) {
    textClass = 'text-lextract-signature-dark opacity-80';
  }

  return (
    <div
      className={`absolute text-xs md:text-sm font-sans tracking-wider uppercase select-none whitespace-nowrap transition-all duration-300 ease-in-out ${textClass}`}
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: `translate(-50%, -50%)`,
        textShadow: isCurrentlyScanning && isSignal ? '0 0 8px hsl(var(--lextract-electric) / 0.4)' : 'none'
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

  // Static text layout that doesn't change
  const staticTextElements = useMemo(() => {
    const elements = [];
    const usedPositions = new Set();
    
    // Enhanced grid system for better mobile support
    const gridCols = 12; // More columns for finer control
    const gridRows = 10; // More rows for better distribution
    const minDistance = 2; // Minimum grid cell distance between words
    
    // Define exclusion zone for title/subtitle (center area)
    const excludeZone = {
      colStart: 3, // Exclude columns 3-8 (center 50% width)
      colEnd: 8,
      rowStart: 3, // Exclude rows 3-6 (center area)
      rowEnd: 6
    };
    
    // Predefined layout for consistency
    const termLayouts = [
      { text: "Force Majeure", col: 1, row: 1 },
      { text: "Change of Control", col: 10, row: 1, isSignal: true },
      { text: "Due Diligence", col: 0, row: 3 },
      { text: "Governing Law", col: 11, row: 3, isSignal: true },
      { text: "Confidentiality", col: 1, row: 7 },
      { text: "Termination", col: 9, row: 7, isSignal: true },
      { text: "Liability Cap", col: 0, row: 8 },
      { text: "AGB", col: 11, row: 8, isSignal: true },
      { text: "Arbitration Clause", col: 2, row: 0 },
      { text: "Shareholder Agreement", col: 8, row: 0, isSignal: true },
      { text: "Amendment", col: 0, row: 5 },
      { text: "Jurisdiction", col: 11, row: 5 },
      { text: "Escrow", col: 2, row: 9 },
      { text: "Joint Venture", col: 9, row: 9 },
      { text: "Breach of Contract", col: 1, row: 2 },
      { text: "Intellectual Property", col: 10, row: 2 }
    ];
    
    termLayouts.forEach((layout, i) => {
      const { text, col, row, isSignal = false } = layout;
      const gridPos = `${col}-${row}`;
      
      // Ensure minimum distance between words
      let isValidPosition = true;
      for (const usedPos of usedPositions) {
        const [usedCol, usedRow] = (usedPos as string).split('-').map(Number);
        const distance = Math.sqrt(Math.pow(col - usedCol, 2) + Math.pow(row - usedRow, 2));
        if (distance < minDistance) {
          isValidPosition = false;
          break;
        }
      }
      
      if (isValidPosition) {
        usedPositions.add(gridPos);
        
        // Calculate responsive positioning
        const x = (col / gridCols) * 90 + 5; // 5% to 95% width with padding
        const y = (row / gridRows) * 75 + 12.5; // 12.5% to 87.5% height
        
        elements.push(
          <FloatingText
            key={`static-${i}`}
            text={text}
            isSignal={isSignal}
            x={x}
            y={y}
            animationCycle={animationCycle}
          />
        );
      }
    });
    
    return elements;
  }, [animationCycle]); // Add animationCycle as dependency

  return (
    <div className="relative w-full h-screen bg-lextract-background overflow-hidden font-sans">
      {/* Background Texture */}
      <div className="absolute inset-0 bg-gradient-to-br from-lextract-background via-white to-lextract-background" />
      
      {/* Floating Legal Text */}
      <div className="absolute inset-0">
        {staticTextElements}
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