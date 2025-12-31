import Image from 'next/image';
import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import TestSection from '@/components/TestSection';
import { supabase } from '@/lib/supabase';
import { Report } from '@/types';

async function getProduct(productId: string): Promise<Report | null> {
  console.log('🔍 Fetching product with ID:', productId);

  // Check if environment variables are available
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.ANON_KEY;

  console.log('🔧 Environment check:');
  console.log('- SUPABASE_URL exists:', !!supabaseUrl);
  console.log('- ANON_KEY exists:', !!supabaseKey);
  console.log('- SUPABASE_URL value:', supabaseUrl ? supabaseUrl.substring(0, 20) + '...' : 'undefined');
  console.log('- ANON_KEY length:', supabaseKey ? supabaseKey.length : 'undefined');

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables!');
    console.error('Please ensure .env.local contains:');
    console.error('SUPABASE_URL=your_supabase_project_url');
    console.error('ANON_KEY=your_supabase_anon_key');
    return null;
  }

  try {
    console.log('📡 Making Supabase query...');
    console.log('- Table: reports');
    console.log('- Filtering by product_id:', productId);
    console.log('- Also filtering by image_status: completed');

    // First, let's try to find the product without the image_status filter to see if it exists
    const { data: checkData, error: checkError } = await supabase
      .from('reports')
      .select('product_id, image_status, verdict')
      .eq('product_id', productId);

    console.log('🔍 Product existence check:');
    console.log('- Found records:', checkData?.length || 0);
    if (checkData && checkData.length > 0) {
      console.log('- First record image_status:', (checkData[0] as any).image_status);
      console.log('- First record verdict:', (checkData[0] as any).verdict);
    }

    // Query the reports table by product_id and ensure image_status is completed
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('product_id', productId)
      .eq('image_status', 'completed')
      .single();

    if (error) {
      console.error('❌ Supabase Query Error Details:');
      console.error('- Error Code:', error.code);
      console.error('- Error Message:', error.message);
      console.error('- Error Details:', error.details);
      console.error('- Error Hint:', error.hint);
      console.error('- Product ID searched:', productId);

      // Check if it's a "not found" error vs a connection error
      if (error.code === 'PGRST116') {
        console.error('ℹ️  Product not found in database (this is normal if product doesn\'t exist)');
      } else {
        console.error('🚨 This appears to be a connection or authentication error');
      }

      return null;
    }

    if (!data) {
      console.log('⚠️ No data returned from Supabase (but no error)');
      return null;
    }

    console.log('✅ Successfully fetched product:', (data as any).product_name);
    console.log('- Product ID:', (data as any).product_id);
    console.log('- Image Status:', (data as any).image_status);
    console.log('- Results column exists:', !!(data as any).results);
    console.log('- Results has basic_tests:', !!((data as any).results?.basic_tests));
    console.log('- Results has contaminant_tests:', !!((data as any).results?.contaminant_tests));
    console.log('- Results has review:', !!((data as any).results?.review));

    // Validate that we have the essential data
    if (!(data as any).results) {
      console.warn('⚠️ Warning: Product has no results data in the results column');
    }

    return data;

  } catch (error) {
    console.error('💥 Unexpected error during Supabase query:');
    console.error('- Error type:', typeof error);
    console.error('- Error message:', error instanceof Error ? error.message : String(error));
    console.error('- Full error object:', JSON.stringify(error, null, 2));
    return null;
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;
  console.log('🔍 ProductPage called with productId:', productId);
  console.log('🔍 productId length:', productId.length);
  console.log('🔍 productId contains &:', productId.includes('&'));

  const product = await getProduct(productId);

  if (!product) {
    notFound();
  }


  const verdictColor = product.verdict === 'pass'
    ? 'text-emerald-600'
    : product.verdict === 'fail'
    ? 'text-red-600'
    : 'text-gray-600';

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <a href="/" className="hover:text-emerald-600">Home</a>
          <span>/</span>
          <a href={`/category/${product.product_category.toLowerCase().replace(/\s+/g, '-')}`} className="hover:text-emerald-600 capitalize">
            {product.product_category}
          </a>
          <span>/</span>
          <span className="text-gray-900">{product.product_name}</span>
        </nav>

        {/* Product Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="w-full">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{product.product_name}</h1>
            <p className="text-xl text-gray-600 mb-4">{product.company}</p>

            {/* Product Info Grid - Full Width */}
            {product.results?.product_info && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                {/* Exclude product_category and product_name/company_name as they're already shown above */}
                {product.results.product_info.serving_size && (
                  <div className="text-center">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Serving Size</p>
                    <p className="text-lg font-semibold text-gray-900">{product.results.product_info.serving_size}</p>
                  </div>
                )}
                  {product.results.product_info.price && (
                    <div className="text-center">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Price</p>
                      <p className="text-lg font-semibold text-gray-900">{product.results.product_info.price.toString().includes('₹') ? product.results.product_info.price : `₹${product.results.product_info.price}`}</p>
                    </div>
                  )}
                  {product.results.product_info.price_per_serving && (
                    <div className="text-center">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Price/Serving</p>
                      <p className="text-lg font-semibold text-gray-900">{product.results.product_info.price_per_serving.toString().includes('₹') ? product.results.product_info.price_per_serving : `₹${product.results.product_info.price_per_serving}`}</p>
                    </div>
                  )}
                {product.results.product_info.verdict && (
                  <div className="text-center">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Verdict</p>
                    <div className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${verdictColor}`}>
                      {product.results.product_info.verdict.toUpperCase()}
                    </div>
                  </div>
                )}
              </div>
            )}

              <div className="flex flex-wrap items-center gap-4 text-sm">
                {product.price && !product.results?.product_info?.price && (
                  <div className="text-lg font-bold text-gray-900">
                    {product.price.toString().includes('₹') ? product.price : `₹${product.price}`}
                  </div>
                )}
                {product.price_per_serving && !product.results?.product_info?.price_per_serving && (
                  <div className="text-sm text-gray-600">
                    {product.price_per_serving.toString().includes('₹') ? product.price_per_serving : `₹${product.price_per_serving}`} per serving
                  </div>
                )}
              </div>
          </div>
        </div>

        {/* Product Image */}
        <div className="bg-white rounded-lg shadow-sm p-12 mb-8">
          <div className="relative h-96 flex items-center justify-center">
            {product.image_url && product.image_status === 'completed' ? (
              <Image
                src={product.image_url}
                alt={product.product_name}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 1200px"
                priority
              />
            ) : (
              <div className="text-gray-400">
                <svg className="w-32 h-32" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* Test Reports */}
        <div className="space-y-12">
          {/* Basic Tests */}
          {product.results?.basic_tests && (
            <TestSection
              title="Basic Tests"
              verdict={(product.results.basic_tests as any).verdict || 'pass'}
              tests={product.results.basic_tests}
            />
          )}

          {/* Contaminant Tests */}
          {product.results?.contaminant_tests && (
            <TestSection
              title="Contaminant Tests"
              verdict={(product.results.contaminant_tests as any).verdict || 'pass'}
              tests={product.results.contaminant_tests}
            />
          )}

          {/* Subjective Analysis / Review */}
          {product.results?.review && (
            <TestSection
              title="Subjective Analysis"
              verdict={(product.results.review as any).verdict || 'pass'}
              tests={product.results.review}
            />
          )}
        </div>

        {/* Video Section */}
        {product.video_url && (
          <div className="mt-12 bg-white rounded-lg shadow-sm p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Detailed Lab Analysis</h3>
            <p className="text-gray-600 mb-6">Watch the complete testing process and detailed analysis of this product.</p>
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
              <iframe
                className="absolute top-0 left-0 w-full h-full rounded-lg"
                src={product.video_url.replace('watch?v=', 'embed/')}
                title="Product Review Video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

