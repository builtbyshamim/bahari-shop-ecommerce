import { useState } from 'react';
import { FiKey, FiEdit2, FiPlus, FiCheck, FiX } from 'react-icons/fi';
import CommonModal from '../../../components/ui/modal/CommonModal';
import { useGetAllCourierTokensQuery } from './CourierServiceTokenApi';
import CourierTokenForm from './CourierTokenForm';

const COURIER_SERVICES = [
  { id: 1, name: 'Pathao' },
  { id: 2, name: 'Steadfast Courier' },
  { id: 3, name: 'RedX Courier' },
];

const AllCourierServiceTokens = () => {
  const [openModal, setOpenModal] = useState<{
    courierServiceId: number;
    courierServiceName: string;
    existingToken?: any;
  } | null>(null);

  const { data, isFetching, refetch } = useGetAllCourierTokensQuery(undefined);

  const tokens: any[] = data?.data || [];

  const getTokenByCourierId = (courierId: number) =>
    tokens.find(
      (t: any) => t.courier_service_id === courierId || t.courier_service?.id === courierId,
    );

  const handleOpenModal = (service: { id: number; name: string }) => {
    const existing = getTokenByCourierId(service.id);
    setOpenModal({
      courierServiceId: service.id,
      courierServiceName: service.name,
      existingToken: existing || null,
    });
  };

  const maskToken = (token?: string) => {
    if (!token) return '—';
    if (token.length <= 8) return '••••••••';
    return token.slice(0, 4) + '••••••••' + token.slice(-4);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Courier Service Tokens</h1>
          <p className="text-gray-600 mt-1">Manage API credentials for courier integrations</p>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          {
            label: 'Total Services',
            value: COURIER_SERVICES.length,
            icon: FiKey,
            color: 'border-blue-200 text-blue-600',
          },
          {
            label: 'Connected',
            value: tokens.length,
            icon: FiCheck,
            color: 'border-green-200 text-green-600',
          },
          {
            label: 'Not Connected',
            value: COURIER_SERVICES.length - tokens.length,
            icon: FiX,
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

      {/* Table */}
      <div className="table-container mt-6">
        {isFetching ? (
          <div className="flex items-center justify-center py-12 text-gray-400">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500 mr-3" />
            Loading...
          </div>
        ) : (
          <div className="max-w-full overflow-x-auto">
            <div className="table-section w-full">
              <table className="table w-full">
                <thead>
                  <tr className="table-row">
                    <th>#</th>
                    <th>COURIER SERVICE</th>
                    <th>API KEY</th>
                    <th>SECRET KEY</th>
                    <th>USERNAME</th>
                    <th>SERVER TOKEN</th>
                    <th>STATUS</th>
                    <th className="text-center!">ACTION</th>
                  </tr>
                </thead>
                <tbody className="table-body">
                  {COURIER_SERVICES.map((service, index) => {
                    const token = getTokenByCourierId(service.id);
                    const isConnected = !!token;

                    return (
                      <tr key={service.id}>
                        <td>{index + 1}</td>

                        {/* Courier Name */}
                        <td>
                          <p className="font-medium text-gray-800">{service.name}</p>
                        </td>

                        {/* API Key */}
                        <td className="font-mono text-xs text-gray-500">
                          {maskToken(token?.api_key)}
                        </td>

                        {/* Secret Key */}
                        <td className="font-mono text-xs text-gray-500">
                          {maskToken(token?.secret_key)}
                        </td>

                        {/* Username */}
                        <td className="text-sm text-gray-500">{token?.username || '—'}</td>

                        {/* Server Token */}
                        <td className="font-mono text-xs text-gray-500 max-w-[160px] truncate">
                          {maskToken(token?.server_generation_token)}
                        </td>

                        {/* Status */}
                        <td>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              isConnected
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {isConnected ? 'Connected' : 'Not Connected'}
                          </span>
                        </td>

                        {/* Action */}
                        <td>
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleOpenModal(service)}
                              className="p-1.5 rounded-md hover:bg-gray-100 text-primary-500 transition-colors"
                              title={isConnected ? 'Edit Token' : 'Add Token'}
                            >
                              {isConnected ? (
                                <FiEdit2 className="w-4 h-4" />
                              ) : (
                                <FiPlus className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      <CommonModal
        isOpen={!!openModal}
        onClose={() => setOpenModal(null)}
        title={
          openModal?.existingToken
            ? `Edit ${openModal.courierServiceName} Token`
            : `Add ${openModal?.courierServiceName} Token`
        }
      >
        {openModal && (
          <CourierTokenForm
            courierServiceId={openModal.courierServiceId}
            courierServiceName={openModal.courierServiceName}
            existingToken={openModal.existingToken}
            onClose={() => {
              setOpenModal(null);
              refetch();
            }}
          />
        )}
      </CommonModal>
    </div>
  );
};

export default AllCourierServiceTokens;
