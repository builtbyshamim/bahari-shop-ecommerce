'use client';

import { useState, useEffect } from 'react';
import {
  User,
  Phone,
  Mail,
  Calendar,
  Edit3,
  Check,
  CheckCircle2,
  Camera,
  Loader2,
} from 'lucide-react';
import AccountLayout from './AccountLayout';
import { useGetProfileQuery, useUpdateProfileMutation } from '@/redux/api/userApi';
import Image from 'next/image';

const FieldInput = ({
  label,
  value,
  onChange,
  type = 'text',
  icon: Icon,
  disabled,
  placeholder,
}: any) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[11px] font-semibold text-black-500 uppercase tracking-wide">
      {label}
    </label>
    <div className="relative">
      {Icon && (
        <Icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-black-400" />
      )}
      <input
        type={type}
        value={value || ''}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full ${Icon ? 'pl-9' : 'pl-3.5'} pr-4 py-2.5 text-sm rounded-xl border outline-none transition-all
          ${
            disabled
              ? 'border-black-200 bg-black-100/60 text-black-600 cursor-default'
              : 'border-primary-300 bg-white focus:ring-2 focus:ring-primary-100 text-black-800'
          }`}
      />
    </div>
  </div>
);

export default function ProfilePage() {
  const { data, isLoading, isError } = useGetProfileQuery('');
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();

  const userdata = data?.data;

  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
  });

  // ✅ API থেকে data আসলে form populate করো
  useEffect(() => {
    if (userdata) {
      setForm({
        name: userdata.name || '',
        phone: userdata.phone || '',
        email: userdata.email || '',
        address: userdata.address || '',
      });
    }
  }, [userdata]);

  const set = (k: string) => (e: any) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async () => {
    try {
      await updateProfile(form).unwrap();
      setSaved(true);
      setEditing(false);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: any) {
      console.error('Update failed:', err);
    }
  };

  if (isLoading) {
    return (
      <AccountLayout activeTab="profile">
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-primary-400" />
        </div>
      </AccountLayout>
    );
  }

  if (isError || !userdata) {
    return (
      <AccountLayout activeTab="profile">
        <div className="text-center py-20 text-red-500 text-sm">
          Failed to load profile. Please try again.
        </div>
      </AccountLayout>
    );
  }

  const joinedDate = userdata.createdAt
    ? new Date(userdata.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      })
    : 'N/A';

  return (
    <AccountLayout activeTab="profile">
      <div className="flex flex-col gap-4">
        {/* Avatar card */}
        <div className="bg-white rounded-2xl border border-black-200 p-5 flex items-center gap-4">
          <div className="relative flex-shrink-0">
            <div className="w-[72px] h-[72px] rounded-2xl overflow-hidden shadow-lg shadow-primary-200/50">
              {userdata?.avatar ? (
                <Image src={userdata.avatar} alt={form.name || 'avatar'} width={72} height={72} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary-400 to-orange-400 flex items-center justify-center">
                  <span className="text-2xl font-extrabold text-white select-none">
                    {form.name?.charAt(0)?.toUpperCase() || '?'}
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-black-900 text-base truncate">{form.name}</p>
            <p className="text-xs text-black-400 mt-0.5 capitalize">{userdata.role}</p>
            <p className="text-xs text-black-400 mt-1 flex items-center gap-1.5">
              <Calendar size={11} /> Member since {joinedDate}
            </p>
          </div>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold text-primary-500 border border-primary-200 bg-primary-50 rounded-xl px-3 py-2 hover:bg-primary-100 transition-colors"
            >
              <Edit3 size={12} /> Edit
            </button>
          )}
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl border border-black-200 p-5 flex flex-col gap-4">
          <FieldInput
            label="Full Name"
            value={form.name}
            onChange={set('name')}
            icon={User}
            disabled={!editing}
            placeholder="Full name"
          />
          <FieldInput
            label="Phone"
            value={form.phone}
            onChange={set('phone')}
            icon={Phone}
            disabled={!editing}
            type="tel"
            placeholder="01XXXXXXXXX"
          />
          <FieldInput
            label="Email"
            value={form.email}
            onChange={set('email')}
            icon={Mail}
            disabled={!editing}
            type="email"
            placeholder="email@example.com"
          />

          {editing && (
            <div className="flex gap-2 pt-1">
              <button
                onClick={save}
                disabled={isUpdating}
                className="flex-1 flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 disabled:opacity-60 text-white text-sm font-bold py-2.5 rounded-xl transition-colors"
              >
                {isUpdating ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Check size={15} /> Save Changes
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setEditing(false);
                  setForm({
                    name: userdata.name || '',
                    phone: userdata.phone || '',
                    email: userdata.email || '',
                    address: userdata.address || '',
                  });
                }}
                className="px-4 py-2.5 rounded-xl border border-black-200 text-black-500 text-sm hover:bg-black-100 transition-colors"
              >
                Cancel
              </button>
            </div>
          )}

          {saved && (
            <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-2.5 text-xs font-semibold">
              <CheckCircle2 size={14} /> Profile updated successfully!
            </div>
          )}
        </div>
      </div>
    </AccountLayout>
  );
}
