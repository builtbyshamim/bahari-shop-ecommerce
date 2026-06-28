import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FiTruck, FiCheck, FiChevronDown } from 'react-icons/fi';
import { useGetAllCourierTokensQuery } from '../../courier-service/courier-service-tokens/CourierServiceTokenApi';
import { useAssignPathaoMutation, useAssignSteadfastMutation } from '../courierAssignApi';
import { useGetAllPathaoStoresQuery } from '../../courier-service/pathao-stores/PathaoStoreApi';

// courier_service_id → name map (seeded in backend)
const COURIER_MAP: Record<number, string> = {
  1: 'Pathao',
  2: 'Steadfast',
  3: 'RedX',
};

interface Props {
  order: any; // full order object from OrderDetails
}

const AssignCourierSection = ({ order }: Props) => {
  const isAlreadyAssigned = !!order.consignment_id;

  const { data: tokenData } = useGetAllCourierTokensQuery(undefined);
  const tokens: any[] = tokenData?.data || [];

  // only tokens that are active (status=1)
  const activeTokens = tokens.filter((t: any) => t.status === 1);

  const [selectedCourierId, setSelectedCourierId] = useState<number | null>(null);

  const [assignSteadfast, { isLoading: loadingSteadfast }] = useAssignSteadfastMutation();
  const [assignPathao, { isLoading: loadingPathao }] = useAssignPathaoMutation();

  const isLoading = loadingSteadfast || loadingPathao;

  const address = order.address;

  // ── Pathao stores ─────────────────────────────────────────────
  const { data: storeData, isFetching: storesFetching } = useGetAllPathaoStoresQuery(
    { limit: 20, page: 1, search: '' },
    { skip: selectedCourierId !== 1 }, // only fetch when Pathao is selected
  );
  const pathaoStores: any[] = storeData?.data?.data?.data || [];
  const activePathaoStores = pathaoStores.filter((s: any) => s.is_active);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      recipient_name: '',
      recipient_phone: '',
      recipient_address: '',
      recipient_email: '',
      cod_amount: '',
      note: '',
      item_description: '',
      // Steadfast specific
      alternative_phone: '',
      total_lot: 1,
      delivery_type: 0,
      // Pathao specific
      store_id: '',
      item_weight: 0.5,
      item_quantity: 1,
      special_instruction: '',
    },
  });

  // Pre-fill from order.address when order loads
  useEffect(() => {
    if (address) {
      setValue('recipient_name', address.fullName || order.customer?.name || '');
      setValue('recipient_phone', address.phone || order.customer?.phone || '');
      setValue('recipient_address', address.fullAddress || order.customer?.address || '');
      setValue('recipient_email', address.email || order.customer?.email || '');
    }
    setValue('cod_amount', String(order.totalPrice || ''));
  }, [order, address]);

  // Auto-select first active store when stores load
  useEffect(() => {
    if (activePathaoStores.length > 0) {
      setValue('store_id', String(activePathaoStores[0].store_id));
    }
  }, [activePathaoStores.length]);

  const onSubmit = async (data: any) => {
    if (!selectedCourierId) {
      toast.error('Please select a courier service');
      return;
    }

    const selectedToken = activeTokens.find(
      (t: any) =>
        t.courier_service_id === selectedCourierId || t.courier_service?.id === selectedCourierId,
    );

    if (!selectedToken) {
      toast.error('No active token found for this courier. Please add API credentials first.');
      return;
    }

    const basePayload = {
      order_id: order.id,
      courier_service_token_id: selectedToken.id,
      recipient_name: data.recipient_name,
      recipient_phone: data.recipient_phone,
      recipient_address: data.recipient_address,
      recipient_email: data.recipient_email || undefined,
      cod_amount: Number(data.cod_amount),
      note: data.note || undefined,
      item_description: data.item_description || undefined,
    };

    try {
      if (selectedCourierId === 2) {
        // Steadfast
        const result = await assignSteadfast({
          ...basePayload,
          alternative_phone: data.alternative_phone || undefined,
          total_lot: Number(data.total_lot) || 1,
          delivery_type: Number(data.delivery_type) || 0,
        }).unwrap();

        if (result?.success) {
          toast.success('Order assigned to Steadfast!');
          reset();
        }
      } else if (selectedCourierId === 1) {
        // Pathao
        const result = await assignPathao({
          ...basePayload,
          store_id: Number(data.store_id),
          item_weight: Number(data.item_weight) || 0.5,
          item_quantity: Number(data.item_quantity) || 1,
          special_instruction: data.special_instruction || undefined,
        }).unwrap();

        if (result?.success) {
          toast.success('Order assigned to Pathao!');
          reset();
        }
      } else {
        toast.error('This courier integration is not available yet.');
      }
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Failed to assign courier');
    }
  };

  // ── Already assigned state ────────────────────────────────────
  if (isAlreadyAssigned) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
          Courier Assignment
        </h3>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-green-600">
            <FiCheck className="w-4 h-4" />
            <span className="text-sm font-semibold">
              Assigned to {COURIER_MAP[order.courier_service_id] ?? 'Courier'}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1 mt-2 text-sm">
            {order.consignment_id && (
              <>
                <span className="text-gray-500">Consignment ID</span>
                <span className="font-mono font-medium text-gray-800">{order.consignment_id}</span>
              </>
            )}
            {order.tracking_code && (
              <>
                <span className="text-gray-500">Tracking Code</span>
                <span className="font-mono font-medium text-gray-800">{order.tracking_code}</span>
              </>
            )}
            {order.courier_order_status && (
              <>
                <span className="text-gray-500">Courier Status</span>
                <span className="capitalize font-medium text-gray-800">
                  {order.courier_order_status}
                </span>
              </>
            )}
            {order.delivery_fee != null && (
              <>
                <span className="text-gray-500">Delivery Fee</span>
                <span className="font-medium text-gray-800">
                  ৳{Number(order.delivery_fee).toFixed(2)}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Assign form ───────────────────────────────────────────────
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4 flex items-center gap-2">
        <FiTruck className="w-4 h-4" />
        Assign Courier
      </h3>

      {/* Courier selector — only show couriers that have an active token */}
      <div className="flex gap-3 mb-5 flex-wrap">
        {activeTokens.length === 0 ? (
          <p className="text-sm text-gray-400">
            No active courier tokens found. Please add API credentials in Courier Settings.
          </p>
        ) : (
          activeTokens.map((token: any) => {
            const courierId: number = token.courier_service_id ?? token.courier_service?.id;
            const courierName = COURIER_MAP[courierId] ?? `Courier ${courierId}`;
            const isSelected = selectedCourierId === courierId;

            return (
              <button
                key={token.id}
                type="button"
                onClick={() => setSelectedCourierId(courierId)}
                className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                  isSelected
                    ? 'bg-primary-500 text-white border-primary-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-primary-400'
                }`}
              >
                {courierName}
              </button>
            );
          })
        )}
      </div>

      {selectedCourierId && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Recipient info */}
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
            Recipient Info
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Recipient Name *</label>
              <input
                {...register('recipient_name', { required: true })}
                className="search-input w-full"
                placeholder="Full name"
              />
              {errors.recipient_name && <p className="text-xs text-red-500 mt-0.5">Required</p>}
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Phone *</label>
              <input
                {...register('recipient_phone', { required: true })}
                className="search-input w-full"
                placeholder="01XXXXXXXXX"
              />
              {errors.recipient_phone && <p className="text-xs text-red-500 mt-0.5">Required</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Address *</label>
            <input
              {...register('recipient_address', { required: true })}
              className="search-input w-full"
              placeholder="Full address"
            />
            {errors.recipient_address && <p className="text-xs text-red-500 mt-0.5">Required</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Email</label>
              <input
                {...register('recipient_email')}
                type="email"
                className="search-input w-full"
                placeholder="Optional"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">COD Amount *</label>
              <input
                {...register('cod_amount', { required: true })}
                type="number"
                className="search-input w-full"
                placeholder="Cash on delivery amount"
              />
            </div>
          </div>

          {/* Steadfast extras */}
          {selectedCourierId === 2 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Alternative Phone</label>
                <input
                  {...register('alternative_phone')}
                  className="search-input w-full"
                  placeholder="Optional"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Total Lot</label>
                <input
                  {...register('total_lot')}
                  type="number"
                  className="search-input w-full"
                  defaultValue={1}
                />
              </div>
            </div>
          )}

          {/* Pathao extras */}
          {selectedCourierId === 1 && (
            <>
              {/* ── Store Dropdown ── */}
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Pickup Store *
                  {storesFetching && (
                    <span className="ml-2 text-xs text-gray-400 font-normal">Loading stores…</span>
                  )}
                </label>

                {!storesFetching && activePathaoStores.length === 0 ? (
                  <p className="text-xs text-red-500">
                    No active Pathao stores found. Please add a store first.
                  </p>
                ) : (
                  <div className="relative">
                    <select
                      {...register('store_id', { required: selectedCourierId === 1 })}
                      className="search-input w-full appearance-none pr-8 cursor-pointer"
                      disabled={storesFetching}
                    >
                      <option value="">Select a store…</option>
                      {activePathaoStores.map((store: any) => (
                        <option key={store.id} value={store.store_id}>
                          {store.name}
                          {store.address ? ` — ${store.address}` : ''}{' '}
                          <span className="text-gray-400">(ID: {store.store_id})</span>
                        </option>
                      ))}
                    </select>
                    <FiChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  </div>
                )}

                {errors.store_id && (
                  <p className="text-xs text-red-500 mt-0.5">Please select a Pathao store</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Item Weight (kg)</label>
                  <input
                    {...register('item_weight')}
                    type="number"
                    step="0.1"
                    className="search-input w-full"
                    defaultValue={0.5}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Item Quantity</label>
                  <input
                    {...register('item_quantity')}
                    type="number"
                    className="search-input w-full"
                    defaultValue={1}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Special Instruction</label>
                  <input
                    {...register('special_instruction')}
                    className="search-input w-full"
                    placeholder="Optional"
                  />
                </div>
              </div>
            </>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Note</label>
              <input
                {...register('note')}
                className="search-input w-full"
                placeholder="Delivery note"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Item Description</label>
              <input
                {...register('item_description')}
                className="search-input w-full"
                placeholder="e.g. T-shirt, shoes"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2.5 bg-primary-500 text-white rounded-md hover:bg-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center cursor-pointer"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Assigning...
              </>
            ) : (
              <>
                <FiTruck className="mr-2" />
                Assign to {COURIER_MAP[selectedCourierId]}
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
};

export default AssignCourierSection;
