'use client';

import { useState } from 'react';

interface ExpandableNoteProps {
  note: string;
  maxLength?: number;
}

function ExpandableNote({ note, maxLength = 100 }: ExpandableNoteProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldTruncate = note.length > maxLength;

  if (!shouldTruncate) {
    return <p className="text-xs text-gray-600 leading-relaxed">{note}</p>;
  }

  return (
    <div>
      <p className="text-xs text-gray-600 leading-relaxed">
        {isExpanded ? note : `${note.substring(0, maxLength)}...`}
      </p>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="mt-1 text-xs text-emerald-600 hover:text-emerald-700 font-medium"
      >
        {isExpanded ? 'Show less' : 'Read more'}
      </button>
    </div>
  );
}

interface TestCardProps {
  testName: string;
  testData: any;
  isNested?: boolean;
}

function TestCard({ testName, testData, isNested = false }: TestCardProps) {
  const verdict = testData.verdict?.toLowerCase();
  const isPass = verdict === 'pass';
  const isFail = verdict === 'fail';
  const isNeutral = !verdict || verdict === 'not assigned' || verdict === 'pending';

  const bgClass = isPass ? 'bg-emerald-100' : isFail ? 'bg-red-100' : 'bg-white';
  const borderClass = isPass ? 'border-emerald-300' : isFail ? 'border-red-300' : 'border-gray-300';
  const hoverClass = isNested ? '' : `hover:shadow-lg hover:-translate-y-1 ${isPass ? 'hover:bg-emerald-200 hover:border-emerald-400' : isFail ? 'hover:bg-red-200 hover:border-red-400' : 'hover:bg-gray-100 hover:border-gray-400'} transition-all duration-300`;

  return (
    <div className={`rounded-lg p-3 border-2 min-h-[140px] ${bgClass} ${borderClass} shadow-sm ${hoverClass}`}>
      {/* Test Name */}
      <div className="flex items-start justify-between mb-3">
        <h4 className={`${isNested ? 'text-xs' : 'text-sm'} font-semibold text-gray-900 capitalize flex-1`}>
          {testName.replace(/_/g, ' ')}
        </h4>
        {testData.verdict && (
          <span className={`ml-2 px-2 py-1 rounded-full text-xs font-bold shrink-0 ${
            isPass ? 'bg-emerald-600 text-white' : isFail ? 'bg-red-600 text-white' : 'bg-gray-500 text-white'
          }`}>
            {testData.verdict.toUpperCase()}
          </span>
        )}
      </div>

      {/* Test Values */}
      <div className="space-y-2 px-1">
        {testData.claimed && (
          <div className="flex justify-between items-center text-xs py-1">
            <span className="text-gray-600 font-medium px-1">Claimed</span>
            <span className="font-semibold text-gray-900 px-1">{testData.claimed}</span>
          </div>
        )}
        {testData.tested && (
          <div className="flex justify-between items-center text-xs py-1">
            <span className="text-gray-600 font-medium px-1">Tested</span>
            <span className="font-semibold text-gray-900 px-1">{testData.tested}</span>
          </div>
        )}
        {testData.rating && (
          <div className="flex justify-between items-center text-xs py-1">
            <span className="text-gray-600 font-medium px-1">Rating</span>
            <span className="font-semibold text-gray-900 px-1">{testData.rating}</span>
          </div>
        )}
      </div>

      {/* Note */}
      {testData.note && (
        <div className="mt-3 border-t border-gray-300 pt-2">
          <ExpandableNote note={testData.note} />
        </div>
      )}
    </div>
  );
}

interface TestGroupProps {
  groupName: string;
  groupData: any;
}

