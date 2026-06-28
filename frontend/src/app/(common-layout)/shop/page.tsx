import type { Metadata } from 'next';
import ShopPage from '@/features/shops/Shops';

export const metadata: Metadata = {
  title: 'Shop — সব পণ্য',
  description:
    'Bahari Shop শপে পান ইলেকট্রনিক্স, ফ্যাশন, গৃহস্থালী পণ্যসহ হাজারো আইটেম। ফিল্টার করুন ক্যাটাগরি, দাম ও ব্র্যান্ড অনুযায়ী।',
  openGraph: {
    title: 'Shop | Bahari Shop',
    description: 'সব ক্যাটাগরির পণ্য একসাথে — Bahari Shop শপে।',
    url: '/shop',
  },
};

export default function Page() {
  return <ShopPage />;
}
