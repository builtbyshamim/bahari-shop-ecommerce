'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FaChevronRight } from 'react-icons/fa6';
import TopRankingSlider from './TopRankingSlider';

interface Section {
  id: string;
  name: string;
  slug: string;
  products: any[];
}

interface TopRankingTabsProps {
  sections: Section[];
}

const TopRankingTabs = ({ sections }: TopRankingTabsProps) => {
  const [activeId, setActiveId] = useState(sections[0]?.id ?? '');

  const active = sections.find((s) => s.id === activeId) ?? sections[0];

  return (
    <div className="bg-black-100 p-3 rounded-md">
      {/* Tab buttons — Feature Types */}
      <div className="flex flex-wrap gap-2 mb-3 border-b border-black-200 pb-2">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveId(section.id)}
            className={`px-3 py-1 text-sm font-semibold rounded-full transition-all duration-200 cursor-pointer ${
              activeId === section.id
                ? 'bg-primary-600 text-white'
                : 'bg-white text-black-800 hover:text-primary-600 border border-black-200'
            }`}
          >
            {section.name}
          </button>
        ))}
      </div>

      {/* Active section header */}
      {active && (
        <>
          <div className="flex justify-between items-start gap-1">
            <div>
              <h2 className="text-xl md:text-2xl text-black-900 font-semibold">{active.name}</h2>
              <p className="text-xs md:text-sm text-black-800">
                Score the lowest prices on Bahari Shop
              </p>
            </div>
            <Link
              href={`/rankings/${active.id}`}
              className="uppercase hover:text-primary-600 duration-200 font-semibold flex items-center gap-1 text-xs"
            >
              <span>view more</span>
              <FaChevronRight className="text-sm" />
            </Link>
          </div>

          <TopRankingSlider products={active.products} />
        </>
      )}
    </div>
  );
};

export default TopRankingTabs;
