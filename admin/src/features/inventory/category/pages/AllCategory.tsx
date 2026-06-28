import { useRef, useState } from 'react';
import {
  useDeleteCategoryMutation,
  useGetCategoryTreeQuery,
  useReorderCategoryMutation,
} from '../categoryApi';
import { FiSearch, FiChevronRight, FiChevronDown } from 'react-icons/fi';
import DeleteAction from '../../../../components/ui/actions/DeleteIcon';
import { ErrorState } from '../../../../components/ui/status/ErrorState';
import { EmptyState } from '../../../../components/ui/status/EmptyState';
import StatusBadge from '../../../../components/ui/status/StatusBadge';
import EditWithActionIcon from '../../../../components/ui/actions/EditWithActionIcon';
import toast from 'react-hot-toast';
import { ImageDisplay } from '../../../../components/ui/modal/ImageDisplay';
import CommonModal from '../../../../components/ui/modal/CommonModal';
import AddCategory from './AddCategory';
import EditCategory from './EditCategory';
import { useDebounce } from '../../../../hooks/useDebounce';

// ──────────────────────────────────────────────
// Recursive Row Component
// ──────────────────────────────────────────────
const CategoryRow = ({
  category,
  depth = 0,
  index,
  onEdit,
  onDelete,
  isDeleting,
  isFetching,
  handleDragStart,
  handleDragEnter,
  handleDragEnd,
}: any) => {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = category?.children?.length > 0;

  return (
    <>
      <tr
        draggable
        onDragStart={() => handleDragStart(index)}
        onDragEnter={() => handleDragEnter(index)}
        onDragEnd={handleDragEnd}
        className="hover:bg-gray-50 transition-colors"
      >
        {/* # */}
        <td className="px-4 py-3 text-sm text-gray-500">{index}</td>

        {/* IMAGE */}
        <td className="px-4 py-3">
          <ImageDisplay
            src={category?.image}
            alt={category.name}
            className="w-10 h-10 rounded-md object-cover"
          />
        </td>

        {/* NAME — indented by depth */}
        <td className="px-4 py-3">
          <div className="flex items-center gap-1" style={{ paddingLeft: `${depth * 20}px` }}>
            {/* Expand/collapse button */}
            {hasChildren ? (
              <button
                onClick={() => setExpanded((prev) => !prev)}
                className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
              >
                {expanded ? <FiChevronDown size={16} /> : <FiChevronRight size={16} />}
              </button>
            ) : (
              // indent spacer for leaf nodes
              depth > 0 && (
                <span className="inline-block w-4 flex-shrink-0">
                  <span className="text-gray-300">└</span>
                </span>
              )
            )}

            <span
              className={`font-medium ${depth > 0 ? 'text-sm text-gray-600' : 'text-gray-800'}`}
            >
              {category.name}
            </span>

            {/* depth badge */}
            {depth > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-gray-100 text-gray-400 rounded">
                L{depth}
              </span>
            )}
          </div>
        </td>

        {/* STATUS */}
        <td className="px-4 py-3">{category.position}</td>
        <td className="px-4 py-3">
          <StatusBadge isActive={category?.isActive} />
        </td>

        {/* ACTION */}
        <td className="px-4 py-3">
          <div className="flex items-center justify-center gap-2">
            <EditWithActionIcon
              item={category}
              onClick={onEdit}
              disabled={isDeleting || isFetching}
            />
            <DeleteAction
              handleDelete={() => onDelete(category)}
              item={category}
              disabled={isDeleting}
              itemName={category?.name}
              tooltip="Delete category"
            />
          </div>
        </td>
      </tr>

      {/* ✅ Recursive children rows */}
      {hasChildren &&
        expanded &&
        category.children.map((child: any, i: number) => (
          <CategoryRow
            key={child.id}
            category={child}
            depth={depth + 1}
            index={`${index}.${i + 1}`}
            onEdit={onEdit}
            onDelete={onDelete}
            isDeleting={isDeleting}
            isFetching={isFetching}
            handleDragStart={handleDragStart}
            handleDragEnter={handleDragEnter}
            handleDragEnd={handleDragEnd}
          />
        ))}
    </>
  );
};

