import { useWindowWidth } from "../hooks/use-window-width";

// All 12 keywords with static positions
const KEYWORDS_LARGE = [
  { text: 'TERMINATION RIGHTS', top: '12%', left: '15%' },
  { text: 'CHANGE OF CONTROL', top: '23%', left: '40%' },
  { text: 'MERGER AGREEMENT', top: '30%', left: '30%' },
  { text: 'CONSENT REQUIREMENTS', top: '70%', left: '20%' },
  { text: 'INSURANCE POLICY', top: '85%', left: '50%' },
  { text: 'NON-SOLICITATION', top: '5%', left: '70%' },
  { text: 'EXPIRING TERMS', top: '67%', left: '60%' },
  { text: 'PRE-EMPTIVE RIGHTS', top: '78%', left: '8%' },
    { text: 'CALL OPTION', top: '85%', left: '70%' },


    { text: 'COLLATERAL', top: '35%', left: '15%' },

  { text: 'PRICE GUARANTEE', top: '90%', left: '40%' },
    { text: 'TAG ALONG RIGHT', top: '42%', left: '25%' }
];

// Use first 8 for "small" screens
const KEYWORDS_SMALL = KEYWORDS_LARGE.slice(0, 8);
// Use first 5 for "mobile"
const KEYWORDS_MOBILE = KEYWORDS_LARGE.slice(0, 5);

const SIGNAL_TERMS = ["CHANGE OF CONTROL", "TERMINATION RIGHTS", "EXPIRING TERMS"];

interface KeywordData {
  text: string;
  top: string;
  left: string;
}

interface KeywordCloudProps {
  animationCycle: number;
  scannerProgress: number;
  headingRef: React.RefObject<HTMLElement>;
}

export const KeywordCloud = ({ animationCycle, scannerProgress }: KeywordCloudProps) => {
  const width = useWindowWidth();
  
  // Select keyword array based on viewport width
  const keywords = width <= 640
    ? KEYWORDS_MOBILE
    : width <= 1024
      ? KEYWORDS_SMALL
      : KEYWORDS_LARGE;

  // Convert scannerProgress (0-1) to scanY percentage
  const scanY = scannerProgress * 100;

  return (
    <div className="keyword-cloud">
      {keywords.map(({ text, top, left }, index) => {
        const isSignal = SIGNAL_TERMS.includes(text);
        const isHighlighted = scanY >= parseFloat(top);
        
        return (
          <span
            key={`${text}-${animationCycle}-${index}`}
            className={`keyword${isHighlighted ? ' highlighted' : ''}`}
            style={{ top, left }}
          >
            {text}
          </span>
        );
      })}
    </div>
  );
};