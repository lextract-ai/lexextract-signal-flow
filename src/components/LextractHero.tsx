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

interface KeywordPosition {
  x: number;
  y: number;
  text: string;
  isSignal: boolean;
  scannerDelay: number;
}

interface FloatingTextProps {
  text: string;
  isSignal: boolean;
  x: number;
  y: number;
  scannerDelay: number;
  animationCycle: number;
}

const FloatingText = ({ text, isSignal, x, y, scannerDelay, animationCycle }: FloatingTextProps) => {
  const [isHighlighted, setIsHighlighted] = useState(false);
  
  useEffect(() => {
    if (isSignal) {
      const timer = setTimeout(() => {
        setIsHighlighted(true);
      }, scannerDelay);
      
      return () => clearTimeout(timer);
    }
  }, [isSignal, scannerDelay, animationCycle]);

  return (
    <div
      className={`absolute text-xs font-sans tracking-wider uppercase select-none whitespace-nowrap transition-colors duration-500 ease-out ${
        isSignal && isHighlighted 
          ? 'text-lextract-signal' 
          : 'text-lextract-noise'
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

// Poisson disk sampling for even distribution
const generatePoissonDiskSampling = (
  width: number, 
  height: number, 
  radius: number, 
  k: number = 30
): Array<{x: number, y: number}> => {
  const cellSize = radius / Math.sqrt(2);
  const gridWidth = Math.ceil(width / cellSize);
  const gridHeight = Math.ceil(height / cellSize);
  const grid: Array<Array<{x: number, y: number} | null>> = Array(gridHeight).fill(null).map(() => Array(gridWidth).fill(null));
  
  const activeList: Array<{x: number, y: number}> = [];
  const points: Array<{x: number, y: number}> = [];
  
  // Exclusion zones for headings (center area)
  const exclusionZones = [
    { x: 30, y: 40, width: 40, height: 20 }, // Main heading area
  ];
  
  const isInExclusionZone = (x: number, y: number) => {
    return exclusionZones.some(zone => 
      x >= zone.x && x <= zone.x + zone.width &&
      y >= zone.y && y <= zone.y + zone.height
    );
  };
  
  const getGridPos = (x: number, y: number) => ({
    gridX: Math.floor(x / cellSize),
    gridY: Math.floor(y / cellSize)
  });
  
  const isValidPoint = (x: number, y: number) => {
    if (x < 5 || x > width - 5 || y < 5 || y > height - 5) return false;
    if (isInExclusionZone(x, y)) return false;
    
    const { gridX, gridY } = getGridPos(x, y);
    
    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        const nx = gridX + dx;
        const ny = gridY + dy;
        
        if (nx >= 0 && nx < gridWidth && ny >= 0 && ny < gridHeight && grid[ny][nx]) {
          const neighbor = grid[ny][nx]!;
          const dist = Math.sqrt((x - neighbor.x) ** 2 + (y - neighbor.y) ** 2);
          if (dist < radius) return false;
        }
      }
    }
    
    return true;
  };
  
  // Start with random initial point outside exclusion zones
  let initialPoint;
  let attempts = 0;
  do {
    initialPoint = {
      x: Math.random() * width,
      y: Math.random() * height
    };
    attempts++;
  } while ((!isValidPoint(initialPoint.x, initialPoint.y) || isInExclusionZone(initialPoint.x, initialPoint.y)) && attempts < 100);
  
  if (attempts < 100) {
    const { gridX, gridY } = getGridPos(initialPoint.x, initialPoint.y);
    grid[gridY][gridX] = initialPoint;
    activeList.push(initialPoint);
    points.push(initialPoint);
  }
  
  while (activeList.length > 0 && points.length < 20) {
    const randomIndex = Math.floor(Math.random() * activeList.length);
    const point = activeList[randomIndex];
    let found = false;
    
    for (let i = 0; i < k; i++) {
      const angle = Math.random() * 2 * Math.PI;
      const distance = radius + Math.random() * radius;
      const newX = point.x + Math.cos(angle) * distance;
      const newY = point.y + Math.sin(angle) * distance;
      
      if (isValidPoint(newX, newY)) {
        const { gridX, gridY } = getGridPos(newX, newY);
        const newPoint = { x: newX, y: newY };
        grid[gridY][gridX] = newPoint;
        activeList.push(newPoint);
        points.push(newPoint);
        found = true;
        break;
      }
    }
    
    if (!found) {
      activeList.splice(randomIndex, 1);
    }
  }
  
  return points;
};

export const LextractHero = () => {
  const [animationCycle, setAnimationCycle] = useState(0);
  const [keywordPositions, setKeywordPositions] = useState<KeywordPosition[]>([]);
  
  useEffect(() => {
    // Generate static positions using Poisson disk sampling
    const positions = generatePoissonDiskSampling(100, 100, 8); // 8% minimum distance
    
    const keywords: KeywordPosition[] = positions.slice(0, 16).map((pos, index) => {
      const text = LEGAL_TERMS[index % LEGAL_TERMS.length];
      const isSignal = SIGNAL_TERMS.includes(text);
      
      // Calculate scanner delay: scanner sweeps from left (0%) to right (100%) over 8 seconds
      // When scanner reaches position x%, the delay should be (x/100) * 8000ms
      const scannerDelay = (pos.x / 100) * 8000;
      
      return {
        x: pos.x,
        y: pos.y,
        text,
        isSignal,
        scannerDelay
      };
    });
    
    setKeywordPositions(keywords);
  }, [animationCycle]);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationCycle(prev => prev + 1);
    }, 12000); // Reset every 12 seconds to allow full scanner + transition cycle
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-screen bg-lextract-background overflow-hidden font-sans">
      {/* Background Texture */}
      <div className="absolute inset-0 bg-gradient-to-br from-lextract-background via-white to-lextract-background" />
      
      {/* Static Keywords */}
      <div className="absolute inset-0">
        {keywordPositions.map((keyword, index) => (
          <FloatingText
            key={`${index}-${animationCycle}`}
            text={keyword.text}
            isSignal={keyword.isSignal}
            x={keyword.x}
            y={keyword.y}
            scannerDelay={keyword.scannerDelay}
            animationCycle={animationCycle}
          />
        ))}
      </div>
      
      {/* Vertical Beam Sweep (Left to Right) */}
      <div 
        className="absolute inset-0 vertical-beam-sweep z-10"
        key={`beam-${animationCycle}`}
      />
      
      {/* Enhanced Grid Overlay */}
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
      
      {/* Main Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-40 px-8">
        <div className="text-center max-w-4xl">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-light text-lextract-text-primary mb-6 tracking-tight leading-tight">
            Intelligent automation of{' '}
            <span className="font-medium">legal due diligence</span>
          </h1>
          <p className="text-lg md:text-xl text-lextract-text-secondary font-light tracking-wide leading-relaxed max-w-2xl mx-auto">
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