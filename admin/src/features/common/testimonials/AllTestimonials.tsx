import { useState } from 'react';
import toast from 'react-hot-toast';
import { FaStar } from 'react-icons/fa';
import { useGetAllTestimonialsQuery, useDeleteTestimonialMutation } from './testimonialsApi';
import DeleteAction from '../../../components/ui/actions/DeleteIcon';
import EditWithActionIcon from '../../../components/ui/actions/EditWithActionIcon';
import StatusBadge from '../../../components/ui/status/StatusBadge';
import CommonModal from '../../../components/ui/modal/CommonModal';
import { ErrorState } from '../../../components/ui/status/ErrorState';
import { EmptyState } from '../../../components/ui/status/EmptyState';
import AddTestimonial from './AddTestimonial';
import EditTestimonial from './EditTestimonial';

const GRADIENTS = [
  'from-orange-500 to-red-500',
  'from-violet-500 to-purple-600',
  'from-blue-500 to-cyan-500',
  'from-pink-500 to-rose-500',
  'from-emerald-500 to-teal-500',
  'from-amber-500 to-orange-500',
  'from-indigo-500 to-blue-600',
  'from-teal-500 to-cyan-500',
  'from-red-500 to-orange-600',
  'from-sky-500 to-blue-500',
  'from-fuchsia-500 to-pink-600',
  'from-lime-500 to-green-500',
];

const StarRating = ({ count }: { count: number }) => (
  <div className="flex items-center gap-0.5">
    {Array.from({ length: 5 }).map((_, i) => (
      <FaStar key={i} size={11} className={i < count ? 'text-amber-400' : 'text-gray-200'} />
    ))}
  </div>
);

const AllTestimonials = () => {
  const [addItem, setAddItem] = useState(false);
  const [openEditModal, setOpenEditModal] = useState<any>(false);

  const { data, error, isFetching, refetch } = useGetAllTestimonialsQuery(undefined);
  const [deleteTestimonial, { isLoading: isDeleting }] = useDeleteTestimonialMutation();

  const testimonials: any[] = data?.data || [];

  const handleDelete = async (item: any) => {
    try {
      const result = await deleteTestimonial(item.id).unwrap();
      if (result?.success !== false) {
        toast.success(result?.message || 'Deleted!');
      } else {
        toast.error(result?.message || 'Delete failed');
      }
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to delete.');
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Testimonials</h1>
          <p className="text-gray-600 mt-1">Manage customer reviews shown on the homepage</p>
        </div>
        <button
          onClick={() => setAddItem(true)}
          className="btn bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-400 transition-colors"
        >
          Add Testimonial
        </button>
      </div>

      <div className="table-container mt-8">
        {error ? (
          <ErrorState message={(error as any)?.data?.message || 'Failed to fetch'} refetch={refetch} />
        ) : (
          <div className="max-w-full overflow-x-auto mt-4">
            {testimonials.length === 0 && !isFetching ? (
              <EmptyState message="No testimonials yet" actionText="Add Your First Testimonial" />
            ) : (
              <div className="table-section w-full">
                <table className="table w-full">
                  <thead>
                    <tr className="table-row">
                      <th>#</th>
                      <th>CUSTOMER</th>
                      <th>RATING</th>
                      <th>REVIEW</th>
                      <th>PRODUCT</th>
                      <th>ORDER</th>
                      <th>STATUS</th>
                      <th className="text-center!">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="table-body">
                    {testimonials.map((t: any, index: number) => {
                      const gradient = GRADIENTS[t.colorIndex % GRADIENTS.length];
                      return (
                        <tr key={t.id}>
                          <td>{index + 1}</td>
                          <td>
                            <div className="flex items-center gap-2">
                              <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-xs font-bold shrink-0 overflow-hidden`}>
                                {t.avatarUrl ? (
                                  <img src={t.avatarUrl} alt={t.name} className="w-full h-full object-cover" />
                                ) : (
                                  t.avatarInitials
                                )}
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-gray-800">{t.name}</p>
                                {t.location && <p className="text-xs text-gray-400">{t.location}</p>}
                              </div>
                            </div>
                          </td>
                          <td><StarRating count={t.rating} /></td>
                          <td className="max-w-[200px]">
                            <p className="text-xs text-gray-600 line-clamp-2">{t.review}</p>
                          </td>
                          <td>
                            {t.productLabel ? (
                              <span className="text-xs bg-orange-50 text-orange-600 border border-orange-100 rounded-full px-2 py-0.5">
                                {t.productLabel}
                              </span>
                            ) : <span className="text-gray-400">—</span>}
                          </td>
                          <td className="text-gray-600 text-sm">{t.sortOrder}</td>
                          <td><StatusBadge isActive={t.isActive} /></td>
                          <td>
                            <div className="flex items-center justify-center gap-2">
                              <EditWithActionIcon item={t} onClick={setOpenEditModal} disabled={isDeleting || isFetching} />
                              <DeleteAction handleDelete={() => handleDelete(t)} item={t} disabled={isDeleting} itemName={t.name} tooltip="Delete testimonial" />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      <CommonModal isOpen={addItem} onClose={() => setAddItem(false)} title="Add Testimonial">
        <AddTestimonial onClose={() => setAddItem(false)} />
      </CommonModal>

      <CommonModal isOpen={!!openEditModal} onClose={() => setOpenEditModal(false)} title="Edit Testimonial">
        <EditTestimonial testimonial={openEditModal} onClose={() => setOpenEditModal(false)} />
      </CommonModal>
    </div>
  );
};

export default AllTestimonials;
