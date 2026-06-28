'use client';

import { useState } from 'react';
import { Phone, Edit3, Trash2, Plus, Loader2, AlertCircle } from 'lucide-react';
import AccountLayout from './AccountLayout';

import toast from 'react-hot-toast';
import {
  useGetAddressesQuery,
  useCreateAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
  useSetDefaultAddressMutation,
  Address,
  CreateAddressDto,
} from '@/redux/api/addressApi,';
import AddressModal from './Addressmodal';

// ─── Delete Confirm Modal ──────────────────────────────────────────────────────

function DeleteConfirm({
  open,
  onClose,
  onConfirm,
  loading,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl p-6 z-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
            <AlertCircle size={20} className="text-red-500" />
          </div>
          <h3 className="font-bold text-black-800">Delete Address?</h3>
        </div>
        <p className="text-sm text-black-500 mb-5">
          This address will be permanently deleted. This action cannot be undone.
        </p>
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-black-200 text-sm font-bold text-black-500 hover:bg-black-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-red-500 text-sm font-bold text-white hover:bg-red-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Address Card ─────────────────────────────────────────────────────────────

function AddressCard({
  addr,
  onEdit,
  onDelete,
  onSetDefault,
  isSettingDefault,
}: {
  addr: Address;
  onEdit: (a: Address) => void;
  onDelete: (a: Address) => void;
  onSetDefault: (id: string) => void;
  isSettingDefault: boolean;
}) {
  return (
    <div
      className={`bg-white rounded-2xl border p-4 transition-all ${
        addr.isDefault
          ? 'border-primary-300 shadow-sm shadow-primary-100/60'
          : 'border-black-200 hover:border-black-300'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Name + badge */}
        <div>
          <p className="text-sm font-bold text-black-800">{addr.fullName}</p>
          {addr.isDefault && (
            <span className="inline-block mt-0.5 text-[10px] font-bold text-primary-600 bg-primary-100 rounded-md px-2 py-0.5">
              Default
            </span>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 flex-shrink-0">
          {!addr.isDefault && (
            <button
              onClick={() => onSetDefault(addr.id)}
              disabled={isSettingDefault}
              className="text-[10px] font-bold text-primary-500 border border-primary-200 bg-primary-50 rounded-lg px-2.5 py-1.5 hover:bg-primary-100 transition-colors disabled:opacity-50"
            >
              {isSettingDefault ? <Loader2 size={11} className="animate-spin" /> : 'Set Default'}
            </button>
          )}
          <button
            onClick={() => onEdit(addr)}
            className="w-8 h-8 rounded-xl border border-black-200 flex items-center justify-center text-black-400 hover:border-primary-300 hover:text-primary-500 transition-all"
          >
            <Edit3 size={13} />
          </button>
          {!addr.isDefault && (
            <button
              onClick={() => onDelete(addr)}
              className="w-8 h-8 rounded-xl border border-black-200 flex items-center justify-center text-black-400 hover:border-red-200 hover:text-red-500 hover:bg-red-50 transition-all"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Contact + address details */}
      <div className="mt-3 flex flex-col gap-1">
        <p className="text-xs text-black-500 flex items-center gap-1.5">
          <Phone size={11} /> {addr.phone}
        </p>
        {addr.email && <p className="text-xs text-black-400">{addr.email}</p>}
        <p className="text-xs text-black-500 leading-relaxed">{addr.fullAddress}</p>
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function AddressSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-black-200 p-4 animate-pulse">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="h-4 w-28 bg-black-100 rounded mb-2" />
          <div className="h-3 w-14 bg-black-100 rounded" />
        </div>
        <div className="flex gap-2">
          <div className="w-16 h-8 rounded-lg bg-black-100" />
          <div className="w-8 h-8 rounded-xl bg-black-100" />
        </div>
      </div>
      <div className="mt-3 flex flex-col gap-2">
        <div className="h-3 w-32 bg-black-100 rounded" />
        <div className="h-3 w-64 bg-black-100 rounded" />
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AddressesPage() {
  // ── RTK Query hooks ──
  const { data: addressesData, isLoading } = useGetAddressesQuery();
  const addresses = (addressesData as any)?.data || [];

  const [createAddress, { isLoading: isCreating }] = useCreateAddressMutation();
  const [updateAddress, { isLoading: isUpdating }] = useUpdateAddressMutation();
  const [deleteAddress, { isLoading: isDeleting }] = useDeleteAddressMutation();
  const [setDefaultAddress, { isLoading: isSettingDefault }] = useSetDefaultAddressMutation();

  // ── local UI state ──
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Address | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Address | null>(null);

  // ── handlers ──────────────────────────────────────────────────────────────

  const handleAddOrUpdate = async (dto: CreateAddressDto) => {
    try {
      if (editTarget) {
        await updateAddress({ id: editTarget.id, body: dto }).unwrap();
        toast.success('Address updated!');
      } else {
        await createAddress(dto).unwrap();
        toast.success('Address added!');
      }
      setModalOpen(false);
      setEditTarget(null);
    } catch (err: any) {
      toast.error(err?.data?.message ?? 'Something went wrong');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteAddress(deleteTarget.id).unwrap();
      toast.success('Address deleted');
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error(err?.data?.message ?? 'Delete failed');
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await setDefaultAddress(id).unwrap();
      toast.success('Default address updated');
    } catch (err: any) {
      toast.error(err?.data?.message ?? 'Failed to update default');
    }
  };

  const openAdd = () => {
    setEditTarget(null);
    setModalOpen(true);
  };

  const openEdit = (addr: Address) => {
    setEditTarget(addr);
    setModalOpen(true);
  };

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <AccountLayout activeTab="addresses">
      <div className="flex flex-col gap-4 w-full">
        {/* Loading skeleton */}
        {isLoading && (
          <>
            <AddressSkeleton />
            <AddressSkeleton />
          </>
        )}

        {/* Address list */}
        {!isLoading &&
          addresses.map((addr: any) => (
            <AddressCard
              key={addr.id}
              addr={addr}
              onEdit={openEdit}
              onDelete={setDeleteTarget}
              onSetDefault={handleSetDefault}
              isSettingDefault={isSettingDefault}
            />
          ))}

        {/* Empty state */}
        {!isLoading && addresses.length === 0 && (
          <div className="text-center py-10 text-sm text-black-400">
            No addresses found. Add a new one below.
          </div>
        )}

        {/* Add new button */}
        <button
          onClick={openAdd}
          className="flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-dashed border-primary-300 bg-primary-50/50 text-sm font-bold text-primary-500 hover:bg-primary-100/50 hover:border-primary-400 transition-all active:scale-[.98]"
        >
          <Plus size={16} /> Add New Address
        </button>
      </div>

      {/* Add / Edit Modal */}
      <AddressModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditTarget(null);
        }}
        onSubmit={handleAddOrUpdate}
        loading={editTarget ? isUpdating : isCreating}
        initial={editTarget}
      />

      {/* Delete Confirm */}
      <DeleteConfirm
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={isDeleting}
      />
    </AccountLayout>
  );
}
