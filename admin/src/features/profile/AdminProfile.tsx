import { useEffect, useState } from 'react';
import { ChevronRight, Save, User, Mail, Phone, MapPin, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { useFetchMeQuery, useUpdateProfileMutation } from '../../redux/api/authApi';

const AdminProfile = () => {
  const { data: res, isLoading } = useFetchMeQuery(undefined);
  const [updateProfile, { isLoading: isSaving }] = useUpdateProfileMutation();

  const user = res?.data;

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name ?? '',
        email: user.email ?? '',
        phone: user.phone ?? '',
        address: user.address ?? '',
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await updateProfile(form).unwrap();
      toast.success(result?.message ?? 'Profile updated successfully');
    } catch (err: any) {
      toast.error(err?.data?.message ?? 'Failed to update profile');
    }
  };

  // Avatar initials
  const initials = (form.name || 'A')
    .split(' ')
    .map((w: string) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const Skeleton = ({ className = '' }: { className?: string }) => (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
          <span>Home</span>
          <ChevronRight className="h-3 w-3" />
          <span className="text-[#ff6d29]">Profile</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage your account information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Avatar Card */}
        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm flex flex-col items-center gap-4">
          <div className="h-24 w-24 rounded-full bg-gradient-to-br from-[#ff6d29] to-[#ffb347] flex items-center justify-center shadow-md">
            <span className="text-white text-3xl font-bold">{initials}</span>
          </div>

          {isLoading ? (
            <>
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-40" />
            </>
          ) : (
            <>
              <div className="text-center">
                <p className="font-semibold text-gray-800 text-lg">{user?.name || '—'}</p>
                <p className="text-sm text-gray-500">{user?.email || user?.phone || '—'}</p>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-50 text-[#ff6d29] text-xs font-semibold rounded-full border border-orange-100">
                <Shield className="h-3 w-3" />
                {user?.role ?? 'ADMIN'}
              </span>
            </>
          )}

          <div className="w-full border-t border-gray-100 pt-4 space-y-2 text-sm text-gray-500">
            <div className="flex justify-between">
              <span>Member since</span>
              <span className="font-medium text-gray-700">
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString('en-BD', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })
                  : '—'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Verified</span>
              <span
                className={`font-medium ${user?.is_verified ? 'text-emerald-600' : 'text-red-500'}`}
              >
                {user?.is_verified ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-5 flex items-center gap-2">
            <User className="h-4 w-4 text-[#ff6d29]" />
            Edit Information
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#ff6d29]/30 focus:border-[#ff6d29] text-gray-700"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#ff6d29]/30 focus:border-[#ff6d29] text-gray-700"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Enter your phone"
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#ff6d29]/30 focus:border-[#ff6d29] text-gray-700"
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Address
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Enter your address"
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#ff6d29]/30 focus:border-[#ff6d29] text-gray-700 resize-none"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSaving || isLoading}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#ff6d29] text-white text-sm font-medium rounded-lg hover:bg-[#e65a1f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="h-4 w-4" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
