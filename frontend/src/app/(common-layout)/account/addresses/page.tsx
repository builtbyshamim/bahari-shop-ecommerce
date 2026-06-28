import type { Metadata } from 'next';
import AddressesPage from '@/features/account/AddressesPage';

export const metadata: Metadata = {
  title: 'My Addresses',
  description: 'Add, edit or remove your delivery addresses.',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <AddressesPage />;
}
