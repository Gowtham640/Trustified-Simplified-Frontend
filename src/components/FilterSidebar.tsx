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
    const newDirection = sortField === field && sortDirection === 'desc' ? 'asc' : 'desc';
    setSortField(field);
    setSortDirection(newDirection);
    applyFilters({}, { field: field as SortOptions['field'], direction: newDirection });
  };

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
    filterKey: keyof FilterOptions
  ) => (
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

  // Mobile dropdown component
  const renderMobileDropdown = (
    title: string,
    sectionKey: string,
    children: React.ReactNode
  ) => (
    <div>
      <button
        onClick={() => toggleSection(sectionKey)}
        className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-300 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
      >
        <span>{title}</span>
        <svg
          className={`w-4 h-4 transition-transform ${expandedSections[sectionKey] ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {(mobileDropdownsOpen ? mobileDropdownsOpen[sectionKey] : expandedSections[sectionKey]) && (
        <div className="mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          <div className="p-3">
            {children}
          </div>
        </div>
      )}
    </div>
  );

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
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                sortField === field
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

    {/* Mobile Layout */}
    <div className="md:hidden bg-white border-t border-gray-200 px-4 py-3 sticky top-0 z-40">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-gray-900">Filters & Sort</h3>
        <button
          onClick={clearFilters}
          className="text-xs text-emerald-600 hover:text-emerald-800 font-medium"
        >
          Clear All
        </button>
      </div>

      <div
        className="flex gap-2 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden"
      >
        {/* Sorting Dropdown */}
        {categoryConfig.hasSorting && renderMobileDropdown(
          'Sort',
          'sorting',
          <div className="space-y-1">
            {categoryConfig.sortingFields
              .filter(field => expandedSections.sorting ||
                (category.toLowerCase().includes('creatine') && field === 'creatine_per_serving') ||
                ['price', 'price_per_serving', 'protein_per_serving'].includes(field))
              .map((field) => (
              <button
                key={field}
                onClick={() => handleSortChange(field)}
                className={`w-full text-left px-2 py-1 rounded text-xs transition-colors ${
                  sortField === field
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
        {categoryConfig.hasVerdict && renderMobileDropdown(
          'Verdict',
          'verdict',
          renderMultiSelectFilter(
            '',
            ['pass', 'fail', 'not assigned'],
            selectedVerdicts,
            setSelectedVerdicts,
            'verdict'
          )
        )}

        {/* Nutrients Filter */}
        {categoryConfig.hasNutrients && renderMobileDropdown(
          'Nutrients',
          'nutrients',
          <div className="space-y-4">
            {categoryConfig.nutrients.map((nutrient) => {
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
                <div key={nutrient} className="border-b border-gray-200 pb-3 last:border-b-0 last:pb-0">
                  <h5 className="text-xs font-medium text-gray-900 mb-2">{title}</h5>
                  {renderNutrientRangeFilter(title, state.state, state.setter, nutrient, `${nutrient}_per_serving` as keyof FilterOptions)}
                </div>
              );
            })}
          </div>
        )}

        {/* Price Filter */}
        {(categoryConfig.hasPrice || categoryConfig.hasPricePerServing) && renderMobileDropdown(
          'Price',
          'price',
          <div className="space-y-4">
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

        {/* Contaminants Filter */}
        {categoryConfig.hasContaminants && categoryConfig.contaminants.length > 0 && renderMobileDropdown(
          'Contaminants',
          'contaminants',
          <div className="space-y-3">
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
                  <h5 className="text-xs font-medium text-gray-700 mb-2 capitalize">
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

        {/* Subjective Analysis Filter */}
        {categoryConfig.hasSubjective && renderMobileDropdown(
          'Subjective',
          'subjective',
          <div className="space-y-3">
            {[
              { key: 'taste', state: taste, setter: setTaste },
              { key: 'mixability', state: mixability, setter: setMixability },
              { key: 'packaging', state: packaging, setter: setPackaging },
              { key: 'serving_size_accuracy', state: servingSizeAccuracy, setter: setServingSizeAccuracy }
            ].map(({ key, state, setter }) => (
              <div key={key}>
                <h5 className="text-xs font-medium text-gray-700 mb-2 capitalize">
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

        {/* Food Tests Filter */}
        {categoryConfig.hasFoodFilters && renderMobileDropdown(
          'Tests',
          'food',
          <div className="space-y-4">
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
      </div>

      {/* Active Filters Count */}
      {countActiveFilters() > 0 && (
        <div className="mt-2 px-2 py-1 bg-emerald-50 rounded text-xs text-emerald-800 font-medium text-center">
          {countActiveFilters()} active
        </div>
      )}
    </div>
    </>
  );
}

