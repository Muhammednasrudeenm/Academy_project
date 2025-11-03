import React, { useState, useMemo, memo } from "react";

/**
 * Reusable component for displaying text with "Show more/less" functionality
 * @param {string} text - The text to display
 * @param {number} maxLength - Maximum characters to show before truncation (default: 500)
 * @param {string} className - Additional CSS classes
 */
function ExpandableText({ text, maxLength = 500, className = "" }) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Process text
  const processed = useMemo(() => {
    if (!text || typeof text !== 'string' || text.length === 0) {
      return null;
    }

    const textLength = text.length;
    const shouldTruncate = textLength > maxLength;
    const truncatedText = text.slice(0, maxLength);
    
    return {
      shouldTruncate,
      truncatedText,
      fullText: text,
      textLength
    };
  }, [text, maxLength]);

  // Handle null/undefined or empty text
  if (!processed) {
    return null;
  }

  const { shouldTruncate, truncatedText, fullText } = processed;

  // If text is shorter than maxLength, don't show expand/collapse
  if (!shouldTruncate) {
    return (
      <span className={`${className} whitespace-pre-wrap break-words`}>
        {fullText}
      </span>
    );
  }

  // Get the text to display based on expanded state
  const displayText = isExpanded ? fullText : truncatedText;

  // Handler for toggle button - simple and direct
  const handleToggleClick = () => {
    setIsExpanded(prev => !prev);
  };

  return (
    <div className={className || ''} style={{ width: '100%', display: 'block' }}>
      <span className="whitespace-pre-wrap break-words" style={{ wordBreak: 'break-word' }}>
        {displayText}
      </span>
      {!isExpanded && <span className="text-gray-500 ml-1">...</span>}
      <button
        type="button"
        onClick={handleToggleClick}
        className="ml-2 text-sky-400 hover:text-sky-300 active:text-sky-200 font-semibold text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500/50 rounded px-1 underline cursor-pointer inline-block select-none"
        style={{ 
          userSelect: 'none',
          backgroundColor: 'transparent',
          border: 'none',
          display: 'inline-block',
          marginLeft: '0.5rem',
          padding: '0.125rem 0.25rem'
        }}
        tabIndex={0}
      >
        {isExpanded ? "Show less" : "Show more"}
      </button>
    </div>
  );
}

// Memoize component to prevent unnecessary re-renders that reset state
export default memo(ExpandableText, (prevProps, nextProps) => {
  // Only re-render if text or maxLength changes
  return prevProps.text === nextProps.text && prevProps.maxLength === nextProps.maxLength;
});
