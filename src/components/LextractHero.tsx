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

const MESSAGES = [
  "Thousands of pages.",
  "Hidden risks.",
  "Lextract makes sense of it all."
];

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
      className={`absolute text-xs font-mono tracking-wider uppercase select-none transition-all duration-1000 ${
        isSignal && isTransformed 
          ? 'text-signal opacity-100 filter-none scale-100 z-20' 
          : 'text-noise opacity-30'
      }`}
      style={{
        left: `${x}%`,
        top: `${y}%`,
        animationDelay: `${delay}ms`,
        fontFamily: 'ui-monospace, monospace'
      }}
    >
      {text}
    </div>
  );
};

const MessageOverlay = ({ message, delay }: { message: string; delay: number }) => {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center z-30"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="message-fade text-center">
        <p className="text-lg text-lextract-electric font-light tracking-wide">
          {message}
        </p>
      </div>
    </div>
  );
};

export const LextractHero = () => {
  const [animationCycle, setAnimationCycle] = useState(0);
  const [showMessages, setShowMessages] = useState(false);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationCycle(prev => prev + 1);
      setShowMessages(true);
      
      setTimeout(() => setShowMessages(false), 12000);
    }, 15000);
    
    return () => clearInterval(interval);
  }, []);

  const generateTextElements = () => {
    const elements = [];
    
    // Generate floating text elements
    for (let i = 0; i < 40; i++) {
      const text = LEGAL_TERMS[Math.floor(Math.random() * LEGAL_TERMS.length)];
      const isSignal = SIGNAL_TERMS.includes(text);
      const x = Math.random() * 85 + 5; // 5% to 90% width
      const y = Math.random() * 85 + 5; // 5% to 90% height
      const delay = Math.random() * 3000 + (isSignal ? 5000 : 0);
      
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
    
    return elements;
  };

  return (
    <div className="relative w-full h-screen bg-lextract-navy overflow-hidden">
      {/* Background Texture */}
      <div className="absolute inset-0 bg-gradient-to-br from-lextract-navy via-lextract-darkgray to-lextract-navy" />
      
      {/* Floating Legal Text */}
      <div className="absolute inset-0">
        {generateTextElements()}
      </div>
      
      {/* Energy Beam Sweep */}
      <div 
        className="absolute inset-0 beam-sweep z-10"
        key={`beam-${animationCycle}`}
      />
      
      {/* Signal Wave Pattern */}
      <div className="absolute bottom-0 left-0 right-0 h-1 z-10">
        <div className="signal-wave h-full origin-left" />
      </div>
      
      {/* Message Overlays */}
      {showMessages && (
        <>
          <MessageOverlay message={MESSAGES[0]} delay={2000} />
          <MessageOverlay message={MESSAGES[1]} delay={6000} />
          <MessageOverlay message={MESSAGES[2]} delay={10000} />
        </>
      )}
      
      {/* Final Title */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-40">
        <div 
          className="text-center opacity-0 animate-[messageSlide_4s_ease-in-out_13s_forwards]"
          style={{ animationFillMode: 'forwards' }}
        >
          <h1 className="text-4xl md:text-6xl font-light text-foreground mb-4 tracking-wide">
            See what matters.{' '}
            <span className="text-lextract-electric font-normal">Instantly.</span>
          </h1>
          <p className="text-lg text-muted-foreground font-light tracking-wider">
            AI-powered due diligence for transaction lawyers.
          </p>
        </div>
      </div>
      
      {/* Subtle Grid Overlay */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />
    </div>
  );
};