import type { Metadata } from 'next';
import NotFoundPage from '@/components/ui/NotFoundPage';

export const metadata: Metadata = {
  title: '404 — Page Not Found',
  description: 'The page you are looking for could not be found.',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return <NotFoundPage />;
}
