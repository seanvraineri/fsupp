"use client";
import { useEffect, useRef, useState, ReactNode } from 'react';

interface ScrollAnimationProps {
  children: ReactNode;
  className?: string;
  animation?: 'fade-up' | 'fade-in' | 'slide-left' | 'slide-right' | 'scale';
  delay?: number;
  duration?: number;
  threshold?: number;
}

export default function ScrollAnimation({ 
  children, 
  className = '', 
  animation = 'fade-up',
  delay = 0,
  duration = 600,
  threshold = 0.1
}: ScrollAnimationProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Only animate once to prevent glitches
          if (entry.isIntersecting && !hasAnimated) {
            setTimeout(() => {
              setIsVisible(true);
              setHasAnimated(true);
            }, delay);
          }
        });
      },
      {
        threshold: threshold,
        rootMargin: '0px 0px -20px 0px' // Reduced margin for better trigger timing
      }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [delay, hasAnimated, threshold]);

  // Use cubic-bezier for smoother animations
  const baseClasses = `transition-all cubic-bezier(0.4, 0, 0.2, 1)`;
  
  const animationClasses = {
    'fade-up': {
      initial: 'translate-y-8 opacity-0',
      animate: 'translate-y-0 opacity-100'
    },
    'fade-in': {
      initial: 'opacity-0',
      animate: 'opacity-100'
    },
    'slide-left': {
      initial: 'translate-x-8 opacity-0',
      animate: 'translate-x-0 opacity-100'
    },
    'slide-right': {
      initial: '-translate-x-8 opacity-0',
      animate: 'translate-x-0 opacity-100'
    },
    'scale': {
      initial: 'scale-95 opacity-0',
      animate: 'scale-100 opacity-100'
    }
  };

  const currentAnimation = animationClasses[animation];
  const appliedClasses = isVisible ? currentAnimation.animate : currentAnimation.initial;

  return (
    <div
      ref={ref}
      className={`${baseClasses} ${appliedClasses} ${className}`}
      style={{ 
        transitionDuration: `${duration}ms`,
        willChange: 'transform, opacity' // Optimize for animations
      }}
    >
      {children}
    </div>
  );
} 