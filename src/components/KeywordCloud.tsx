import { useEffect, useState, useRef } from "react";
import { FloatingKeyword } from "./FloatingKeyword";

const LEGAL_TERMS = [
  "Force Majeure", "Indemnification", "Material Adverse Change",
  "Change of Control", "Governing Law", "Termination", 
  "EXPIRING TERMS", "Confidentiality", "Intellectual Property",
  "Liability Cap", "Arbitration", "Jurisdiction",
  "Amendment", "Warranties", "Covenants",
  "Merger", "Joint Venture", "Escrow"
];

const SIGNAL_TERMS = ["Change of Control", "Governing Law", "Termination"];

const COLLISION_MARGIN = 16; // px

interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface KeywordPosition {
  text: string;
  isSignal: boolean;
  x: number;
  y: number;
}

interface KeywordCloudProps {
  animationCycle: number;
  scannerProgress: number;
  headingRef: React.RefObject<HTMLElement>;
}

export const KeywordCloud = ({ animationCycle, scannerProgress, headingRef }: KeywordCloudProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [keywordPositions, setKeywordPositions] = useState<KeywordPosition[]>([]);

  const isOverlapping = (a: BoundingBox, b: BoundingBox): boolean => {
    return !(
      a.x + a.width + COLLISION_MARGIN < b.x ||
      b.x + b.width + COLLISION_MARGIN < a.x ||
      a.y + a.height + COLLISION_MARGIN < b.y ||
      b.y + b.height + COLLISION_MARGIN < a.y
    );
  };

  const generateKeywordPositions = (): KeywordPosition[] => {
    if (!containerRef.current) return [];

    const containerRect = containerRef.current.getBoundingClientRect();
    const placedBoxes: BoundingBox[] = [];

    // Add heading bounding box to avoid overlap
    if (headingRef.current) {
      const headingRect = headingRef.current.getBoundingClientRect();
      const relativeHeadingBox: BoundingBox = {
        x: ((headingRect.left - containerRect.left) / containerRect.width) * 100,
        y: ((headingRect.top - containerRect.top) / containerRect.height) * 100,
        width: (headingRect.width / containerRect.width) * 100,
        height: (headingRect.height / containerRect.height) * 100
      };
      placedBoxes.push(relativeHeadingBox);
    }

    const positions: KeywordPosition[] = [];
    const isMobile = window.innerWidth < 768;
    const isTablet = window.innerWidth < 1024;
    
    const targetCount = isMobile ? 6 : isTablet ? 8 : 10;
    const gridSize = isMobile ? 4 : isTablet ? 5 : 6;
    const cellSize = 100 / gridSize; // Percentage
    const maxAttempts = 50;

    // Estimate keyword dimensions (in percentage)
    const avgKeywordWidth = isMobile ? 8 : 6;
    const keywordHeight = 2;

    for (let i = 0; i < targetCount && i < LEGAL_TERMS.length; i++) {
      const text = LEGAL_TERMS[i];
      const isSignal = SIGNAL_TERMS.includes(text);
      let placed = false;
      let attempts = 0;

      while (!placed && attempts < maxAttempts) {
        // Grid-based positioning with random offsets
        const gridX = Math.floor(Math.random() * gridSize);
        const gridY = Math.floor(Math.random() * gridSize);
        
        const baseX = gridX * cellSize + cellSize / 2;
        const baseY = gridY * cellSize + cellSize / 2;
        
        // Add random offset within the cell
        const offsetX = (Math.random() - 0.5) * cellSize * 0.6;
        const offsetY = (Math.random() - 0.5) * cellSize * 0.6;
        
        const x = Math.max(avgKeywordWidth / 2, Math.min(100 - avgKeywordWidth / 2, baseX + offsetX));
        const y = Math.max(keywordHeight / 2, Math.min(100 - keywordHeight / 2, baseY + offsetY));

        const proposedBox: BoundingBox = {
          x: x - avgKeywordWidth / 2,
          y: y - keywordHeight / 2,
          width: avgKeywordWidth,
          height: keywordHeight
        };

        const hasCollision = placedBoxes.some(box => isOverlapping(proposedBox, box));

        if (!hasCollision) {
          positions.push({ text, isSignal, x, y });
          placedBoxes.push(proposedBox);
          placed = true;
        }

        attempts++;
      }
    }

    return positions;
  };

  useEffect(() => {
    const generatePositions = () => {
      const positions = generateKeywordPositions();
      setKeywordPositions(positions);
    };

    // Generate positions after a small delay to ensure refs are ready
    const timer = setTimeout(generatePositions, 100);
    
    // Regenerate on window resize
    const handleResize = () => {
      setTimeout(generatePositions, 100);
    };

    window.addEventListener('resize', handleResize);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, [animationCycle, headingRef]);

  return (
    <div ref={containerRef} className="absolute inset-0">
      {keywordPositions.map((position, index) => (
        <FloatingKeyword
          key={`${position.text}-${position.x}-${position.y}-${index}-${animationCycle}`}
          text={position.text}
          isSignal={position.isSignal}
          x={position.x}
          y={position.y}
          animationCycle={animationCycle}
          scannerProgress={scannerProgress}
        />
      ))}
    </div>
  );
};