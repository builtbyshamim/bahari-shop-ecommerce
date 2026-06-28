import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ slug: string }>;
}

async function fetchPage(slug: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const res = await fetch(`${baseUrl}/api/v1/pages/public/${slug}`, {
    next: { revalidate: 300 },
  });
  if (!res.ok) return null;
  const json = await res.json();
  return json?.data ?? null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = await fetchPage(slug);
  return {
    title: page?.title ?? 'Page Not Found',
  };
}

export default async function DynamicPage({ params }: Props) {
  const { slug } = await params;
  const page = await fetchPage(slug);

  if (!page) notFound();

  return (
    <main className="container py-10 min-h-[60vh]">
      {/* Page Header */}
      <div className="mb-8 pb-4 border-b border-black-200">
        <h1 className="text-2xl md:text-3xl font-bold text-black-900">{page.title}</h1>
      </div>

      {/* Page Content - rendered from Jodit HTML */}
      {page.content ? (
        <article
          className="prose prose-sm sm:prose max-w-none text-black-700
            prose-headings:text-black-900 prose-headings:font-semibold
            prose-a:text-primary-500 prose-a:no-underline hover:prose-a:underline
            prose-strong:text-black-800
            prose-ul:list-disc prose-ol:list-decimal
            prose-li:marker:text-primary-500"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      ) : (
        <p className="text-black-500 text-sm">No content available.</p>
      )}
    </main>
  );
}
