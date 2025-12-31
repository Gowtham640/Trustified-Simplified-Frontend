'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const SLIDES = [
  {
    title: 'Find your trustified certified product',
    subtitle: 'Your easy source of trustified certified products',
    description: 'We make it easy for you to find your ideal and safe product.',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'
  },
  {
    title: 'Transparent Results',
    subtitle: 'Complete Lab Testing & Analysis',
    description: 'Comprehensive reports on protein content, contaminants, and more',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'
  },
  {
    title: 'Make Informed Choices',
    subtitle: 'Trust Your Supplements',
    description: 'Browse our database of tested products and find what works',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'
  }
];

export default function Slideshow() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="relative h-96 overflow-hidden">
      {/* Slides */}
      {SLIDES.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* Background Image with Dark Overlay */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${slide.image})` }}
          />
          {/* Dark Overlay for better text readability */}
          <div className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm" />

          {/* Content */}
          <div className="relative z-10 w-full h-full flex items-center justify-center">
            <div className="text-center text-white px-4 max-w-4xl">
              <h1 className="text-5xl font-bold mb-4 drop-shadow-lg">{slide.title}</h1>
              <h2 className="text-2xl mb-3 drop-shadow-lg">{slide.subtitle}</h2>
              <p className="text-lg opacity-90 drop-shadow-lg">{slide.description}</p>
            </div>
          </div>
        </div>
      ))}

      {/* Search Bar */}
      <div className="absolute z-10 bottom-4 left-1/2 transform -translate-x-1/2 w-full max-w-2xl px-4">
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for products, brands, or categories..."
            className="w-full px-6 py-4 bg-white rounded-full text-gray-900 shadow-2xl focus:outline-none focus:ring-4 focus:ring-white/50"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-full transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {SLIDES.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentSlide ? 'bg-white w-8' : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

