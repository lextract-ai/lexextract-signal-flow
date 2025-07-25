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
    // Calculate scanner sync delay based on horizontal position
    // Scanner takes 8 seconds and starts from -100%, reaches x% at (x + 100) / 200 * 8 seconds
    const scannerDelay = ((x + 100) / 200) * 8000;
    
    const timer = setTimeout(() => {
      if (isSignal) {
        setIsTransformed(true);
      }
    }, scannerDelay);
    
    return () => clearTimeout(timer);
  }, [isSignal, x]);

  return (
    <div
      className={`absolute text-xs font-sans tracking-wider uppercase select-none whitespace-nowrap transition-all duration-1000 ease-out ${
        isSignal && isTransformed 
          ? 'text-lextract-signature-light opacity-100 z-20' 
          : 'text-gray-400 opacity-60'
      }`}
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: `translate(-50%, -50%)`
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

  // Generate distributed positions using Mitchell's best-candidate algorithm
  const generateDistributedPositions = (count: number, minDistance: number) => {
    const positions = [];
    const centerExclusion = { x: 50, y: 50, width: 40, height: 30 }; // Center exclusion zone
    
    for (let i = 0; i < count; i++) {
      let bestCandidate = null;
      let bestDistance = 0;
      
      // Generate multiple candidates and pick the one furthest from existing points
      for (let j = 0; j < 30; j++) {
        const candidate = {
          x: Math.random() * 100,
          y: Math.random() * 100
        };
        
        // Skip if in center exclusion zone
        if (candidate.x > centerExclusion.x - centerExclusion.width/2 && 
            candidate.x < centerExclusion.x + centerExclusion.width/2 &&
            candidate.y > centerExclusion.y - centerExclusion.height/2 && 
            candidate.y < centerExclusion.y + centerExclusion.height/2) {
          continue;
        }
        
        // Calculate minimum distance to existing points
        let minDistToExisting = Infinity;
        for (const existing of positions) {
          const dist = Math.sqrt(
            Math.pow(candidate.x - existing.x, 2) + 
            Math.pow(candidate.y - existing.y, 2)
          );
          minDistToExisting = Math.min(minDistToExisting, dist);
        }
        
        // Keep candidate if it's the best so far
        if (minDistToExisting > bestDistance) {
          bestDistance = minDistToExisting;
          bestCandidate = candidate;
        }
      }
      
      // Only add if minimum distance is met
      if (bestCandidate && (positions.length === 0 || bestDistance >= minDistance)) {
        positions.push(bestCandidate);
      }
    }
    
    return positions;
  };

  const generateTextElements = () => {
    const positions = generateDistributedPositions(18, 12); // Minimum 12% distance
    const elements = [];
    
    for (let i = 0; i < positions.length; i++) {
      const text = LEGAL_TERMS[Math.floor(Math.random() * LEGAL_TERMS.length)];
      const isSignal = SIGNAL_TERMS.includes(text);
      const { x, y } = positions[i];
      
      elements.push(
        <FloatingText
          key={`${i}-${animationCycle}`}
          text={text}
          isSignal={isSignal}
          delay={0} // Delay is now handled internally based on position
          x={x}
          y={y}
        />
      );
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
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-light text-lextract-signature-dark mb-6 tracking-tight leading-tight">
            Intelligent automation of{' '}
            <span className="font-medium">legal due diligence</span>
          </h1>
          <p className="text-lg md:text-xl text-lextract-signature-dark font-light tracking-wide leading-relaxed max-w-2xl mx-auto">
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