// ──────────────────────────────────────────────
// Main Component
// ──────────────────────────────────────────────
const AllCategory = () => {
  const [openEditModal, setOpenEditModal] = useState<any>(false);
  const [addItem, setAddItem] = useState(false);
  const [search, setSearch] = useState('');

  const debouncedSearch = useDebounce(search, 500);

  const [reorderCategory] = useReorderCategoryMutation();
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  // ✅ Drag handlers
  const handleDragStart = (index: number) => {
    dragItem.current = index;
  };

  const handleDragEnter = (index: number) => {
    dragOverItem.current = index;
  };

  const handleDragEnd = async () => {
    if (
      dragItem.current === null ||
      dragOverItem.current === null ||
      dragItem.current === dragOverItem.current
    )
      return;

    const reordered = [...categories];
    const dragged = reordered.splice(dragItem.current, 1)[0];
    reordered.splice(dragOverItem.current, 0, dragged);

    dragItem.current = null;
    dragOverItem.current = null;

    // ✅ Position update — index = position
    const items = reordered.map((cat: any, index: number) => ({
      id: cat.id,
      position: index,
    }));

    try {
      console.log('Reordering with payload:', items);
      await reorderCategory({ items }).unwrap();
      toast.success('Order updated!');
    } catch {
      toast.error('Failed to reorder');
    }
  };

  const {
    data: categoryData,
    error,
    isFetching,
    refetch,
  } = useGetCategoryTreeQuery({ search: debouncedSearch });

  const [deleteCategory, { isLoading: isDeleting }] = useDeleteCategoryMutation();

  // Tree data — root level categories (children nested inside)
  const categories: any[] = categoryData?.data || [];

  // Client-side search filter (preserves tree structure)
  const filterTree = (nodes: any[], query: string): any[] => {
    if (!query) return nodes;
    return nodes.reduce((acc: any[], node) => {
      const filteredChildren = filterTree(node.children || [], query);
      const matches = node.name.toLowerCase().includes(query.toLowerCase());
      if (matches || filteredChildren.length > 0) {
        acc.push({ ...node, children: filteredChildren });
      }
      return acc;
    }, []);
  };

  const filteredCategories = filterTree(categories, debouncedSearch);

  const handleDeleteCategory = async (category: any) => {
    try {
      await deleteCategory(category?.id).unwrap();
      toast.success('Category deleted successfully!');
      refetch();
    } catch (error: any) {
      if (error?.data?.message?.includes('products')) {
        toast.error('Cannot delete: category has associated products.');
      } else if (error?.status === 403) {
        toast.error("You don't have permission to delete categories.");
      } else {
        toast.error(error?.data?.message || 'Failed to delete category.');
      }
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Category List</h1>
          <p className="text-gray-600 mt-1">Manage your categories and hierarchy</p>
        </div>
        <button
          onClick={() => setAddItem(true)}
          className="btn bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
        >
          Add New Category
        </button>
      </div>

      <div className="table-container mt-8">
        {/* Search */}
        <div className="mb-4 relative max-w-sm">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
            disabled={isFetching}
          />
        </div>

        {error ? (
          <ErrorState
            message={(error as any)?.data?.message || 'Failed to fetch categories'}
            refetch={refetch}
          />
        ) : filteredCategories.length === 0 && !isFetching ? (
          <EmptyState message="No categories found" actionText="Add Your First Category" />
        ) : (
          <div className="table-section w-full overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr className="table-row">
                  <th className="w-12">#</th>
                  <th className="w-16">IMAGE</th>
                  <th>NAME</th>
                  <th className="w-28">Position</th>
                  <th className="w-28">STATUS</th>
                  <th className="w-24 text-center">ACTION</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {filteredCategories.map((category: any, index: number) => (
                  <CategoryRow
                    key={category.id}
                    category={category}
                    depth={0}
                    index={index + 1}
                    onEdit={setOpenEditModal}
                    onDelete={handleDeleteCategory}
                    isDeleting={isDeleting}
                    isFetching={isFetching}
                    handleDragStart={handleDragStart}
                    handleDragEnter={handleDragEnter}
                    handleDragEnd={handleDragEnd}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <CommonModal isOpen={addItem} onClose={() => setAddItem(false)} title="Add New Category">
        <AddCategory onClose={() => setAddItem(false)} />
      </CommonModal>

      <CommonModal
        isOpen={!!openEditModal}
        onClose={() => setOpenEditModal(false)}
        title="Update Category"
      >
        <EditCategory category={openEditModal} onClose={() => setOpenEditModal(false)} />
      </CommonModal>
    </div>
  );
};

export default AllCategory;
