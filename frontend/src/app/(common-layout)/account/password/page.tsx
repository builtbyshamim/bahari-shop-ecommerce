import type { Metadata } from 'next';
import PasswordPage from '@/features/account/PasswordPage';

export const metadata: Metadata = {
  title: 'Change Password',
  description: 'Change your account password.',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <PasswordPage />;
}
