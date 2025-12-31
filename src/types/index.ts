export interface Report {
  id: number;
  product_id: string;
  product_name: string;
  product_category: string;
  company: string;
  verdict: 'pass' | 'fail' | 'not assigned' | 'pending';
  price: number | null;
  price_per_serving: number | null;
  image_url: string | null;
  image_status: 'pending' | 'completed' | 'failed';
  video_url: string;
  video_id: number;
  results: ReportResults;
  created_at: string;
  updated_at: string;
}

export interface ReportResults {
  product_info?: ProductInfo;
  basic_tests?: BasicTests;
  contaminant_tests?: ContaminantTests;
  review?: Review;
  debug_info?: DebugInfo;
}

export interface ProductInfo {
  product_name: string;
  company_name: string;
  product_category: string;
  serving_size: string;
  price: string;
  price_per_serving: string;
  verdict: string;
}

export interface BasicTests {
  [key: string]: TestResult;
}

export interface ContaminantTests {
  [key: string]: TestResult | ContaminantGroup;
}

export interface ContaminantGroup {
  note?: string;
  verdict?: string;
  [key: string]: unknown;
}

export interface Review {
  [key: string]: {
    rating?: string;
    note?: string;
    verdict: string;
  };
}

export interface TestResult {
  tested?: string;
  claimed?: string;
  rating?: string;
  note?: string;
  verdict: string;
}

export interface DebugInfo {
  can_access_url?: boolean;
  request_timestamp?: string;
}

export type FilterOptions = {
  verdict?: string[];
  protein_per_serving?: string[];
  carbs_per_serving?: string[];
  fats_per_serving?: string[];
  creatine_per_serving?: string[];
  price?: [number, number];
  price_per_serving?: [number, number];
  company?: string[];

  // Contaminant filters
  aflatoxins?: string[];
  pesticides?: string[];
  amino_spiking?: string[];
  heavy_metals?: string[];
  melamine_spiking?: string[];

  // Omega 3 specific contaminants (will be determined from data)
  omega3_contaminants?: { [key: string]: string[] };

  // Subjective analysis filters
  taste?: string[];
  mixability?: string[];
  packaging?: string[];
  serving_size_accuracy?: string[];

  // Food/Others category filters
  basic_tests_verdict?: string[];
  contaminant_tests_verdict?: string[];
  review_verdict?: string[];
};

export type SortOptions = {
  field: 'price' | 'price_per_serving' | 'protein_per_serving' | 'carbs_per_serving' | 'fats_per_serving' | 'creatine_per_serving';
  direction: 'asc' | 'desc';
};

export const CATEGORIES = [
  'Whey Concentrate',
  'Whey Isolate',
  'Whey Blend',
  'Creatine',
  'Omega 3',
  'Food',
  'Plant Protein',
  'All Products'
];

// Predefined range options for nutrients
export const NUTRIENT_RANGES = {
  protein: [
    { label: '< 20g', min: 0, max: 20 },
    { label: '20-22g', min: 20, max: 22 },
    { label: '22-25g', min: 22, max: 25 },
    { label: '> 25g', min: 25, max: Infinity }
  ],
  carbs: [
    { label: '< 5g', min: 0, max: 5 },
    { label: '5-10g', min: 5, max: 10 },
    { label: '10-20g', min: 10, max: 20 },
    { label: '20-30g', min: 20, max: 30 },
    { label: '> 30g', min: 30, max: Infinity }
  ],
  fats: [
    { label: '< 5g', min: 0, max: 5 },
    { label: '5-10g', min: 5, max: 10 },
    { label: '10-15g', min: 10, max: 15 },
    { label: '> 15g', min: 15, max: Infinity }
  ],
  creatine: [
    { label: '< 3g', min: 0, max: 3 },
    { label: '3-4g', min: 3, max: 4 },
    { label: '4-5g', min: 4, max: 5 },
    { label: '> 5g', min: 5, max: Infinity }
  ]
};

export const matchesNutrientRange = (value: number, selectedRanges: string[], nutrient: string): boolean => {
  if (!selectedRanges.length) return true;

  const ranges = NUTRIENT_RANGES[nutrient as keyof typeof NUTRIENT_RANGES];
  if (!ranges) return true;

  return selectedRanges.some(rangeLabel => {
    const range = ranges.find(r => r.label === rangeLabel);
    if (!range) return false;
    return value >= range.min && (range.max === Infinity ? value > range.min : value <= range.max);
  });
};

// Utility functions for extracting data from product reports
export const getNutrientValue = (product: Report, nutrient: string): number | null => {
  const basicTests = product.results?.basic_tests;
  if (!basicTests || !basicTests[`${nutrient}_per_serving`]) return null;

  const tested = basicTests[`${nutrient}_per_serving`].tested;
  return tested ? parseFloat(tested) || null : null;
};

export const getPricePerServing = (product: Report): number | null => {
  const productInfo = product.results?.product_info;
  if (!productInfo?.price_per_serving) return null;

  const priceStr = productInfo.price_per_serving.replace(/[^\d.]/g, '');
  return parseFloat(priceStr) || null;
};

