import { useEffect, useState } from "react";

const LEGAL_TERMS = [
  "Force Majeure", "Indemnification", "Liquidated Damages", "Material Adverse Change",
  "Change of Control", "Governing Law", "Termination", "AGB", "Shareholder Agreement",
  "Due Diligence", "Confidentiality", "Non-Disclosure", "Intellectual Property",
  "Breach of Contract", "Liability Cap", "Jurisdiction",
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
  const [transitionProgress, setTransitionProgress] = useState(0);
  
  useEffect(() => {
    if (!isSignal) return;
    
    const startTime = 2000; // Scanner starts at 2s
    const scanDuration = 6000; // Scanner takes 6s to cross screen
    const textPosition = x / 100; // Convert percentage to 0-1
    const scanStart = startTime + (textPosition * scanDuration);
    const transitionDuration = 2000; // 2s transition
    
    const timer = setTimeout(() => {
      // Animate transition progress from 0 to 1 over transitionDuration
      const interval = setInterval(() => {
        setTransitionProgress(prev => {
          const next = prev + (16 / transitionDuration); // 16ms intervals
          if (next >= 1) {
            clearInterval(interval);
            return 1;
          }
          return next;
        });
      }, 16);
      
      return () => clearInterval(interval);
    }, scanStart);
    
    return () => clearTimeout(timer);
  }, [isSignal, x, animationCycle]);

  // Reset transition progress when animation cycle changes
  useEffect(() => {
    setTransitionProgress(0);
  }, [animationCycle]);

  const getInterpolatedColor = () => {
    if (!isSignal || transitionProgress === 0) {
      return 'hsl(var(--lextract-noise))';
    }
    
    // Interpolate between noise color and signal color
    const noiseHsl = [186, 18, 45]; // --lextract-noise
    const signalHsl = [184, 94, 51]; // --lextract-signal
    
    const h = noiseHsl[0] + (signalHsl[0] - noiseHsl[0]) * transitionProgress;
    const s = noiseHsl[1] + (signalHsl[1] - noiseHsl[1]) * transitionProgress;
    const l = noiseHsl[2] + (signalHsl[2] - noiseHsl[2]) * transitionProgress;
    
    return `hsl(${h}, ${s}%, ${l}%)`;
  };

  const getOpacity = () => {
    if (!isSignal) return 0.35;
    return 0.35 + (0.65 * transitionProgress);
  };

  const getTextShadow = () => {
    if (!isSignal || transitionProgress === 0) return 'none';
    const shadowOpacity = 0.6 * transitionProgress;
    return `0 0 8px hsl(var(--lextract-signal) / ${shadowOpacity})`;
  };

  return (
    <div
      className="absolute text-xs font-sans tracking-wider uppercase select-none whitespace-nowrap text-transitioning"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: `translate(-50%, -50%) scale(${1 + (0.1 * transitionProgress)})`,
        color: getInterpolatedColor(),
        opacity: getOpacity(),
        textShadow: getTextShadow(),
        zIndex: isSignal && transitionProgress > 0 ? 20 : 10
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
    // Fixed seed for consistent layout across animation cycles
    const seed = 12345;
    let random = seed;
    const seededRandom = () => {
      random = (random * 9301 + 49297) % 233280;
      return random / 233280;
    };

    const elements = [];
    const positions = [];
    const minDistance = 8; // Minimum distance between keywords (in percentage)
    
    // Define exclusion zone for title/subtitle (responsive)
    const excludeZone = {
      xMin: 15, xMax: 85, // Center 70% horizontally
      yMin: 25, yMax: 75  // Center 50% vertically
    };
    
    // Generate fixed positions using Poisson disk sampling
    const maxAttempts = 30;
    const targetCount = 16;
    
    for (let i = 0; i < targetCount; i++) {
      let validPosition = null;
      let attempts = 0;
      
      while (!validPosition && attempts < maxAttempts) {
        const x = seededRandom() * 90 + 5; // 5% to 95%
        const y = seededRandom() * 85 + 7.5; // 7.5% to 92.5%
        
        // Check if position is in exclusion zone
        const inExclusionZone = x >= excludeZone.xMin && x <= excludeZone.xMax && 
                               y >= excludeZone.yMin && y <= excludeZone.yMax;
        
        if (!inExclusionZone) {
          // Check distance from other positions
          const tooClose = positions.some(pos => {
            const distance = Math.sqrt(Math.pow(x - pos.x, 2) + Math.pow(y - pos.y, 2));
            return distance < minDistance;
          });
          
          if (!tooClose) {
            validPosition = { x, y };
          }
        }
        attempts++;
      }
      
      if (validPosition) {
        positions.push(validPosition);
      }
    }
    
    // Assign terms to fixed positions
    positions.forEach((pos, i) => {
      const termIndex = i % LEGAL_TERMS.length;
      const text = LEGAL_TERMS[termIndex];
      const isSignal = SIGNAL_TERMS.includes(text);
      
      elements.push(
        <FloatingText
          key={`${text}-${pos.x}-${pos.y}`}
          text={text}
          isSignal={isSignal}
          x={pos.x}
          y={pos.y}
          animationCycle={animationCycle}
        />
      );
    });
    
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