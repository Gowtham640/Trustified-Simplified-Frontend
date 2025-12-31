'use client';

import Link from 'next/link';
import Image from 'next/image';
import { CATEGORIES } from '@/types';
import { useState } from 'react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-green-800 shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/favicon.svg"
              alt="Trustified Logo"
              width={32}
              height={32}
              className="w-8 h-8"
            />
            <span className="text-xl font-bold text-white">Trustified Simplified</span>
          </Link>

          {/* Desktop Categories */}
          <div className="hidden md:flex items-center space-x-1">
            {CATEGORIES.map((category) => (
              <Link
                key={category}
                href={category === 'All Products' ? '/category/all' : `/category/${category.toLowerCase().replace(/\s+/g, '-')}`}
                className="px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-green-600 transition-colors"
              >
                {category}
              </Link>
            ))}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:bg-green-50 focus:outline-none"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {CATEGORIES.map((category) => (
              <Link
                key={category}
                href={category === 'All Products' ? '/category/all' : `/category/${category.toLowerCase().replace(/\s+/g, '-')}`}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-green-50 hover:text-green-800"
                onClick={() => setIsOpen(false)}
              >
                {category}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}

