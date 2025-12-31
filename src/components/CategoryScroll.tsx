'use client';

import { useRef, useEffect, useState } from 'react';
import ProductCard from './ProductCard';
import { Report } from '@/types';

interface CategoryScrollProps {
  title: string;
  products: Report[];
}

export default function CategoryScroll({ title, products }: CategoryScrollProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);

  const updateScrollButtons = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      const tolerance = 5; // 5px tolerance for floating point precision

      setCanScrollLeft(scrollLeft > tolerance);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - tolerance);
    }
  };

  useEffect(() => {
    updateScrollButtons();
  }, [products.length]);

  // Update scroll buttons when user manually scrolls
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    const handleScroll = () => {
      if (!isScrolling) {
        updateScrollButtons();
      }
    };

    scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
    return () => scrollContainer.removeEventListener('scroll', handleScroll);
  }, [isScrolling]);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer || isHovered || products.length === 0 || isScrolling) return;

    let animationId: number;
    let lastTime = 0;
    const scrollSpeed = 0.5; // pixels per millisecond

    const autoScroll = (currentTime: number) => {
      if (currentTime - lastTime >= 16) { // ~60fps
        lastTime = currentTime;

        if (scrollContainer.scrollLeft >= scrollContainer.scrollWidth - scrollContainer.clientWidth - 10) {
          // Smoothly scroll back to start instead of instant jump
          scrollContainer.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          scrollContainer.scrollBy({ left: scrollSpeed, behavior: 'auto' });
        }
      }

      if (!isHovered && !isScrolling) {
        animationId = requestAnimationFrame(autoScroll);
      }
    };

    animationId = requestAnimationFrame(autoScroll);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isHovered, products.length, isScrolling]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current && !isScrolling) {
      setIsScrolling(true);
      const scrollAmount = Math.min(300, scrollRef.current.clientWidth * 0.8); // Responsive scroll amount

      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });

      // Wait for smooth scroll to complete before updating buttons
      setTimeout(() => {
        updateScrollButtons();
        setIsScrolling(false);
      }, 350); // Slightly longer than the smooth scroll duration
    }
  };

  if (products.length === 0) return null;

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft || isScrolling}
            className={`p-2 rounded-full bg-emerald-100 hover:bg-emerald-200 transition-colors ${
              !canScrollLeft || isScrolling ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <svg className="w-6 h-6 text-emerald-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => scroll('right')}
            disabled={!canScrollRight || isScrolling}
            className={`p-2 rounded-full bg-emerald-100 hover:bg-emerald-200 transition-colors ${
              !canScrollRight || isScrolling ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <svg className="w-6 h-6 text-emerald-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="flex space-x-4 overflow-x-hidden scroll-smooth"
      >
        {products.map((product) => (
          <ProductCard key={product.id} product={product} isHorizontal />
        ))}
      </div>
    </div>
  );
}

