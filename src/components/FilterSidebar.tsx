'use client';

import { useState, useEffect } from 'react';
import { FilterOptions, SortOptions, getCategoryFilters, NUTRIENT_RANGES } from '@/types';

interface FilterSidebarProps {
  onFilterChange: (filters: FilterOptions, sort?: SortOptions) => void;
  category: string;
  mobileDropdownsOpen?: { [key: string]: boolean };
  onMobileDropdownChange?: (dropdowns: { [key: string]: boolean }) => void;
}

export default function FilterSidebar({
  onFilterChange,
  category,
  mobileDropdownsOpen,
  onMobileDropdownChange
}: FilterSidebarProps) {
  const categoryConfig = getCategoryFilters(category);

  // Collapsible states
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
    sorting: true,      // Show sorting options by default
    verdict: true,      // Show overall verdict by default
    nutrients: true,    // Show protein/creatine ranges by default
    price: false,       // Hide price filters by default
    contaminants: false,// Hide contaminant filters by default
    subjective: false,  // Hide subjective analysis by default
    food: false         // Hide food tests by default
  });
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Filter states
  const [selectedVerdicts, setSelectedVerdicts] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [pricePerServingRange, setPricePerServingRange] = useState<[number, number]>([0, 1000]);
  const [selectedProteinRanges, setSelectedProteinRanges] = useState<string[]>([]);
  const [selectedCarbsRanges, setSelectedCarbsRanges] = useState<string[]>([]);
  const [selectedFatsRanges, setSelectedFatsRanges] = useState<string[]>([]);
  const [selectedCreatineRanges, setSelectedCreatineRanges] = useState<string[]>([]);

  // Contaminant filter states
  const [aflatoxins, setAflatoxins] = useState<string[]>([]);
  const [pesticides, setPesticides] = useState<string[]>([]);
  const [aminoSpiking, setAminoSpiking] = useState<string[]>([]);
  const [heavyMetals, setHeavyMetals] = useState<string[]>([]);
  const [melamineSpiking, setMelamineSpiking] = useState<string[]>([]);

  // Subjective analysis states
  const [taste, setTaste] = useState<string[]>([]);
  const [mixability, setMixability] = useState<string[]>([]);
  const [packaging, setPackaging] = useState<string[]>([]);
  const [servingSizeAccuracy, setServingSizeAccuracy] = useState<string[]>([]);

  // Food category states
  const [basicTestsVerdict, setBasicTestsVerdict] = useState<string[]>([]);
  const [contaminantTestsVerdict, setContaminantTestsVerdict] = useState<string[]>([]);
  const [reviewVerdict, setReviewVerdict] = useState<string[]>([]);

  // Sorting state
  const [sortField, setSortField] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const clearFilters = () => {
    setSelectedVerdicts([]);
    setPriceRange([0, 10000]);
    setPricePerServingRange([0, 1000]);
    setSelectedProteinRanges([]);
    setSelectedCarbsRanges([]);
    setSelectedFatsRanges([]);
    setSelectedCreatineRanges([]);

    setAflatoxins([]);
    setPesticides([]);
    setAminoSpiking([]);
    setHeavyMetals([]);
    setMelamineSpiking([]);

    setTaste([]);
    setMixability([]);
    setPackaging([]);
    setServingSizeAccuracy([]);

    setBasicTestsVerdict([]);
    setContaminantTestsVerdict([]);
    setReviewVerdict([]);

    setSortField('');
    setSortDirection('desc');

    onFilterChange({});
  };

  useEffect(() => {
    // Reset all filters when category changes
    clearFilters();
  }, [category]);

  const toggleSection = (section: string) => {
    if (onMobileDropdownChange && mobileDropdownsOpen !== undefined) {
      // Use external state for mobile dropdowns
      onMobileDropdownChange({
        ...mobileDropdownsOpen,
        [section]: !mobileDropdownsOpen[section]
      });
    } else {
      // Use local state for desktop collapsible sections
      setExpandedSections(prev => ({
        ...prev,
        [section]: !prev[section]
      }));
    }
  };

  const applyFilters = (newFilters: Partial<FilterOptions> = {}, newSort?: SortOptions) => {
    const filters: FilterOptions = {
      // Verdict
      verdict: selectedVerdicts.length > 0 ? selectedVerdicts : undefined,

      // Nutrients (using selected ranges)
      protein_per_serving: selectedProteinRanges.length > 0 ? selectedProteinRanges : undefined,
      carbs_per_serving: selectedCarbsRanges.length > 0 ? selectedCarbsRanges : undefined,
      fats_per_serving: selectedFatsRanges.length > 0 ? selectedFatsRanges : undefined,
      creatine_per_serving: selectedCreatineRanges.length > 0 ? selectedCreatineRanges : undefined,

      // Price
      price: priceRange[0] !== 0 || priceRange[1] !== 10000 ? priceRange : undefined,
      price_per_serving: pricePerServingRange[0] !== 0 || pricePerServingRange[1] !== 1000 ? pricePerServingRange : undefined,

      // Contaminants
      aflatoxins: aflatoxins.length > 0 ? aflatoxins : undefined,
      pesticides: pesticides.length > 0 ? pesticides : undefined,
      amino_spiking: aminoSpiking.length > 0 ? aminoSpiking : undefined,
      heavy_metals: heavyMetals.length > 0 ? heavyMetals : undefined,
      melamine_spiking: melamineSpiking.length > 0 ? melamineSpiking : undefined,

      // Subjective
      taste: taste.length > 0 ? taste : undefined,
      mixability: mixability.length > 0 ? mixability : undefined,
      packaging: packaging.length > 0 ? packaging : undefined,
      serving_size_accuracy: servingSizeAccuracy.length > 0 ? servingSizeAccuracy : undefined,

      // Food filters
      basic_tests_verdict: basicTestsVerdict.length > 0 ? basicTestsVerdict : undefined,
      contaminant_tests_verdict: contaminantTestsVerdict.length > 0 ? contaminantTestsVerdict : undefined,
      review_verdict: reviewVerdict.length > 0 ? reviewVerdict : undefined,

      ...newFilters
    };

    const sort = newSort || (sortField ? { field: sortField as any, direction: sortDirection } : undefined);
    onFilterChange(filters, sort);
  };

  const handleMultiSelectChange = (current: string[], value: string, setter: (value: string[]) => void, filterKey: keyof FilterOptions) => {
    const newValues = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    setter(newValues);
    // Pass the updated values directly to avoid state update timing issues
    applyFilters({ [filterKey]: newValues });
  };

  const handleRangeChange = (currentRange: [number, number], value: number, index: 0 | 1,
    setter: (range: [number, number]) => void, maxValue: number, filterKey: keyof FilterOptions) => {
    const newRange: [number, number] = [...currentRange];
    newRange[index] = value;
    setter(newRange);
    // Pass the updated range directly to avoid state update timing issues
    applyFilters({ [filterKey]: newRange });
  };

  const handleSortChange = (field: string) => {
    const typedField = field as SortOptions['field'];
    const newDirection = sortField === field && sortDirection === 'desc' ? 'asc' : 'desc';
    setSortField(field);
    setSortDirection(newDirection);
    applyFilters({}, { field: typedField, direction: newDirection });
  };


  const toggleSheet = () => {
    setIsSheetOpen((prev) => !prev);
  };

  const formatDisplayLabel = (value: string) => {
    if (value === 'not assigned') return 'Null';
    return value
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const SORT_PILL_OPTIONS: Array<{ field: SortOptions['field']; label: string }> = [
    { field: 'price_per_serving', label: 'Price per serving' },
    { field: 'protein_per_serving', label: 'Protein per serving' },
    { field: 'price', label: 'Price' }
  ];

  const renderSortingPills = () => {
    const availableSortingFields = categoryConfig.sortingFields as SortOptions['field'][];

    return (
      <div className="flex flex-wrap gap-2">
        {SORT_PILL_OPTIONS.filter((option) =>
          availableSortingFields.includes(option.field)
        ).map((option) => {
          const isActive = sortField === option.field;
          return (
            <button
              key={option.field}
              onClick={() => handleSortChange(option.field)}
              className={`px-4 py-2 text-sm font-semibold rounded-full transition-all duration-150 border ${isActive
                ? 'bg-emerald-500 text-white border-transparent shadow-[0_12px_30px_rgba(16,185,129,0.45)]'
                : 'bg-white/5 text-gray-200 border-white/15 hover:bg-white/10'
                }`}
            >
              {option.label}
              {isActive && (
                <span className="ml-2 text-[0.65rem] font-semibold">
                  {sortDirection === 'desc' ? '↓' : '↑'}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  };

  const renderMobileNutrientPills = () => (
    <div className="space-y-4">
      {categoryConfig.nutrients.map((nutrient) => {
        const nutrientTitles = {
          protein: 'Protein per serving',
          carbs: 'Carbs per serving',
          fats: 'Fats per serving',
          creatine: 'Creatine per serving'
        };

        const title = nutrientTitles[nutrient as keyof typeof nutrientTitles];
        if (!title) return null;

        const rangeStates = {
          protein: { state: selectedProteinRanges, setter: setSelectedProteinRanges },
          carbs: { state: selectedCarbsRanges, setter: setSelectedCarbsRanges },
          fats: { state: selectedFatsRanges, setter: setSelectedFatsRanges },
          creatine: { state: selectedCreatineRanges, setter: setSelectedCreatineRanges }
        };

        const state = rangeStates[nutrient as keyof typeof rangeStates];
        if (!state) return null;

        const ranges = NUTRIENT_RANGES[nutrient as keyof typeof NUTRIENT_RANGES] ?? [];

        return (
          <div key={nutrient}>
            <h5 className="text-sm font-semibold text-gray-200 mb-2">{title}</h5>
            {renderMultiSelectFilter(
              '',
              ranges.map((range) => range.label),
              state.state,
              state.setter,
              `${nutrient}_per_serving` as keyof FilterOptions,
              'pill'
            )}
          </div>
        );
      })}
    </div>
  );

  const renderPriceSlider = () => (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.4em] text-gray-400">
        <span>Price</span>
        <span className="whitespace-nowrap">
          ₹{priceRange[0]} - ₹{priceRange[1]}
        </span>
      </div>
      <div className="space-y-2">
        <input
          type="range"
          min={0}
          max={priceRange[1]}
          step={10}
          value={priceRange[0]}
          onChange={(e) =>
            handleRangeChange(
              priceRange,
              Math.min(parseInt(e.target.value, 10) || 0, priceRange[1]),
              0,
              setPriceRange,
              10000,
              'price'
            )
          }
          className="w-full accent-emerald-400"
          aria-label="Minimum price"
        />
        <input
          type="range"
          min={priceRange[0]}
          max={10000}
          step={10}
          value={priceRange[1]}
          onChange={(e) =>
            handleRangeChange(
              priceRange,
              Math.max(parseInt(e.target.value, 10) || 0, priceRange[0]),
              1,
              setPriceRange,
              10000,
              'price'
            )
          }
          className="w-full accent-emerald-400"
          aria-label="Maximum price"
        />
      </div>
      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>Min ₹{priceRange[0]}</span>
        <span>Max ₹{priceRange[1]}</span>
      </div>
    </div>
  );

  const renderCollapsibleSection = (
    title: string,
    sectionKey: string,
    children: React.ReactNode
  ) => (
    <div className="mb-6">
      <button
        onClick={() => toggleSection(sectionKey)}
        className="w-full flex items-center justify-between font-semibold text-gray-900 mb-3 hover:text-emerald-700"
      >
        <span>{title}</span>
        <svg
          className={`w-5 h-5 transition-transform ${expandedSections[sectionKey] ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {expandedSections[sectionKey] && children}
    </div>
  );

  const renderRangeFilter = (
    title: string,
    range: [number, number],
    min: number,
    max: number,
    setter: (range: [number, number]) => void,
    unit: string = '',
    step: number = 1,
    filterKey: keyof FilterOptions
  ) => (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Min</label>
          <input
            type="number"
            min={min}
            max={max}
            step={step}
            value={range[0]}
            onChange={(e) => handleRangeChange(range, parseFloat(e.target.value) || min, 0, setter, max, filterKey)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Max</label>
          <input
            type="number"
            min={min}
            max={max}
            step={step}
            value={range[1]}
            onChange={(e) => handleRangeChange(range, parseFloat(e.target.value) || max, 1, setter, max, filterKey)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
      </div>
      <div className="text-sm text-gray-500">
        Range: {range[0]}{unit} - {range[1]}{unit}
      </div>
    </div>
  );

  const renderNutrientRangeFilter = (
    title: string,
    selectedRanges: string[],
    setter: (ranges: string[]) => void,
    nutrient: string,
    filterKey: keyof FilterOptions
  ) => (
    <div className="space-y-2">
      {NUTRIENT_RANGES[nutrient as keyof typeof NUTRIENT_RANGES].map((range) => (
        <label key={range.label} className="flex items-center cursor-pointer group">
          <input
            type="checkbox"
            checked={selectedRanges.includes(range.label)}
            onChange={() => {
              const newRanges = selectedRanges.includes(range.label)
                ? selectedRanges.filter(r => r !== range.label)
                : [...selectedRanges, range.label];
              setter(newRanges);
              // Pass the updated ranges directly to avoid state update timing issues
              applyFilters({ [filterKey]: newRanges });
            }}
            className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
          />
          <span className="ml-2 text-sm text-gray-700 group-hover:text-emerald-800">
            {range.label}
          </span>
        </label>
      ))}
    </div>
  );

  const renderMultiSelectFilter = (
    title: string,
    options: string[],
    selected: string[],
    setter: (value: string[]) => void,
    filterKey: keyof FilterOptions,
    variant: 'checkbox' | 'pill' = 'checkbox'
  ) => {
    if (variant === 'pill') {
      return (
        <div className="flex flex-wrap gap-2">
          {options.map((option) => {
            const isActive = selected.includes(option);
            return (
              <button
                key={option}
                onClick={() => handleMultiSelectChange(selected, option, setter, filterKey)}
                className={`px-4 py-2 text-xs font-semibold rounded-full border transition-all duration-150 ${isActive
                  ? 'bg-emerald-500 text-white border-transparent shadow-[0_10px_30px_rgba(16,185,129,0.4)]'
                  : 'bg-white/5 text-gray-200 border-white/10 hover:bg-white/10'
                  }`}
              >
                {formatDisplayLabel(option)}
              </button>
            );
          })}
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {options.map((option) => (
          <label key={option} className="flex items-center cursor-pointer group">
            <input
              type="checkbox"
              checked={selected.includes(option)}
              onChange={() => handleMultiSelectChange(selected, option, setter, filterKey)}
              className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
            />
            <span className="ml-2 text-sm text-gray-700 capitalize group-hover:text-emerald-800">
              {option === 'not assigned' ? 'No Result' : option}
            </span>
          </label>
        ))}
      </div>
    );
  };

  const countActiveFilters = () => {
    let count = 0;

    if (selectedVerdicts.length > 0) count++;
    if (priceRange[0] !== 0 || priceRange[1] !== 10000) count++;
    if (pricePerServingRange[0] !== 0 || pricePerServingRange[1] !== 1000) count++;
    if (selectedProteinRanges.length > 0) count++;
    if (selectedCarbsRanges.length > 0) count++;
    if (selectedFatsRanges.length > 0) count++;
    if (selectedCreatineRanges.length > 0) count++;

    if (aflatoxins.length > 0) count++;
    if (pesticides.length > 0) count++;
    if (aminoSpiking.length > 0) count++;
    if (heavyMetals.length > 0) count++;
    if (melamineSpiking.length > 0) count++;

    if (taste.length > 0) count++;
    if (mixability.length > 0) count++;
    if (packaging.length > 0) count++;
    if (servingSizeAccuracy.length > 0) count++;

    if (basicTestsVerdict.length > 0) count++;
    if (contaminantTestsVerdict.length > 0) count++;
    if (reviewVerdict.length > 0) count++;

    return count;
  };

  return (
    <>
      {/* Desktop Layout */}
      <div className="hidden md:block bg-white rounded-lg shadow-md p-6 sticky top-20">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900">Filters</h3>
          <button
            onClick={clearFilters}
            className="text-sm text-emerald-600 hover:text-emerald-800 font-medium"
          >
            Clear All
          </button>
        </div>

        {/* Sorting Section */}
        {categoryConfig.hasSorting && renderCollapsibleSection(
          'Sort By',
          'sorting',
          <div className="space-y-2">
            {categoryConfig.sortingFields
              .filter(field => expandedSections.sorting ||
                (category.toLowerCase().includes('creatine') && field === 'creatine_per_serving') ||
                ['price', 'price_per_serving', 'protein_per_serving'].includes(field))
              .map((field) => (
                <button
                  key={field}
                  onClick={() => handleSortChange(field)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${sortField === field
                    ? 'bg-emerald-100 text-emerald-800 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  {field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  {sortField === field && (
                    <span className="float-right">
                      {sortDirection === 'desc' ? '↓' : '↑'}
                    </span>
                  )}
                </button>
              ))}
          </div>
        )}

        {/* Verdict Filter */}
        {categoryConfig.hasVerdict && renderCollapsibleSection(
          'Overall Verdict',
          'verdict',
          renderMultiSelectFilter(
            '',
            ['pass', 'fail', 'not assigned'],
            selectedVerdicts,
            setSelectedVerdicts,
            'verdict'
          )
        )}

        {/* Nutrient Filters */}
        {categoryConfig.hasNutrients && renderCollapsibleSection(
          'Nutrients Per Serving',
          'nutrients',
          <div className="space-y-6">
            {categoryConfig.nutrients
              .map((nutrient) => {
                const nutrientTitles = {
                  protein: 'Protein Per Serving',
                  carbs: 'Carbs Per Serving',
                  fats: 'Fats Per Serving',
                  creatine: 'Creatine Per Serving'
                };

                const title = nutrientTitles[nutrient as keyof typeof nutrientTitles];
                if (!title) return null;

                const rangeStates = {
                  protein: { state: selectedProteinRanges, setter: setSelectedProteinRanges },
                  carbs: { state: selectedCarbsRanges, setter: setSelectedCarbsRanges },
                  fats: { state: selectedFatsRanges, setter: setSelectedFatsRanges },
                  creatine: { state: selectedCreatineRanges, setter: setSelectedCreatineRanges }
                };

                const state = rangeStates[nutrient as keyof typeof rangeStates];
                if (!state) return null;

                return (
                  <div key={nutrient} className="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
                    <h5 className="font-medium text-gray-900 mb-3">{title}</h5>
                    {renderNutrientRangeFilter(title, state.state, state.setter, nutrient, `${nutrient}_per_serving` as keyof FilterOptions)}
                  </div>
                );
              })}
          </div>
        )}

        {/* Price Filters */}
        {(categoryConfig.hasPrice || categoryConfig.hasPricePerServing) && renderCollapsibleSection(
          'Price',
          'price',
          <div className="space-y-6">
            {categoryConfig.hasPrice && renderRangeFilter(
              'Price (₹)',
              priceRange,
              0,
              10000,
              setPriceRange,
              '₹',
              1,
              'price'
            )}
            {categoryConfig.hasPricePerServing && renderRangeFilter(
              'Price Per Serving (₹)',
              pricePerServingRange,
              0,
              1000,
              setPricePerServingRange,
              '₹',
              0.1,
              'price_per_serving'
            )}
          </div>
        )}

        {/* Contaminant Filters */}
        {categoryConfig.hasContaminants && categoryConfig.contaminants.length > 0 && renderCollapsibleSection(
          'Contaminant Tests',
          'contaminants',
          <div className="space-y-4">
            {categoryConfig.contaminants.map((contaminant) => {
              const contaminantStates = {
                aflatoxins: { state: aflatoxins, setter: setAflatoxins },
                pesticides: { state: pesticides, setter: setPesticides },
                amino_spiking: { state: aminoSpiking, setter: setAminoSpiking },
                heavy_metals: { state: heavyMetals, setter: setHeavyMetals },
                melamine_spiking: { state: melamineSpiking, setter: setMelamineSpiking }
              };

              const state = contaminantStates[contaminant as keyof typeof contaminantStates];
              if (!state) return null;

              return (
                <div key={contaminant}>
                  <h5 className="text-sm font-medium text-gray-700 mb-2 capitalize">
                    {contaminant.replace('_', ' ')}
                  </h5>
                  {renderMultiSelectFilter(
                    '',
                    ['pass', 'fail'],
                    state.state,
                    state.setter,
                    contaminant as keyof FilterOptions
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Subjective Analysis Filters */}
        {categoryConfig.hasSubjective && renderCollapsibleSection(
          'Subjective Analysis',
          'subjective',
          <div className="space-y-4">
            {[
              { key: 'taste', state: taste, setter: setTaste },
              { key: 'mixability', state: mixability, setter: setMixability },
              { key: 'packaging', state: packaging, setter: setPackaging },
              { key: 'serving_size_accuracy', state: servingSizeAccuracy, setter: setServingSizeAccuracy }
            ].map(({ key, state, setter }) => (
              <div key={key}>
                <h5 className="text-sm font-medium text-gray-700 mb-2 capitalize">
                  {key.replace('_', ' ')}
                </h5>
                {renderMultiSelectFilter(
                  '',
                  ['pass', 'fail', 'neutral'],
                  state,
                  setter,
                  key as keyof FilterOptions
                )}
              </div>
            ))}
          </div>
        )}

        {/* Food Category Filters */}
        {categoryConfig.hasFoodFilters && renderCollapsibleSection(
          'Test Results',
          'food',
          <div className="space-y-6">
            {renderMultiSelectFilter(
              'Basic Tests',
              ['pass', 'fail'],
              basicTestsVerdict,
              setBasicTestsVerdict,
              'basic_tests_verdict'
            )}
            {renderMultiSelectFilter(
              'Contaminant Tests',
              ['pass', 'fail'],
              contaminantTestsVerdict,
              setContaminantTestsVerdict,
              'contaminant_tests_verdict'
            )}
            {renderMultiSelectFilter(
              'Review',
              ['pass', 'fail'],
              reviewVerdict,
              setReviewVerdict,
              'review_verdict'
            )}
          </div>
        )}

        {/* Active Filters Count */}
        {countActiveFilters() > 0 && (
          <div className="mt-6 p-3 bg-emerald-50 rounded-lg">
            <p className="text-sm text-emerald-800 font-medium">
              {countActiveFilters()} active filter(s)
            </p>
          </div>
        )}
      </div>

      {/* Mobile Bottom Sheet */}
      <div className="md:hidden">
        <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center">
          <div
            className={`w-full max-w-3xl transition-[height] duration-300 ease-out ${isSheetOpen ? 'h-[80vh]' : 'h-16'
              }`}
          >
            <div className="relative h-full">
              <div className="absolute inset-0 rounded-t-[32px] border border-white/10 bg-neutral-900" />
              <div className="relative flex h-full flex-col">
                <button
                  type="button"
                  onClick={toggleSheet}
                  className="flex flex-col items-center gap-2 px-6 pt-3 pb-2 text-center focus:outline-none"
                >
                  <span className="block h-1.5 w-12 rounded-full bg-white/30" />
                  <span className="text-[0.65rem] font-semibold uppercase tracking-[0.5em] text-gray-300">
                    Sorting & Filters
                  </span>
                </button>

                <div
                  className={`flex flex-1 flex-col gap-4 px-5 pb-6 transition-all duration-300 ${isSheetOpen
                    ? 'opacity-100 max-h-[calc(80vh-72px)] overflow-y-auto'
                    : 'opacity-0 max-h-0 overflow-hidden'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-[0.4em] text-gray-400">
                      Filter Deck
                    </p>
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="text-xs font-semibold text-emerald-400 uppercase tracking-[0.3em] transition-colors hover:text-emerald-200"
                    >
                      Clear All
                    </button>
                  </div>

                  {categoryConfig.hasSorting && (
                    <section className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.4em] text-gray-400">
                        Sorting
                      </p>
                      {renderSortingPills()}
                    </section>
                  )}

                  {categoryConfig.hasVerdict && (
                    <section className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.4em] text-gray-400">
                        Verdict
                      </p>
                      {renderMultiSelectFilter(
                        '',
                        ['pass', 'fail', 'not assigned'],
                        selectedVerdicts,
                        setSelectedVerdicts,
                        'verdict',
                        'pill'
                      )}
                    </section>
                  )}

                  {categoryConfig.hasNutrients && (
                    <section className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.4em] text-gray-400">
                        Nutrients per serving
                      </p>
                      {renderMobileNutrientPills()}
                    </section>
                  )}

                  {categoryConfig.hasPrice && (
                    <section className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.4em] text-gray-400">
                        Price
                      </p>
                      {renderPriceSlider()}
                    </section>
                  )}

                  {categoryConfig.hasContaminants && categoryConfig.contaminants.length > 0 && (
                    <section className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.4em] text-gray-400">
                        Contaminants
                      </p>
                      {categoryConfig.contaminants.map((contaminant) => {
                        const contaminantStates = {
                          aflatoxins: { state: aflatoxins, setter: setAflatoxins },
                          pesticides: { state: pesticides, setter: setPesticides },
                          amino_spiking: { state: aminoSpiking, setter: setAminoSpiking },
                          heavy_metals: { state: heavyMetals, setter: setHeavyMetals },
                          melamine_spiking: { state: melamineSpiking, setter: setMelamineSpiking }
                        };

                        const state = contaminantStates[contaminant as keyof typeof contaminantStates];
                        if (!state) return null;

                        return (
                          <div key={contaminant}>
                            <h5 className="text-xs font-semibold tracking-[0.2em] text-gray-500 capitalize">
                              {contaminant.replace('_', ' ')}
                            </h5>
                            {renderMultiSelectFilter(
                              '',
                              ['pass', 'fail'],
                              state.state,
                              state.setter,
                              contaminant as keyof FilterOptions,
                              'pill'
                            )}
                          </div>
                        );
                      })}
                    </section>
                  )}

                  {categoryConfig.hasSubjective && (
                    <section className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.4em] text-gray-400">
                        Subjective
                      </p>
                      {[
                        { key: 'taste', state: taste, setter: setTaste },
                        { key: 'mixability', state: mixability, setter: setMixability },
                        { key: 'packaging', state: packaging, setter: setPackaging },
                        { key: 'serving_size_accuracy', state: servingSizeAccuracy, setter: setServingSizeAccuracy }
                      ].map(({ key, state, setter }) => (
                        <div key={key}>
                          <h5 className="text-xs font-semibold tracking-[0.2em] text-gray-500 capitalize">
                            {key.replace('_', ' ')}
                          </h5>
                          {renderMultiSelectFilter(
                            '',
                            ['pass', 'fail', 'neutral'],
                            state,
                            setter,
                            key as keyof FilterOptions,
                            'pill'
                          )}
                        </div>
                      ))}
                    </section>
                  )}

                  {countActiveFilters() > 0 && (
                    <div className="flex justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs font-semibold uppercase tracking-[0.4em] text-emerald-200">
                      {countActiveFilters()} active filter(s)
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

