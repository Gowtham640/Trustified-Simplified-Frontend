'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import ProductCard from '@/components/ProductCard';
import { supabase } from '@/lib/supabase';
import { Report } from '@/types';

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [products, setProducts] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  const searchProducts = async (searchQuery: string) => {
    setLoading(true);

    console.log('🔍 Searching products for query:', searchQuery);

    // Check environment variables
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Missing Supabase environment variables!');
      console.error('Please ensure .env.local contains:');
      console.error('SUPABASE_URL=your_supabase_project_url');
      console.error('ANON_KEY=your_supabase_anon_key');
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .or(`product_name.ilike.%${searchQuery}%,company.ilike.%${searchQuery}%,product_category.ilike.%${searchQuery}%`)
        .eq('image_status', 'completed')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Supabase Search Error Details:');
        console.error('- Error Code:', error.code);
        console.error('- Error Message:', error.message);
        console.error('- Error Details:', error.details);
        console.error('- Error Hint:', error.hint);
        console.error('- Search query:', searchQuery);
      } else {
        console.log(`✅ Search completed, found ${data?.length || 0} products`);
        setProducts(data || []);
      }
    } catch (error) {
      console.error('💥 Unexpected error during search:');
      console.error('- Error type:', typeof error);
      console.error('- Error message:', error instanceof Error ? error.message : String(error));
    }

    setLoading(false);
  };

  useEffect(() => {
    if (query) {
      searchProducts(query);
    }
  }, [query]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Search Results
          </h1>
          {query && (
            <p className="text-lg text-gray-600">
              Showing results for: <span className="font-semibold text-emerald-800">{query}</span>
            </p>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md h-80 animate-pulse">
                <div className="h-56 bg-gray-200 rounded-t-lg"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <>
            <div className="mb-6 text-sm text-gray-600">
              Found {products.length} product(s)
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-20">
            <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No products found</h3>
            <p className="mt-2 text-sm text-gray-500">
              Try searching with different keywords or browse by category
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          </div>
        </div>
      </div>
    }>
      <SearchResults />
    </Suspense>
  );
}