export const getContaminantVerdict = (product: Report, contaminant: string): string | null => {
  const contaminantTests = product.results?.contaminant_tests;
  if (!contaminantTests) return null;

  // Check if it's a direct test result
  if (contaminantTests[contaminant]?.verdict) {
    return contaminantTests[contaminant].verdict;
  }

  // Check if it's within a contaminant group
  for (const [key, value] of Object.entries(contaminantTests)) {
    if (typeof value === 'object' && value !== null && 'verdict' in value) {
      if (key.toLowerCase().includes(contaminant.toLowerCase())) {
        return (value as TestResult | ContaminantGroup).verdict || null;
      }
    }
  }

  return null;
};

export const getSubjectiveVerdict = (product: Report, aspect: string): string | null => {
  const review = product.results?.review;
  if (!review) return null;

  const aspectData = review[aspect];
  return aspectData?.verdict || null;
};

export const getBasicTestsVerdict = (product: Report): string | null => {
  const basicTests = product.results?.basic_tests;
  if (!basicTests) return null;

  // Get overall verdict from basic tests
  const verdicts = Object.values(basicTests).map(test => test.verdict).filter(Boolean);
  if (verdicts.length === 0) return null;

  // Return 'pass' if all pass, 'fail' if any fail, otherwise 'mixed'
  const hasFail = verdicts.some(v => v === 'fail');
  const hasPass = verdicts.some(v => v === 'pass');

  if (hasFail) return 'fail';
  if (hasPass) return 'pass';
  return 'mixed';
};

export const getContaminantTestsVerdict = (product: Report): string | null => {
  const contaminantTests = product.results?.contaminant_tests;
  if (!contaminantTests) return null;

  const verdicts: string[] = [];

  for (const value of Object.values(contaminantTests)) {
    if (typeof value === 'object' && value !== null && 'verdict' in value) {
      const verdict = (value as TestResult | ContaminantGroup).verdict;
      if (verdict) verdicts.push(verdict);
    }
  }

  if (verdicts.length === 0) return null;

  const hasFail = verdicts.some(v => v === 'fail');
  const hasPass = verdicts.some(v => v === 'pass');

  if (hasFail) return 'fail';
  if (hasPass) return 'pass';
  return 'mixed';
};

export const getReviewVerdict = (product: Report): string | null => {
  const review = product.results?.review;
  if (!review) return null;

  const verdicts = Object.values(review).map(r => r.verdict).filter(Boolean);
  if (verdicts.length === 0) return null;

  const hasFail = verdicts.some(v => v === 'fail');
  const hasPass = verdicts.some(v => v === 'pass');

  if (hasFail) return 'fail';
  if (hasPass) return 'pass';
  return 'mixed';
};

// Category-specific filter configurations
export const getCategoryFilters = (category: string) => {
  const lowerCategory = category.toLowerCase();

  if (lowerCategory.includes('whey') || lowerCategory.includes('plant protein')) {
    return {
      hasVerdict: true,
      hasNutrients: true,
      nutrients: ['protein'],
      hasContaminants: true,
      contaminants: ['aflatoxins', 'pesticides', 'amino_spiking', 'heavy_metals', 'melamine_spiking'],
      hasSubjective: true,
      subjective: ['taste', 'mixability', 'packaging', 'serving_size_accuracy'],
      hasPrice: true,
      hasPricePerServing: true,
      hasSorting: true,
      sortingFields: ['price', 'price_per_serving', 'protein_per_serving']
    };
  }

  if (lowerCategory.includes('creatine')) {
    return {
      hasVerdict: true,
      hasNutrients: true,
      nutrients: ['creatine'], // creatine instead of protein
      hasContaminants: true,
      contaminants: ['aflatoxins', 'pesticides', 'amino_spiking', 'heavy_metals', 'melamine_spiking'],
      hasSubjective: true,
      subjective: ['taste', 'mixability', 'packaging', 'serving_size_accuracy'],
      hasPrice: true,
      hasPricePerServing: true,
      hasSorting: true,
      sortingFields: ['price', 'price_per_serving', 'creatine_per_serving']
    };
  }

  if (lowerCategory.includes('omega')) {
    return {
      hasVerdict: true,
      hasNutrients: false, // no carbs/fats for omega 3
      nutrients: [],
      hasContaminants: true,
      contaminants: [], // will be determined from actual data
      hasSubjective: true,
      subjective: ['taste', 'mixability', 'packaging', 'serving_size_accuracy'],
      hasPrice: true,
      hasPricePerServing: true,
      hasSorting: true,
      sortingFields: ['price', 'price_per_serving']
    };
  }

  if (lowerCategory.includes('food') || lowerCategory.includes('other')) {
    return {
      hasVerdict: false,
      hasNutrients: false,
      nutrients: [],
      hasContaminants: false,
      contaminants: [],
      hasSubjective: false,
      subjective: [],
      hasPrice: true,
      hasPricePerServing: true,
      hasSorting: false,
      sortingFields: [],
      hasFoodFilters: true
    };
  }

  // Default/All products - show all possible filters
  return {
    hasVerdict: true,
    hasNutrients: true,
    nutrients: ['protein', 'creatine'],
    hasContaminants: true,
    contaminants: ['aflatoxins', 'pesticides', 'amino_spiking', 'heavy_metals', 'melamine_spiking'],
    hasSubjective: true,
    subjective: ['taste', 'mixability', 'packaging', 'serving_size_accuracy'],
    hasPrice: true,
    hasPricePerServing: true,
    hasSorting: true,
    sortingFields: ['price', 'price_per_serving', 'protein_per_serving', 'creatine_per_serving']
  };
};

