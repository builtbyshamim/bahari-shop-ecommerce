import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import moment from 'moment';
import { useGetAllBlogsQuery, useDeleteBlogMutation } from '../blogApi';
import { useGetAllBlogCategoriesQuery } from '../blogCategoryApi';
import DeleteAction from '../../../components/ui/actions/DeleteIcon';
import StatusBadge from '../../../components/ui/status/StatusBadge';
import { ErrorState } from '../../../components/ui/status/ErrorState';
import { EmptyState } from '../../../components/ui/status/EmptyState';
import CommonPagination from '../../../components/ui/pagination/CommonPagination';
import { useDebounce } from '../../../hooks/useDebounce';

const AllBlogs = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [queryParams, setQueryParams] = useState({ page: 1, limit: 15 });

  const debouncedSearch = useDebounce(search, 400);

  const { data, error, isFetching, refetch } = useGetAllBlogsQuery({
    search: debouncedSearch || undefined,
    blogCategoryId: selectedCategory || undefined,
    page: queryParams.page,
    limit: queryParams.limit,
  });

  const { data: catData } = useGetAllBlogCategoriesQuery({ limit: 100 });
  const categories: any[] = catData?.data?.data || [];

  const [deleteBlog, { isLoading: isDeleting }] = useDeleteBlogMutation();

  const blogs: any[] = data?.data?.data || [];
  const meta = data?.data?.meta;

  const handleDelete = async (blog: any) => {
    try {
      const result = await deleteBlog(blog.id).unwrap();
      if (result?.success !== false) {
        toast.success(result?.message || 'Blog deleted!');
      } else {
        toast.error(result?.message || 'Delete failed');
      }
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to delete blog.');
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Blog Posts</h1>
          <p className="text-gray-600 mt-1">Create and manage blog articles for your store</p>
        </div>
        <button
          onClick={() => navigate('/admin/blog/add')}
          className="btn bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-400 transition-colors"
        >
          + Add Blog Post
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mt-6">
        <input
          type="text"
          placeholder="Search blog posts..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setQueryParams((p) => ({ ...p, page: 1 }));
          }}
          className="w-full sm:w-64 border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <select
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            setQueryParams((p) => ({ ...p, page: 1 }));
          }}
          className="w-full sm:w-52 border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">All Categories</option>
          {categories.map((cat: any) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="table-container mt-6">
        {error ? (
          <ErrorState
            message={(error as any)?.data?.message || 'Failed to fetch blog posts'}
            refetch={refetch}
          />
        ) : (
          <div className="max-w-full overflow-x-auto">
            {blogs.length === 0 && !isFetching ? (
              <EmptyState message="No blog posts yet" actionText="Create Your First Blog Post" />
            ) : (
              <div className="table-section w-full">
                <table className="table w-full">
                  <thead>
                    <tr className="table-row">
                      <th>#</th>
                      <th>THUMBNAIL</th>
                      <th>TITLE</th>
                      <th>CATEGORY</th>
                      <th>PRODUCT</th>
                      <th>STATUS</th>
                      <th>CREATED</th>
                      <th className="text-center!">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="table-body">
                    {blogs.map((blog: any, index: number) => (
                      <tr key={blog.id}>
                        <td>{(queryParams.page - 1) * queryParams.limit + index + 1}</td>
                        <td>
                          {blog.thumbnail ? (
                            <img
                              src={blog.thumbnail}
                              alt={blog.title}
                              className="w-14 h-10 object-cover rounded"
                            />
                          ) : (
                            <div className="w-14 h-10 bg-gray-100 rounded flex items-center justify-center text-gray-400 text-xs">
                              No img
                            </div>
                          )}
                        </td>
                        <td className="font-medium text-gray-800 max-w-55">
                          <p className="truncate">{blog.title}</p>
                          <code className="text-xs text-gray-400">{blog.slug}</code>
                        </td>
                        <td className="text-gray-600 text-sm">{blog.blogCategory?.name || '—'}</td>
                        <td className="text-gray-600 text-sm max-w-30 truncate">
                          {blog.product?.name || '—'}
                        </td>
                        <td>
                          <StatusBadge isActive={blog.isPublished} />
                        </td>
                        <td className="text-gray-500 text-sm">
                          {moment(blog.createdAt).format('DD MMM YYYY')}
                        </td>
                        <td>
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => navigate(`/admin/blog/edit/${blog.id}`)}
                              disabled={isDeleting || isFetching}
                              className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                              title="Edit"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                            </button>
                            <DeleteAction
                              handleDelete={() => handleDelete(blog)}
                              item={blog}
                              disabled={isDeleting}
                              itemName={blog.title}
                              tooltip="Delete blog post"
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
      </div>

      {meta && meta.totalPages > 1 && (
        <CommonPagination
          total={meta.totalItems}
          totalPage={meta.totalPages}
          page={queryParams.page}
          limit={queryParams.limit}
          setSearchValue={setQueryParams}
        />
      )}
    </div>
  );
};

export default AllBlogs;
