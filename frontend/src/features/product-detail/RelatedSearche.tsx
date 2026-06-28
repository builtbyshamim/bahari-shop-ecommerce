import { Search, TrendingUp } from 'lucide-react';
import Link from 'next/link';

const RelatedSearches = ({ searches, category }: any) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-black-800">Related Searches</h2>
        <div className="flex items-center gap-2 text-sm">
          <TrendingUp size={16} className="text-primary-500" />
          <span className="text-black-500">Trending in {category.name}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        {searches.map((search: any, index: number) => (
          <a
            key={index}
            href={`/search?q=${encodeURIComponent(search)}`}
            className="group bg-black-100 hover:bg-primary-100 px-4 py-2 rounded-full flex items-center gap-2 transition-all"
          >
            <Search size={14} className="text-black-400 group-hover:text-primary-500" />
            <span className="text-sm text-black-700 group-hover:text-primary-700">{search}</span>
          </a>
        ))}
      </div>

      <div>
        <h3 className="font-medium text-black-700 mb-3">Browse more in {category.name}</h3>
        <div className="flex gap-4">
          <Link
            href={`/rankings/new_arrival`}
            className="text-sm text-primary-600 hover:text-primary-700 hover:underline"
          >
            New Arrivals
          </Link>
          <Link
            href={`/rankings/top`}
            className="text-sm text-primary-600 hover:text-primary-700 hover:underline"
          >
            Best Sellers
          </Link>
          <Link
            href={`/deals`}
            className="text-sm text-primary-600 hover:text-primary-700 hover:underline"
          >
            {` Today's Deals`}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RelatedSearches;
