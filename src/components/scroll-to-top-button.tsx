
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ScrollToTopButtonProps {
  scrollContainerSelector: string;
}

export default function ScrollToTopButton({ scrollContainerSelector }: ScrollToTopButtonProps) {
  const [isVisible, setIsVisible] = useState(false);

  const scrollToTop = () => {
    const container = document.querySelector(scrollContainerSelector);
    container?.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const toggleVisibility = useCallback(() => {
    const container = document.querySelector(scrollContainerSelector);
    if (container && container.scrollTop > 200) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [scrollContainerSelector]);

  useEffect(() => {
    const scrollContainer = document.querySelector(scrollContainerSelector);
    
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', toggleVisibility);
    }
    
    // Initial check
    toggleVisibility();

    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', toggleVisibility);
      }
    };
  }, [scrollContainerSelector, toggleVisibility]);

  return (
    <Button
      variant="default"
      size="icon"
      onClick={scrollToTop}
      className={cn(
        "fixed bottom-8 right-8 z-50 h-12 w-12 rounded-full shadow-lg transition-opacity duration-300",
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
      aria-label="Scroll to top"
    >
      <ArrowUp className="h-6 w-6" />
    </Button>
  );
}
