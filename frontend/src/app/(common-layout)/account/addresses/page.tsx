import type { Metadata } from 'next';
import AddressesPage from '@/features/account/AddressesPage';

export const metadata: Metadata = {
  title: 'My Addresses — আমার ঠিকানা',
  description: 'আপনার ডেলিভারি ঠিকানা যোগ, সম্পাদনা বা মুছুন।',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <AddressesPage />;
}
