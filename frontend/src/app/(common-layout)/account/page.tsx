import type { Metadata } from 'next';
import ProfilePage from '@/features/account/Account';

export const metadata: Metadata = {
  title: 'My Account',
  description: 'Manage your account profile.',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <ProfilePage />;
}
