import { useEffect, useState, useRef } from "react";

interface FloatingKeywordProps {
  text: string;
  isSignal: boolean;
  x: number;
  y: number;
  animationCycle: number;
  scannerProgress: number;
}

export const FloatingKeyword = ({ 
  text, 
  isSignal, 
  x, 
  y, 
  animationCycle, 
  scannerProgress 
}: FloatingKeywordProps) => {
  const [isHighlighted, setIsHighlighted] = useState(false);
  const keywordRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!isSignal || !keywordRef.current) return;
    
    const rect = keywordRef.current.getBoundingClientRect();
    const parentRect = keywordRef.current.offsetParent?.getBoundingClientRect();
    
    if (!parentRect) return;
    
    // Calculate if scanner has crossed this keyword's position
    const relativeX = (rect.left - parentRect.left) / parentRect.width;
    const hasBeenScanned = scannerProgress >= relativeX;
    
    setIsHighlighted(hasBeenScanned);
  }, [isSignal, scannerProgress]);

  // Reset highlighting when animation cycle changes
  useEffect(() => {
    setIsHighlighted(false);
  }, [animationCycle]);

  return (
    <div
      ref={keywordRef}
      className={`
        absolute text-xs font-sans tracking-wider uppercase select-none whitespace-nowrap
        keyword transition-colors duration-800 ease-in-out
        ${isHighlighted ? 'highlighted' : ''}
      `}
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: 'translate(-50%, -50%)',
        zIndex: isSignal && isHighlighted ? 20 : 10,
        color: isHighlighted && isSignal 
          ? 'hsl(var(--lextract-signal))' 
          : 'hsl(var(--lextract-noise))',
        opacity: isHighlighted && isSignal ? 1 : 0.35,
        textShadow: isHighlighted && isSignal 
          ? '0 0 8px hsl(var(--lextract-signal) / 0.6)' 
          : 'none'
      }}
    >
      {text}
    </div>
  );
};