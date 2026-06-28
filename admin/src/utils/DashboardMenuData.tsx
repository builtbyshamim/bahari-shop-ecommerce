import {
  MdCenterFocusStrong,
  MdOutlineAccountBalance,
  MdOutlineDashboard,
  MdShoppingCart,
  MdOutlineAssessment,
  MdOutlineMessage,
  MdOutlineArticle,
} from 'react-icons/md';
import { TbShoppingCartBolt } from 'react-icons/tb';
import { FaHireAHelper, FaUsers } from 'react-icons/fa';
import { HiTruck } from 'react-icons/hi';
import { CiCompass1, CiDollar } from 'react-icons/ci';
import { IoIosSettings } from 'react-icons/io';

type MenuItem = {
  id: number;
  name: string;
  path: string;
  icon: React.ReactNode;
  subMenu?: Array<{ id: number; name: string; path: string }>;
};

export const useDashboardMenuData = (role?: string): MenuItem[] => {
  const isEmployee = role === 'EMPLOYEE';

  if (isEmployee) {
    return [
      {
        id: 2,
        name: 'Orders',
        path: '/admin/orders',
        icon: <TbShoppingCartBolt />,
        subMenu: [
          { id: 2, name: 'Add Custom Order', path: '/admin/orders/custom-order' },
          { id: 3, name: 'Manage Orders', path: '/admin/orders' },
          { id: 4, name: 'Order Payments', path: '/admin/orders/payments' },
        ],
      },
    ];
  }

  const menuItems: (MenuItem | false)[] = [
    {
      id: 1,
      name: 'Dashboard',
      path: '/admin',
      icon: <MdOutlineDashboard />,
    },

    {
      id: 2,
      name: 'Orders',
      path: '/admin/orders',
      icon: <TbShoppingCartBolt />,
      subMenu: [
        { id: 2, name: 'Add Custom Order', path: '/admin/orders/custom-order' },
        { id: 3, name: 'Manage Orders', path: '/admin/orders' },
        { id: 4, name: 'Order Payments', path: '/admin/orders/payments' },
      ],
    },

    {
      id: 3,
      name: 'Inventory',
      path: '/admin/inventory',
      icon: <MdShoppingCart />,
      subMenu: [
        { id: 1, name: 'Products', path: '/admin/manage-products' },
        {
          id: 2,
          name: 'Create Product',
          path: '/admin/manage-products/add-product',
        },
        { id: 3, name: 'Category', path: '/admin/inventory/manage-category' },
        { id: 4, name: 'Brand', path: '/admin/inventory/manage-brand' },
        { id: 5, name: 'Inventory', path: '/admin/inventory/manage-inventory' },
        { id: 6, name: 'Product Reviews', path: '/admin/inventory/product-reviews' },
      ],
    },
    {
      id: 998,
      name: 'Reports',
      path: '/admin/reports',
      icon: <MdOutlineAssessment />,
      subMenu: [
        { id: 1, name: 'Orders Report', path: '/admin/reports/orders' },
        { id: 2, name: 'Sales Summary', path: '/admin/reports/sales' },
        { id: 3, name: 'Income Report', path: '/admin/reports/income' },
        { id: 4, name: 'Expense Report', path: '/admin/reports/expense' },
        { id: 5, name: 'Inventory Report', path: '/admin/reports/inventory' },
        { id: 6, name: 'Stock Movements', path: '/admin/reports/stock-movements' },
        { id: 7, name: 'Campaigns', path: '/admin/reports/campaigns' },
      ],
    },

    {
      id: 5,
      name: 'Accounting',
      path: '/admin/accounting',
      icon: <MdOutlineAccountBalance />,
      subMenu: [
        { id: 1, name: 'Accounting Summary', path: '/admin/accounting/accounts' },
        { id: 2, name: 'Accounting Categories', path: '/admin/accounting/categories' },
        { id: 3, name: 'Transactions', path: '/admin/accounting/transactions' },
        { id: 4, name: 'ledger', path: '/admin/accounting/ledger' },
        { id: 5, name: 'reports', path: '/admin/accounting/reports' },
      ],
    },

    {
      id: 1001,
      name: 'Offers',
      path: '/admin/offers',
      icon: <CiCompass1 />,
      subMenu: [
        { id: 1, name: 'Manage Deals', path: '/admin/offers/manage-deals' },
        { id: 2, name: 'Manage Coupons', path: '/admin/offers/manage-coupons' },
      ],
    },
    {
      id: 1002,
      name: 'Featured Sections',
      path: '/admin/featured-sections',
      icon: <CiDollar />,
      subMenu: [
        { id: 1, name: 'Feature Types', path: '/admin/feature-types' },
        { id: 2, name: 'Manage Featured Sections', path: '/admin/featured-sections' },
      ],
    },
    {
      id: 4,
      name: 'Customers',
      path: '/admin/manage-customers',
      icon: <FaUsers />,
      subMenu: [
        { id: 1, name: 'Manage Customers', path: '/admin/manage-customers' },
        { id: 2, name: 'Customer Levels', path: '/admin/customer-rank/levels' },
        { id: 3, name: 'Customer Leaderboard', path: '/admin/customer-rank/leaderboard' },
      ],
    },

    {
      id: 7,
      name: 'Courier Services',
      path: '/admin/courier-services',
      icon: <HiTruck />,
      subMenu: [
        {
          id: 1,
          name: 'Fraud Check',
          path: '/admin/courier-services/fraud-check',
        },
        {
          id: 2,
          name: 'Pathao Store',
          path: '/admin/courier-services/pathao-stores',
        },
        {
          id: 3,
          name: 'Courier Service Tokens',
          path: '/admin/courier-services/courier-service-tokens',
        },
      ],
    },
    {
      id: 1003,
      name: 'Blog',
      path: '/admin/blog/posts',
      icon: <MdOutlineArticle />,
      subMenu: [
        { id: 1, name: 'All Posts', path: '/admin/blog/posts' },
        { id: 2, name: 'Add New Post', path: '/admin/blog/add' },
        { id: 3, name: 'Blog Categories', path: '/admin/blog/categories' },
      ],
    },
    {
      id: 11,
      name: 'My Company',
      path: '/admin/settings/company-info',
      icon: <MdCenterFocusStrong />,
    },

    {
      id: 12,
      name: 'Messaging',
      path: '/admin/messaging',
      icon: <MdOutlineMessage />,
      subMenu: [
        { id: 1, name: 'Send Message', path: '/admin/messaging/send' },
        { id: 2, name: 'Message History', path: '/admin/messaging/history' },
        { id: 3, name: 'Templates', path: '/admin/messaging/templates' },
      ],
    },

    {
      id: 9,
      name: 'HRM',
      path: '/admin/hrm',
      icon: <FaHireAHelper />,
      subMenu: [
        { id: 1, name: 'Designations', path: '/admin/hrm/designations' },
        { id: 2, name: 'Employees', path: '/admin/hrm/employees' },
      ],
    },

    {
      id: 6,
      name: 'Settings',
      path: '/admin/common/payment-status',
      icon: <IoIosSettings />,
      subMenu: [
        {
          id: 1,
          name: 'Company Info',
          path: '/admin/settings/company-info',
        },
        {
          id: 4,
          name: 'Order Sources',
          path: '/admin/common/manage-order-sources',
        },
        {
          id: 5,
          name: 'Banners',
          path: '/admin/common/manage-banners',
        },
        {
          id: 6,
          name: 'Pages',
          path: '/admin/common/manage-pages',
        },
        {
          id: 7,
          name: 'Testimonials',
          path: '/admin/common/manage-testimonials',
        },
        {
          id: 8,
          name: 'Delivery Charges',
          path: '/admin/common/manage-delivery-charges',
        },
        {
          id: 9,
          name: 'Trending Searches',
          path: '/admin/common/trending-searches',
        },
        {
          id: 10,
          name: 'Subscribers',
          path: '/admin/settings/subscribers',
        },
        {
          id: 11,
          name: 'Gallery',
          path: '/admin/common/manage-gallery',
        },
      ],
    },
  ];

  return menuItems.filter(Boolean) as MenuItem[];
};
