'use client';

import { useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Address, CreateAddressDto } from '@/redux/api/addressApi,';

// ─── Zod Schema ───────────────────────────────────────────────────────────────

const addressSchema = z.object({
  fullName: z
    .string()
    .min(1, 'Name is required')
    .min(3, 'Name must be at least 3 characters')
    .max(60, 'Name is too long'),

  phone: z
    .string()
    .min(1, 'Phone is required')
    .regex(/^01[3-9]\d{8}$/, 'Please enter a valid BD number (e.g. 01XXXXXXXXX)'),

  email: z.string().email('Please enter a valid email').optional().or(z.literal('')),

  fullAddress: z
    .string()
    .min(1, 'Address is required')
    .min(10, 'Address is too short, please add more details'),

  isDefault: z.boolean().optional(),
});

type AddressFormValues = z.infer<typeof addressSchema>;

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (dto: CreateAddressDto) => void;
  loading: boolean;
  initial?: Address | null;
}

// ─── Small helper: error message row ─────────────────────────────────────────

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
      <span className="inline-block w-1 h-1 rounded-full bg-red-400 flex-shrink-0" />
      {message}
    </p>
  );
}

// ─── Input className helper ───────────────────────────────────────────────────

function inputCls(isDirty: boolean, hasError: boolean) {
  if (hasError && isDirty) return 'border-red-300 bg-red-50 focus:border-red-400';
  if (isDirty && !hasError) return 'border-green-300 bg-green-50/40 focus:border-green-400';
  return 'border-black-200 bg-white focus:border-primary-400';
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AddressModal({ open, onClose, onSubmit, loading, initial }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, dirtyFields },
  } = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    mode: 'onChange', // validate on every keystroke → real-time
    reValidateMode: 'onChange',
    defaultValues: {
      fullName: '',
      phone: '',
      email: '',
      fullAddress: '',
      isDefault: false,
    },
  });

  const isDefault = watch('isDefault');

  // Populate form when opening in edit mode, clear when opening in add mode
  useEffect(() => {
    if (!open) return;
    reset(
      initial
        ? {
            fullName: initial.fullName,
            phone: initial.phone,
            email: initial.email ?? '',
            fullAddress: initial.fullAddress,
            isDefault: initial.isDefault,
          }
        : { fullName: '', phone: '', email: '', fullAddress: '', isDefault: false },
    );
  }, [open, initial, reset]);

  const onValidSubmit = (data: AddressFormValues) => {
    onSubmit(data as CreateAddressDto);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl p-6 z-10 animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-black-800">
            {initial ? 'Edit Address' : 'Add New Address'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl border border-black-200 flex items-center justify-center text-black-400 hover:border-black-300 transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* ── Form ── */}
        <form onSubmit={handleSubmit(onValidSubmit)} noValidate>
          <div className="flex flex-col gap-3">
            {/* Full Name */}
            <div>
              <label className="text-xs font-semibold text-black-600 mb-1 block">
                Full Name <span className="text-red-400">*</span>
              </label>
              <input
                {...register('fullName')}
                placeholder="e.g. Rahim Uddin"
                className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-black-800 placeholder:text-black-300 outline-none transition-colors
                  ${inputCls(!!dirtyFields.fullName, !!errors.fullName)}`}
              />
              <FieldError message={errors.fullName?.message} />
            </div>

            {/* Phone */}
            <div>
              <label className="text-xs font-semibold text-black-600 mb-1 block">
                Phone <span className="text-red-400">*</span>
              </label>
              <input
                {...register('phone')}
                placeholder="01XXXXXXXXX"
                maxLength={11}
                className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-black-800 placeholder:text-black-300 outline-none transition-colors
                  ${inputCls(!!dirtyFields.phone, !!errors.phone)}`}
              />
              <FieldError message={errors.phone?.message} />
            </div>

            {/* Email (optional) */}
            <div>
              <label className="text-xs font-semibold text-black-600 mb-1 block">Email</label>
              <input
                {...register('email', { required: true })}
                type="email"
                placeholder="you@example.com"
                className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-black-800 placeholder:text-black-300 outline-none transition-colors
                  ${inputCls(!!dirtyFields.email, !!errors.email)}`}
              />
              <FieldError message={errors.email?.message} />
            </div>

            {/* Full Address */}
            <div>
              <label className="text-xs font-semibold text-black-600 mb-1 block">
                Full Address <span className="text-red-400">*</span>
              </label>
              <textarea
                {...register('fullAddress')}
                rows={3}
                placeholder="House, Road, Block, Area, District..."
                className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-black-800 placeholder:text-black-300 outline-none resize-none transition-colors
                  ${inputCls(!!dirtyFields.fullAddress, !!errors.fullAddress)}`}
              />
              <FieldError message={errors.fullAddress?.message} />
            </div>

            {/* Default toggle */}
            <div
              className="flex items-center gap-2.5 cursor-pointer select-none"
              onClick={() => setValue('isDefault', !isDefault, { shouldDirty: true })}
            >
              <div
                className={`w-10 h-5 rounded-full transition-colors flex-shrink-0 relative ${
                  isDefault ? 'bg-primary-500' : 'bg-black-200'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                    isDefault ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </div>
              <span className="text-xs font-semibold text-black-600">Set as default address</span>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-2 mt-5">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-black-200 text-sm font-bold text-black-500 hover:bg-black-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-primary-500 text-sm font-bold text-white hover:bg-primary-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              {initial ? 'Save Changes' : 'Add Address'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
