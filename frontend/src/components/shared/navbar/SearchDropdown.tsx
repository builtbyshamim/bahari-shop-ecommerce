'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Search, Clock, X, ArrowRight, SearchIcon } from 'lucide-react';
import { useGetShopProductsQuery, useGetCategoryTreeQuery } from '@/redux/api/productApi';
import { useGetActiveTrendingSearchesQuery } from '@/redux/api/trendingSearchApi';

const FALLBACK_IMAGE =
  'https://foodwithsunnah.com/wp-content/uploads/2025/02/Sukkari-Mufattal-1KG-247x247.jpeg';

const HISTORY_KEY = 'search_history';
const MAX_HISTORY = 5;

interface SearchDropdownProps {
  onClose?: () => void;
  autoFocus?: boolean;
}

export const SearchDropdown = ({ onClose, autoFocus = false }: SearchDropdownProps) => {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);

  // Load history from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(HISTORY_KEY);
      if (stored) setHistory(JSON.parse(stored));
    } catch {}
  }, []);

  // Auto focus
  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  // Debounce query
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 350);
    return () => clearTimeout(timer);
  }, [query]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Fetch trending searches from backend
  const { data: trendingData } = useGetActiveTrendingSearchesQuery();
  const trendingSearches: string[] = (trendingData as any)?.data ?? [];

  // Fetch live search results
  const { data: searchData, isFetching: searchLoading } = useGetShopProductsQuery(
    { search: debouncedQuery, limit: 6, page: 1 },
    { skip: debouncedQuery.trim().length < 2 },
  );

  // Fetch popular products (default state)
  const { data: popularData } = useGetShopProductsQuery(
    { sort: 'newest', limit: 4, page: 1 },
    { skip: false },
  );

  // Fetch categories
  const { data: categoryData } = useGetCategoryTreeQuery({});

  const searchResults = searchData?.data?.data ?? [];
  const popularProducts = popularData?.data?.data ?? [];
  const categories = (categoryData?.data ?? []).filter((c: any) => c.isActive).slice(0, 6);

  const saveToHistory = (term: string) => {
    if (!term.trim()) return;
    const updated = [term, ...history.filter((h) => h !== term)].slice(0, MAX_HISTORY);
    setHistory(updated);
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    } catch {}
  };

  const removeFromHistory = (term: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = history.filter((h) => h !== term);
    setHistory(updated);
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    } catch {}
  };

  const handleSearch = (term: string) => {
    if (!term.trim()) return;
    saveToHistory(term);
    setIsOpen(false);
    setQuery(term);
    onClose?.();
    router.push(`/shop?search=${encodeURIComponent(term.trim())}`);
  };

  const handleProductClick = (slug: string) => {
    saveToHistory(query || '');
    setIsOpen(false);
    onClose?.();
    router.push(`/product-details/category/${slug}`);
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch(query);
      return;
    }
    if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((p) => Math.min(p + 1, searchResults.length - 1));
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((p) => Math.max(p - 1, -1));
    }
  };

  const showEmpty = query.trim().length === 0;
  const showResults = debouncedQuery.trim().length >= 2;
  const noResults = showResults && !searchLoading && searchResults.length === 0;

  return (
    <div ref={dropdownRef} className="relative w-full">
      {/* Input */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-black-400 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setActiveIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search for products, brands and more..."
          className="w-full pl-10 pr-10 py-2.5 ring-1 ring-black-200 rounded-full outline-none focus:ring-2 focus:ring-primary-500 text-black-800 placeholder-black-400 text-sm bg-white transition-all"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setDebouncedQuery('');
              inputRef.current?.focus();
            }}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-black-400 hover:text-black-700"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-black-100 z-[999] overflow-hidden max-h-[75vh] md:max-h-[80vh] overflow-y-auto">
          {/* ── Empty state: history + trending + categories + popular ── */}
          {showEmpty && (
            <div className="p-4 space-y-5">
              {/* Recent searches */}
              {history.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-black-400 mb-2">
                    Recent Searches
                  </p>
                  <div className="space-y-0.5">
                    {history.map((term) => (
                      <div
                        key={term}
                        onClick={() => handleSearch(term)}
                        className="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-black-100 cursor-pointer group"
                      >
                        <div className="flex items-center gap-2.5">
                          <Clock className="w-3.5 h-3.5 text-black-400 shrink-0" />
                          <span className="text-sm text-black-700">{term}</span>
                        </div>
                        <button
                          onClick={(e) => removeFromHistory(term, e)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-black-400 hover:text-black-700"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Trending */}
              {trendingSearches.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-black-400 mb-2">
                    Trending
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {trendingSearches.map((item: any) => (
                      <div key={item.id}>
                        <button
                          onClick={() => handleSearch(item.name)}
                          className="flex items-center gap-1.5 border border-primary-400 px-3 py-1.5 bg-primary-100/50 text-primary-500 rounded-full text-xs font-medium  hover:bg-primary-100 hover:text-primary-600 duration-200"
                        >
                          <SearchIcon className="w-3 h-3" />
                          {item.name}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Categories */}
              {categories.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-black-400 mb-2">
                    Browse Categories
                  </p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {categories?.slice(0, 10).map((cat: any) => (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setIsOpen(false);
                          onClose?.();
                          router.push(`/shop?category=${cat.slug}`);
                        }}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-black-100 hover:bg-primary-100 hover:text-primary-600 text-left text-sm text-black-700 transition-colors"
                      >
                        <span className="truncate">{cat.name}</span>
                        <ArrowRight className="w-3 h-3 ml-auto shrink-0 opacity-50" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Popular products */}
              {popularProducts.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-black-400 mb-2">
                    Popular Products
                  </p>
                  <div className="space-y-1">
                    {popularProducts.map((product: any) => (
                      <div
                        key={product.id}
                        onClick={() => handleProductClick(product.slug)}
                        className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-black-100 cursor-pointer group"
                      >
                        <div className="w-10 h-10 rounded-lg bg-black-100 overflow-hidden shrink-0 border border-black-200">
                          <Image
                            src={product.thumbnail?.url || FALLBACK_IMAGE}
                            alt={product.name}
                            width={40}
                            height={40}
                            className="w-full h-full object-contain p-1"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-black-800 truncate">{product.name}</p>
                          <p className="text-xs text-primary-500 font-medium">
                            ৳{product.price?.toLocaleString()}
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-black-300 opacity-0 group-hover:opacity-100 shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Loading ── */}
          {!showEmpty && searchLoading && (
            <div className="p-6 flex items-center justify-center gap-3 text-black-400">
              <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">Searching...</span>
            </div>
          )}

          {/* ── No results ── */}
          {noResults && (
            <div className="p-6 text-center">
              <p className="text-sm text-black-500 mb-1">No products found for</p>
              <p className="text-sm font-medium text-black-800">"{debouncedQuery}"</p>
              <button
                onClick={() => handleSearch(debouncedQuery)}
                className="mt-3 text-xs text-primary-500 hover:underline"
              >
                Search in all products →
              </button>
            </div>
          )}

          {/* ── Search results ── */}
          {showResults && !searchLoading && searchResults.length > 0 && (
            <div className="p-3">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-black-400 mb-2 px-1">
                Products
              </p>
              <div className="space-y-0.5">
                {searchResults.map((product: any, i: number) => (
                  <div
                    key={product.id}
                    onClick={() => handleProductClick(product.slug)}
                    className={`flex items-center gap-3 px-2 py-2.5 rounded-xl cursor-pointer group transition-colors ${
                      activeIndex === i ? 'bg-primary-50' : 'hover:bg-black-100'
                    }`}
                  >
                    <div className="w-11 h-11 rounded-lg bg-black-100 overflow-hidden shrink-0 border border-black-200">
                      <Image
                        src={product.thumbnail?.url || FALLBACK_IMAGE}
                        alt={product.name}
                        width={44}
                        height={44}
                        className="w-full h-full object-contain p-1"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-black-800 truncate leading-snug">{product.name}</p>
                      <p className="text-[11px] text-black-400 truncate">
                        {product.category?.name}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      {product.compareAtPrice && (
                        <p className="text-[10px] text-black-400 line-through">
                          ৳{product.compareAtPrice?.toLocaleString()}
                        </p>
                      )}
                      <p className="text-sm font-semibold text-primary-500">
                        ৳{product.price?.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* View all */}
              <button
                onClick={() => handleSearch(debouncedQuery)}
                className="w-full mt-2 py-2.5 text-sm text-primary-500 hover:bg-primary-50 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors border border-primary-200"
              >
                View all results for "{debouncedQuery}"
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
