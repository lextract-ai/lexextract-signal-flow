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
    const isMobile = window.innerWidth < 768;
    const isTablet = window.innerWidth < 1024;
    
    const targetCount = isMobile ? 6 : isTablet ? 8 : 10;
    
    // Estimate keyword dimensions (in percentage)
    const avgKeywordWidth = isMobile ? 8 : 6;
    const keywordHeight = 2;
    
    // Calculate minDist based on keyword diagonal + buffer
    const keywordDiagonal = Math.sqrt(avgKeywordWidth * avgKeywordWidth + keywordHeight * keywordHeight);
    const minDist = keywordDiagonal + 2; // 2% buffer
    
    // Define bounds excluding heading area
    let bounds = { x: 0, y: 0, width: 100, height: 100 };
    
    if (headingRef.current) {
      const headingRect = headingRef.current.getBoundingClientRect();
      const headingBox = {
        x: ((headingRect.left - containerRect.left) / containerRect.width) * 100,
        y: ((headingRect.top - containerRect.top) / containerRect.height) * 100,
        width: (headingRect.width / containerRect.width) * 100,
        height: (headingRect.height / containerRect.height) * 100
      };
      
      // Use full container bounds for now, will exclude heading in point validation
      bounds = { x: 5, y: 5, width: 90, height: 90 }; // 5% margin from edges
    }
    
    // Poisson disk sampling implementation
    const samplePoints = poissonDiskSampling(bounds, minDist, 30);
    
    // Map keywords to sample points
    const positions: KeywordPosition[] = [];
    const availablePoints = [...samplePoints];
    
    for (let i = 0; i < Math.min(targetCount, LEGAL_TERMS.length, availablePoints.length); i++) {
      const text = LEGAL_TERMS[i];
      const isSignal = SIGNAL_TERMS.includes(text);
      
      // Pick a random point from available points
      const pointIndex = Math.floor(Math.random() * availablePoints.length);
      const point = availablePoints.splice(pointIndex, 1)[0];
      
      if (point && isValidPlacement(point, headingRef.current, containerRect)) {
        positions.push({ 
          text, 
          isSignal, 
          x: point.x, 
          y: point.y 
        });
      }
    }
    
    return positions;
  };
  
  const poissonDiskSampling = (bounds: { x: number, y: number, width: number, height: number }, minDist: number, maxTries: number) => {
    const points: { x: number, y: number }[] = [];
    const activeList: { x: number, y: number }[] = [];
    const cellSize = minDist / Math.sqrt(2);
    const cols = Math.ceil(bounds.width / cellSize);
    const rows = Math.ceil(bounds.height / cellSize);
    const grid: (number | null)[][] = Array(rows).fill(null).map(() => Array(cols).fill(null));
    
    // Generate initial sample
    const initialX = bounds.x + Math.random() * bounds.width;
    const initialY = bounds.y + Math.random() * bounds.height;
    const initial = { x: initialX, y: initialY };
    
    points.push(initial);
    activeList.push(initial);
    
    const gridX = Math.floor((initialX - bounds.x) / cellSize);
    const gridY = Math.floor((initialY - bounds.y) / cellSize);
    if (gridY >= 0 && gridY < rows && gridX >= 0 && gridX < cols) {
      grid[gridY][gridX] = 0;
    }
    
    while (activeList.length > 0) {
      const randomIndex = Math.floor(Math.random() * activeList.length);
      const activePoint = activeList[randomIndex];
      let found = false;
      
      for (let i = 0; i < maxTries; i++) {
        // Generate sample between minDist and 2*minDist from activePoint
        const angle = Math.random() * 2 * Math.PI;
        const radius = minDist + Math.random() * minDist;
        const newX = activePoint.x + radius * Math.cos(angle);
        const newY = activePoint.y + radius * Math.sin(angle);
        
        // Check if new point is within bounds
        if (newX >= bounds.x && newX <= bounds.x + bounds.width && 
            newY >= bounds.y && newY <= bounds.y + bounds.height) {
          
          const gX = Math.floor((newX - bounds.x) / cellSize);
          const gY = Math.floor((newY - bounds.y) / cellSize);
          
          if (gY >= 0 && gY < rows && gX >= 0 && gX < cols) {
            let valid = true;
            
            // Check neighboring cells for conflicts
            for (let dy = -1; dy <= 1; dy++) {
              for (let dx = -1; dx <= 1; dx++) {
                const checkY = gY + dy;
                const checkX = gX + dx;
                
                if (checkY >= 0 && checkY < rows && checkX >= 0 && checkX < cols && 
                    grid[checkY][checkX] !== null) {
                  const existingPoint = points[grid[checkY][checkX]!];
                  const dist = Math.sqrt(
                    (newX - existingPoint.x) ** 2 + (newY - existingPoint.y) ** 2
                  );
                  
                  if (dist < minDist) {
                    valid = false;
                    break;
                  }
                }
              }
              if (!valid) break;
            }
            
            if (valid) {
              const newPoint = { x: newX, y: newY };
              points.push(newPoint);
              activeList.push(newPoint);
              grid[gY][gX] = points.length - 1;
              found = true;
              break;
            }
          }
        }
      }
      
      if (!found) {
        activeList.splice(randomIndex, 1);
      }
    }
    
    return points;
  };
  
  const isValidPlacement = (point: { x: number, y: number }, headingElement: HTMLElement | null, containerRect: DOMRect): boolean => {
    if (!headingElement) return true;
    
    const headingRect = headingElement.getBoundingClientRect();
    const headingBox = {
      x: ((headingRect.left - containerRect.left) / containerRect.width) * 100,
      y: ((headingRect.top - containerRect.top) / containerRect.height) * 100,
      width: (headingRect.width / containerRect.width) * 100,
      height: (headingRect.height / containerRect.height) * 100
    };
    
    // Check if point overlaps with heading (with some margin)
    const margin = 3; // 3% margin around heading
    return !(
      point.x >= headingBox.x - margin &&
      point.x <= headingBox.x + headingBox.width + margin &&
      point.y >= headingBox.y - margin &&
      point.y <= headingBox.y + headingBox.height + margin
    );
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