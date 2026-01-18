'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import ProductCard from '@/components/ProductCard';
import FilterSidebar from '@/components/FilterSidebar';
import { supabase } from '@/lib/supabase';
import {
  Report,
  FilterOptions,
  SortOptions,
  getNutrientValue,
  getPricePerServing,
  getContaminantVerdict,
  getSubjectiveVerdict,
  getBasicTestsVerdict,
  getContaminantTestsVerdict,
  getReviewVerdict,
  matchesNutrientRange
} from '@/types';

export default function CategoryPage() {
  const params = useParams();
  const category = params.category as string;
  const [products, setProducts] = useState<Report[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileDropdownsOpen, setMobileDropdownsOpen] = useState<{ [key: string]: boolean }>({});

  const fetchProducts = async () => {
    setLoading(true);

    console.log('🔍 Fetching products for category:', category);

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

    let query = supabase
      .from('reports')
      .select('*')
      .eq('image_status', 'completed')
      .order('created_at', { ascending: false });

    if (category !== 'all') {
      const categoryName = category.replace(/-/g, ' ');
      console.log('📂 Filtering by category:', categoryName);
      query = query.ilike('product_category', categoryName);
    }

    try {
      const { data, error } = await query;

      if (error) {
        console.error('❌ Supabase Query Error Details:');
        console.error('- Error Code:', error.code);
        console.error('- Error Message:', error.message);
        console.error('- Error Details:', error.details);
        console.error('- Error Hint:', error.hint);
      } else {
        console.log(`✅ Successfully fetched ${data?.length || 0} products`);
        setProducts(data || []);
        setFilteredProducts(data || []);
      }
    } catch (error) {
      console.error('💥 Unexpected error during Supabase query:');
      console.error('- Error type:', typeof error);
      console.error('- Error message:', error instanceof Error ? error.message : String(error));
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, [category]);

  const handleFilterChange = (filters: FilterOptions, sort?: SortOptions) => {

    let filtered = [...products];

    // Verdict filter (from supabase table)
    if (filters.verdict && filters.verdict.length > 0) {
      filtered = filtered.filter(p => {
        if (!p.verdict) return false; // Skip products with no verdict
        return filters.verdict!.includes(p.verdict);
      });
    }

    // Nutrient filters (from JSON basic_tests)
    const nutrientFilters = [
      { key: 'protein_per_serving', field: 'protein' },
      { key: 'carbs_per_serving', field: 'carbs' },
      { key: 'fats_per_serving', field: 'fats' },
      { key: 'creatine_per_serving', field: 'creatine' }
    ];

    nutrientFilters.forEach(({ key, field }) => {
      const selectedRanges = filters[key as keyof FilterOptions] as string[] | undefined;
      if (selectedRanges && selectedRanges.length > 0) {
        filtered = filtered.filter(p => {
          const value = getNutrientValue(p, field);
          return value !== null && matchesNutrientRange(value, selectedRanges, field);
        });
      }
    });

    // Price filters
    if (filters.price) {
      filtered = filtered.filter(p =>
        p.price !== null && p.price >= filters.price![0] && p.price <= filters.price![1]
      );
    }

    if (filters.price_per_serving) {
      filtered = filtered.filter(p => {
        const pricePerServing = getPricePerServing(p);
        return pricePerServing !== null &&
               pricePerServing >= filters.price_per_serving![0] &&
               pricePerServing <= filters.price_per_serving![1];
      });
    }

    // Contaminant filters
    const contaminantFilters = [
      { key: 'aflatoxins', field: 'aflatoxins' },
      { key: 'pesticides', field: 'pesticides' },
      { key: 'amino_spiking', field: 'amino spiking' },
      { key: 'heavy_metals', field: 'heavy metals' },
      { key: 'melamine_spiking', field: 'melamine spiking' }
    ];

    contaminantFilters.forEach(({ key, field }) => {
      const verdicts = filters[key as keyof FilterOptions] as string[] | undefined;
      if (verdicts && verdicts.length > 0) {
        filtered = filtered.filter(p => {
          const verdict = getContaminantVerdict(p, field);
          return verdict && verdicts.includes(verdict);
        });
      }
    });

    // Subjective analysis filters
    const subjectiveFilters = [
      { key: 'taste', field: 'taste' },
      { key: 'mixability', field: 'mixability' },
      { key: 'packaging', field: 'packaging' },
      { key: 'serving_size_accuracy', field: 'serving size accuracy' }
    ];

    subjectiveFilters.forEach(({ key, field }) => {
      const verdicts = filters[key as keyof FilterOptions] as string[] | undefined;
      if (verdicts && verdicts.length > 0) {
        filtered = filtered.filter(p => {
          const verdict = getSubjectiveVerdict(p, field);
          return verdict && verdicts.includes(verdict);
        });
      }
    });

    // Food category filters
    if (filters.basic_tests_verdict && filters.basic_tests_verdict.length > 0) {
      filtered = filtered.filter(p => {
        const verdict = getBasicTestsVerdict(p);
        return verdict && filters.basic_tests_verdict!.includes(verdict);
      });
    }

    if (filters.contaminant_tests_verdict && filters.contaminant_tests_verdict.length > 0) {
      filtered = filtered.filter(p => {
        const verdict = getContaminantTestsVerdict(p);
        return verdict && filters.contaminant_tests_verdict!.includes(verdict);
      });
    }

    if (filters.review_verdict && filters.review_verdict.length > 0) {
      filtered = filtered.filter(p => {
        const verdict = getReviewVerdict(p);
        return verdict && filters.review_verdict!.includes(verdict);
      });
    }

    // Apply sorting
    if (sort) {
      filtered.sort((a, b) => {
        let aValue: number | null = null;
        let bValue: number | null = null;

        switch (sort.field) {
          case 'price':
            aValue = a.price;
            bValue = b.price;
            break;
          case 'price_per_serving':
            // Try the JSON data first (like the product page does), then fallback to database field
            aValue = getPricePerServing(a) || (a.price_per_serving != null && a.price_per_serving > 0 ? a.price_per_serving : null);
            bValue = getPricePerServing(b) || (b.price_per_serving != null && b.price_per_serving > 0 ? b.price_per_serving : null);
            break;
          case 'protein_per_serving':
            aValue = getNutrientValue(a, 'protein');
            bValue = getNutrientValue(b, 'protein');
            break;
          case 'carbs_per_serving':
            aValue = getNutrientValue(a, 'carbs');
            bValue = getNutrientValue(b, 'carbs');
            break;
          case 'fats_per_serving':
            aValue = getNutrientValue(a, 'fats');
            bValue = getNutrientValue(b, 'fats');
            break;
          case 'creatine_per_serving':
            aValue = getNutrientValue(a, 'creatine');
            bValue = getNutrientValue(b, 'creatine');
            break;
        }

        // Handle null values
        if (aValue === null && bValue === null) return 0;
        if (aValue === null) return sort.direction === 'asc' ? 1 : -1;
        if (bValue === null) return sort.direction === 'asc' ? -1 : 1;

        const comparison = aValue - bValue;
        return sort.direction === 'asc' ? comparison : -comparison;
      });
    }

    setFilteredProducts(filtered);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 capitalize">
          {category === 'all' ? 'All Products' : category.replace(/-/g, ' ')}
        </h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-64 shrink-0">
            <FilterSidebar onFilterChange={handleFilterChange} category={category} />
          </aside>

          {/* Products Grid */}
          <main className="flex-1">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg shadow-md h-80 animate-pulse">
                    <div className="h-56 bg-gray-200 rounded-t-lg"></div>
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <>
                <div className="mb-4 text-sm text-gray-600">
                  Showing {filteredProducts.length} of {products.length} products
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-20 bg-white rounded-lg shadow-md">
                <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-900">No products found</h3>
                <p className="mt-2 text-sm text-gray-500">Try adjusting your filters</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

