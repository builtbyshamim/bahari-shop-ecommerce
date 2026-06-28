import type { Metadata } from 'next';
import { Inter, Source_Serif_4 } from 'next/font/google';
import './globals.css';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import ReduxProvider from '@/components/providers/ReduxProvider';
import GoogleAuthProvider from '@/components/providers/GoogleAuthProvider';
import { Toaster } from 'react-hot-toast';
import FcmInitializer from '@/components/FcmInitializer';
import TrackingInitializer from '@/components/TrackingInitializer';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

const sourceSerif = Source_Serif_4({
  variable: '--font-source-serif',
  subsets: ['latin'],
});

async function fetchCompanyInfo() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/company-info`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data ?? json ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const info = await fetchCompanyInfo();

  const name = info?.name || 'Bahari Shop';
  const tagline = info?.tagline || 'Best Products at Best Prices';
  const seoTitle = info?.seoTitle || `${name} — ${tagline}`;
  const seoDescription =
    info?.seoDescription ||
    info?.description ||
    `Find the best products at the best prices at ${name}. Electronics, fashion, home goods and thousands more items. Fast delivery, easy returns.`;
  const keywords: string[] = info?.seoKeywords
    ? info.seoKeywords
        .split(',')
        .map((k: string) => k.trim())
        .filter(Boolean)
    : [name, 'online shopping', 'bangladesh', 'ecommerce', 'best price'];

  const faviconUrl: string | undefined = info?.faviconUrl ?? undefined;
  const logoUrl: string | undefined = info?.logoUrl ?? undefined;
  const websiteUrl: string = info?.website || process.env.NEXT_PUBLIC_SITE_URL || '';

  return {
    metadataBase: websiteUrl ? new URL(websiteUrl) : undefined,
    title: {
      default: seoTitle,
      template: `%s | ${name}`,
    },
    description: seoDescription,
    keywords,
    authors: [{ name }],
    creator: name,
    publisher: name,
    applicationName: name,
    category: 'ecommerce',
    ...(faviconUrl && {
      icons: {
        icon: faviconUrl,
        shortcut: faviconUrl,
        apple: faviconUrl,
      },
    }),
    ...(websiteUrl && {
      alternates: { canonical: websiteUrl },
    }),
    openGraph: {
      type: 'website',
      locale: 'bn_BD',
      siteName: name,
      title: seoTitle,
      description: seoDescription,
      ...(websiteUrl && { url: websiteUrl }),
      ...(logoUrl && {
        images: [{ url: logoUrl, width: 400, height: 200, alt: `${name} logo` }],
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title: seoTitle,
      description: seoDescription,
      ...(logoUrl && { images: [logoUrl] }),
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const info = await fetchCompanyInfo();

  const name = info?.name || 'Bahari Shop';
  const websiteUrl: string = info?.website || process.env.NEXT_PUBLIC_SITE_URL || '';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    ...(websiteUrl && { url: websiteUrl }),
    ...(info?.logoUrl && { logo: info.logoUrl }),
    ...(info?.seoDescription || info?.description
      ? { description: info?.seoDescription || info?.description }
      : {}),
    ...(info?.email && {
      contactPoint: {
        '@type': 'ContactPoint',
        email: info.email,
        ...(info.phone && { telephone: info.phone }),
        contactType: 'customer service',
        availableLanguage: 'Bengali',
      },
    }),
    ...(info?.address && {
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'BD',
        streetAddress: info.address,
      },
    }),
    ...(info?.socialLinks && {
      sameAs: Object.values(info.socialLinks as Record<string, string>).filter(Boolean),
    }),
  };

  return (
    <html lang="bn">
      <body className={`${inter.variable} ${sourceSerif.variable} antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <ReduxProvider>
          <GoogleAuthProvider>
            <FcmInitializer />
            <TrackingInitializer />
            {children}
          </GoogleAuthProvider>
        </ReduxProvider>
        <Toaster position="bottom-center" reverseOrder={true} />
      </body>
    </html>
  );
}
