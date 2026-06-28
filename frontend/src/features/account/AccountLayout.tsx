'use client';
import { User, Package, Heart, MapPin, Lock, LogOut, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useEffect } from 'react';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import { useGetProfileQuery } from '@/redux/api/userApi';

export type AccountTab = 'profile' | 'orders' | 'wishlist' | 'addresses' | 'password';

export const ACCOUNT_TABS: {
  id: AccountTab;
  label: string;
  mobileLabel: string;
  href: string;
  icon: any;
}[] = [
  { id: 'profile', label: 'Profile', mobileLabel: 'Profile', href: '/account', icon: User },
  {
    id: 'orders',
    label: 'My Orders',
    mobileLabel: 'Orders',
    href: '/account/orders',
    icon: Package,
  },
  {
    id: 'wishlist',
    label: 'Wishlist',
    mobileLabel: 'Wishlist',
    href: '/account/wishlist',
    icon: Heart,
  },
  {
    id: 'addresses',
    label: 'Addresses',
    mobileLabel: 'Address',
    href: '/account/addresses',
    icon: MapPin,
  },
  {
    id: 'password',
    label: 'Change Password',
    mobileLabel: 'Password',
    href: '/account/password',
    icon: Lock,
  },
];

export default function AccountLayout({
  children,
  activeTab,
}: {
  children: React.ReactNode;
  activeTab: AccountTab;
}) {
  const router = useRouter();
  const { data, isLoading, isError } = useGetProfileQuery('');
  const user = data?.data;

  useEffect(() => {
    if (!isLoading && (isError || !user)) {
      router.replace('/login');
    }
  }, [isLoading, isError, user, router]);
  const displayName = user?.name || 'User';
  const displayPhone = user?.phone || user?.email || '';
  const avatarLetter = displayName.charAt(0).toUpperCase();

  const handleLogOut = () => {
    Cookies.remove('ecommerce_accessToken');
    Cookies.remove('ecommerce_refreshToken');
    toast.success('Logout successfully');
    router.push('/');
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap');
        .acc { font-family: 'Sora', sans-serif; }
      `}</style>

      {/* ── PAGE WRAPPER ─────────────────────────────────────────────────────
          pb-20 on mobile so content doesn't hide behind the fixed bottom bar  */}
      <div className="acc min-h-screen bg-black-100/50 pb-20 lg:pb-10">
        <div className="container py-4 lg:py-10">
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 items-start">
            {/* ════════════════════════════════════════════════════════════════
                DESKTOP SIDEBAR  (hidden on mobile)
            ════════════════════════════════════════════════════════════════ */}
            <aside className="hidden lg:flex flex-col w-60 flex-shrink-0 sticky top-24 gap-3">
              {/* User card */}
              <div className="bg-white rounded-2xl border border-black-200 p-4 flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl overflow-hidden shadow-md shadow-primary-200/40 flex-shrink-0">
                  {user?.avatar ? (
                    <Image
                      src={user.avatar}
                      alt={displayName}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary-400 to-orange-400 flex items-center justify-center">
                      <span className="text-lg font-extrabold text-white">{avatarLetter}</span>
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-black-900 truncate">{displayName}</p>
                  <p className="text-[11px] text-black-400 truncate">{displayPhone}</p>
                </div>
              </div>

              {/* Nav */}
              <nav className="bg-white rounded-2xl border border-black-200 overflow-hidden">
                {ACCOUNT_TABS.map(({ id, label, href, icon: Icon }) => {
                  const active = id === activeTab;
                  return (
                    <button
                      key={id}
                      onClick={() => router.push(href)}
                      className={`w-full flex items-center gap-3 px-4 py-3.5 text-sm font-semibold transition-all border-b border-black-100 last:border-b-0
                        ${
                          active
                            ? 'bg-primary-50 text-primary-600 border-l-[3px] border-l-primary-500'
                            : 'text-black-600 hover:bg-black-100/60 border-l-[3px] border-l-transparent'
                        }`}
                    >
                      <Icon size={15} className={active ? 'text-primary-500' : 'text-black-400'} />
                      {label}
                      {active && <ChevronRight size={13} className="ml-auto text-primary-400" />}
                    </button>
                  );
                })}
              </nav>

              <button
                onClick={handleLogOut}
                className="flex items-center gap-3 px-4 py-3.5 text-sm font-semibold text-red-500 bg-white border border-black-200 rounded-2xl hover:bg-red-50 hover:border-red-200 transition-all"
              >
                <LogOut size={15} /> Log Out
              </button>
            </aside>

            {/* ════════════════════════════════════════════════════════════════
                MAIN CONTENT
            ════════════════════════════════════════════════════════════════ */}
            <div className="flex-1 w-full min-w-0 flex flex-col gap-4">
              {/* ── Mobile: compact user header ─────────────────────────── */}
              <div className="lg:hidden bg-white rounded-2xl border border-black-200 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl overflow-hidden shadow-sm flex-shrink-0">
                    {user?.avatar ? (
                      <Image
                        src={user.avatar}
                        alt={displayName}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary-400 to-orange-400 flex items-center justify-center">
                        <span className="text-base font-extrabold text-white">{avatarLetter}</span>
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-black-900 truncate leading-tight">
                      {displayName}
                    </p>
                    <p className="text-[11px] text-black-400 truncate">{displayPhone}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogOut}
                  className="flex items-center gap-1.5 text-[11px] text-red-500 border border-red-100 bg-red-50 rounded-xl px-3 py-1.5 font-bold hover:bg-red-100 transition-colors flex-shrink-0"
                >
                  <LogOut size={12} /> Logout
                </button>
              </div>

              {/* ── Mobile: horizontal scrollable tab bar (below header) ── */}
              {/* ── Mobile: Grid-based tab bar (No horizontal scroll) ── */}
              <nav className="lg:hidden bg-white rounded-2xl border border-black-200 p-2">
                <div className="grid grid-cols-5 gap-1">
                  {ACCOUNT_TABS.map(({ id, mobileLabel, href, icon: Icon }) => {
                    const active = id === activeTab;
                    return (
                      <button
                        key={id}
                        onClick={() => router.push(href)}
                        className={`flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl transition-all
            ${active ? 'bg-primary-50 text-primary-600' : 'text-black-400 active:bg-black-50'}`}
                      >
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors 
              ${active ? 'bg-primary-100' : 'bg-black-50'}`}
                        >
                          <Icon
                            size={18}
                            className={active ? 'text-primary-600' : 'text-black-400'}
                          />
                        </div>
                        <span className="text-[10px] font-bold leading-tight text-center">
                          {mobileLabel}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </nav>

              {/* Page content */}
              <div className="w-full">{children}</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
