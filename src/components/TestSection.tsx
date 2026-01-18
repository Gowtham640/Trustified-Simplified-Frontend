'use client';

import { useState } from 'react';
import { TestResult, ContaminantGroup } from '@/types';

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
  testData: TestResult | ContaminantGroup;
  isNested?: boolean;
}

function TestCard({ testName, testData, isNested = false }: TestCardProps) {
  const verdict = testData.verdict?.toLowerCase();
  const isPass = verdict === 'pass';
  const isFail = verdict === 'fail';

  const bgClass = isPass ? 'bg-emerald-100' : isFail ? 'bg-red-100' : 'bg-white';
  const borderClass = isPass ? 'border-emerald-300' : isFail ? 'border-red-300' : 'border-gray-300';
  const hoverClass = isNested ? '' : `hover:shadow-lg hover:-translate-y-1 ${isPass ? 'hover:bg-emerald-200 hover:border-emerald-400' : isFail ? 'hover:bg-red-200 hover:border-red-400' : 'hover:bg-gray-100 hover:border-gray-400'} transition-all duration-300`;

  // Type-safe property access
  const claimed = 'claimed' in testData ? String(testData.claimed) : undefined;
  const tested = 'tested' in testData ? String(testData.tested) : undefined;
  const rating = 'rating' in testData ? String(testData.rating) : undefined;
  const note = 'note' in testData ? String(testData.note) : undefined;

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
        {claimed && (
          <div className="flex justify-between items-center text-xs py-1">
            <span className="text-gray-600 font-medium px-1">Claimed</span>
            <span className="font-semibold text-gray-900 px-1">{claimed}</span>
          </div>
        )}
        {tested && (
          <div className="flex justify-between items-center text-xs py-1">
            <span className="text-gray-600 font-medium px-1">Tested</span>
            <span className="font-semibold text-gray-900 px-1">{tested}</span>
          </div>
        )}
        {rating && (
          <div className="flex justify-between items-center text-xs py-1">
            <span className="text-gray-600 font-medium px-1">Rating</span>
            <span className="font-semibold text-gray-900 px-1">{rating}</span>
          </div>
        )}
      </div>

      {/* Note */}
      {note && (
        <div className="mt-3 border-t border-gray-300 pt-2">
          <ExpandableNote note={note} />
        </div>
      )}
    </div>
  );
}

interface TestGroupProps {
  groupName: string;
  groupData: ContaminantGroup;
}

function TestGroup({ groupName, groupData }: TestGroupProps) {
  const hasVerdict = groupData.verdict !== undefined;
  const isPass = groupData.verdict?.toLowerCase() === 'pass';
  const bgClass = isPass ? 'bg-green-100' : hasVerdict ? 'bg-red-100' : 'bg-gray-100';
  const borderClass = isPass ? 'border-green-400' : hasVerdict ? 'border-red-400' : 'border-gray-400';

  // Extract sub-tests
  const subTests: Array<{ name: string; data: unknown }> = [];
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
        {hasVerdict && groupData.verdict && (
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
            <TestCard key={name} testName={name} testData={data as TestResult | ContaminantGroup} isNested />
          ))}
        </div>
      )}
    </div>
  );
}

interface TestSectionProps {
  title: string;
  verdict: string;
  tests: Record<string, unknown>;
}

export default function TestSection({ title, verdict, tests }: TestSectionProps) {
  const sectionNote = tests.note as string | undefined;
  const verdictLower = verdict?.toLowerCase();
  const isPass = verdictLower === 'pass';
  const isFail = verdictLower === 'fail';
  const sectionBgClass = isPass ? 'bg-emerald-50 border-emerald-200' : isFail ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200';
  const noteBgClass = isPass ? 'bg-emerald-100 border-emerald-300' : isFail ? 'bg-red-100 border-red-300' : 'bg-white border-gray-300';

  const iconColor = isPass ? 'text-emerald-600' : 'text-red-600';

  // Get the appropriate icon based on title
  const getIcon = (title: string) => {
    const iconClass = `w-10 h-10 mr-3 ${iconColor}`;
    if (title.toLowerCase().includes('basic')) {
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      );
    }
    if (title.toLowerCase().includes('contaminant')) {
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      );
    }
    if (title.toLowerCase().includes('review') || title.toLowerCase().includes('subjective')) {
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      );
    }
    // fallback - science/beaker icon
    return (
      <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    );
  };

  // Organize tests into groups and individual tests
  const items: Array<{ name: string; data: unknown; isGroup: boolean }> = [];

  Object.entries(tests).forEach(([key, value]) => {
    if (key === 'verdict' || key === 'note') return;

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      // Check if this has sub-tests (nested objects)
      const valueRecord = value as Record<string, unknown>;
      const hasSubTests = Object.keys(valueRecord).some(
        k => k !== 'verdict' && k !== 'note' && typeof valueRecord[k] === 'object'
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
        {getIcon(title)}
        <h3 className="text-2xl font-bold text-gray-900 capitalize">
          {title.replace(/_/g, ' ')}
        </h3>
      </div>


      {/* Tests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {items.map(({ name, data, isGroup }) => (
          isGroup ? (
            <div key={name} className="lg:col-span-2">
              <TestGroup groupName={name} groupData={data as ContaminantGroup} />
            </div>
          ) : (
            <TestCard key={name} testName={name} testData={data as TestResult} />
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

