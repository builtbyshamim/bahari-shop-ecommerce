import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaTiktok,
  FaWhatsapp,
  FaXTwitter,
  FaYoutube,
} from 'react-icons/fa6';
import InputString from '../../../components/ui/InputString';
import InputTextarea from '../../../components/ui/InputTextarea';
import { useGetCompanyInfoQuery, useUpdateCompanyInfoMutation } from './companyApi';

const SOCIAL_FIELDS = [
  { key: 'facebook', label: 'Facebook URL', icon: <FaFacebookF /> },
  { key: 'instagram', label: 'Instagram URL', icon: <FaInstagram /> },
  { key: 'youtube', label: 'YouTube URL', icon: <FaYoutube /> },
  { key: 'twitter', label: 'Twitter / X URL', icon: <FaXTwitter /> },
  { key: 'tiktok', label: 'TikTok URL', icon: <FaTiktok /> },
  { key: 'linkedin', label: 'LinkedIn URL', icon: <FaLinkedinIn /> },
  { key: 'whatsapp', label: 'WhatsApp Number', icon: <FaWhatsapp /> },
];

const SectionCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
    <h2 className="text-base font-semibold text-gray-700 mb-4">{title}</h2>
    {children}
  </div>
);

const CompanyInfoPage = () => {
  const { data, isFetching } = useGetCompanyInfoQuery(undefined);
  const [updateInfo, { isLoading: isSaving }] = useUpdateCompanyInfoMutation();
  const info = data?.data;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<any>();

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const [faviconPreview, setFaviconPreview] = useState<string | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (info) {
      reset({
        name: info.name || '',
        tagline: info.tagline || '',
        description: info.description || '',
        address: info.address || '',
        phone: info.phone || '',
        email: info.email || '',
        website: info.website || '',
        seoTitle: info.seoTitle || '',
        seoDescription: info.seoDescription || '',
        seoKeywords: info.seoKeywords || '',
        facebook: info.socialLinks?.facebook || '',
        instagram: info.socialLinks?.instagram || '',
        youtube: info.socialLinks?.youtube || '',
        twitter: info.socialLinks?.twitter || '',
        tiktok: info.socialLinks?.tiktok || '',
        linkedin: info.socialLinks?.linkedin || '',
        whatsapp: info.socialLinks?.whatsapp || '',
      });
      if (info.logoUrl) setLogoPreview(info.logoUrl);
      if (info.faviconUrl) setFaviconPreview(info.faviconUrl);
    }
  }, [info, reset]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleFaviconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFaviconFile(file);
    setFaviconPreview(URL.createObjectURL(file));
  };

  const onSubmit = async (values: any) => {
    const fd = new FormData();
    ['name', 'tagline', 'description', 'address', 'phone', 'email', 'website', 'seoTitle', 'seoDescription', 'seoKeywords'].forEach((f) => {
      if (values[f] !== undefined) fd.append(f, values[f]);
    });

    const socialLinks: Record<string, string> = {};
    SOCIAL_FIELDS.forEach(({ key }) => {
      if (values[key]) socialLinks[key] = values[key];
    });
    fd.append('socialLinks', JSON.stringify(socialLinks));

    if (logoFile) fd.append('logo', logoFile);
    if (faviconFile) fd.append('favicon', faviconFile);

    try {
      await updateInfo(fd).unwrap();
      toast.success('Company info updated successfully!');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Update failed');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Company Information</h1>
        <p className="text-gray-500 mt-1">Manage your company profile shown across the platform</p>
      </div>

      {isFetching ? (
        <div className="text-center py-16 text-gray-400">Loading…</div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Logo & Favicon */}
          <SectionCard title="Branding">
            <div className="flex flex-col gap-6">
              {/* Logo */}
              <div className="flex items-center gap-6">
                <div
                  onClick={() => logoInputRef.current?.click()}
                  className="w-28 h-20 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-primary-500 transition overflow-hidden bg-gray-50"
                >
                  {logoPreview ? (
                    <img src={logoPreview} alt="logo" className="w-full h-full object-contain p-1" />
                  ) : (
                    <span className="text-xs text-gray-400 text-center px-2">Click to upload</span>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Company Logo</p>
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    className="btn border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 text-sm px-4 py-2"
                  >
                    {logoPreview ? 'Change Logo' : 'Upload Logo'}
                  </button>
                  <p className="text-xs text-gray-400 mt-1.5">PNG, JPG, WEBP — max 2 MB, 400×200 recommended</p>
                </div>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoChange}
                />
              </div>

              {/* Favicon */}
              <div className="flex items-center gap-6">
                <div
                  onClick={() => faviconInputRef.current?.click()}
                  className="w-16 h-16 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-primary-500 transition overflow-hidden bg-gray-50"
                >
                  {faviconPreview ? (
                    <img src={faviconPreview} alt="favicon" className="w-full h-full object-contain p-1" />
                  ) : (
                    <span className="text-xs text-gray-400 text-center px-1">Icon</span>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Favicon / Site Icon</p>
                  <button
                    type="button"
                    onClick={() => faviconInputRef.current?.click()}
                    className="btn border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 text-sm px-4 py-2"
                  >
                    {faviconPreview ? 'Change Favicon' : 'Upload Favicon'}
                  </button>
                  <p className="text-xs text-gray-400 mt-1.5">PNG, ICO — square, 32×32 or 64×64 recommended</p>
                </div>
                <input
                  ref={faviconInputRef}
                  type="file"
                  accept="image/*,.ico"
                  className="hidden"
                  onChange={handleFaviconChange}
                />
              </div>
            </div>
          </SectionCard>

          {/* Basic Info */}
          <SectionCard title="Basic Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputString
                label="Company Name"
                name="name"
                placeholder="e.g. KCommerce"
                register={register}
                errors={errors}
                required={true}
              />
              <InputString
                label="Tagline"
                name="tagline"
                placeholder="e.g. Shop smart, shop local"
                register={register}
                errors={errors}
                required={false}
              />
              <InputString
                label="Phone Number"
                name="phone"
                placeholder="01XXXXXXXXX"
                register={register}
                errors={errors}
                required={false}
              />
              <InputString
                label="Email Address"
                name="email"
                type="email"
                placeholder="contact@yourcompany.com"
                register={register}
                errors={errors}
                required={false}
              />
              <InputString
                label="Website URL"
                name="website"
                type="url"
                placeholder="https://yourcompany.com"
                register={register}
                errors={errors}
                required={false}
              />
              <div className="md:col-span-2">
                <InputTextarea
                  label="Address"
                  name="address"
                  placeholder="Full company address"
                  register={register}
                  errors={errors}
                  required={false}
                  rows={2}
                />
              </div>
              <div className="md:col-span-2">
                <InputTextarea
                  label="Description"
                  name="description"
                  placeholder="Short company description shown on the frontend"
                  register={register}
                  errors={errors}
                  required={false}
                  rows={3}
                />
              </div>
            </div>
          </SectionCard>

          {/* SEO */}
          <SectionCard title="SEO & Metadata">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SEO Title
                  <span className="ml-2 text-xs font-normal text-gray-400">(shown in browser tab & Google results)</span>
                </label>
                <input
                  {...register('seoTitle')}
                  placeholder="e.g. Bahari Shop — সেরা দামে সেরা পণ্য"
                  className="w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm hover:border-gray-300"
                />
                <p className="text-xs text-gray-400 mt-1">Leave blank to auto-generate from Company Name + Tagline. Max 60 characters recommended.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meta Description
                  <span className="ml-2 text-xs font-normal text-gray-400">(shown under title in Google results)</span>
                </label>
                <textarea
                  {...register('seoDescription')}
                  rows={3}
                  placeholder="e.g. Bahari Shop-এ পান সেরা পণ্য সেরা দামে। ইলেকট্রনিক্স, ফ্যাশন, গৃহস্থালী পণ্যসহ হাজারো আইটেম।"
                  className="w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm hover:border-gray-300 resize-none"
                />
                <p className="text-xs text-gray-400 mt-1">Leave blank to use Company Description. Max 160 characters recommended.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SEO Keywords
                </label>
                <input
                  {...register('seoKeywords')}
                  placeholder="online shopping, bangladesh, ecommerce, best price (comma separated)"
                  className="w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm hover:border-gray-300"
                />
                <p className="text-xs text-gray-400 mt-1">Separate keywords with commas.</p>
              </div>
            </div>
          </SectionCard>

          {/* Social Links */}
          <SectionCard title="Social Media Links">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {SOCIAL_FIELDS.map(({ key, label, icon }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <div className="flex items-center gap-2">
                    <span className="p-2.5 bg-gray-100 border border-gray-200 rounded-md text-gray-500 shrink-0">
                      {icon}
                    </span>
                    <input
                      {...register(key)}
                      placeholder="https://…"
                      className="flex-1 px-3 py-2 border border-gray-200 bg-gray-50 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm hover:border-gray-300"
                    />
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="btn px-8 py-2.5 disabled:opacity-60"
            >
              {isSaving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default CompanyInfoPage;
