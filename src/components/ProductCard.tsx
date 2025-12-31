'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Report } from '@/types';

interface ProductCardProps {
  product: Report;
  isHorizontal?: boolean;
}

export default function ProductCard({ product, isHorizontal = false }: ProductCardProps) {
  const verdictColor = product.verdict === 'pass' 
    ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
    : product.verdict === 'fail'
    ? 'bg-red-100 text-red-800 border-red-300'
    : 'bg-gray-100 text-gray-800 border-gray-300';

  return (
    <Link href={`/product/${product.product_id}`}>
      <div 
        className={`group bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-xl ${
          isHorizontal ? 'w-72 flex-shrink-0' : 'w-full'
        }`}
      >
        {/* Product Image */}
        <div className="relative h-56 bg-gray-100 overflow-hidden">
          {product.image_url && product.image_status === 'completed' ? (
            <Image
              src={product.image_url}
              alt={product.product_name}
              fill
              className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-emerald-800 transition-colors">
            {product.product_name}
          </h3>
          <p className="text-sm text-gray-600 mb-2">{product.company}</p>
          
          <div className="flex items-center justify-between">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${verdictColor}`}>
              {product.verdict.toUpperCase()}
            </span>
            {product.price && (
              <span className="text-sm font-bold text-emerald-800">
                {product.price.toString().includes('₹') ? product.price : `₹${product.price}`}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

