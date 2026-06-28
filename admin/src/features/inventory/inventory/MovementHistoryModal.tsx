import { useState } from 'react';
import { useGetInventoryMovementsQuery } from './inventoryApi';
import CommonPagination from '../../../components/ui/pagination/CommonPagination';

const movementLabel: Record<string, { label: string; color: string }> = {
  initial: { label: 'Opening', color: 'bg-purple-100 text-purple-700' },
  purchase_in: { label: 'Stock In', color: 'bg-green-100 text-green-700' },
  sale_out: { label: 'Sale', color: 'bg-blue-100 text-blue-700' },
  return_in: { label: 'Return', color: 'bg-yellow-100 text-yellow-700' },
  adjustment_in: { label: 'Adj +', color: 'bg-teal-100 text-teal-700' },
  adjustment_out: { label: 'Adj −', color: 'bg-orange-100 text-orange-700' },
  damage_out: { label: 'Damage', color: 'bg-red-100 text-red-700' },
};

const IN_TYPES = new Set(['initial', 'purchase_in', 'return_in', 'adjustment_in', 'transfer_in']);

const MovementHistoryModal = ({ inventory }: any) => {
  const [params, setParams] = useState({ page: 1, limit: 10 });

  const { data, isFetching } = useGetInventoryMovementsQuery(
    { id: inventory?.id, page: params.page, limit: params.limit },
    { skip: !inventory?.id },
  );

  const movements = data?.data?.data ?? [];
  const meta = data?.data?.meta;

  return (
    <div className="space-y-3">
      {/* Stock summary header */}
      <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
        <p>
          <span className="font-medium">Product:</span> {inventory?.product?.name}
        </p>
        <div className="flex gap-4 mt-1">
          <span>
            On Hand: <strong>{inventory?.qty_on_hand}</strong>
          </span>
          <span>
            Reserved: <strong className="text-orange-500">{inventory?.qty_reserved}</strong>
          </span>
          <span>
            Available: <strong className="text-green-600">{inventory?.qty_available}</strong>
          </span>
        </div>
      </div>

      {/* Movement list */}
      {isFetching ? (
        <div className="text-center py-8 text-gray-400">Loading...</div>
      ) : movements.length === 0 ? (
        <div className="text-center py-8 text-gray-400">No movements yet</div>
      ) : (
        <div className="space-y-2">
          {movements.map((m: any) => {
            const meta = movementLabel[m.movement_type] ?? {
              label: m.movement_type,
              color: 'bg-gray-100 text-gray-600',
            };
            const isIn = IN_TYPES.has(m.movement_type);
            return (
              <div
                key={m.id}
                className="flex items-center justify-between p-3 border border-gray-100 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${meta.color}`}>
                    {meta.label}
                  </span>
                  <div>
                    <p className="text-sm font-mono">
                      {m.qty_before} → {m.qty_after}
                    </p>
                    {m.note && <p className="text-xs text-gray-400">{m.note}</p>}
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`font-semibold font-mono ${isIn ? 'text-green-600' : 'text-red-500'}`}
                  >
                    {isIn ? '+' : '−'}
                    {m.quantity}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(m.created_at).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination — only shown when there is more than one page */}
      {meta && meta.totalPages > 1 && (
        <CommonPagination
          total={meta.totalItems}
          totalPage={meta.totalPages}
          page={params.page}
          limit={params.limit}
          setSearchValue={setParams}
        />
      )}
    </div>
  );
};

export default MovementHistoryModal;
