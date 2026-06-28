'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { MapPin, Phone, Mail, Truck, RotateCcw, ShieldCheck, Headphones } from 'lucide-react';
import {
  FaFacebookF,
  FaYoutube,
  FaXTwitter,
  FaTiktok,
  FaInstagram,
  FaLinkedinIn,
  FaWhatsapp,
} from 'react-icons/fa6';
import { footerColumns } from '@/utlits/footerData';
import { useGetCategoryTreeQuery } from '@/redux/api/productApi';
import { useGetCompanyInfoQuery } from '@/redux/api/companyApi';
import { useSubscribeMutation } from '@/redux/api/subscriberApi';
import ssl_banner from '../../../../public/images/logo/sslcommerz-banner.png';

// ─── Types ────────────────────────────────────────────────────
interface Category {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
}

interface SocialLinks {
  facebook?: string;
  instagram?: string;
  youtube?: string;
  twitter?: string;
  tiktok?: string;
  linkedin?: string;
  whatsapp?: string;
}

interface SocialConfigItem {
  icon: React.ReactNode;
  label: string;
  hoverCls: string;
}

interface ContactItem {
  Icon: React.ElementType;
  label: string;
  href?: string;
}

// ─── Constants ────────────────────────────────────────────────
const SOCIAL_CONFIG: Record<string, SocialConfigItem> = {
  facebook: {
    icon: <FaFacebookF size={14} />,
    label: 'Facebook',
    hoverCls: 'hover:bg-[#1877f2] hover:border-[#1877f2] hover:text-white',
  },
  instagram: {
    icon: <FaInstagram size={14} />,
    label: 'Instagram',
    hoverCls: 'hover:bg-[#e1306c] hover:border-[#e1306c] hover:text-white',
  },
  youtube: {
    icon: <FaYoutube size={14} />,
    label: 'YouTube',
    hoverCls: 'hover:bg-[#ff0000] hover:border-[#ff0000] hover:text-white',
  },
  twitter: {
    icon: <FaXTwitter size={14} />,
    label: 'X / Twitter',
    hoverCls: 'hover:bg-[#1a1a1a] hover:border-[#1a1a1a] hover:text-white',
  },
  tiktok: {
    icon: <FaTiktok size={14} />,
    label: 'TikTok',
    hoverCls: 'hover:bg-[#010101] hover:border-[#333] hover:text-white',
  },
  linkedin: {
    icon: <FaLinkedinIn size={14} />,
    label: 'LinkedIn',
    hoverCls: 'hover:bg-[#0077b5] hover:border-[#0077b5] hover:text-white',
  },
  whatsapp: {
    icon: <FaWhatsapp size={14} />,
    label: 'WhatsApp',
    hoverCls: 'hover:bg-[#25d366] hover:border-[#25d366] hover:text-white',
  },
};

interface FeatureItem {
  icon: React.ReactNode;
  title: string;
  sub: string;
  iconCls: string;
  bgCls: string;
}

const FEATURES: FeatureItem[] = [
  {
    icon: <Truck size={20} />,
    title: 'Free Delivery',
    sub: 'On orders above ৳500',
    iconCls: 'text-primary-500',
    bgCls: 'bg-primary-50 border-primary-100',
  },
  {
    icon: <ShieldCheck size={20} />,
    title: 'Secure Payment',
    sub: '100% encrypted checkout',
    iconCls: 'text-primary-500',
    bgCls: 'bg-primary-50 border-primary-100',
  },
  {
    icon: <RotateCcw size={20} />,
    title: 'Easy Returns',
    sub: 'Hassle-free 7-day policy',
    iconCls: 'text-primary-500',
    bgCls: 'bg-primary-50 border-primary-100',
  },
  {
    icon: <Headphones size={20} />,
    title: '24/7 Support',
    sub: 'Always here to help',
    iconCls: 'text-primary-500',
    bgCls: 'bg-primary-50 border-primary-100',
  },
];

interface PaymentMethod {
  label: string;
  bg: string;
  color: string;
}

