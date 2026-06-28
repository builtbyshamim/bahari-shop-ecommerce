export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterColumn {
  title: string;
  links: FooterLink[];
}

export const footerColumns: FooterColumn[] = [
  {
    title: 'Information',
    links: [
      { label: 'About Us',            href: '/pages/about-us' },
      { label: 'Contact Us',          href: '/pages/contact-us' },
      { label: 'Company Information', href: '/pages/company-information' },
      { label: 'Our Stories',         href: '/pages/our-stories' },
      { label: 'Terms & Conditions',  href: '/pages/terms-and-conditions' },
      { label: 'Privacy Policy',      href: '/pages/privacy-policy' },
      { label: 'Careers',             href: '/pages/careers' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Support Center', href: '/pages/support-center' },
      { label: 'How to Order',   href: '/pages/how-to-order' },
      { label: 'Order Tracking', href: '/pages/order-tracking' },
      { label: 'Payment',        href: '/pages/payment' },
      { label: 'Shipping',       href: '/pages/shipping' },
      { label: 'FAQ',            href: '/pages/faq' },
    ],
  },
  {
    title: 'Consumer Policy',
    links: [
      { label: 'Happy Return',  href: '/pages/happy-return' },
      { label: 'Refund Policy', href: '/pages/refund-policy' },
      { label: 'Exchange',      href: '/pages/exchange' },
      { label: 'Cancellation',  href: '/pages/cancellation' },
      { label: 'Pre-Order',     href: '/pages/pre-order' },
      { label: 'Extra Discount',href: '/pages/extra-discount' },
    ],
  },
];
