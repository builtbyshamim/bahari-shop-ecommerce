'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppSelector } from '@/redux/hooks';
import { useGetProfileQuery } from '@/redux/api/userApi';
import { CiShop } from 'react-icons/ci';
import { MdOutlineShoppingBag } from 'react-icons/md';
import { FaRegHeart } from 'react-icons/fa6';
import { RiLoginBoxLine, RiUser3Line } from 'react-icons/ri';

const Toolbar = () => {
  const pathname = usePathname();
  const cartItems = useAppSelector((store) => store.cart.products);
  const wishlists = useAppSelector((state: any) => state.wishlist.items);
  const { data: userData } = useGetProfileQuery(null);
  const user = userData?.data;

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  const tabBase =
    'flex flex-col items-center justify-center gap-[3px] flex-1 py-2 mx-0.5 my-1.5 rounded-xl transition-all duration-150';

  const tabActive = 'bg-primary-100/50 text-primary-500';
  const tabInactive = 'text-[#888780] hover:bg-primary-100/50 active:scale-95';

  const labelBase = 'text-[10px] leading-none';
  const labelActive = 'font-semibold text-primary-500';
  const labelInactive = 'font-medium text-[#888780]';

  const badgeClass =
    'absolute -top-1.5 -right-1.5 text-[9px] bg-[#D85A30] text-white rounded-full min-w-[16px] h-4 px-[3px] flex items-center justify-center font-bold leading-none border-[1.5px] border-white';

  const formatCount = (n: number) => (n > 9 ? '9+' : n);

  return (
    <div className="h-[72px] lg:hidden">
      <div className="fixed bottom-0 w-full bg-white border-t border-gray-100 z-50 pb-safe">
        <div className="flex items-stretch px-1">
          {/* Shop */}
          <Link
            href="/shop"
            className={`${tabBase} ${isActive('/shop') ? tabActive : tabInactive}`}
          >
            <CiShop className="text-[22px]" />
            <span className={`${labelBase} ${isActive('/shop') ? labelActive : labelInactive}`}>
              Shop
            </span>
          </Link>

          {/* Wishlist */}
          <Link
            href="/wishlist"
            className={`${tabBase} ${isActive('/wishlist') ? tabActive : tabInactive}`}
          >
            <div className="relative flex items-center justify-center w-[28px] h-[24px]">
              <FaRegHeart className="text-[18px]" />
              {wishlists?.length > 0 && (
                <span className={badgeClass}>{formatCount(wishlists.length)}</span>
              )}
            </div>
            <span className={`${labelBase} ${isActive('/wishlist') ? labelActive : labelInactive}`}>
              Wishlist
            </span>
          </Link>

          {/* Cart */}
          <Link
            href="/enjoy/shipping-cart"
            className={`${tabBase} ${isActive('/enjoy/shipping-cart') ? tabActive : tabInactive}`}
          >
            <div className="relative flex items-center justify-center w-[28px] h-[24px]">
              <MdOutlineShoppingBag className="text-[22px]" />
              {cartItems?.length > 0 && (
                <span className={badgeClass}>{formatCount(cartItems.length)}</span>
              )}
            </div>
            <span
              className={`${labelBase} ${isActive('/enjoy/shipping-cart') ? labelActive : labelInactive}`}
            >
              Cart
            </span>
          </Link>

          {/* Account / Login */}
          {user ? (
            <Link
              href="/account"
              className={`${tabBase} ${isActive('/account') ? tabActive : tabInactive}`}
            >
              <div className="w-[24px] h-[24px] rounded-full bg-primary-600 flex items-center justify-center text-white text-[10px] font-bold leading-none">
                {user.name?.charAt(0)?.toUpperCase() || <RiUser3Line />}
              </div>
              <span
                className={`${labelBase} ${isActive('/account') ? labelActive : labelInactive}`}
              >
                Account
              </span>
            </Link>
          ) : (
            <Link
              href="/login"
              className={`${tabBase} ${isActive('/login') ? tabActive : tabInactive}`}
            >
              <RiLoginBoxLine className="text-[22px]" />
              <span className={`${labelBase} ${isActive('/login') ? labelActive : labelInactive}`}>
                Login
              </span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Toolbar;
