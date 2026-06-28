import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import AuthUserNotAccessRoute from '../components/providers/AuthUserNotAccessRoute';
import LoginPage from '../components/auth/Login';
import ForgotPassword from '../components/auth/ForgotPassword';
import Dashboard from '../components/dashboard/Dashboard';
import AllCustomer from '../features/customer/AllCustomer';
import ProductList from '../features/inventory/products/pages/AllProduct';
import EditProduct from '../features/inventory/products/pages/EditProduct';
import AddProduct from '../features/inventory/products/pages/AddProduct';
import AllCategory from '../features/inventory/category/pages/AllCategory';
import AllBrand from '../features/inventory/brand/AllBrand';
import ProductMedia from '../features/inventory/products/pages/ProductMedia';
import AllDeals from '../features/offers/deals/pages/AllDeals';
import AllCoupons from '../features/offers/coupons/pages/AllCoupons';
import AllTopRankingProducts from '../features/top-ranking-products/pages/AllTopRankingProducts';
import AllFeatureTypes from '../features/feature-types/AllFeatureTypes';
import OrderList from '../features/orders/pages/OrderList';
import OrderDetails from '../features/orders/pages/OrderDetails';
import CustomerDetailsPage from '../features/customer/CustomerDetailsPage';
import AllInventory from '../features/inventory/inventory/AllInventory';
import AllReviews from '../features/inventory/reviews/pages/AllReviews';
import ReportsDashboard from '../features/accounting/reports/ReportsDashboard';
import LedgerView from '../features/accounting/ledger/LedgerView';
import AllTransactions from '../features/accounting/transactions/AllTransactions';
import AllAccountingCategories from '../features/accounting/categories/AllAccountingCategories';
import AllAccounts from '../features/accounting/accounts/AllAccounts';
import hrmRoutes from './hrmRoutes';
import AllPathaoStores from '../features/courier-service/pathao-stores/AllPathaostores';
import AllCourierServiceTokens from '../features/courier-service/courier-service-tokens/AllCourierServiceTokens';
import AllCustomerLevels from '../features/customer-rank/AllCustomerLevels';
import CustomerLeaderboard from '../features/customer-rank/CustomerLeaderboard';
import AllOrderSources from '../features/common/order-sources/AllOrderSources';
import AllBanners from '../features/common/banners/AllBanners';
import AllPages from '../features/common/pages/AllPages';
import AllTestimonials from '../features/common/testimonials/AllTestimonials';
import AllDeliveryCharges from '../features/common/delivery-charges/pages/AllDeliveryCharges';
import CustomOrder from '../features/orders/pages/CustomOrder';
import AdminProfile from '../features/profile/AdminProfile';
import ChangePassword from '../features/profile/ChangePassword';
import ReportsHub from '../features/reports/ReportsHub';
import OrdersReportPage from '../features/reports/pages/OrdersReportPage';
import SalesSummaryPage from '../features/reports/pages/SalesSummaryPage';
import IncomeReportPage from '../features/reports/pages/IncomeReportPage';
import ExpenseReportPage from '../features/reports/pages/ExpenseReportPage';
import InventoryReportPage from '../features/reports/pages/InventoryReportPage';
import StockMovementsPage from '../features/reports/pages/StockMovementsPage';
import CampaignReportPage from '../features/reports/pages/CampaignReportPage';
import AdminOnlyRoute from '../components/providers/AdminOnlyRoute';
import CompanyInfoPage from '../features/settings/company-info/CompanyInfoPage';
import AllTrendingSearches from '../features/trending-search/AllTrendingSearches';
import SendMessage from '../features/messaging/SendMessage';
import MessageHistory from '../features/messaging/MessageHistory';
import AllTemplates from '../features/messaging/templates/AllTemplates';
import FraudCheckPage from '../features/courier-service/fraud-check/FraudCheckPage';
import OrderPayments from '../features/orders/order-payments/OrderPayments';
import AllSubscribers from '../features/subscribers/pages/AllSubscribers';
import AllGallery from '../features/common/gallery/AllGallery';
import AddBlog from '../features/blog/posts/AddBlog';
import AllBlogs from '../features/blog/posts/AllBlogs';
import AllBlogCategories from '../features/blog/categories/AllBlogCategories';
import EditBlog from '../features/blog/posts/EditBlog';
const router = createBrowserRouter([
  {
    path: '/',
    element: <AuthUserNotAccessRoute> </AuthUserNotAccessRoute>,
  },
  {
    path: '/login',
    element: (
      <AuthUserNotAccessRoute>
        <LoginPage />
      </AuthUserNotAccessRoute>
    ),
  },

  {
    path: '/auth/forgot-password',
    element: (
      <AuthUserNotAccessRoute>
        <ForgotPassword />
      </AuthUserNotAccessRoute>
    ),
  },
  {
    path: '/admin',
    element: <MainLayout />,
    children: [
      // Dashboard - admin only, employees are redirected to orders
      {
        path: '/admin',
        element: (
          <AdminOnlyRoute>
            <Dashboard />
          </AdminOnlyRoute>
        ),
      },

      // order routes - accessible by both admin and employee
      {
        path: '/admin/orders',
        element: <OrderList />,
      },
      {
        path: '/admin/orders/custom-order',
        element: <CustomOrder />,
      },
      {
        path: '/admin/orders/payments',
        element: <OrderPayments />,
      },
      {
        path: '/admin/manage-orders/:id',
        element: <OrderDetails />,
      },

      // profile routes - accessible by both admin and employee
      {
        path: '/admin/profile',
        element: <AdminProfile />,
      },
      {
        path: '/admin/change-password',
        element: <ChangePassword />,
      },

      // admin-only routes below
      {
        path: '/admin/manage-customers',
        element: (
          <AdminOnlyRoute>
            <AllCustomer />
          </AdminOnlyRoute>
        ),
      },
      {
        path: '/admin/manage-customers/:id',
        element: (
          <AdminOnlyRoute>
            <CustomerDetailsPage />
          </AdminOnlyRoute>
        ),
      },
      {
        path: '/admin/customer-rank/leaderboard',
        element: (
          <AdminOnlyRoute>
            <CustomerLeaderboard />
          </AdminOnlyRoute>
        ),
      },
      {
        path: '/admin/customer-rank/levels',
        element: (
          <AdminOnlyRoute>
            <AllCustomerLevels />
          </AdminOnlyRoute>
        ),
      },

      {
        path: '/admin/manage-products',
        element: (
          <AdminOnlyRoute>
            <ProductList />
          </AdminOnlyRoute>
        ),
      },
      {
        path: '/admin/manage-products/edit-product/:id',
        element: (
          <AdminOnlyRoute>
            <EditProduct />
          </AdminOnlyRoute>
        ),
      },
      {
        path: '/admin/manage-products/media/:id',
        element: (
          <AdminOnlyRoute>
            <ProductMedia />
          </AdminOnlyRoute>
        ),
      },
      {
        path: '/admin/manage-products/add-product',
        element: (
          <AdminOnlyRoute>
            <AddProduct />
          </AdminOnlyRoute>
        ),
      },

      {
        path: '/admin/inventory/manage-category',
        element: (
          <AdminOnlyRoute>
            <AllCategory />
          </AdminOnlyRoute>
        ),
      },
      {
        path: '/admin/inventory/manage-brand',
        element: (
          <AdminOnlyRoute>
            <AllBrand />
          </AdminOnlyRoute>
        ),
      },
      {
        path: '/admin/inventory/manage-inventory',
        element: (
          <AdminOnlyRoute>
            <AllInventory />
          </AdminOnlyRoute>
        ),
      },
      {
        path: '/admin/inventory/product-reviews',
        element: (
          <AdminOnlyRoute>
            <AllReviews />
          </AdminOnlyRoute>
        ),
      },

      {
        path: '/admin/offers/manage-deals',
        element: (
          <AdminOnlyRoute>
            <AllDeals />
          </AdminOnlyRoute>
        ),
      },
      {
        path: '/admin/offers/manage-coupons',
        element: (
          <AdminOnlyRoute>
            <AllCoupons />
          </AdminOnlyRoute>
        ),
      },
      {
        path: '/admin/featured-sections',
        element: (
          <AdminOnlyRoute>
            <AllTopRankingProducts />
          </AdminOnlyRoute>
        ),
      },

      {
        path: '/admin/feature-types',
        element: (
          <AdminOnlyRoute>
            <AllFeatureTypes />
          </AdminOnlyRoute>
        ),
      },
      {
        path: '/admin/common/trending-searches',
        element: (
          <AdminOnlyRoute>
            <AllTrendingSearches />
          </AdminOnlyRoute>
        ),
      },

      // accounting routes
      {
        path: '/admin/accounting/accounts',
        element: (
          <AdminOnlyRoute>
            <AllAccounts />
          </AdminOnlyRoute>
        ),
      },
      {
        path: '/admin/accounting/categories',
        element: (
          <AdminOnlyRoute>
            <AllAccountingCategories />
          </AdminOnlyRoute>
        ),
      },
      {
        path: '/admin/accounting/transactions',
        element: (
          <AdminOnlyRoute>
            <AllTransactions />
          </AdminOnlyRoute>
        ),
      },
      {
        path: '/admin/accounting/ledger',
        element: (
          <AdminOnlyRoute>
            <LedgerView />
          </AdminOnlyRoute>
        ),
      },
      {
        path: '/admin/accounting/reports',
        element: (
          <AdminOnlyRoute>
            <ReportsDashboard />
          </AdminOnlyRoute>
        ),
      },

      {
        path: '/admin/courier-services/pathao-stores',
        element: (
          <AdminOnlyRoute>
            <AllPathaoStores />
          </AdminOnlyRoute>
        ),
      },
      {
        path: '/admin/courier-services/courier-service-tokens',
        element: (
          <AdminOnlyRoute>
            <AllCourierServiceTokens />
          </AdminOnlyRoute>
        ),
      },

      // common / settings routes
      {
        path: '/admin/common/manage-order-sources',
        element: (
          <AdminOnlyRoute>
            <AllOrderSources />
          </AdminOnlyRoute>
        ),
      },
      {
        path: '/admin/common/manage-banners',
        element: (
          <AdminOnlyRoute>
            <AllBanners />
          </AdminOnlyRoute>
        ),
      },
      {
        path: '/admin/common/manage-pages',
        element: (
          <AdminOnlyRoute>
            <AllPages />
          </AdminOnlyRoute>
        ),
      },
      {
        path: '/admin/common/manage-testimonials',
        element: (
          <AdminOnlyRoute>
            <AllTestimonials />
          </AdminOnlyRoute>
        ),
      },
      {
        path: '/admin/common/manage-gallery',
        element: (
          <AdminOnlyRoute>
            <AllGallery />
          </AdminOnlyRoute>
        ),
      },
      {
        path: '/admin/common/manage-delivery-charges',
        element: (
          <AdminOnlyRoute>
            <AllDeliveryCharges />
          </AdminOnlyRoute>
        ),
      },

      // reports
      {
        path: '/admin/reports',
        element: (
          <AdminOnlyRoute>
            <ReportsHub />
          </AdminOnlyRoute>
        ),
      },
      {
        path: '/admin/reports/orders',
        element: (
          <AdminOnlyRoute>
            <OrdersReportPage />
          </AdminOnlyRoute>
        ),
      },
      {
        path: '/admin/reports/sales',
        element: (
          <AdminOnlyRoute>
            <SalesSummaryPage />
          </AdminOnlyRoute>
        ),
      },
      {
        path: '/admin/reports/income',
        element: (
          <AdminOnlyRoute>
            <IncomeReportPage />
          </AdminOnlyRoute>
        ),
      },
      {
        path: '/admin/reports/expense',
        element: (
          <AdminOnlyRoute>
            <ExpenseReportPage />
          </AdminOnlyRoute>
        ),
      },
      {
        path: '/admin/reports/inventory',
        element: (
          <AdminOnlyRoute>
            <InventoryReportPage />
          </AdminOnlyRoute>
        ),
      },
      {
        path: '/admin/reports/stock-movements',
        element: (
          <AdminOnlyRoute>
            <StockMovementsPage />
          </AdminOnlyRoute>
        ),
      },
      {
        path: '/admin/reports/campaigns',
        element: (
          <AdminOnlyRoute>
            <CampaignReportPage />
          </AdminOnlyRoute>
        ),
      },

      // fraud check
      {
        path: '/admin/courier-services/fraud-check',
        element: (
          <AdminOnlyRoute>
            <FraudCheckPage />
          </AdminOnlyRoute>
        ),
      },

      // company info
      {
        path: '/admin/settings/company-info',
        element: (
          <AdminOnlyRoute>
            <CompanyInfoPage />
          </AdminOnlyRoute>
        ),
      },

      // subscribers
      {
        path: '/admin/settings/subscribers',
        element: (
          <AdminOnlyRoute>
            <AllSubscribers />
          </AdminOnlyRoute>
        ),
      },

      // messaging
      {
        path: '/admin/messaging/send',
        element: (
          <AdminOnlyRoute>
            <SendMessage />
          </AdminOnlyRoute>
        ),
      },
      {
        path: '/admin/messaging/history',
        element: (
          <AdminOnlyRoute>
            <MessageHistory />
          </AdminOnlyRoute>
        ),
      },
      {
        path: '/admin/messaging/templates',
        element: (
          <AdminOnlyRoute>
            <AllTemplates />
          </AdminOnlyRoute>
        ),
      },
      // blog routes
      {
        path: '/admin/blog/categories',
        element: (
          <AdminOnlyRoute>
            <AllBlogCategories />
          </AdminOnlyRoute>
        ),
      },
      {
        path: '/admin/blog/posts',
        element: (
          <AdminOnlyRoute>
            <AllBlogs />
          </AdminOnlyRoute>
        ),
      },
      {
        path: '/admin/blog/add',
        element: (
          <AdminOnlyRoute>
            <AddBlog />
          </AdminOnlyRoute>
        ),
      },
      {
        path: '/admin/blog/edit/:id',
        element: (
          <AdminOnlyRoute>
            <EditBlog />
          </AdminOnlyRoute>
        ),
      },

      // hrm routes will be added here
      ...hrmRoutes,
    ],
  },
]);
export default router;
