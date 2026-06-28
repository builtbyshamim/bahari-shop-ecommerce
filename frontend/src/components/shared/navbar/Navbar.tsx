'use client';
import { useState, useEffect, JSX } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Menu, X, ShoppingBag, Plus, Minus, ChevronDown, Heart, Gift } from 'lucide-react';
import ShoppingCart from '../cart-modal/ShoppingCart';
import AuthModal from '../auth-modal/AuthModal';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { cartMenuToggle, loginModalToggle } from '@/redux/features/toggleSlice';
import { useGetCategoryTreeQuery } from '@/redux/api/productApi';
import { SearchDropdown } from './SearchDropdown';
import { useGetProfileQuery } from '@/redux/api/userApi';
import default_logo from '../../../../public/images/logo/default_logo.png';
import Image from 'next/image';
import { FaShopSlash } from 'react-icons/fa6';
import { useGetCompanyInfoQuery } from '@/redux/api/companyApi';
interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
  isActive: boolean;
  children?: Category[];
}

const CategorySkeleton = () => (
  <div className="flex items-center gap-6 py-2">
    {[80, 96, 72, 88, 64, 80].map((w, i) => (
      <div key={i} className="h-3.5 bg-gray-100 rounded-full animate-pulse" style={{ width: w }} />
    ))}
  </div>
);

