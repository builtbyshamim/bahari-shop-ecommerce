import type { Metadata } from 'next';
import ProfilePage from '@/features/account/Account';

export const metadata: Metadata = {
  title: 'My Account — প্রোফাইল',
  description: 'আপনার অ্যাকাউন্ট প্রোফাইল পরিচালনা করুন।',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <ProfilePage />;
}
