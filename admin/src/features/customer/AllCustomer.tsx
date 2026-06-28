import React, { useState } from 'react';
import { FiSearch, FiEye } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useDebounce } from '../../hooks/useDebounce';
import { useDeleteCustomerMutation, useGetAllCustomerQuery } from './customerApi';
import { EmptyState } from '../../components/ui/status/EmptyState';
import StatusBadge from '../../components/ui/status/StatusBadge';
import DeleteAction from '../../components/ui/actions/DeleteIcon';
import CommonPagination from '../../components/ui/pagination/CommonPagination';

const AllCustomer: React.FC = () => {
  const [searchValue, setSearchValue] = useState({
    search: '',
    limit: 10,
    page: 1,
  });

  // Debounced search
  const debouncedSearch = useDebounce(searchValue.search, 500);

  // RTK Query
  const {
    data: customerData,
    isFetching,
    refetch,
  } = useGetAllCustomerQuery({
    ...searchValue,
    search: debouncedSearch,
  });

  const [deleteCustomer] = useDeleteCustomerMutation();
  const customers = customerData?.data?.data || [];
  const meta = customerData?.data?.meta || { totalItems: 0, totalPages: 1 };

  const handleDeleteCustomer = async (customer: any) => {
    try {
      await deleteCustomer(customer.id).unwrap();
    } catch (err) {
      console.error('Failed to delete customer:', err);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Customer List</h1>
          <p className="text-gray-600 mt-1">Manage your customers</p>
        </div>
      </div>

      {/* Customer Table */}
      <div className="table-container mt-8">
        <div className="mb-4">
          <div className="relative max-w-sm">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email or phone..."
              value={searchValue.search}
              onChange={(e) =>
                setSearchValue({
                  ...searchValue,
                  search: e.target.value.trim(),
                  page: 1,
                })
              }
              className="search-input"
              disabled={isFetching}
            />
          </div>
        </div>

        <div className="max-w-full overflow-x-auto mt-4">
          <div className="table-section w-full">
            <table className="table w-full">
              <thead>
                <tr className="table-row">
                  <th>#</th>
                  <th>NAME</th>
                  <th>EMAIL</th>
                  <th>PHONE</th>
                  <th>TOTAL ORDERS</th>
                  <th>TOTAL SPENT</th>
                  <th>STATUS</th>
                  <th className="text-center!">ACTION</th>
                </tr>
              </thead>

              {customers.length === 0 && !isFetching ? (
                <tbody>
                  <tr>
                    <td colSpan={8}>
                      <EmptyState message="No customers found" />
                    </td>
                  </tr>
                </tbody>
              ) : (
                <tbody className="table-body">
                  {customers.map((customer: any, index: number) => (
                    <tr key={customer.id}>
                      <td>{(searchValue.page - 1) * searchValue.limit + index + 1}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          {/* Avatar fallback with initials */}
                          <div className="w-8 h-8 rounded-full bg-primary-300 flex items-center justify-center text-primary-500 font-bold text-xs flex-shrink-0">
                            {customer.name
                              ? customer.name
                                  .split(' ')
                                  .map((n: string) => n[0])
                                  .join('')
                                  .toUpperCase()
                                  .slice(0, 2)
                              : '?'}
                          </div>
                          <span className="text-wrap font-medium text-gray-700">
                            {customer.name || 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td>{customer.email || 'N/A'}</td>
                      <td>{customer.phone || 'N/A'}</td>
                      <td>{customer.totalOrders ?? 0}</td>
                      <td>
                        {customer.totalSpent != null
                          ? `$${Number(customer.totalSpent).toFixed(2)}`
                          : 'N/A'}
                      </td>
                      <td>
                        <StatusBadge isActive={!customer.isBanned} />
                      </td>
                      <td>
                        <div className="flex items-center justify-center w-full gap-2">
                          <Link
                            to={`/admin/manage-customers/${customer.id}`}
                            className="text-blue-500 hover:text-blue-700 transition"
                            title="View Details"
                          >
                            <FiEye size={17} />
                          </Link>
                          <DeleteAction handleDelete={handleDeleteCustomer} item={customer} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              )}
            </table>
          </div>

          {/* Pagination */}
          {customers.length > 0 && (
            <div>
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllCustomer;