// ─── Sub-components ───────────────────────────────────────────
const ShopByColumn = () => {
  const { data } = useGetCategoryTreeQuery({});
  const categories: Category[] = (data?.data || []).filter((c: Category) => c.isActive).slice(0, 7);

  return (
    <FooterLinkColumn
      title="Shop"
      links={
        categories.length > 0
          ? categories.map((c) => ({ label: c.name, href: `/shop?category=${c.slug}` }))
          : [{ label: 'All Products', href: '/shop' }]
      }
    />
  );
};

const FooterLinkColumn = ({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) => (
  <div>
    <h4 className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400 mb-4">
      {title}
    </h4>
    <ul className="space-y-2.5">
      {links.map((link) => (
        <li key={link.href}>
          <Link
            href={link.href}
            className="text-[13px] text-gray-500 hover:text-primary-500 transition-colors duration-200"
          >
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  </div>
);

// ─── Main Footer ──────────────────────────────────────────────
const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [subscribeStatus, setSubscribeStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const [subscribe, { isLoading: isSubscribing }] = useSubscribeMutation();
  const { data: companyRes } = useGetCompanyInfoQuery(undefined);
  const company = companyRes?.data;

  const socialLinks: SocialLinks = company?.socialLinks || {};
  const activeSocials = Object.entries(socialLinks).filter(([, url]) => !!url);

  const companyName: string = company?.name || 'Bahari Shop';
  const description: string =
    company?.description ||
    'Delivering fresh groceries, organic essentials & lifestyle products across Bangladesh. Speed, trust, and quality — every order.';

  const half = Math.ceil(companyName.length / 2);
  const namePart1 = companyName.slice(0, half);
  const namePart2 = companyName.slice(half);

  const rawContact: ContactItem[] = [
    company?.address ? { Icon: MapPin, label: company.address as string, href: undefined } : null,
    company?.phone
      ? { Icon: Phone, label: company.phone as string, href: `tel:${company.phone}` }
      : null,
    company?.email
      ? { Icon: Mail, label: company.email as string, href: `mailto:${company.email}` }
      : null,
  ].filter(Boolean) as ContactItem[];

  const displayContact: ContactItem[] =
    rawContact.length > 0
      ? rawContact
      : [
          { Icon: MapPin, label: 'Dhaka, Bangladesh', href: undefined },
          { Icon: Phone, label: '+880 1700-000000', href: 'tel:+8801700000000' },
          { Icon: Mail, label: 'hello@Bahari Shop.com', href: 'mailto:hello@Bahari Shop.com' },
        ];

  return (
    <footer className="">
      {/* ── Feature strip ──────────────────────────────────── */}
      <div className="py-8 bg-white">
        <div className="container mx-auto px-4 md:px-6 py-4">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="flex flex-col sm:flex-row items-center gap-3 bg-white border shadow-[0_3px_10px_rgb(0,0,0,0.2)] border-gray-100 rounded-2xl p-4 xl:p-6"
              >
                <div className="bg-[#FFF7ED] w-12 h-12 rounded-xl flex items-center justify-center">
                  <div
                    className={`w-6 h-6 flex justify-center items-center mx-auto ${feature.bgCls} ${feature.iconCls}`}
                  >
                    {feature.icon}
                  </div>
                </div>
                <div className="text-center sm:text-start">
                  <p className="text-sm font-semibold text-black-800 leading-tight">
                    {feature.title}
                  </p>
                  <p className="text-[13px] text-[#6B7280] mt-0.5">{feature.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main grid ──────────────────────────────────────── */}
      <div className="bg-[#FAFAFA]">
        <div className="container mx-auto px-4 md:px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Brand column */}
            <div className="lg:col-span-4 flex flex-col gap-5">
              {/* Logo */}
              <Link href="/" className="inline-flex items-center gap-2 w-fit">
                {company?.logoUrl ? (
                  <Image
                    src={company.logoUrl as string}
                    alt={companyName}
                    width={120}
                    height={36}
                    className="h-9 w-auto object-contain"
                  />
                ) : (
                  <span className="text-2xl font-bold tracking-tight">
                    <span className="text-primary-500">{namePart1}</span>
                    <span className="text-gray-800">{namePart2}</span>
                  </span>
                )}
              </Link>

              {/* Description */}
              <p className="text-[13px] text-gray-500 leading-relaxed max-w-[300px]">
                {description}
              </p>

              {/* Newsletter */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400 mb-2.5">
                  Stay in the loop
                </p>
                {subscribeStatus === 'success' ? (
                  <p className="text-[13px] text-green-600 font-medium">Thanks for subscribing!</p>
                ) : (
                  <div className="flex flex-row xs:flex-row gap-2">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (subscribeStatus === 'error') setSubscribeStatus('idle');
                      }}
                      placeholder="Your email address"
                      className="flex-1 min-w-0 text-[13px] px-3.5 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:border-primary-400 transition-colors"
                    />
                    <button
                      onClick={async () => {
                        if (!email || isSubscribing) return;
                        try {
                          await subscribe({ email }).unwrap();
                          setSubscribeStatus('success');
                          setEmail('');
                        } catch {
                          setSubscribeStatus('error');
                        }
                      }}
                      disabled={isSubscribing || !email}
                      className="px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white text-[13px] font-semibold rounded-lg transition-colors duration-200 whitespace-nowrap cursor-pointer shrink-0 disabled:cursor-not-allowed"
                    >
                      {isSubscribing ? 'Subscribing...' : 'Subscribe'}
                    </button>
                  </div>
                )}
                {subscribeStatus === 'error' && (
                  <p className="text-[12px] text-red-500 mt-1">
                    Could not subscribe. Please try again.
                  </p>
                )}
              </div>

              {/* Contact */}
              <div className="flex flex-col gap-1">
                {displayContact.map((item, i) => {
                  const row = (
                    <div className="flex items-start gap-2.5 py-1.5">
                      <item.Icon size={13} className="text-primary-500 mt-0.5 shrink-0" />
                      <span className="text-[13px] text-gray-500">{item.label}</span>
                    </div>
                  );
                  return item.href ? (
                    <Link key={i} href={item.href}>
                      {row}
                    </Link>
                  ) : (
                    <div key={i}>{row}</div>
                  );
                })}
              </div>

              {/* Social */}
              {activeSocials.length > 0 && (
                <div className="flex flex-col gap-2.5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">
                    Follow Us
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {activeSocials.map(([platform, url]) => {
                      const cfg = SOCIAL_CONFIG[platform];
                      if (!cfg) return null;
                      return (
                        <a
                          key={platform}
                          href={url as string}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`w-8 h-8 hover:scale-110 flex items-center justify-center rounded-full bg-[#F97316]/10 transition-all duration-200 text-primary-500 `}
                        >
                          {cfg.icon}
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Link columns */}
            <div className="lg:col-span-8">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
                <ShopByColumn />
                {footerColumns.map((col) => (
                  <FooterLinkColumn key={col.title} title={col.title} links={col.links} />
                ))}
              </div>
            </div>
          </div>
          <div className="pt-5">
            <Image src={ssl_banner} alt="SSL Commerz Banner" className="w-full h-auto" />
          </div>
        </div>
      </div>
      {/* ── Bottom bar ─────────────────────────────────────── */}
      <div className="border-t bg-white border-gray-200">
        <div className="container mx-auto px-4 md:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 flex-wrap">
          <p className="text-[12px] text-gray-400">
            © {currentYear} {companyName} Ltd. All rights reserved.
          </p>

          {/* Policy links */}
          <div className="flex items-center gap-4 text-[12px] text-gray-400">
            {[
              { label: 'Privacy', href: '/pages/privacy-policy' },
              { label: 'Terms', href: '/pages/terms-and-conditions' },
              { label: 'Refund', href: '/pages/refund-policy' },
              { label: 'Contact', href: '/pages/contact-us' },
            ].map(({ label, href }) => (
              <Link key={href} href={href} className="hover:text-primary-500 transition-colors">
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