const Navbar = (): JSX.Element => {
  const dispatch = useAppDispatch();
  const products = useAppSelector((store) => store.cart.products);
  const totalPrice = useAppSelector((store) => store.cart.totalPrice);
  const wishlists = useAppSelector((state: any) => state.wishlist.items);

  const { data: companyRes, isLoading: companyLoading } = useGetCompanyInfoQuery(undefined);
  const company = companyRes?.data;

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeMegaChild, setActiveMegaChild] = useState<string | null>(null);
  const [expandedMobileCategories, setExpandedMobileCategories] = useState<Set<string>>(new Set());
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const { data: userData } = useGetProfileQuery(null);
  const user = userData?.data;

  const pathname = usePathname();
  const { data: categoryData, isLoading: categoryLoading } = useGetCategoryTreeQuery({});
  const categories: Category[] = (categoryData?.data || []).filter((cat: Category) => cat.isActive);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileCategory = (id: string) => {
    setExpandedMobileCategories((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const isCategoryActive = (slug: string) =>
    pathname === `/shop?category=${slug}` || pathname.startsWith(`/shop?category=${slug}/`);

  const closeMega = () => {
    setActiveCategory(null);
    setActiveMegaChild(null);
  };

  // ── Desktop Mega Menu ──────────────────────────────────
  const renderMegaMenuChildren = (children: Category[]) => {
    const activeChildren = children.filter((c) => c.isActive);
    const highlightedId = activeMegaChild ?? activeChildren[0]?.id ?? null;
    const highlightedChild = activeChildren.find((c) => c.id === highlightedId);

    return (
      <div className="flex min-w-[360px]">
        {/* Left: subcategory list */}
        <div className="w-[210px] py-2 shrink-0" style={{ borderRight: '1px solid #f3f4f6' }}>
          {activeChildren.map((child) => {
            const isHighlighted = child.id === highlightedId;
            const hasGrandChildren = !!child.children?.filter((c) => c.isActive).length;
            return (
              <div key={child.id} onMouseEnter={() => setActiveMegaChild(child.id)}>
                <Link
                  href={`/shop?category=${child.slug}`}
                  onClick={closeMega}
                  className={`flex items-center justify-between px-4 py-2.5 text-[13.5px] transition-all duration-150 ease-in-out ${
                    isHighlighted
                      ? 'bg-orange-50 text-orange-500 font-semibold'
                      : 'text-gray-700 hover:bg-gray-50 font-normal'
                  }`}
                >
                  {child.name}
                  {hasGrandChildren && (
                    <ChevronDown
                      className={`w-3.5 h-3.5 -rotate-90 shrink-0 ${
                        isHighlighted ? 'text-orange-400' : 'text-gray-300'
                      }`}
                    />
                  )}
                </Link>
              </div>
            );
          })}
        </div>

        {/* Right: grandchildren */}
        {highlightedChild?.children?.filter((c) => c.isActive).length ? (
          <div className="flex flex-col gap-0.5 px-5 py-3 min-w-[160px]">
            {highlightedChild.children
              .filter((c) => c.isActive)
              .map((gc) => (
                <Link
                  key={gc.id}
                  href={`/shop?category=${gc.slug}`}
                  onClick={closeMega}
                  className="text-[13px] text-gray-600 hover:text-orange-500 transition-colors whitespace-nowrap py-1.5"
                >
                  {gc.name}
                </Link>
              ))}
          </div>
        ) : null}
      </div>
    );
  };

  // ── Mobile Category Item ───────────────────────────────
  const renderMobileCategoryItem = (category: Category, depth = 0) => {
    const hasChildren = !!category.children?.filter((c) => c.isActive).length;
    const isExpanded = expandedMobileCategories.has(category.id);

    return (
      <div key={category.id} className={depth > 0 ? 'ml-3 pl-3 border-l border-gray-100' : ''}>
        <div className="flex items-center justify-between py-2.5 rounded-lg px-2 hover:bg-orange-50 transition-colors">
          <Link
            href={`/shop?category=${category.slug}`}
            className={`flex-1 text-sm font-medium ${
              isCategoryActive(category.slug) ? 'text-orange-500' : 'text-gray-700'
            }`}
            onClick={() => {
              if (!hasChildren) {
                setIsMobileMenuOpen(false);
                setExpandedMobileCategories(new Set());
              }
            }}
          >
            {category.name}
          </Link>
          {hasChildren && (
            <button
              onClick={() => toggleMobileCategory(category.id)}
              className="p-1 rounded-full hover:bg-gray-200 transition-colors"
            >
              {isExpanded ? (
                <Minus className="w-3.5 h-3.5 text-gray-400" />
              ) : (
                <Plus className="w-3.5 h-3.5 text-gray-400" />
              )}
            </button>
          )}
        </div>
        {isExpanded && hasChildren && (
          <div className="pb-1">
            {category
              .children!.filter((c) => c.isActive)
              .map((child) => renderMobileCategoryItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <nav
        className={`sticky top-0 left-0 z-50 bg-white transition-all duration-300 ${
          isScrolled ? 'shadow-[0_2px_20px_rgba(0,0,0,0.08)]' : ''
        }`}
        onMouseLeave={closeMega}
      >
        {/* ── Top Row ─────────────────────────────── */}
        <div className="max-w-[1280px] mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between h-[60px] gap-4">
            {/* Left: Hamburger (mobile) + Logo */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5 text-gray-700" />
                ) : (
                  <Menu className="w-5 h-5 text-gray-700" />
                )}
              </button>

              <Link
                href="/"
                className="shrink-0 flex items-center gap-2 min-w-0 max-w-[40%] sm:max-w-[200px]"
              >
                {companyLoading ? (
                  <div className="w-24 sm:w-32 lg:w-36 h-9 rounded-lg bg-gray-100 animate-pulse" />
                ) : company?.logoUrl ? (
                  <>
                    <div className="relative w-24 sm:w-32 lg:w-36 h-12 shrink-0">
                      <Image
                        src={default_logo}
                        className="object-contain object-left transition-opacity duration-300"
                        alt={company?.name || 'Logo'}
                        fill
                        priority
                      />
                    </div>
                  </>
                ) : company?.name ? (
                  <span className="text-base font-extrabold tracking-tight bg-linear-to-r from-orange-500 to-orange-400 bg-clip-text text-transparent select-none truncate min-w-0">
                    {company.name}
                  </span>
                ) : (
                  <div className="relative w-24 sm:w-32 lg:w-36 h-9 shrink-0">
                    <Image
                      src={default_logo}
                      className="object-contain object-left"
                      alt="Logo"
                      fill
                      priority
                    />
                  </div>
                )}
              </Link>
            </div>

            {/* Center: Search Bar (desktop) */}
            <div className="hidden lg:flex flex-1 max-w-[460px]">
              <SearchDropdown />
            </div>

            {/* Right: Action Buttons */}
            <div className="flex items-center gap-2">
              {/* Mobile search */}
              <button
                onClick={() => setMobileSearchOpen(true)}
                className="lg:hidden w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 hover:border-orange-400 hover:text-orange-500 transition-colors text-gray-600"
              >
                <Search className="w-4 h-4" />
              </button>

              {/* Mobile cart icon */}
              <button
                onClick={() => dispatch(cartMenuToggle())}
                className="lg:hidden relative w-9 h-9 flex items-center justify-center rounded-full bg-orange-500 hover:bg-orange-600 transition-colors text-white"
              >
                <ShoppingBag className="w-4 h-4" />
                {(products?.length ?? 0) > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-0.5 bg-gray-900 text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
                    {products.length > 9 ? '9+' : products.length}
                  </span>
                )}
              </button>

              {/* Offers button */}
              <Link
                href="/shop"
                className="hidden lg:flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[13px] font-medium text-gray-700 border border-gray-200 hover:border-orange-300 hover:text-orange-500 transition-colors whitespace-nowrap"
              >
                <FaShopSlash className="w-3.5 h-3.5 text-orange-500" />
                Shops
              </Link>

              {/* Wishlist button */}
              <Link
                href="/wishlist"
                className="hidden lg:flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[13px] font-medium text-gray-700 border border-gray-200 hover:border-orange-300 hover:text-orange-500 transition-colors whitespace-nowrap"
              >
                <Heart className="w-3.5 h-3.5 text-gray-500" />
                Wishlist
                {wishlists?.length > 0 && (
                  <span className="bg-orange-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">
                    {wishlists.length}
                  </span>
                )}
              </Link>

              {/* Cart button */}
              <button
                onClick={() => dispatch(cartMenuToggle())}
                className="hidden lg:flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[13px] font-semibold text-white bg-orange-500 hover:bg-orange-600 transition-colors whitespace-nowrap relative"
              >
                <ShoppingBag className="w-4 h-4" />
                Cart
                {(products?.length ?? 0) > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 bg-gray-900 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                    {products.length > 99 ? '99+' : products.length}
                  </span>
                )}
              </button>

              {/* Account avatar / Login */}
              {user ? (
                <Link
                  href="/account"
                  className="w-9 h-9 rounded-full hover:opacity-90 transition-opacity flex items-center justify-center overflow-hidden border border-primary-500 flex-shrink-0"
                  title={user.name || 'Account'}
                >
                  {user.avatar ? (
                    <Image
                      src={user.avatar}
                      alt={user.name}
                      width={36}
                      height={36}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-primary-400 to-orange-400 flex items-center justify-center">
                      <span className="text-xs font-extrabold text-white">
                        {user.name?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                  )}
                </Link>
              ) : (
                <button
                  onClick={() => dispatch(loginModalToggle())}
                  className="hidden lg:flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[13px] font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  Login
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── Category Bar (Desktop) ───────────────── */}
        <div className="hidden lg:block border-t bg-[#F5F3EF] border-gray-100">
          <div className="max-w-[1280px] mx-auto px-4 lg:px-6">
            {categoryLoading ? (
              <CategorySkeleton />
            ) : (
              <div className="flex items-center justify-center gap-0.5 py-0.5">
                {categories.map((category, index) => {
                  const hasChildren = !!category.children?.filter((c) => c.isActive).length;
                  const isActive = activeCategory === category.id;
                  const isCurrent = isCategoryActive(category.slug);

                  return (
                    <div
                      key={category.id}
                      className="relative"
                      onMouseEnter={() => {
                        if (hasChildren) {
                          setActiveCategory(category.id);
                          setActiveMegaChild(null);
                        } else {
                          setActiveCategory(null);
                        }
                      }}
                    >
                      <Link
                        href={`/shop?category=${category.slug}`}
                        className={`flex items-center gap-1 px-3.5 py-2.5 text-[13.5px] font-medium transition-all duration-200 ease-in-out whitespace-nowrap rounded-sm ${
                          isCurrent
                            ? 'text-orange-500 border-b-2 border-orange-500'
                            : isActive
                              ? 'text-orange-500'
                              : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        {category.name}
                        {hasChildren && (
                          <ChevronDown
                            className={`w-3.5 h-3.5 transition-transform duration-300 ease-in-out ${
                              isActive ? 'rotate-180 text-orange-500' : 'text-gray-400'
                            }`}
                          />
                        )}
                      </Link>

                      {/* Mega Menu Dropdown */}
                      {isActive && hasChildren && (
                        <div
                          className={`absolute top-full mt-1 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150 ${
                            index >= categories.length - 3 ? 'right-0' : 'left-0'
                          }`}
                          onMouseEnter={() => setActiveCategory(category.id)}
                          onMouseLeave={closeMega}
                        >
                          {renderMegaMenuChildren(category.children!)}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── Mobile Search Overlay ────────────────── */}
        {mobileSearchOpen && (
          <div className="fixed inset-0 z-[999] bg-black/60 backdrop-blur-sm lg:hidden">
            <div className="bg-white p-4 shadow-2xl rounded-b-2xl">
              <div className="flex items-center gap-3 mb-3">
                <button
                  onClick={() => setMobileSearchOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="w-4 h-4 text-gray-600" />
                </button>
                <span className="text-sm font-semibold text-gray-800">Search products</span>
              </div>
              <SearchDropdown autoFocus onClose={() => setMobileSearchOpen(false)} />
            </div>
          </div>
        )}

        {/* ── Mobile Drawer ────────────────────────── */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => {
                setIsMobileMenuOpen(false);
                setExpandedMobileCategories(new Set());
              }}
            />
            <div className="absolute left-0 top-0 h-full w-[85vw] max-w-xs bg-white shadow-2xl overflow-y-auto flex flex-col">
              {/* Drawer header */}
              <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-4 flex items-center justify-between">
                <span className="text-base font-bold text-gray-900">Browse</span>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setExpandedMobileCategories(new Set());
                  }}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              </div>

              {/* Quick links */}
              <div className="flex gap-2 px-4 py-3 border-b border-gray-100">
                <Link
                  href="/shop"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-orange-50 text-orange-500 text-xs font-semibold border border-orange-100"
                >
                  <FaShopSlash className="w-3.5 h-3.5" />
                  Shops
                </Link>
                <Link
                  href="/wishlist"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-gray-50 text-gray-600 text-xs font-semibold border border-gray-100"
                >
                  <Heart className="w-3.5 h-3.5" />
                  Wishlist {wishlists?.length > 0 && `(${wishlists.length})`}
                </Link>
                {user ? (
                  <Link
                    href="/account"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-7 h-7 rounded-full overflow-hidden border border-primary-500 flex-shrink-0 flex items-center justify-center"
                  >
                    {user.avatar ? (
                      <Image
                        src={user.avatar}
                        alt={user.name}
                        width={28}
                        height={28}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-primary-400 to-orange-400 flex items-center justify-center">
                        <span className="text-[10px] font-extrabold text-white">
                          {user.name?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      </div>
                    )}
                  </Link>
                ) : (
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      dispatch(loginModalToggle());
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-gray-100 text-gray-700 text-xs font-semibold"
                  >
                    Login
                  </button>
                )}
              </div>

              {/* Mobile Cart quick view */}
              <div className="px-4 py-3 border-b border-gray-100">
                <button
                  onClick={() => {
                    dispatch(cartMenuToggle());
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-orange-500 text-white text-sm font-semibold"
                >
                  <span className="flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4" />
                    View Cart
                    {(products?.length ?? 0) > 0 && (
                      <span className="bg-white text-orange-500 text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                        {products.length}
                      </span>
                    )}
                  </span>
                  <span className="text-sm font-bold">৳{Number(totalPrice).toFixed(0)}</span>
                </button>
              </div>

              {/* Categories */}
              <div className="flex-1 px-4 py-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">
                  Categories
                </p>
                {categoryLoading ? (
                  <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-9 bg-gray-50 rounded-xl animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-0.5">
                    {categories.map((cat) => renderMobileCategoryItem(cat, 0))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      <ShoppingCart />
      <AuthModal />
    </>
  );
};

export default Navbar;
