import { useState } from 'react';
import toast from 'react-hot-toast';
import moment from 'moment';
import {
  useGetAllTemplatesQuery,
  useDeleteTemplateMutation,
} from '../messagingApi';
import DeleteAction from '../../../components/ui/actions/DeleteIcon';
import EditWithActionIcon from '../../../components/ui/actions/EditWithActionIcon';
import { EmptyState } from '../../../components/ui/status/EmptyState';
import { ErrorState } from '../../../components/ui/status/ErrorState';
import CommonModal from '../../../components/ui/modal/CommonModal';
import AddTemplate from './AddTemplate';
import EditTemplate from './EditTemplate';

const CHANNEL_BADGE: Record<string, string> = {
  email: 'bg-blue-100 text-blue-700',
  sms: 'bg-green-100 text-green-700',
  both: 'bg-purple-100 text-purple-700',
};

const AllTemplates = () => {
  const [addOpen, setAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);

  const { data, error, isFetching, refetch } = useGetAllTemplatesQuery(undefined);
  const [deleteTemplate, { isLoading: isDeleting }] = useDeleteTemplateMutation();

  const templates: any[] = data?.data || data || [];

  const handleDelete = async (item: any) => {
    try {
      const res = await deleteTemplate(item.id).unwrap();
      toast.success(res?.message || 'Template deleted!');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Delete failed');
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Message Templates</h1>
          <p className="text-gray-500 mt-1">Create reusable Email & SMS templates</p>
        </div>
        <button
          onClick={() => setAddOpen(true)}
          className="btn bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-400 transition"
        >
          Add Template
        </button>
      </div>

      <div className="table-container mt-8">
        {error ? (
          <ErrorState message={(error as any)?.data?.message || 'Failed to fetch templates'} refetch={refetch} />
        ) : templates.length === 0 && !isFetching ? (
          <EmptyState message="No templates yet" actionText="Create First Template" />
        ) : (
          <div className="max-w-full overflow-x-auto mt-4">
            <table className="table w-full">
              <thead>
                <tr className="table-row">
                  <th>#</th>
                  <th>NAME</th>
                  <th>CHANNEL</th>
                  <th>SUBJECT</th>
                  <th>STATUS</th>
                  <th>CREATED</th>
                  <th className="text-center!">ACTION</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {templates.map((t: any, i: number) => (
                  <tr key={t.id}>
                    <td>{i + 1}</td>
                    <td className="font-medium text-gray-800">{t.name}</td>
                    <td>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${CHANNEL_BADGE[t.channel] ?? 'bg-gray-100 text-gray-600'}`}>
                        {t.channel}
                      </span>
                    </td>
                    <td className="text-gray-500 text-sm truncate max-w-[160px]">
                      {t.subject || <span className="text-gray-300">—</span>}
                    </td>
                    <td>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${t.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {t.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="text-gray-500 text-sm">{moment(t.createdAt).format('DD MMM YYYY')}</td>
                    <td>
                      <div className="flex items-center justify-center gap-2">
                        <EditWithActionIcon item={t} onClick={setEditItem} disabled={isDeleting} />
                        <DeleteAction handleDelete={() => handleDelete(t)} item={t} disabled={isDeleting} itemName={t.name} tooltip="Delete template" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <CommonModal isOpen={addOpen} onClose={() => setAddOpen(false)} title="Add Template">
        <AddTemplate onClose={() => setAddOpen(false)} />
      </CommonModal>

      <CommonModal isOpen={!!editItem} onClose={() => setEditItem(null)} title="Edit Template">
        <EditTemplate template={editItem} onClose={() => setEditItem(null)} />
      </CommonModal>
    </div>
  );
};

export default AllTemplates;
