import { useEffect, useState } from "react";

const LEGAL_TERMS = [
  "Force Majeure", "Indemnification", "Material Adverse Change",
  "Change of Control", "Governing Law", "Termination", 
  "Due Diligence", "Confidentiality", "Intellectual Property",
  "Liability Cap", "Arbitration", "Jurisdiction",
  "Amendment", "Warranties", "Covenants",
  "Merger", "Joint Venture", "Escrow"
];

const SIGNAL_TERMS = ["Change of Control", "Governing Law", "Termination"];

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
    // Create a balanced grid-based distribution
    const elements = [];
    
    // Responsive exclusion zones based on viewport
    const isMobile = window.innerWidth < 768;
    const isTablet = window.innerWidth < 1024;
    
    let excludeZone, gridConfig;
    
    if (isMobile) {
      excludeZone = { xMin: 10, xMax: 90, yMin: 20, yMax: 80 };
      gridConfig = { rows: 3, cols: 2, targetCount: 6 };
    } else if (isTablet) {
      excludeZone = { xMin: 15, xMax: 85, yMin: 25, yMax: 75 };
      gridConfig = { rows: 3, cols: 3, targetCount: 8 };
    } else {
      excludeZone = { xMin: 20, xMax: 80, yMin: 30, yMax: 70 };
      gridConfig = { rows: 3, cols: 4, targetCount: 10 };
    }
    
    // Create strategic zones around the exclusion area
    const zones = [
      // Top area
      { xMin: 10, xMax: 90, yMin: 5, yMax: excludeZone.yMin - 5 },
      // Bottom area  
      { xMin: 10, xMax: 90, yMin: excludeZone.yMax + 5, yMax: 95 },
      // Left side
      { xMin: 5, xMax: excludeZone.xMin - 5, yMin: 15, yMax: 85 },
      // Right side
      { xMin: excludeZone.xMax + 5, xMax: 95, yMin: 15, yMax: 85 }
    ];
    
    // Distribute keywords strategically across zones
    const positions = [];
    let termIndex = 0;
    
    zones.forEach((zone, zoneIndex) => {
      const keywordsPerZone = Math.ceil(gridConfig.targetCount / zones.length);
      const zoneWidth = zone.xMax - zone.xMin;
      const zoneHeight = zone.yMax - zone.yMin;
      
      for (let i = 0; i < keywordsPerZone && termIndex < gridConfig.targetCount; i++) {
        // Create balanced distribution within each zone
        const xStep = zoneWidth / (keywordsPerZone + 1);
        const yStep = zoneHeight / 2;
        
        const x = zone.xMin + xStep * (i + 1) + (Math.random() - 0.5) * 10;
        const y = zone.yMin + yStep * (i % 2 + 1) + (Math.random() - 0.5) * 8;
        
        // Ensure position is within bounds and not too close to others
        const clampedX = Math.max(5, Math.min(95, x));
        const clampedY = Math.max(8, Math.min(92, y));
        
        const validPosition = positions.every(pos => {
          const distance = Math.sqrt(Math.pow(clampedX - pos.x, 2) + Math.pow(clampedY - pos.y, 2));
          return distance >= (isMobile ? 15 : 12);
        });
        
        if (validPosition) {
          positions.push({ x: clampedX, y: clampedY });
          termIndex++;
        }
      }
    });
    
    // Create elements from positions
    positions.forEach((pos, i) => {
      const text = LEGAL_TERMS[i % LEGAL_TERMS.length];
      const isSignal = SIGNAL_TERMS.includes(text);
      
      elements.push(
        <FloatingText
          key={`${text}-${pos.x}-${pos.y}-${i}`}
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