'use client';

import { useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiGrid,
  FiList,
  FiFilter,
  FiX,
  FiChevronDown,
  FiShoppingBag,
  FiChevronRight,
} from 'react-icons/fi';

import ShopProductCard from '@/components/ui/card/ShopProductCard';
import {
  useGetCategoryTreeQuery,
  useGetShopBrandsQuery,
  useGetShopProductsQuery,
} from '@/redux/api/productApi';

// ─── Types ───────────────────────────────────────────────────
interface Category {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  children?: Category[];
}

const sortOptions = [
  { label: 'Newest First', value: 'newest' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
  { label: 'Discount %', value: 'discount' },
];

const priceRanges = [
  { label: 'All Prices', min: undefined, max: undefined },
  { label: 'Under ৳500', min: 0, max: 500 },
  { label: '৳500 - ৳1000', min: 500, max: 1000 },
  { label: '৳1000 - ৳1500', min: 1000, max: 1500 },
  { label: '৳1500 - ৳2000', min: 1500, max: 2000 },
  { label: '৳2000 - ৳3000', min: 2000, max: 3000 },
  { label: '৳3000 - ৳5000', min: 3000, max: 5000 },
  { label: 'Above ৳10000', min: 10000, max: undefined },
];

// ─── Recursive Category Tree Item ────────────────────────────
const CategoryTreeItem = ({
  category,
  activeSlug,
  onSelect,
  depth = 0,
}: {
  category: Category;
  activeSlug: string;
  onSelect: (slug: string) => void;
  depth?: number;
}) => {
  const [open, setOpen] = useState(
    // auto-expand if a child is active
    category.children?.some((c) => c.slug === activeSlug) ?? false,
  );
  const hasChildren = (category.children?.filter((c) => c.isActive) ?? []).length > 0;
  const isActive = activeSlug === category.slug;

  return (
    <div style={{ paddingLeft: depth * 12 }}>
      <div className="flex items-center justify-between group">
        <button
          onClick={() => onSelect(category.slug)}
          className={`flex-1 text-left py-1.5 text-sm transition-colors ${
            isActive ? 'text-primary-500 font-medium' : 'text-gray-600 hover:text-primary-500'
          }`}
        >
          {isActive && <span className="mr-1 text-primary-500">›</span>}
          {category.name}
        </button>
        {hasChildren && (
          <button
            onClick={() => setOpen((p) => !p)}
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            <FiChevronRight className={`w-3 h-3 transition-transform ${open ? 'rotate-90' : ''}`} />
          </button>
        )}
      </div>

      {hasChildren && open && (
        <div className="border-l border-gray-100 ml-2">
          {category
            .children!.filter((c) => c.isActive)
            .map((child) => (
              <CategoryTreeItem
                key={child.id}
                category={child}
                activeSlug={activeSlug}
                onSelect={onSelect}
                depth={depth + 1}
              />
            ))}
        </div>
      )}
    </div>
  );
};

// ─── Skeleton ─────────────────────────────────────────────────
const ProductSkeleton = () => (
  <div className="bg-white rounded-lg overflow-hidden animate-pulse">
    <div className="bg-gray-200 aspect-square" />
    <div className="p-3 space-y-2">
      <div className="h-3 bg-gray-200 rounded w-3/4" />
      <div className="h-3 bg-gray-200 rounded w-1/2" />
      <div className="h-4 bg-gray-200 rounded w-1/3" />
    </div>
  </div>
);

// ─── Main ShopPage ────────────────────────────────────────────
const ShopPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ── Read URL params ──
  const [filters, setFilters] = useState({
    category: searchParams.get('category') ?? '',
    brand: searchParams.get('brand') ?? '',
    search: searchParams.get('search') ?? '',
    sort: searchParams.get('sort') ?? 'newest',
    minPrice: searchParams.get('minPrice') ?? '',
    maxPrice: searchParams.get('maxPrice') ?? '',
    inStock: searchParams.get('inStock') ?? '',
    page: Number(searchParams.get('page') ?? 1),
  });

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [gridCols, setGridCols] = useState<'5' | '4' | '3'>('4');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);

  // ── Sync filters → URL ──
  const updateURL = useCallback(
    (newFilters: typeof filters) => {
      const params = new URLSearchParams();
      Object.entries(newFilters).forEach(([k, v]) => {
        if (v && v !== '' && v !== 1) params.set(k, String(v));
      });
      router.push(`/shop?${params.toString()}`, { scroll: false });
    },
    [router],
  );

  const setFilter = (key: keyof typeof filters, value: any) => {
    const updated = { ...filters, [key]: value, ...(key !== 'page' && { page: 1 }) };
    setFilters(updated);
    updateURL(updated);
  };

  const clearFilters = () => {
    const reset = {
      category: '',
      brand: '',
      search: '',
      sort: 'newest',
      minPrice: '',
      maxPrice: '',
      inStock: '',
      page: 1,
    };
    setFilters(reset);
    router.push('/shop');
  };

  // ── API Calls ──
  const queryParams = {
    page: filters.page,
    limit: 20,
    ...(filters.search && { search: filters.search }),
    ...(filters.category && { category: filters.category }),
    ...(filters.brand && { brand: filters.brand }),
    ...(filters.sort && { sort: filters.sort }),
    ...(filters.minPrice && { minPrice: filters.minPrice }),
    ...(filters.maxPrice && { maxPrice: filters.maxPrice }),
    ...(filters.inStock && { inStock: filters.inStock }),
  };

  const { data: productData, isFetching } = useGetShopProductsQuery(queryParams);
  const { data: categoryData } = useGetCategoryTreeQuery({});
  const { data: brandData } = useGetShopBrandsQuery({});

  const products = productData?.data?.data ?? [];
  const meta = productData?.data?.meta ?? { totalItems: 0, totalPages: 1, currentPage: 1 };
  const categories: Category[] = (categoryData?.data ?? []).filter((c: Category) => c.isActive);
  const brands = brandData?.data?.data ?? [];
  const activeFiltersCount = [
    filters.category,
    filters.brand,
    filters.minPrice,
    filters.maxPrice,
    filters.inStock,
  ].filter(Boolean).length;

  // ── Sidebar content (shared desktop + mobile) ──
  const SidebarContent = () => (
    <div className="space-y-6">
      {/* Clear */}
      {activeFiltersCount > 0 && (
        <button
          onClick={clearFilters}
          className="w-full flex items-center justify-center gap-2 py-2 text-sm text-red-500 border border-red-200 rounded-lg hover:bg-red-50"
        >
          <FiX className="w-4 h-4" />
          Clear All Filters ({activeFiltersCount})
        </button>
      )}

      {/* ── Categories (Recursive Tree) ── */}
      <div>
        <h4 className="text-sm font-semibold text-gray-800 mb-3 uppercase tracking-wide">
          Categories
        </h4>
        <button
          onClick={() => setFilter('category', '')}
          className={`block w-full text-left py-1.5 text-sm mb-1 ${
            !filters.category
              ? 'text-primary-500 font-medium'
              : 'text-gray-600 hover:text-primary-500'
          }`}
        >
          All Categories
        </button>
        <div className="space-y-0.5">
          {categories.map((cat) => (
            <CategoryTreeItem
              key={cat.id}
              category={cat}
              activeSlug={filters.category}
              onSelect={(slug) => setFilter('category', slug)}
            />
          ))}
        </div>
      </div>

      {/* ── Price Range ── */}
      <div>
        <h4 className="text-sm font-semibold text-gray-800 mb-3 uppercase tracking-wide">
          Price Range
        </h4>
        <div className="space-y-2">
          {priceRanges.map((range) => {
            const isActive =
              String(filters.minPrice || '') === String(range.min ?? '') &&
              String(filters.maxPrice || '') === String(range.max ?? '');
            return (
              <label key={range.label} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="price"
                  checked={isActive}
                  onChange={() => {
                    const updated = {
                      ...filters,
                      minPrice: range.min !== undefined ? String(range.min) : '',
                      maxPrice: range.max !== undefined ? String(range.max) : '',
                      page: 1,
                    };
                    setFilters(updated);
                    updateURL(updated);
                  }}
                  className="w-4 h-4 text-primary-500"
                />
                <span className="text-sm text-gray-600">{range.label}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* ── Brands ── */}
      {brands.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-800 mb-3 uppercase tracking-wide">
            Brands
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {brands.map((brand: any) => (
              <label key={brand.id} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="brand"
                  checked={filters.brand === brand.slug}
                  onChange={() =>
                    setFilter('brand', filters.brand === brand.slug ? '' : brand.slug)
                  }
                  className="w-4 h-4 text-primary-500"
                />
                <span className="text-sm text-gray-600">{brand.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* ── Stock ── */}
      <div>
        <h4 className="text-sm font-semibold text-gray-800 mb-3 uppercase tracking-wide">
          Availability
        </h4>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.inStock === 'true'}
            onChange={() => setFilter('inStock', filters.inStock === 'true' ? '' : 'true')}
            className="w-4 h-4 rounded text-primary-500"
          />
          <span className="text-sm text-gray-600">In Stock Only</span>
        </label>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-400 text-white py-6 md:py-8">
        <div className="root-container px-4">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-1">
            {filters.category
              ? (categories
                  .flatMap((c) => [c, ...(c.children ?? [])])
                  .find((c) => c.slug === filters.category)?.name ?? 'Shop')
              : 'Shop All Products'}
          </h1>
          <p className="text-white/80 text-sm">{meta.totalItems} products available</p>
        </div>
      </div>

      <div className="root-container py-6">
        {/* Top Bar */}
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 mb-6">
          {/* Search — full width on mobile */}
          <div className="w-full sm:flex-1 sm:max-w-md">
            <input
              type="text"
              placeholder="Search products..."
              value={filters.search}
              onChange={(e) => setFilter('search', e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary-400 focus:outline-none text-sm"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Mobile filter btn */}
            <button
              onClick={() => setIsFilterOpen(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-white rounded-lg border border-gray-200 text-sm"
            >
              <FiFilter className="w-4 h-4" />
              Filters
              {activeFiltersCount > 0 && (
                <span className="bg-primary-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Grid cols — desktop only */}

            {/* View mode */}
            <div className="flex items-center gap-1 bg-white rounded-lg border border-gray-200 p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-primary-500 text-white' : 'hover:bg-gray-100'}`}
              >
                <FiGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-primary-500 text-white' : 'hover:bg-gray-100'}`}
              >
                <FiList className="w-4 h-4" />
              </button>
            </div>

            {/* Sort — click-based dropdown (works on touch) */}
            <div className="relative">
              <button
                onClick={() => setIsSortOpen((p) => !p)}
                className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-lg border border-gray-200 text-sm whitespace-nowrap"
              >
                {sortOptions.find((o) => o.value === filters.sort)?.label}
                <FiChevronDown
                  className={`w-4 h-4 transition-transform ${isSortOpen ? 'rotate-180' : ''}`}
                />
              </button>
              {isSortOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsSortOpen(false)} />
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    {sortOptions.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => {
                          setFilter('sort', opt.value);
                          setIsSortOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${
                          filters.sort === opt.value
                            ? 'text-primary-500 font-medium'
                            : 'text-gray-700'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block w-60 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm p-5 sticky top-20">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FiFilter className="w-4 h-4" />
                Filters
              </h3>
              <SidebarContent />
            </div>
          </div>

          {/* Mobile Sidebar */}
          <AnimatePresence>
            {isFilterOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsFilterOpen(false)}
                  className="fixed inset-0 bg-black/50 z-50 lg:hidden"
                />
                <motion.div
                  initial={{ x: '-100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '-100%' }}
                  transition={{ type: 'tween' }}
                  className="fixed left-0 top-0 h-full w-full sm:w-80 bg-white z-50 overflow-y-auto lg:hidden"
                >
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="font-semibold text-gray-800">Filters</h3>
                      <button
                        onClick={() => setIsFilterOpen(false)}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                      >
                        <FiX className="w-5 h-5" />
                      </button>
                    </div>
                    <SidebarContent />
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Products */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500">
                {isFetching
                  ? 'Loading...'
                  : `Showing ${products.length} of ${meta.totalItems} products`}
              </p>
            </div>

            {/* Product Grid */}
            {isFetching ? (
              <div
                className={`grid grid-cols-2 gap-3 ${
                  gridCols === '5'
                    ? 'lg:grid-cols-5'
                    : gridCols === '4'
                      ? 'lg:grid-cols-4'
                      : 'lg:grid-cols-3'
                }`}
              >
                {[...Array(12)].map((_, i) => (
                  <ProductSkeleton key={i} />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <FiShoppingBag className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">No products Avilable</h3>
                <p className="text-gray-400 text-sm mb-4">Try adjusting your filters</p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-2 bg-primary-500 text-white rounded-lg text-sm"
                >
                  Clear Filters
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              <div
                className={`grid grid-cols-2 gap-3 md:gap-4 ${
                  gridCols === '5'
                    ? 'lg:grid-cols-5'
                    : gridCols === '4'
                      ? 'lg:grid-cols-4'
                      : 'lg:grid-cols-3'
                }`}
              >
                {products?.map((product: any) => (
                  <ShopProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {products.map((product: any) => (
                  <ShopProductCard key={product.id} product={product} listView />
                ))}
              </div>
            )}

            {/* Pagination */}
            {meta.totalPages > 1 && !isFetching && (
              <div className="flex items-center justify-center gap-1 mt-10 flex-wrap">
                <button
                  onClick={() => setFilter('page', Math.max(1, filters.page - 1))}
                  disabled={filters.page === 1}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-sm disabled:opacity-40 hover:border-primary-400"
                >
                  Previous
                </button>

                {(() => {
                  const current = filters.page;
                  const total = meta.totalPages;
                  const pages: (number | 'ellipsis-start' | 'ellipsis-end')[] = [];

                  if (total <= 7) {
                    for (let i = 1; i <= total; i++) pages.push(i);
                  } else {
                    pages.push(1);
                    if (current > 4) pages.push('ellipsis-start');
                    const start = Math.max(2, current - 2);
                    const end = Math.min(total - 1, current + 2);
                    for (let i = start; i <= end; i++) pages.push(i);
                    if (current < total - 3) pages.push('ellipsis-end');
                    pages.push(total);
                  }

                  return pages.map((p) => {
                    if (p === 'ellipsis-start' || p === 'ellipsis-end') {
                      return (
                        <span
                          key={p}
                          className="w-10 h-10 flex items-center justify-center text-gray-400 text-sm"
                        >
                          ...
                        </span>
                      );
                    }
                    return (
                      <button
                        key={p}
                        onClick={() => setFilter('page', p)}
                        className={`w-10 h-10 rounded-lg text-sm ${
                          current === p
                            ? 'bg-primary-500 text-white'
                            : 'border border-gray-200 hover:border-primary-400'
                        }`}
                      >
                        {p}
                      </button>
                    );
                  });
                })()}

                <button
                  onClick={() => setFilter('page', Math.min(meta.totalPages, filters.page + 1))}
                  disabled={filters.page === meta.totalPages}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-sm disabled:opacity-40 hover:border-primary-400"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopPage;
