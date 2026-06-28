import { useState } from 'react';
import { FiSearch, FiUsers, FiUserCheck, FiUserX, FiClock } from 'react-icons/fi';
import DeleteAction from '../../../components/ui/actions/DeleteIcon';
import CommonPagination from '../../../components/ui/pagination/CommonPagination';
import { ErrorState } from '../../../components/ui/status/ErrorState';
import { EmptyState } from '../../../components/ui/status/EmptyState';
import EditWithActionIcon from '../../../components/ui/actions/EditWithActionIcon';
import CommonModal from '../../../components/ui/modal/CommonModal';
import toast from 'react-hot-toast';
import { useDebounce } from '../../../hooks/useDebounce';
import {
  useDeleteEmployeeMutation,
  useGetAllEmployeesQuery,
  useGetEmployeeStatsQuery,
} from './allEmployeeApi';

import { useGetAllDesignationsQuery } from '../designations/DesignationApi';
import AddEmployee from './NewEmployee';
import EditEmployee from './EditOldEmployee';

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-600',
  on_leave: 'bg-yellow-100 text-yellow-800',
  terminated: 'bg-red-100 text-red-800',
};

const typeColors: Record<string, string> = {
  full_time: 'bg-blue-100 text-blue-800',
  part_time: 'bg-purple-100 text-purple-800',
  contract: 'bg-orange-100 text-orange-800',
  intern: 'bg-pink-100 text-pink-800',
};