function TestGroup({ groupName, groupData }: TestGroupProps) {
  const hasVerdict = groupData.verdict !== undefined;
  const isPass = groupData.verdict?.toLowerCase() === 'pass';
  const bgClass = isPass ? 'bg-green-100' : hasVerdict ? 'bg-red-100' : 'bg-gray-100';
  const borderClass = isPass ? 'border-green-400' : hasVerdict ? 'border-red-400' : 'border-gray-400';

  // Extract sub-tests
  const subTests: Array<{ name: string; data: any }> = [];
  Object.entries(groupData).forEach(([key, value]) => {
    if (key === 'verdict' || key === 'note') return;
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      subTests.push({ name: key, data: value });
    }
  });

  // If it's just a simple test with verdict and note, treat it as a card
  if (subTests.length === 0) {
    return <TestCard testName={groupName} testData={groupData} />;
  }

  return (
    <div className={`rounded-lg p-5 border-2 ${bgClass} ${borderClass} shadow-sm`}>
      {/* Group Header */}
      <div className="flex items-start justify-between mb-4">
        <h4 className="text-base font-bold text-gray-900 capitalize flex-1">
          {groupName.replace(/_/g, ' ')}
        </h4>
        {hasVerdict && (
          <span className={`ml-2 px-3 py-1 rounded-full text-xs font-bold shrink-0 ${
            isPass ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
          }`}>
            {groupData.verdict.toUpperCase()}
          </span>
        )}
      </div>

      {/* Group Note */}
      {groupData.note && (
        <div className="mb-4 p-3 bg-white/60 border border-gray-300 rounded-md">
          <ExpandableNote note={groupData.note} maxLength={150} />
        </div>
      )}

      {/* Sub-tests Grid */}
      {subTests.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {subTests.map(({ name, data }) => (
            <TestCard key={name} testName={name} testData={data} isNested />
          ))}
        </div>
      )}
    </div>
  );
}

interface TestSectionProps {
  title: string;
  verdict: string;
  tests: Record<string, any>;
}

export default function TestSection({ title, verdict, tests }: TestSectionProps) {
  const sectionNote = tests.note as string | undefined;
  const verdictLower = verdict?.toLowerCase();
  const isPass = verdictLower === 'pass';
  const isFail = verdictLower === 'fail';
  const isNeutral = !verdictLower || verdictLower === 'not assigned' || verdictLower === 'pending';
  const sectionBgClass = isPass ? 'bg-emerald-50 border-emerald-200' : isFail ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200';
  const noteBgClass = isPass ? 'bg-emerald-100 border-emerald-300' : isFail ? 'bg-red-100 border-red-300' : 'bg-white border-gray-300';

  // Get the appropriate icon based on title
  const getIconName = (title: string) => {
    if (title.toLowerCase().includes('basic')) return 'lab_research';
    if (title.toLowerCase().includes('contaminant')) return 'microbiology';
    if (title.toLowerCase().includes('review') || title.toLowerCase().includes('subjective')) return 'rate_review';
    return 'science'; // fallback
  };

  const iconColor = isPass ? 'text-emerald-600' : 'text-red-600';

  // Organize tests into groups and individual tests
  const items: Array<{ name: string; data: any; isGroup: boolean }> = [];

  Object.entries(tests).forEach(([key, value]) => {
    if (key === 'verdict' || key === 'note') return;

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      // Check if this has sub-tests (nested objects)
      const hasSubTests = Object.keys(value).some(
        k => k !== 'verdict' && k !== 'note' && typeof value[k] === 'object'
      );

      items.push({
        name: key,
        data: value,
        isGroup: hasSubTests
      });
    }
  });

  return (
    <div className={`mb-10 p-6 rounded-lg border-2 ${sectionBgClass}`}>
      {/* Section Header */}
      <div className="flex items-center mb-6">
        <span className={`material-symbols-outlined text-4xl mr-3 ${iconColor}`}>
          {getIconName(title)}
        </span>
        <h3 className="text-2xl font-bold text-gray-900 capitalize">
          {title.replace(/_/g, ' ')}
        </h3>
      </div>


      {/* Tests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {items.map(({ name, data, isGroup }) => (
          isGroup ? (
            <div key={name} className="lg:col-span-2">
              <TestGroup groupName={name} groupData={data} />
            </div>
          ) : (
            <TestCard key={name} testName={name} testData={data} />
          )
        ))}
      </div>
      {/* Section Note */}
      {sectionNote && (
        <div className={`mt-6 p-4 border rounded-lg ${noteBgClass}`}>
          <ExpandableNote note={sectionNote} maxLength={200} />
        </div>
      )}
    </div>
  );
}

