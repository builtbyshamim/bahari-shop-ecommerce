import React, { useState } from 'react';
import { FiSearch, FiFilter } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useDebounce } from '../../../hooks/useDebounce';
import { useGetAllOrdersQuery } from '../OrdersApi';
import { EmptyState } from '../../../components/ui/status/EmptyState';
import CommonPagination from '../../../components/ui/pagination/CommonPagination';

const OrderList: React.FC = () => {
  const [searchValue, setSearchValue] = useState({
    search: '',
    limit: 10,
    page: 1,
    createdById: '',
  });
  const [showCreatorFilter, setShowCreatorFilter] = useState(false);
  const [creatorInput, setCreatorInput] = useState('');

  const debouncedSearch = useDebounce(searchValue.search, 500);

  const {
    data: orderData,
    isFetching,
    refetch,
  } = useGetAllOrdersQuery({
    ...searchValue,
    search: debouncedSearch,
  });

  const orders = orderData?.data?.data || [];
  const meta = orderData?.data?.meta || { totalItems: 0, totalPages: 1 };

  const statusColor: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-blue-100 text-blue-700',
    processing: 'bg-purple-100 text-purple-700',
    shipped: 'bg-indigo-100 text-indigo-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
    refunded: 'bg-gray-100 text-gray-700',
  };

  const paymentColor: Record<string, string> = {
    unpaid: 'bg-red-100 text-red-700',
    paid: 'bg-green-100 text-green-700',
    partial: 'bg-yellow-100 text-yellow-700',
    refunded: 'bg-gray-100 text-gray-700',
  };

  const creatorBadge = (order: any) => {
    const cb = order.createdBy;
    if (!cb) return <span className="text-gray-400 text-xs">Customer</span>;
    const role = cb.role?.toLowerCase();
    const colorClass =
      role === 'admin'
        ? 'bg-orange-100 text-orange-700'
        : role === 'employee'
          ? 'bg-violet-100 text-violet-700'
          : 'bg-gray-100 text-gray-600';
    return (
      <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium capitalize ${colorClass}`}>
        {cb.name || cb.email || cb.phone || 'Staff'}
      </span>
    );
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Order List</h1>
          <p className="text-gray-600 mt-1">Manage your orders</p>
        </div>
        <Link
          to="/admin/orders/custom-order"
          className="flex items-center gap-2 px-4 py-2 bg-[#ff6d29] text-white text-sm font-medium rounded-lg hover:bg-[#e65a1f] transition-colors"
        >
          + New Order
        </Link>
      </div>

      {/* Table */}
      <div className="table-container mt-6">
        {/* Search + Filters */}
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order no, name or phone..."
              value={searchValue.search}
              onChange={(e) =>
                setSearchValue({ ...searchValue, search: e.target.value.trim(), page: 1 })
              }
              className="search-input pl-9"
              disabled={isFetching}
            />
          </div>

          {/* Created By filter toggle */}
          <button
            onClick={() => setShowCreatorFilter((v) => !v)}
            className={`flex items-center gap-1.5 px-3 py-2 text-sm border rounded-lg transition-colors ${
              searchValue.createdById
                ? 'bg-violet-50 border-violet-300 text-violet-700'
                : 'border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
          >
            <FiFilter className="h-3.5 w-3.5" />
            {searchValue.createdById ? 'Filtered by creator' : 'Filter by creator'}
          </button>

          {searchValue.createdById && (
            <button
              onClick={() => {
                setSearchValue({ ...searchValue, createdById: '', page: 1 });
                setCreatorInput('');
              }}
              className="text-xs text-red-500 hover:underline"
            >
              × Clear filter
            </button>
          )}
        </div>

        {/* Creator ID filter panel */}
        {showCreatorFilter && (
          <div className="mb-4 p-4 bg-violet-50 border border-violet-100 rounded-xl flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Creator User ID (paste from user profile)
              </label>
              <input
                type="text"
                placeholder="e.g. a1b2c3d4-..."
                value={creatorInput}
                onChange={(e) => setCreatorInput(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-400"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setSearchValue({ ...searchValue, createdById: creatorInput.trim(), page: 1 });
                  setShowCreatorFilter(false);
                }}
                className="px-4 py-2 bg-violet-600 text-white text-sm rounded-lg hover:bg-violet-700 transition-colors"
              >
                Apply
              </button>
              <button
                onClick={() => {
                  setShowCreatorFilter(false);
                  setCreatorInput('');
                }}
                className="px-4 py-2 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="max-w-full overflow-x-auto mt-2">
          <div className="table-section w-full">
            <table className="table w-full">
              <thead>
                <tr className="table-row">
                  <th>#</th>
                  <th>ORDER NO</th>
                  <th>CUSTOMER</th>
                  <th>PHONE</th>
                  <th>ITEMS</th>
                  <th>TOTAL</th>
                  <th>SOURCE</th>
                  <th>CREATED BY</th>
                  <th>PAYMENT</th>
                  <th>STATUS</th>
                  <th>DATE</th>
                  <th className="text-center!">ACTION</th>
                </tr>
              </thead>

              {orders.length === 0 && !isFetching ? (
                <tbody>
                  <tr>
                    <td colSpan={12}>
                      <EmptyState message="No orders found" />
                    </td>
                  </tr>
                </tbody>
              ) : (
                <tbody className="table-body">
                  {orders.map((order: any, index: number) => (
                    <tr key={order.id}>
                      <td>{(searchValue.page - 1) * searchValue.limit + index + 1}</td>
                      <td className="font-medium text-blue-600">{order.orderNumber}</td>
                      <td>{order.customer?.name || 'N/A'}</td>
                      <td>{order.customer?.phone || 'N/A'}</td>
                      <td>{order.items?.length ?? 0}</td>
                      <td>৳{Number(order.totalPrice).toFixed(2)}</td>
                      <td>
                        {order.orderSource?.name ? (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 capitalize">
                            {order.orderSource.name}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">—</span>
                        )}
                      </td>
                      <td>{creatorBadge(order)}</td>
                      <td>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${paymentColor[order.paymentStatus] ?? ''}`}
                        >
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${statusColor[order.status] ?? ''}`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td>{new Date(order.createdAt).toLocaleDateString('en-GB')}</td>
                      <td>
                        <div className="flex items-center justify-center gap-2">
                          <Link to={`/admin/manage-orders/${order.id}`} className="btn btn-sm">
                            View
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              )}
            </table>
          </div>

          {orders.length > 0 && (
            <CommonPagination
              total={meta.totalItems}
              totalPage={meta.totalPages}
              setSearchValue={setSearchValue}
              searchValue={searchValue}
              refetch={refetch}
              limit={searchValue.limit}
              page={searchValue.page}
              disabled={isFetching}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderList;