const AllEmployees = () => {
  const [openEditModal, setOpenEditModal] = useState<any>(false);
  const [addItem, setAddItem] = useState(false);
  const [searchValue, setSearchValue] = useState({
    search: '',
    limit: 10,
    page: 1,
    status: '',
    employment_type: '',
    designation_id: '',
  });

  const debouncedSearch = useDebounce(searchValue.search, 500);

  const { data, error, isFetching, refetch } = useGetAllEmployeesQuery({
    ...searchValue,
    search: debouncedSearch,
  });

  const { data: statsData } = useGetEmployeeStatsQuery(undefined);
  const { data: designationData } = useGetAllDesignationsQuery({ limit: 100 });
  const [deleteEmployee, { isLoading: isDeleting }] = useDeleteEmployeeMutation();

  const employees = data?.data?.data?.data || [];
  const meta = data?.data?.data?.meta || { totalItems: 0, totalPages: 1 };
  const stats = statsData?.data?.data || {};
  const designations = designationData?.data?.data?.data || [];

  const handleDelete = async (emp: any) => {
    try {
      const result = await deleteEmployee(emp.id).unwrap();
      if (result?.success) toast.success(result?.message || 'Employee deleted!');
      else toast.error(result?.message || 'Delete failed');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to delete employee.');
    }
  };

  // ── helper: safely read profile fields ───────────────────────────────────
  const p = (emp: any) => emp?.employeeProfile ?? {};

  const hasFilters =
    searchValue.status || searchValue.employment_type || searchValue.designation_id;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Employees</h1>
          <p className="text-gray-600 mt-1">Manage your workforce</p>
        </div>
        <button
          onClick={() => setAddItem(true)}
          className="btn bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
        >
          Add Employee
        </button>
      </div>

      {/* Stats Cards */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: 'Total',
            value: stats.total ?? 0,
            icon: FiUsers,
            color: 'border-blue-200 text-blue-600',
          },
          {
            label: 'Active',
            value: stats.active ?? 0,
            icon: FiUserCheck,
            color: 'border-green-200 text-green-600',
          },
          {
            label: 'On Leave',
            value: stats.on_leave ?? 0,
            icon: FiClock,
            color: 'border-yellow-200 text-yellow-600',
          },
          {
            label: 'Inactive',
            value: stats.inactive ?? 0,
            icon: FiUserX,
            color: 'border-red-200 text-red-600',
          },
        ].map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className={`bg-white rounded-xl border p-4 flex items-center gap-3 ${color}`}
          >
            <Icon className="w-5 h-5 shrink-0" />
            <div>
              <p className="text-xs text-gray-500">{label}</p>
              <p className="text-xl font-bold text-gray-800">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="table-container mt-6">
        {/* Filters */}
        <div className="mb-4 flex flex-wrap gap-3 items-center">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search name, email, EMP ID..."
              value={searchValue.search}
              onChange={(e) => setSearchValue({ ...searchValue, search: e.target.value, page: 1 })}
              className="search-input pl-9 min-w-[220px]"
              disabled={isFetching}
            />
          </div>

          <select
            value={searchValue.status}
            onChange={(e) => setSearchValue({ ...searchValue, status: e.target.value, page: 1 })}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="on_leave">On Leave</option>
            <option value="terminated">Terminated</option>
          </select>

          <select
            value={searchValue.employment_type}
            onChange={(e) =>
              setSearchValue({ ...searchValue, employment_type: e.target.value, page: 1 })
            }
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Types</option>
            <option value="full_time">Full Time</option>
            <option value="part_time">Part Time</option>
            <option value="contract">Contract</option>
            <option value="intern">Intern</option>
          </select>

          <select
            value={searchValue.designation_id}
            onChange={(e) =>
              setSearchValue({ ...searchValue, designation_id: e.target.value, page: 1 })
            }
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Designations</option>
            {designations.map((d: any) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          {hasFilters && (
            <button
              onClick={() =>
                setSearchValue({
                  ...searchValue,
                  status: '',
                  employment_type: '',
                  designation_id: '',
                  page: 1,
                })
              }
              className="text-sm text-red-500 hover:underline"
            >
              Clear Filters
            </button>
          )}
        </div>

        {error ? (
          <ErrorState
            message={(error as any)?.data?.message || 'Failed to fetch employees'}
            refetch={refetch}
          />
        ) : (
          <div className="max-w-full overflow-x-auto mt-4">
            {employees.length === 0 && !isFetching ? (
              <EmptyState message="No employees found" actionText="Add Your First Employee" />
            ) : (
              <div className="table-section w-full">
                <table className="table w-full">
                  <thead>
                    <tr className="table-row">
                      <th>#</th>
                      <th>EMP ID</th>
                      <th>NAME</th>
                      <th>DESIGNATION</th>
                      <th>TYPE</th>
                      <th>CONTACT</th>
                      <th>SALARY</th>
                      <th>JOIN DATE</th>
                      <th>STATUS</th>
                      <th className="text-center!">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="table-body">
                    {employees.map((emp: any, index: number) => (
                      <tr key={emp.id}>
                        <td>{(searchValue.page - 1) * searchValue.limit + index + 1}</td>

                        {/* EMP-00001 — from profile */}
                        <td className="font-mono text-sm text-primary-600 font-semibold">
                          {p(emp).employee_id ?? '—'}
                        </td>

                        {/* Name + email — from user */}
                        <td>
                          <div>
                            <p className="font-medium text-gray-800">{emp.name}</p>
                            <p className="text-xs text-gray-400">{emp.email}</p>
                          </div>
                        </td>

                        {/* Designation — profile → designation */}
                        <td>{p(emp).designation?.name ?? '—'}</td>

                        {/* Employment type — from profile */}
                        <td>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              typeColors[p(emp).employment_type] ?? 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {p(emp).employment_type?.replace('_', ' ') ?? '—'}
                          </span>
                        </td>

                        {/* Phone — from user */}
                        <td className="text-sm text-gray-500">{emp.phone ?? '—'}</td>

                        {/* Salary — from profile */}
                        <td className="font-medium">
                          {p(emp).salary ? `৳ ${Number(p(emp).salary).toLocaleString()}` : '—'}
                        </td>

                        {/* Join date — from profile */}
                        <td className="text-sm">
                          {p(emp).join_date
                            ? new Date(p(emp).join_date).toLocaleDateString('en-BD', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })
                            : '—'}
                        </td>

                        {/* Status — from profile */}
                        <td>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              statusColors[p(emp).status] ?? 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {p(emp).status?.replace('_', ' ') ?? '—'}
                          </span>
                        </td>

                        <td>
                          <div className="flex items-center justify-center gap-2">
                            <EditWithActionIcon
                              item={emp}
                              onClick={setOpenEditModal}
                              disabled={isDeleting || isFetching}
                            />
                            <DeleteAction
                              handleDelete={() => handleDelete(emp)}
                              item={emp}
                              disabled={isDeleting}
                              itemName={emp.name}
                              tooltip="Delete employee"
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {employees.length > 0 && (
          <CommonPagination
            total={meta.totalItems}
            totalPage={meta.totalPages}
            setSearchValue={setSearchValue}
            searchValue={searchValue}
            refetch={refetch}
            limit={searchValue.limit}
            page={searchValue.page}
            disabled={isFetching || isDeleting}
          />
        )}
      </div>

      <CommonModal isOpen={addItem} onClose={() => setAddItem(false)} title="Add New Employee">
        <AddEmployee onClose={() => setAddItem(false)} />
      </CommonModal>

      <CommonModal
        isOpen={!!openEditModal}
        onClose={() => setOpenEditModal(false)}
        title="Edit Employee"
      >
        <EditEmployee employee={openEditModal} onClose={() => setOpenEditModal(false)} />
      </CommonModal>
    </div>
  );
};

export default AllEmployees;
