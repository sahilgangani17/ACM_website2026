import React, { useState, useRef, useEffect, useCallback } from 'react';

const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*<>[]{}/*+=~_';

interface ScrambleTextProps {
  text: string;
  className?: string;
  isHovered?: boolean;
}

export const ScrambleText: React.FC<ScrambleTextProps> = ({
  text,
  className = '',
  isHovered,
}) => {
  const [displayText, setDisplayText] = useState(text);
  const animRef = useRef<number | null>(null);

  const scramble = useCallback(() => {
    const duration = 400; // ms
    const startTime = performance.now();

    if (animRef.current !== null) {
      cancelAnimationFrame(animRef.current);
    }

    const frame = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1.0, elapsed / duration);
      const resolvedCount = Math.floor(progress * text.length);

      const result = text
        .split('')
        .map((char, i) => {
          if (char === ' ') return ' ';
          if (i < resolvedCount) return text[i];
          return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
        })
        .join('');

      setDisplayText(result);

      if (progress < 1.0) {
        animRef.current = requestAnimationFrame(frame);
      } else {
        setDisplayText(text);
        animRef.current = null;
      }
    };

    animRef.current = requestAnimationFrame(frame);
  }, [text]);

  useEffect(() => {
    if (isHovered) {
      scramble();
    }
  }, [isHovered, scramble]);

  useEffect(() => {
    setDisplayText(text);
    return () => {
      if (animRef.current !== null) {
        cancelAnimationFrame(animRef.current);
      }
    };
  }, [text]);

  return (
    <span
      onMouseEnter={scramble}
      className={className}
    >
      {displayText}
    </span>
  );
};
