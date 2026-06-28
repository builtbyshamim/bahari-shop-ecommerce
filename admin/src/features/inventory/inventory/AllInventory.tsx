import { useState } from 'react';
import { FiSearch, FiPlus } from 'react-icons/fi';
import { useDebounce } from '../../../hooks/useDebounce';
import { useGetAllInventoryQuery } from './inventoryApi';
import { ErrorState } from '../../../components/ui/status/ErrorState';
import { EmptyState } from '../../../components/ui/status/EmptyState';
import CommonPagination from '../../../components/ui/pagination/CommonPagination';
import CommonModal from '../../../components/ui/modal/CommonModal';
import CreateInventory from './CreateInventory';
import StockInModal from './StockInModal';
import AdjustStockModal from './AdjustStockModal';
import MovementHistoryModal from './MovementHistoryModal';
import EditInventorySettingsModal from './EditInventorySettingsModal';

const AllInventory = () => {
  const [search, setSearch] = useState({ search: '', page: 1, limit: 10 });
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [modal, setModal] = useState<'create' | 'stockIn' | 'adjust' | 'history' | 'edit' | null>(
    null,
  );

  const debouncedSearch = useDebounce(search.search, 500);

  const { data, error, isFetching, refetch } = useGetAllInventoryQuery({
    ...search,
    search: debouncedSearch,
  });

  const inventories = data?.data?.data || [];
  const meta = data?.data?.meta || { totalItems: 0, totalPages: 1 };

  const openModal = (type: typeof modal, item?: any) => {
    setSelectedItem(item ?? null);
    setModal(type);
  };
  const closeModal = () => {
    setModal(null);
    setSelectedItem(null);
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Inventory</h1>
          <p className="text-gray-600 mt-1">Manage stock levels and movements</p>
        </div>
        <button
          onClick={() => openModal('create')}
          className="btn bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
        >
          <FiPlus className="inline mr-1" /> Add Inventory
        </button>
      </div>

      <div className="table-container mt-8">
        <div className="mb-4 relative max-w-sm">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by product name..."
            value={search.search}
            onChange={(e) => setSearch({ ...search, search: e.target.value, page: 1 })}
            className="search-input"
          />
        </div>

        {error ? (
          <ErrorState message="Failed to fetch inventory" refetch={refetch} />
        ) : inventories.length === 0 && !isFetching ? (
          <EmptyState message="No inventory found" actionText="Add First Inventory" />
        ) : (
          <div className="max-w-full overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr className="table-row">
                  <th>#</th>
                  <th>PRODUCT</th>
                  <th>VARIANT</th>
                  <th className="text-right!">ON HAND</th>
                  <th className="text-right!">RESERVED</th>
                  <th className="text-right!">AVAILABLE</th>
                  <th className="text-right!">AVG COST</th>
                  <th className="text-center!">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {inventories.map((inv: any, i: number) => (
                  <tr key={inv.id}>
                    <td>{(search.page - 1) * search.limit + i + 1}</td>
                    <td className="font-medium">{inv.product?.name ?? '—'}</td>
                    <td className="text-gray-500 text-sm">
                      {inv.variant
                        ? Object.values(inv.variant.option_values ?? {}).join(' / ')
                        : 'Simple'}
                    </td>
                    <td className="text-right font-mono">{inv.qty_on_hand}</td>
                    <td className="text-right font-mono text-orange-500">{inv.qty_reserved}</td>
                    <td
                      className={`text-right font-mono font-semibold ${inv.qty_available <= inv.low_stock_threshold ? 'text-red-500' : 'text-green-600'}`}
                    >
                      {inv.qty_available}
                      {inv.qty_available <= inv.low_stock_threshold && (
                        <span className="ml-1 text-xs bg-red-100 text-red-600 px-1 rounded">
                          Low
                        </span>
                      )}
                    </td>
                    <td className="text-right font-mono">
                      ৳{Number(inv.avg_cost_price).toFixed(2)}
                    </td>
                    <td>
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openModal('stockIn', inv)}
                          className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                        >
                          Stock In
                        </button>
                        <button
                          onClick={() => openModal('adjust', inv)}
                          className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                        >
                          Adjust
                        </button>
                        <button
                          onClick={() => openModal('history', inv)}
                          className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                        >
                          History
                        </button>
                        <button
                          onClick={() => openModal('edit', inv)}
                          className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
                        >
                          Settings
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {inventories.length > 0 && (
          <CommonPagination
            total={meta.totalItems}
            totalPage={meta.totalPages}
            setSearchValue={setSearch}
            searchValue={search}
            refetch={refetch}
            limit={search.limit}
            page={search.page}
            disabled={isFetching}
          />
        )}
      </div>

      <CommonModal isOpen={modal === 'create'} onClose={closeModal} title="Create Inventory">
        <CreateInventory onClose={closeModal} />
      </CommonModal>
      <CommonModal isOpen={modal === 'stockIn'} onClose={closeModal} title="Stock In">
        <StockInModal inventory={selectedItem} onClose={closeModal} />
      </CommonModal>
      <CommonModal isOpen={modal === 'adjust'} onClose={closeModal} title="Adjust Stock">
        <AdjustStockModal inventory={selectedItem} onClose={closeModal} />
      </CommonModal>
      <CommonModal isOpen={modal === 'history'} onClose={closeModal} title="Movement History">
        <MovementHistoryModal inventory={selectedItem} onClose={closeModal} />
      </CommonModal>
      <CommonModal isOpen={modal === 'edit'} onClose={closeModal} title="Inventory Settings">
        <EditInventorySettingsModal inventory={selectedItem} onClose={closeModal} />
      </CommonModal>
    </div>
  );
};

export default AllInventory;
