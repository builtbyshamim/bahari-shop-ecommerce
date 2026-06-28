import type { Metadata } from 'next';
import PasswordPage from '@/features/account/PasswordPage';

export const metadata: Metadata = {
  title: 'Change Password — পাসওয়ার্ড পরিবর্তন',
  description: 'আপনার অ্যাকাউন্টের পাসওয়ার্ড পরিবর্তন করুন।',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <PasswordPage />;
}
