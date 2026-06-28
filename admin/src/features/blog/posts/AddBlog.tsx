import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { FiSave, FiArrowLeft, FiX, FiSearch } from 'react-icons/fi';
import toast from 'react-hot-toast';
import JoditTextEditor from '../../../components/ui/editor/JoditTextEditor';
import ToggleSwitch from '../../../components/ui/toggle/ToggleSwitch';
import { useCreateBlogMutation } from '../blogApi';
import { useGetAllBlogCategoriesQuery } from '../blogCategoryApi';
import { useGetAllProductsQuery } from '../../inventory/products/productApi';
import { useDebounce } from '../../../hooks/useDebounce';

const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_-]+/g, '-');

const AddBlog = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: '',
      slug: '',
      shortDescription: '',
      blogCategoryId: '',
      isPublished: true,
      sortOrder: 0,
      metaTitle: '',
      metaDescription: '',
      metaKeywords: '',
    },
  });

  const [content, setContent] = useState('');
  const [seoOpen, setSeoOpen] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [productSearch, setProductSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const productRef = useRef<HTMLDivElement>(null);

  const [createBlog, { isLoading }] = useCreateBlogMutation();
  const { data: catData } = useGetAllBlogCategoriesQuery({ limit: 100 });
  const categories: any[] = catData?.data?.data || [];

  const debouncedProductSearch = useDebounce(productSearch, 400);
  const { data: productData } = useGetAllProductsQuery(
    { search: debouncedProductSearch, limit: 10, page: 1 },
    { skip: !showProductDropdown && !debouncedProductSearch },
  );
  const products: any[] = productData?.data?.data || [];

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setValue('title', title);
    setValue('slug', slugify(title));
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const removeThumbnail = () => {
    setThumbnailFile(null);
    setThumbnailPreview(null);
  };

  const handleProductSelect = (product: any) => {
    setSelectedProduct(product);
    setProductSearch(product.name);
    setShowProductDropdown(false);
  };

  const clearProduct = () => {
    setSelectedProduct(null);
    setProductSearch('');
  };

  const onSubmit = async (data: any) => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('slug', data.slug);
    if (data.shortDescription) formData.append('shortDescription', data.shortDescription);
    if (content) formData.append('content', content);
    if (data.blogCategoryId) formData.append('blogCategoryId', data.blogCategoryId);
    if (selectedProduct?.id) formData.append('productId', selectedProduct.id);
    formData.append('isPublished', String(data.isPublished));
    formData.append('sortOrder', String(data.sortOrder ?? 0));
    if (data.metaTitle) formData.append('metaTitle', data.metaTitle);
    if (data.metaDescription) formData.append('metaDescription', data.metaDescription);
    if (data.metaKeywords) formData.append('metaKeywords', data.metaKeywords);
    if (thumbnailFile) formData.append('thumbnail', thumbnailFile);

    try {
      const result = await createBlog(formData).unwrap();
      if (result?.success !== false) {
        toast.success('Blog post created!');
        navigate('/admin/blog/posts');
      } else {
        toast.error(result?.message || 'Failed to create blog post');
      }
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to create blog post.');
    }
  };

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/admin/blog/posts')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <FiArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Add Blog Post</h1>
          <p className="text-gray-500 text-sm mt-0.5">Create a new blog article</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column — main content */}
          <div className="lg:col-span-2 space-y-5">
            {/* Title */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
              <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wider">
                Blog Details
              </h2>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">
                  Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  {...register('title', { required: 'Title is required' })}
                  onChange={handleTitleChange}
                  placeholder="e.g. Best Wireless Earbuds 2025"
                  className="w-full border border-gray-200 bg-gray-50 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                {errors.title && (
                  <p className="text-red-500 text-xs mt-1">{errors.title.message as string}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">
                  Slug <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  {...register('slug', { required: 'Slug is required' })}
                  placeholder="e.g. best-wireless-earbuds-2025"
                  className="w-full border border-gray-200 bg-gray-50 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                {errors.slug && (
                  <p className="text-red-500 text-xs mt-1">{errors.slug.message as string}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">
                  Short Description
                </label>
                <textarea
                  {...register('shortDescription')}
                  rows={3}
                  placeholder="Brief summary shown in blog listing (150–200 characters recommended)"
                  className="w-full border border-gray-200 bg-gray-50 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                />
              </div>
            </div>

            {/* Rich text content */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wider mb-3">
                Blog Content
              </h2>
              <JoditTextEditor
                content={content}
                setContent={setContent}
                placeholder="Write your full blog article here..."
              />
            </div>

            {/* SEO */}
            <div className="bg-white rounded-xl border border-gray-200">
              <button
                type="button"
                onClick={() => setSeoOpen((v) => !v)}
                className="w-full flex items-center justify-between px-5 py-4 text-left"
              >
                <div className="flex items-center gap-2">
                  <FiSearch className="text-gray-400 w-4 h-4" />
                  <span className="font-semibold text-gray-700 text-sm uppercase tracking-wider">
                    SEO Meta
                  </span>
                  <span className="text-xs text-gray-400 font-normal normal-case">(optional)</span>
                </div>
                <span className="text-gray-400 text-lg">{seoOpen ? '−' : '+'}</span>
              </button>

              {seoOpen && (
                <div className="px-5 pb-5 space-y-4 border-t border-gray-100 pt-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">
                      Meta Title
                      <span className="ml-1 text-gray-400 font-normal normal-case">
                        (max 70 chars)
                      </span>
                    </label>
                    <input
                      type="text"
                      {...register('metaTitle', { maxLength: 70 })}
                      placeholder="SEO title — leave blank to use blog title"
                      maxLength={70}
                      className="w-full border border-gray-200 bg-gray-50 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Shown in browser tab & Google results
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">
                      Meta Description
                      <span className="ml-1 text-gray-400 font-normal normal-case">
                        (max 160 chars)
                      </span>
                    </label>
                    <textarea
                      {...register('metaDescription', { maxLength: 160 })}
                      rows={3}
                      placeholder="Short description shown in Google search results"
                      maxLength={160}
                      className="w-full border border-gray-200 bg-gray-50 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">
                      Meta Keywords
                    </label>
                    <input
                      type="text"
                      {...register('metaKeywords')}
                      placeholder="wireless earbuds, bluetooth, gadget review"
                      className="w-full border border-gray-200 bg-gray-50 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <p className="text-xs text-gray-400 mt-1">Comma-separated keywords</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right column — meta */}
          <div className="space-y-5">
            {/* Publish settings */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
              <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wider">
                Publish
              </h2>

              <ToggleSwitch
                name="isPublished"
                label="Published"
                register={register}
                errors={errors}
                defaultValue={true}
                onToggle={(val: boolean) => setValue('isPublished', val)}
              />

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">
                  Sort Order
                </label>
                <input
                  type="number"
                  min={0}
                  {...register('sortOrder')}
                  className="w-full border border-gray-200 bg-gray-50 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-6 py-2.5 cursor-pointer bg-primary-500 text-white rounded-md hover:bg-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    Saving...
                  </>
                ) : (
                  <>
                    <FiSave />
                    Publish Blog
                  </>
                )}
              </button>
            </div>

            {/* Thumbnail */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wider mb-3">
                Thumbnail Image
              </h2>

              {thumbnailPreview ? (
                <div className="relative">
                  <img
                    src={thumbnailPreview}
                    alt="Thumbnail preview"
                    className="w-full h-40 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={removeThumbnail}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <FiX className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-colors">
                  <svg
                    className="w-8 h-8 text-gray-400 mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="text-xs text-gray-500">Click to upload thumbnail</span>
                  <span className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Blog Category */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wider mb-3">
                Blog Category
              </h2>
              <select
                {...register('blogCategoryId')}
                className="w-full border border-gray-200 bg-gray-50 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">— Select Category —</option>
                {categories?.map((cat: any) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Related Product */}
            <div className="bg-white rounded-xl border border-gray-200 p-5" ref={productRef}>
              <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wider mb-3">
                Related Product
                <span className="ml-1 text-gray-400 font-normal normal-case">(optional)</span>
              </h2>

              {selectedProduct ? (
                <div className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-lg border border-gray-200">
                  {selectedProduct.images?.[0]?.url && (
                    <img
                      src={selectedProduct.images[0].url}
                      alt={selectedProduct.name}
                      className="w-10 h-10 object-cover rounded"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {selectedProduct.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      ৳{selectedProduct.price ?? selectedProduct.basePrice ?? '—'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={clearProduct}
                    className="p-1 text-gray-400 hover:text-red-500"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => {
                      setProductSearch(e.target.value);
                      setShowProductDropdown(true);
                    }}
                    onFocus={() => setShowProductDropdown(true)}
                    placeholder="Search product by name..."
                    className="w-full border border-gray-200 bg-gray-50 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  {showProductDropdown && products.length > 0 && (
                    <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {products.map((p: any) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => handleProductSelect(p)}
                          className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 text-left transition-colors"
                        >
                          {p.images?.[0]?.url && (
                            <img
                              src={p.images[0].url}
                              alt={p.name}
                              className="w-8 h-8 object-cover rounded"
                            />
                          )}
                          <div className="min-w-0">
                            <p className="text-sm text-gray-800 truncate">{p.name}</p>
                            <p className="text-xs text-gray-400">
                              ৳{p.price ?? p.basePrice ?? '—'}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  {showProductDropdown && productSearch && products.length === 0 && (
                    <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-xs text-gray-500 text-center">
                      No products found
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddBlog;
