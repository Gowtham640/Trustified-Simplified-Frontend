import Navbar from '@/components/Navbar';
import Slideshow from '@/components/Slideshow';
import CategoryScroll from '@/components/CategoryScroll';
import { supabase } from '@/lib/supabase';
import { Report } from '@/types';

async function getProductsByCategory() {
  try {
    console.log('🔍 Fetching products from Supabase...');

    // Check environment variables
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.ANON_KEY;

    console.log('🔧 Environment check:');
    console.log('- SUPABASE_URL exists:', !!supabaseUrl);
    console.log('- ANON_KEY exists:', !!supabaseKey);

    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Missing Supabase environment variables!');
      console.error('Please ensure .env.local contains:');
      console.error('SUPABASE_URL=your_supabase_project_url');
      console.error('ANON_KEY=your_supabase_anon_key');
      throw new Error('Missing Supabase environment variables');
    }

    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('image_status', 'completed')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Supabase Query Error Details:');
      console.error('- Error Code:', error.code);
      console.error('- Error Message:', error.message);
      console.error('- Error Details:', error.details);
      console.error('- Error Hint:', error.hint);
      throw error;
    }

    if (!data || data.length === 0) {
      console.log('⚠️ No products found with image_status=completed');
      return {};
    }

    console.log(`✅ Successfully fetched ${data.length} products from Supabase`);
    return organizeProductsByCategory(data);
  } catch (error) {
    console.error('❌ Failed to fetch products from Supabase:', error);
    console.error('- Error type:', typeof error);
    console.error('- Error message:', error instanceof Error ? error.message : String(error));
    throw error;
  }
}

function organizeProductsByCategory(products: Report[]): Record<string, Report[]> {
  const productsByCategory: Record<string, Report[]> = {};

  products.forEach((product: Report) => {
    const category = product.product_category || 'Other';
    if (!productsByCategory[category]) {
      productsByCategory[category] = [];
    }
    productsByCategory[category].push(product);
  });

  return productsByCategory;
}

export default async function Home() {
  const productsByCategory = await getProductsByCategory();

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Slideshow />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {Object.entries(productsByCategory).map(([category, products]) => (
          <CategoryScroll 
            key={category} 
            title={category} 
            products={products} 
          />
        ))}
        
        {Object.keys(productsByCategory).length === 0 && (
          <div className="text-center py-20">
            <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No products found</h3>
            <p className="mt-2 text-sm text-gray-500">No products with completed images are available.</p>
          </div>
        )}
      </main>
    </div>
  );
}
