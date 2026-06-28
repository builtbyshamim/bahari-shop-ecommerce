import type { Metadata } from 'next';
import BlogDetailPage from '@/features/blogs/BlogDetailPage';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/blogs/public/${slug}`,
      { next: { revalidate: 3600 } },
    );
    if (!res.ok) throw new Error();
    const json = await res.json();
    const blog = json?.data ?? json;

    return {
      title: blog.metaTitle || blog.title,
      description: blog.metaDescription || blog.shortDescription || '',
      keywords: blog.metaKeywords || undefined,
      openGraph: {
        title: blog.metaTitle || blog.title,
        description: blog.metaDescription || blog.shortDescription || '',
        images: blog.thumbnail ? [{ url: blog.thumbnail }] : [],
        url: `/blog/${slug}`,
        type: 'article',
      },
    };
  } catch {
    return {
      title: 'Blog Article | GadgetElection',
    };
  }
}

export default function BlogPostPage() {
  return <BlogDetailPage />;
}
