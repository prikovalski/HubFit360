
import { useState, useRef } from 'react';

interface RateLimiterConfig {
  maxAttempts: number;
  windowMs: number;
  blockDurationMs?: number;
}

export const useRateLimiter = (config: RateLimiterConfig) => {
  const [isBlocked, setIsBlocked] = useState(false);
  const attemptsRef = useRef<number[]>([]);
  const blockTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const checkRateLimit = (): boolean => {
    const now = Date.now();
    const { maxAttempts, windowMs, blockDurationMs = 60000 } = config;

    // Remove attempts outside the window
    attemptsRef.current = attemptsRef.current.filter(
      attempt => now - attempt < windowMs
    );

    if (attemptsRef.current.length >= maxAttempts) {
      setIsBlocked(true);
      
      // Clear existing timeout
      if (blockTimeoutRef.current) {
        clearTimeout(blockTimeoutRef.current);
      }
      
      // Set unblock timeout
      blockTimeoutRef.current = setTimeout(() => {
        setIsBlocked(false);
        attemptsRef.current = [];
      }, blockDurationMs);
      
      return false;
    }

    // Add current attempt
    attemptsRef.current.push(now);
    return true;
  };

  const reset = () => {
    setIsBlocked(false);
    attemptsRef.current = [];
    if (blockTimeoutRef.current) {
      clearTimeout(blockTimeoutRef.current);
      blockTimeoutRef.current = null;
    }
  };

  return {
    isBlocked,
    checkRateLimit,
    reset,
    remainingAttempts: Math.max(0, config.maxAttempts - attemptsRef.current.length)
  };
};
