import type { Metadata } from 'next';
import BlogsPage from '@/features/blogs/BlogsPage';

export const metadata: Metadata = {
  title: 'Blog — Tech Insights & Gadget Reviews',
  description:
    'Expert gadget reviews, buying guides and tech tips from GadgetElection. Stay updated with the latest in smartphones, laptops, earbuds and more.',
  openGraph: {
    title: 'GadgetElection Blog — Tech Insights & Gadget Reviews',
    description: 'Expert reviews and buying guides for the best gadgets in Bangladesh.',
    url: '/blog',
  },
};

export default function BlogPage() {
  return <BlogsPage />;
}
