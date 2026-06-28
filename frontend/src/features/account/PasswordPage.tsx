'use client';

import { Lock, Eye, EyeOff, CheckCircle2, X, ShieldCheck, Loader2 } from 'lucide-react';
import AccountLayout from './AccountLayout';
import { useChangePasswordMutation } from '@/redux/api/userApi';
import { useForm } from 'react-hook-form';
import { useState } from 'react';

type FormValues = {
  current: string;
  next: string;
  confirm: string;
};

export default function PasswordPage() {
  const [changePassword, { isLoading }] = useChangePasswordMutation();
  const [show, setShow] = useState({ current: false, next: false, confirm: false });
  const [saved, setSaved] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>();

  const toggle = (k: keyof typeof show) => setShow((p) => ({ ...p, [k]: !p[k] }));

  const nextVal = watch('next') || '';
  const strength = !nextVal ? 0 : nextVal.length < 6 ? 1 : nextVal.length < 10 ? 2 : 3;
  const strengthLabel = ['', 'Weak', 'Fair', 'Strong'];
  const strengthColor = ['', 'bg-red-400', 'bg-amber-400', 'bg-green-500'];
  const strengthText = ['', 'text-red-500', 'text-amber-500', 'text-green-600'];

  const onSubmit = async (values: FormValues) => {
    try {
      await changePassword({
        currentPassword: values.current,
        newPassword: values.next,
      }).unwrap();
      setSaved(true);
      reset();
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      // show error via react-hook-form setError
    }
  };

  const fields: {
    key: keyof FormValues;
    label: string;
    placeholder: string;
    validation: object;
  }[] = [
    {
      key: 'current',
      label: 'Current Password',
      placeholder: 'Enter your current password',
      validation: { required: 'Current password is required' },
    },
    {
      key: 'next',
      label: 'New Password',
      placeholder: 'Min. 6 characters',
      validation: {
        required: 'New password is required',
        minLength: { value: 6, message: 'Password must be at least 6 characters' },
      },
    },
    {
      key: 'confirm',
      label: 'Confirm New Password',
      placeholder: 'Re-enter new password',
      validation: {
        required: 'Please confirm your password',
        validate: (val: string) => val === watch('next') || 'Passwords do not match',
      },
    },
  ];

  return (
    <AccountLayout activeTab="password">
      <div className="max-w-md w-full flex flex-col gap-4">
        {/* Info card */}
        <div className="bg-primary-50 border border-primary-200 rounded-2xl px-4 py-3.5 flex items-start gap-3">
          <ShieldCheck size={18} className="text-primary-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-primary-700 leading-relaxed">
            Use a strong password with at least 8 characters, including numbers and symbols.
          </p>
        </div>

        {/* Form card */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white rounded-2xl border border-black-200 p-5 flex flex-col gap-4"
        >
          {fields.map(({ key, label, placeholder, validation }) => (
            <div key={key} className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-black-500 uppercase tracking-wide">
                {label}
              </label>
              <div className="relative">
                <Lock
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-black-400"
                />
                <input
                  type={show[key] ? 'text' : 'password'}
                  placeholder={placeholder}
                  {...register(key, validation)}
                  className={`w-full pl-9 pr-10 py-2.5 text-sm rounded-xl border outline-none transition-all text-black-800
                    ${
                      errors[key]
                        ? 'border-red-300 focus:ring-2 focus:ring-red-100'
                        : 'border-black-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100'
                    }`}
                />
                <button
                  type="button"
                  onClick={() => toggle(key)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-black-400 hover:text-black-600 transition-colors"
                >
                  {show[key] ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>

              {/* Validation error */}
              {errors[key] && (
                <p className="text-[11px] text-red-500 font-semibold flex items-center gap-1">
                  <X size={11} /> {errors[key]?.message}
                </p>
              )}

              {/* Strength bar — only for "next" */}
              {key === 'next' && nextVal && (
                <div className="flex flex-col gap-1.5 mt-1">
                  <div className="flex gap-1">
                    {[1, 2, 3].map((s) => (
                      <div
                        key={s}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          s <= strength ? strengthColor[strength] : 'bg-black-200'
                        }`}
                      />
                    ))}
                  </div>
                  <p className={`text-[11px] font-semibold ${strengthText[strength]}`}>
                    {strengthLabel[strength]} password
                  </p>
                </div>
              )}
            </div>
          ))}

          {/* API error */}
          {/* Success */}
          {saved && (
            <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-xl px-3 py-2.5 text-xs font-semibold">
              <CheckCircle2 size={13} /> Password changed successfully!
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-primary-500 hover:bg-primary-600 active:scale-[.98] disabled:opacity-60 text-white text-sm font-bold rounded-xl transition-all mt-1 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 size={15} className="animate-spin" /> Updating...
              </>
            ) : (
              'Update Password'
            )}
          </button>
        </form>
      </div>
    </AccountLayout>
  );
}
