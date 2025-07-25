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
  // Calculate animation delay based on x position to sync with scanner
  const animationDelay = (x / 100) * 6;

  return (
    <div
      className={`absolute text-xs md:text-sm font-sans tracking-wider uppercase select-none whitespace-nowrap keyword`}
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: `translate(-50%, -50%)`,
        animationDelay: `${animationDelay}s`
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
    
    // Cleaner, more spaced out layouts
    const mobileLayout = [
      { text: "Force Majeure", x: 15, y: 15 },
      { text: "Change of Control", x: 85, y: 20, isSignal: true },
      { text: "Due Diligence", x: 10, y: 80 },
      { text: "Governing Law", x: 90, y: 85, isSignal: true }
    ];
    
    const tabletLayout = [
      { text: "Force Majeure", x: 12, y: 12 },
      { text: "Change of Control", x: 88, y: 15, isSignal: true },
      { text: "Due Diligence", x: 8, y: 35 },
      { text: "Governing Law", x: 92, y: 40, isSignal: true },
      { text: "Termination", x: 85, y: 75, isSignal: true },
      { text: "AGB", x: 15, y: 85, isSignal: true },
      { text: "Amendment", x: 20, y: 25 },
      { text: "Jurisdiction", x: 80, y: 90 }
    ];
    
    const desktopLayout = [
      { text: "Force Majeure", x: 8, y: 10 },
      { text: "Change of Control", x: 92, y: 12, isSignal: true },
      { text: "Due Diligence", x: 5, y: 30 },
      { text: "Governing Law", x: 95, y: 35, isSignal: true },
      { text: "Confidentiality", x: 12, y: 65 },
      { text: "Termination", x: 88, y: 70, isSignal: true },
      { text: "Liability Cap", x: 10, y: 85 },
      { text: "AGB", x: 90, y: 88, isSignal: true },
      { text: "Shareholder Agreement", x: 70, y: 8, isSignal: true },
      { text: "Amendment", x: 25, y: 20 },
      { text: "Jurisdiction", x: 75, y: 92 },
      { text: "Joint Venture", x: 30, y: 90 }
    ];
    
    // Mobile keywords (always visible)
    mobileLayout.forEach((layout, i) => {
      const { text, x, y, isSignal = false } = layout;
      elements.push(
        <FloatingText
          key={`mobile-${i}`}
          text={text}
          isSignal={isSignal}
          x={x}
          y={y}
          animationCycle={animationCycle}
        />
      );
    });
    
    // Additional tablet keywords (hidden on mobile)
    const tabletOnlyKeywords = tabletLayout.filter(item => 
      !mobileLayout.some(mobile => mobile.text === item.text)
    );
    
    tabletOnlyKeywords.forEach((layout, i) => {
      const { text, x, y, isSignal = false } = layout;
      elements.push(
        <div key={`tablet-${i}`} className="hidden md:block">
          <FloatingText
            text={text}
            isSignal={isSignal}
            x={x}
            y={y}
            animationCycle={animationCycle}
          />
        </div>
      );
    });
    
    // Additional desktop keywords (hidden on mobile and tablet)
    const desktopOnlyKeywords = desktopLayout.filter(item => 
      !tabletLayout.some(tablet => tablet.text === item.text)
    );
    
    desktopOnlyKeywords.forEach((layout, i) => {
      const { text, x, y, isSignal = false } = layout;
      elements.push(
        <div key={`desktop-${i}`} className="hidden lg:block">
          <FloatingText
            text={text}
            isSignal={isSignal}
            x={x}
            y={y}
            animationCycle={animationCycle}
          />
        </div>
      );
    });
    
    return elements;
  }, [animationCycle]);

  return (
    <div className="relative w-full h-screen bg-lextract-background overflow-hidden font-sans scanner">
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