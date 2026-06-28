import type { Metadata } from 'next';
import NotFoundPage from '@/components/ui/NotFoundPage';

export const metadata: Metadata = {
  title: '404 — পেজ পাওয়া যায়নি',
  description: 'আপনি যে পেজটি খুঁজছেন সেটি পাওয়া যায়নি।',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return <NotFoundPage />;
}
