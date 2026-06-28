import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FiSearch, FiPlus, FiMinus, FiTrash2, FiShoppingCart } from 'react-icons/fi';
import { useDebounce } from '../../../hooks/useDebounce';
import { useAdminCreateOrderMutation } from '../OrdersApi';
import { useGetAllCustomerQuery } from '../../customer/customerApi';
import { useGetAllProductsQuery } from '../../inventory/products/productApi';
import { useGetAllOrderSourcesQuery } from '../../common/order-sources/orderSourceApi';
import InputString from '../../../components/ui/InputString';

// ─── Types ────────────────────────────────────────────────────────────────────
interface CartItem {
  product_id: string;
  assigned_variant_price_id?: string;
  name: string;
  image?: string;
  sale_price: number;
  without_discount_price: number;
  quantity: number;
  selected_variant_options?: Record<string, string>;
}

const PAYMENT_METHODS = ['Cash', 'cash_on_delivery', 'bkash', 'nagad', 'card', 'bank', 'ssl_commerce'] as const;

// ─── Small helpers ────────────────────────────────────────────────────────────
const currency = (n: number) => `৳${Number(n).toFixed(2)}`;

const Card = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">{title}</h3>
    {children}
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const CustomOrder = () => {
  const navigate = useNavigate();
  const [createOrder, { isLoading: isSubmitting }] = useAdminCreateOrderMutation();

  // ── Customer ─────────────────────────────────────────────────────────────
  const [customerSearch, setCustomerSearch] = useState('');
  const debouncedCustomer = useDebounce(customerSearch, 400);
  const { data: customerData } = useGetAllCustomerQuery(
    { search: debouncedCustomer, limit: 8 },
    { skip: debouncedCustomer.length < 2 },
  );
  const customers = customerData?.data?.data || [];
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

  const {
    register: regCustomer,
    setValue: setCustomerVal,
    watch: watchCustomer,
    formState: { errors: customerErrors },
    trigger: triggerCustomer,
  } = useForm({
    defaultValues: { fullName: '', phone: '', email: '', address: '' },
  });

  const fillCustomer = (c: any) => {
    setCustomerVal('fullName', c.name || '');
    setCustomerVal('phone', c.phone || '');
    setCustomerVal('email', c.email || '');
    setCustomerVal('address', c.address || '');
    setCustomerSearch('');
    setShowCustomerDropdown(false);
  };

  // ── Products ──────────────────────────────────────────────────────────────
  const [productSearch, setProductSearch] = useState('');
  const debouncedProduct = useDebounce(productSearch, 400);
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [productPage, setProductPage] = useState(1);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [hasMoreProducts, setHasMoreProducts] = useState(true);
  const productListRef = useRef<HTMLDivElement>(null);

  const { data: productData, isFetching: productFetching } = useGetAllProductsQuery(
    { search: debouncedProduct, limit: 12, page: productPage },
    { skip: debouncedProduct.length < 1 },
  );

  // Reset pagination when search changes
  useEffect(() => {
    setProductPage(1);
    setAllProducts([]);
    setHasMoreProducts(true);
  }, [debouncedProduct]);

  // Accumulate products across pages
  useEffect(() => {
    if (!productData?.data?.data) return;
    const newItems: any[] = productData.data.data;
    setAllProducts((prev) => (productPage === 1 ? newItems : [...prev, ...newItems]));
    const meta = productData.data.meta;
    if (meta) {
      setHasMoreProducts(meta.currentPage < meta.totalPages);
    } else {
      setHasMoreProducts(newItems.length === 12);
    }
  }, [productData]);

  const handleProductScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollTop + clientHeight >= scrollHeight - 10 && hasMoreProducts && !productFetching) {
      setProductPage((prev) => prev + 1);
    }
  };

  const products = allProducts;

  // ── Cart ──────────────────────────────────────────────────────────────────
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (product: any) => {
    const id = product.id;
    const existing = cart.find((i) => i.product_id === id);
    if (existing) {
      setCart(cart.map((i) => (i.product_id === id ? { ...i, quantity: i.quantity + 1 } : i)));
    } else {
      const salePrice = Number(product.basePrice ?? product.basePrice ?? product.basePrice ?? 0);
      const origPrice = Number(
        product.originalPrice ?? product.without_discount_price ?? salePrice,
      );
      setCart([
        ...cart,
        {
          product_id: id,
          name: product.name,
          image: product.thumbnail ?? product.images?.[0]?.url ?? undefined,
          sale_price: salePrice,
          without_discount_price: origPrice,
          quantity: 1,
        },
      ]);
    }
    setProductSearch('');
    setShowProductDropdown(false);
  };

  const changeQty = (productId: string, delta: number) => {
    setCart((prev) =>
      prev.map((i) =>
        i.product_id === productId ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i,
      ),
    );
  };

  const changePrice = (
    productId: string,
    field: 'sale_price' | 'without_discount_price',
    value: string,
  ) => {
    const num = parseFloat(value) || 0;
    setCart((prev) => prev.map((i) => (i.product_id === productId ? { ...i, [field]: num } : i)));
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((i) => i.product_id !== productId));
  };

  // ── Order Source ──────────────────────────────────────────────────────────
  const { data: sourcesData } = useGetAllOrderSourcesQuery({});
  const orderSources: any[] = (sourcesData?.data || []).filter((s: any) => s.status);
  const [selectedSourceId, setSelectedSourceId] = useState<string>('');

  // ── Order Extras ──────────────────────────────────────────────────────────
  const [deliveryCharge, setDeliveryCharge] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>('Cash');
  const [orderNote, setOrderNote] = useState<string>('');

  // ── Calculated totals ─────────────────────────────────────────────────────
  const subTotal = useMemo(
    () => cart.reduce((s, i) => s + i.without_discount_price * i.quantity, 0),
    [cart],
  );
  const itemTotal = useMemo(() => cart.reduce((s, i) => s + i.sale_price * i.quantity, 0), [cart]);
  const totalPrice = useMemo(
    () => Math.max(0, itemTotal - discount + deliveryCharge),
    [itemTotal, discount, deliveryCharge],
  );

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    const isValid = await triggerCustomer();
    const phone = watchCustomer('phone');
    const fullName = watchCustomer('fullName');
    const address = watchCustomer('address');

    if (!isValid || !fullName || !phone || !address) {
      toast.error('Please fill in all required customer fields.');
      return;
    }
    if (!/^01[3-9]\d{8}$/.test(phone)) {
      toast.error('Enter a valid BD mobile number (e.g. 01XXXXXXXXX)');
      return;
    }
    if (cart.length === 0) {
      toast.error('Add at least one product to the order.');
      return;
    }

    const dto: any = {
      customer: {
        fullName,
        phone,
        email: watchCustomer('email') || undefined,
        address,
      },
      items: cart.map((i) => ({
        product_id: i.product_id,
        assigned_variant_price_id: i.assigned_variant_price_id,
        name: i.name,
        image: i.image,
        sale_price: i.sale_price,
        without_discount_price: i.without_discount_price,
        quantity: i.quantity,
        selected_variant_options: i.selected_variant_options,
      })),
      subTotal,
      discount,
      couponDiscount: 0,
      deliveryCharge,
      totalPrice,
      paymentMethod: paymentMethod || undefined,
      orderNote: orderNote || undefined,
      orderSourceId: selectedSourceId || undefined,
    };

    try {
      const result = await createOrder(dto).unwrap();
      toast.success(`Order ${result?.data?.orderNumber || ''} placed successfully!`);
      navigate('/admin/orders');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to place order. Please check the details.');
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Custom Order</h1>
          <p className="text-gray-500 text-sm mt-1">Place a manual order on behalf of a customer</p>
        </div>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || cart.length === 0}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />{' '}
              Placing...
            </>
          ) : (
            <>
              <FiShoppingCart /> Place Order
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* ── LEFT: Customer + Products ─────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-5">
          {/* Customer Info */}
          <Card title="Customer Info">
            {/* Search existing */}
            <div className="mb-4 relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search Existing Customer
              </label>
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Type phone, name or email..."
                  value={customerSearch}
                  onChange={(e) => {
                    setCustomerSearch(e.target.value);
                    setShowCustomerDropdown(true);
                  }}
                  onFocus={() => setShowCustomerDropdown(true)}
                  className="search-input pl-9"
                />
              </div>
              {showCustomerDropdown && customers.length > 0 && (
                <div className="absolute z-50 top-full mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                  {customers?.map((c: any) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => fillCustomer(c)}
                      className="w-full text-left px-4 py-2.5 hover:bg-gray-50 border-b border-gray-100 last:border-0"
                    >
                      <span className="font-medium text-gray-800 text-sm">{c.name}</span>
                      <span className="text-gray-500 text-xs ml-2">{c.phone}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputString
                name="fullName"
                label="Full Name"
                placeholder="Customer full name"
                register={regCustomer}
                errors={customerErrors}
                required
              />
              <InputString
                name="phone"
                label="Phone"
                placeholder="01XXXXXXXXX"
                register={regCustomer}
                errors={customerErrors}
                required
              />
              <InputString
                name="address"
                label="Address"
                placeholder="Full delivery address"
                register={regCustomer}
                errors={customerErrors}
                required
              />
              <InputString
                name="email"
                label="Email"
                placeholder="email@example.com"
                register={regCustomer}
                errors={customerErrors}
                required={false}
              />
            </div>
          </Card>

          {/* Add Products */}
          <Card title="Add Products">
            <div className="relative mb-4">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search product by name..."
                value={productSearch}
                onChange={(e) => {
                  setProductSearch(e.target.value);
                  setShowProductDropdown(true);
                }}
                onFocus={() => setShowProductDropdown(true)}
                className="search-input pl-9"
              />
              {showProductDropdown && (productFetching || products.length > 0) && (
                <div
                  ref={productListRef}
                  onScroll={handleProductScroll}
                  className="absolute z-50 top-full mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto"
                >
                  {products.length === 0 && productFetching ? (
                    <div className="px-4 py-3 text-sm text-gray-500">Searching...</div>
                  ) : (
                    <>
                      {products.map((p: any) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => addToCart(p)}
                          className="w-full flex items-center gap-3 text-left px-4 py-2.5 hover:bg-gray-50 border-b border-gray-100 last:border-0"
                        >
                          {(p.thumbnail ?? p.images?.[0]?.url) ? (
                            <img
                              src={p.thumbnail ?? p.images[0].url}
                              alt={p.name}
                              className="w-9 h-9 rounded object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded bg-gray-100 flex-shrink-0 flex items-center justify-center text-gray-400 text-xs">
                              IMG
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">{p.name}</p>
                            <p className="text-xs text-primary-500 font-medium">
                              {currency(p.basePrice ?? 0)}
                            </p>
                          </div>
                          <FiPlus className="text-primary-500 flex-shrink-0" />
                        </button>
                      ))}
                      {productFetching && (
                        <div className="px-4 py-2 text-center text-xs text-gray-400">
                          Loading more...
                        </div>
                      )}
                      {!productFetching && !hasMoreProducts && products.length > 0 && (
                        <div className="px-4 py-2 text-center text-xs text-gray-400 border-t border-gray-100">
                          All results shown
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Cart Items */}
            {cart.length === 0 ? (
              <div className="text-center py-10 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg">
                No products added yet. Search and add products above.
              </div>
            ) : (
              <div className="space-y-3">
                {cart?.map((item) => (
                  <div
                    key={item.product_id}
                    className="flex gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    {/* Image */}
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 rounded object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded bg-gray-200 flex-shrink-0 flex items-center justify-center text-gray-400 text-xs">
                        IMG
                      </div>
                    )}

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{item.name}</p>

                      {/* Prices */}
                      <div className="flex gap-3 mt-1.5 flex-wrap">
                        <div>
                          <span className="text-xs text-gray-500 block">Sale Price</span>
                          <div className="flex items-center border border-gray-300 rounded overflow-hidden bg-white">
                            <span className="px-1.5 text-gray-500 text-xs bg-gray-100 border-r border-gray-300">
                              ৳
                            </span>
                            <input
                              type="number"
                              min={0}
                              step="any"
                              value={item.sale_price}
                              onChange={(e) =>
                                changePrice(item.product_id, 'sale_price', e.target.value)
                              }
                              className="w-20 px-2 py-1 text-xs focus:outline-none"
                            />
                          </div>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500 block">Original Price</span>
                          <div className="flex items-center border border-gray-300 rounded overflow-hidden bg-white">
                            <span className="px-1.5 text-gray-500 text-xs bg-gray-100 border-r border-gray-300">
                              ৳
                            </span>
                            <input
                              type="number"
                              min={0}
                              step="any"
                              value={item.without_discount_price}
                              onChange={(e) =>
                                changePrice(
                                  item.product_id,
                                  'without_discount_price',
                                  e.target.value,
                                )
                              }
                              className="w-20 px-2 py-1 text-xs focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Qty + Remove */}
                    <div className="flex flex-col items-end justify-between">
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.product_id)}
                        className="text-red-400 hover:text-red-600 p-1"
                      >
                        <FiTrash2 size={14} />
                      </button>
                      <div className="flex items-center gap-1.5 mt-auto">
                        <button
                          type="button"
                          onClick={() => changeQty(item.product_id, -1)}
                          className="w-7 h-7 rounded border border-gray-300 bg-white flex items-center justify-center hover:bg-gray-100"
                        >
                          <FiMinus size={12} />
                        </button>
                        <span className="w-8 text-center text-sm font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => changeQty(item.product_id, 1)}
                          className="w-7 h-7 rounded border border-gray-300 bg-white flex items-center justify-center hover:bg-gray-100"
                        >
                          <FiPlus size={12} />
                        </button>
                      </div>
                      <p className="text-xs font-bold text-primary-500 mt-1">
                        {currency(item.sale_price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* ── RIGHT: Source, Pricing, Payment ───────────────────────────── */}
        <div className="space-y-5">
          {/* Order Source */}
          <Card title="Order Source">
            <div className="space-y-2">
              {orderSources?.length === 0 ? (
                <p className="text-sm text-gray-400">No active order sources found.</p>
              ) : (
                orderSources?.map((src: any) => (
                  <label
                    key={src.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedSourceId === src.id
                        ? 'border-primary-500 bg-primary-300'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="orderSource"
                      value={src.id}
                      checked={selectedSourceId === src.id}
                      onChange={() => setSelectedSourceId(src.id)}
                      className="text-primary-500"
                    />
                    <span className="text-sm font-medium text-gray-700 capitalize">{src.name}</span>
                  </label>
                ))
              )}
              {selectedSourceId && (
                <button
                  type="button"
                  onClick={() => setSelectedSourceId('')}
                  className="text-xs text-gray-400 hover:text-gray-600 mt-1"
                >
                  Clear selection
                </button>
              )}
            </div>
          </Card>

          {/* Pricing */}
          <Card title="Pricing">
            <div className="space-y-3">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Sub Total</span>
                <span className="font-medium">{currency(subTotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Item Total</span>
                <span className="font-medium">{currency(itemTotal)}</span>
              </div>

              {/* Discount */}
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Discount (৳)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                    ৳
                  </span>
                  <input
                    type="number"
                    min={0}
                    step="any"
                    value={discount}
                    onChange={(e) => setDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full pl-7 pr-3 py-2 border border-gray-200 bg-gray-50 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              {/* Delivery */}
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">
                  Delivery Charge (৳)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                    ৳
                  </span>
                  <input
                    type="number"
                    min={0}
                    step="any"
                    value={deliveryCharge}
                    onChange={(e) =>
                      setDeliveryCharge(Math.max(0, parseFloat(e.target.value) || 0))
                    }
                    className="w-full pl-7 pr-3 py-2 border border-gray-200 bg-gray-50 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
                <span className="font-semibold text-gray-800">Total</span>
                <span className="text-lg font-bold text-primary-500">{currency(totalPrice)}</span>
              </div>
            </div>
          </Card>

          {/* Payment & Note */}
          <Card title="Payment">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full border border-gray-200 bg-gray-50 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">— Select —</option>
                  {PAYMENT_METHODS.map((m) => (
                    <option key={m} value={m}>
                      {m === 'cash_on_delivery' ? 'Cash on Delivery (COD)' : m === 'ssl_commerce' ? 'SSL Commerce (Online)' : m}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Order Note</label>
                <textarea
                  rows={3}
                  placeholder="Any special instructions..."
                  value={orderNote}
                  onChange={(e) => setOrderNote(e.target.value)}
                  className="w-full border border-gray-200 bg-gray-50 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                />
              </div>
            </div>
          </Card>

          {/* Place order button (also at bottom for mobile) */}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || cart.length === 0}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />{' '}
                Placing Order...
              </>
            ) : (
              <>
                <FiShoppingCart /> Place Order ({cart.length} item{cart.length !== 1 ? 's' : ''})
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomOrder;
