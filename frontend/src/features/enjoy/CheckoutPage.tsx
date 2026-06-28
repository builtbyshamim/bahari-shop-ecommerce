'use client';

import { useEffect, useState } from 'react';
import {
  ChevronRight,
  ShoppingBag,
  Phone,
  User,
  Home,
  Tag,
  CheckCircle2,
  Truck,
  Shield,
  RotateCcw,
  MapPin,
  CreditCard,
  Banknote,
} from 'lucide-react';
import Link from 'next/link';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { clearCart, applyCoupon, removeCoupon } from '@/redux/features/cartSlice';
import { useCreateOrderMutation, useGetDeliveryChargesQuery } from '@/redux/api/checkoutApi';
import { useValidateCouponMutation } from '@/redux/api/couponApi';
import { useInitiateSslPaymentMutation } from '@/redux/api/sslPaymentApi';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { useGetAddressesQuery } from '@/redux/api/addressApi,';
import { useGetProfileQuery } from '@/redux/api/userApi';
import { useRouter } from 'next/navigation';
import { getStoredTrackingParams } from '@/hooks/useTrackingParams';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const FormInput = ({
  label,
  id,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  icon: Icon,
  required = false,
}: any) => (
  <div className="flex flex-col gap-1.5">
    <label htmlFor={id} className="text-xs font-medium text-black-600">
      {label} {required && <span className="text-primary-500">*</span>}
    </label>
    <div className="relative">
      {Icon && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-black-400">
          <Icon size={15} />
        </span>
      )}
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`w-full ${Icon ? 'pl-9' : 'pl-3.5'} pr-3.5 py-2.5 text-sm rounded-xl border bg-white text-black-800 placeholder-black-300 outline-none transition-all
          ${error ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100' : 'border-black-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100'}`}
      />
    </div>
    {error && <p className="text-[11px] text-red-500">{error}</p>}
  </div>
);

const SectionCard = ({ title, icon: Icon, children }: any) => (
  <div className="bg-white rounded-2xl border border-black-200 overflow-hidden">
    <div className="flex items-center gap-2.5 px-5 py-4 border-b border-black-100 bg-black-100/40">
      <div className="w-7 h-7 rounded-lg bg-primary-500 flex items-center justify-center">
        <Icon size={14} className="text-white" />
      </div>
      <h3 className="font-semibold text-black-800 text-sm">{title}</h3>
    </div>
    <div className="px-5 py-5">{children}</div>
  </div>
);

// ─── Order Summary Side ───────────────────────────────────────────────────────
const OrderSummary = ({
  deliveryPrice,
  couponCode,
}: {
  deliveryPrice: number;
  couponCode: string;
}) => {
  const products = useAppSelector((s) => s.cart.products);
  const subTotal = useAppSelector((s) => s.cart.subTotal);
  const discount = useAppSelector((s) => s.cart.discount);
  const couponDiscount = useAppSelector((s) => s.cart.couponDiscount);
  const totalPrice = useAppSelector((s) => s.cart.totalPrice);
  const selectedItems = useAppSelector((s) => s.cart.selectedItems);
  const grandTotal = Number(totalPrice || 0) + Number(deliveryPrice || 0);

  return (
    <div className="bg-white rounded-2xl border border-black-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-black-100 bg-black-100/40">
        <h3 className="font-semibold text-black-800 text-sm flex items-center gap-2">
          <ShoppingBag size={15} className="text-primary-500" />
          Order Summary ({selectedItems} items)
        </h3>
      </div>

      <div className="px-4 py-3 max-h-56 overflow-y-auto flex flex-col gap-2.5 [scrollbar-width:thin]">
        {products.map((p: any, i: number) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg overflow-hidden bg-black-100 border border-black-200 flex-shrink-0">
              {p.image ? (
                <Image
                  width={100}
                  height={100}
                  src={p.image}
                  alt={p.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-black-300">
                  <ShoppingBag size={14} />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-black-700 truncate">{p.name}</p>
              {p.selected_variant_options && Object.keys(p.selected_variant_options).length > 0 && (
                <p className="text-[10px] text-black-400 truncate">
                  {Object.entries(p.selected_variant_options)
                    .map(([k, v]) => `${k}: ${v}`)
                    .join(' · ')}
                </p>
              )}
              <p className="text-[11px] text-black-400">Qty: {p.quantity}</p>
            </div>
            <span className="text-xs font-semibold text-black-800 flex-shrink-0">
              ৳{(p.sale_price * p.quantity).toFixed(0)}
            </span>
          </div>
        ))}
      </div>

      <div className="px-5 py-4 border-t border-black-100 flex flex-col gap-2.5">
        <div className="flex justify-between text-sm text-black-500">
          <span>Subtotal</span>
          <span>৳{subTotal.toFixed(0)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-black-500">Discount</span>
            <span className="text-green-700 font-medium">−৳{discount.toFixed(0)}</span>
          </div>
        )}
        {couponDiscount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-black-500">Coupon ({couponCode})</span>
            <span className="text-green-700 font-medium">−৳{couponDiscount.toFixed(0)}</span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-black-500">Delivery</span>
          <span
            className={
              deliveryPrice === 0 ? 'text-green-700 font-medium' : 'text-black-700 font-medium'
            }
          >
            {deliveryPrice === 0 ? 'FREE' : `৳${deliveryPrice}`}
          </span>
        </div>
        <div className="border-t border-dashed border-black-200 pt-2.5 flex justify-between items-center">
          <span className="font-semibold text-black-800 text-sm">Total Payable</span>
          <span className="font-bold text-primary-500 text-xl">৳{grandTotal.toFixed(0)}</span>
        </div>
        {(discount > 0 || couponDiscount > 0) && (
          <div className="bg-green-50 border border-green-100 rounded-xl px-3 py-2 text-center">
            <p className="text-[11px] text-green-700 font-medium">
              Saving ৳{(discount + couponDiscount).toFixed(0)} on this order!
            </p>
          </div>
        )}
      </div>

      <div className="px-5 pb-4 flex items-center justify-around border-t border-black-100 pt-4">
        {[
          { icon: Shield, label: 'Secure' },
          { icon: Truck, label: 'Fast Delivery' },
          { icon: RotateCcw, label: 'Easy Return' },
        ].map(({ icon: I, label }) => (
          <div key={label} className="flex flex-col items-center gap-1">
            <I size={16} className="text-primary-500" />
            <span className="text-[10px] text-black-400">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Main Checkout Page ───────────────────────────────────────────────────────
const CheckoutPage = () => {
  const dispatch = useAppDispatch();
  const products = useAppSelector((s) => s.cart.products);
  const subTotal = useAppSelector((s) => s.cart.subTotal);
  const discount = useAppSelector((s) => s.cart.discount);
  const totalPrice = useAppSelector((s) => s.cart.totalPrice);
  const router = useRouter();

  const { data: deliveryData } = useGetDeliveryChargesQuery('');
  const deliveryCharges = deliveryData?.data ?? [];
  const [delivery, setDelivery] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'ssl'>('cod');

  const { data: addresses = [] } = useGetAddressesQuery();
  const defaultAddress = (addresses as any)?.data?.find((a: any) => a.isDefault) ?? null;

  const { data: profileData } = useGetProfileQuery('');
  const profile = profileData?.data;

  const couponDiscount = useAppSelector((s) => s.cart.couponDiscount);

  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    orderNote: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [appliedCouponCode, setAppliedCouponCode] = useState('');
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [createOrder, { isLoading }] = useCreateOrderMutation();
  const [validateCoupon, { isLoading: isCouponLoading }] = useValidateCouponMutation();
  const [initiateSslPayment, { isLoading: isSslLoading }] = useInitiateSslPaymentMutation();

  useEffect(() => {
    if (defaultAddress) {
      setForm((prev) => ({
        ...prev,
        fullName: defaultAddress.fullName,
        phone: defaultAddress.phone,
        email: defaultAddress.email ?? '',
        address: defaultAddress.fullAddress,
      }));
    } else if (profile) {
      setForm((prev) => ({
        ...prev,
        fullName: prev.fullName || profile.name || '',
        phone: prev.phone || profile.phone || '',
        email: prev.email || profile.email || '',
      }));
    }
  }, [defaultAddress?.id, profile?.name]);

  useEffect(() => {
    if (deliveryCharges.length > 0 && !delivery) {
      setDelivery(deliveryCharges[0].id);
    }
  }, [deliveryCharges]);

  const deliveryPrice = deliveryCharges.find((d: any) => d.id === delivery)?.charge;

  const set = (field: string) => (e: any) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    if (errors[field]) setErrors((err) => ({ ...err, [field]: '' }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.fullName.trim()) e.fullName = 'Full name is required';
    if (!form.phone.trim()) e.phone = 'Phone number is required';
    else if (!/^01[3-9]\d{8}$/.test(form.phone)) e.phone = 'Enter a valid BD mobile number';
    if (!form.address.trim()) e.address = 'Address is required';
    return e;
  };

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponError('');
    try {
      const cartItemTotal = products.reduce(
        (sum: number, p: any) => sum + Number(p.sale_price) * Number(p.quantity),
        0,
      );
      const result = await validateCoupon({
        code: couponInput.trim(),
        cartTotal: cartItemTotal,
      }).unwrap();
      dispatch(applyCoupon(result?.data?.discount ?? 0));
      setAppliedCouponCode(couponInput.trim().toUpperCase());
      toast.success(`Coupon applied! You save ৳${result?.data?.discount.toFixed(0)}`);
    } catch (err: any) {
      setCouponError(err?.message ?? 'Invalid coupon code');
      dispatch(removeCoupon());
      setAppliedCouponCode('');
    }
  };

  const handleRemoveCoupon = () => {
    dispatch(removeCoupon());
    setAppliedCouponCode('');
    setCouponInput('');
    setCouponError('');
  };

  const buildOrderPayload = () => {
    const selectedDelivery = deliveryCharges.find((d: any) => d.id === delivery);
    return {
      customer: {
        fullName: form.fullName,
        phone: form.phone,
        email: form.email || undefined,
        address: form.address,
      },
      items: products.map((p: any) => ({
        product_id: p.product_id ?? p.id,
        assigned_variant_price_id: p.assigned_variant_price_id || undefined,
        name: p.name,
        image: p.image || undefined,
        sale_price: Number(p.sale_price),
        without_discount_price: Number(p.without_discount_price),
        quantity: Number(p.quantity),
        selected_variant_options: p.selected_variant_options || undefined,
      })),
      subTotal: Number(subTotal ?? 0),
      discount: Number(discount ?? 0),
      couponDiscount: Number(couponDiscount ?? 0),
      deliveryCharge: Number(selectedDelivery?.charge ?? 0),
      totalPrice: Number(totalPrice ?? 0) + Number(selectedDelivery?.charge ?? 0),
      deliveryMethodId: selectedDelivery?.id,
      deliveryMethodName: selectedDelivery?.name,
      couponCode: appliedCouponCode || undefined,
      orderNote: form.orderNote || undefined,
      ...getStoredTrackingParams(),
    };
  };

  const handlePlaceOrder = async () => {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }

    const basePayload = buildOrderPayload();

    if (paymentMethod === 'cod') {
      // ── Cash on Delivery flow ───────────────────────────────────────────────
      try {
        const result = await createOrder({
          ...basePayload,
          paymentMethod: 'cash_on_delivery',
        }).unwrap();
        dispatch(clearCart());
        toast.success('Order placed successfully!');
        const orderId = result?.data?.id;
        if (orderId) {
          router.push(`/enjoy/thanks-massage/${orderId}`);
        } else {
          router.push('/account/orders');
        }
      } catch (err: any) {
        toast.error(err?.data?.message ?? err?.message ?? 'Order failed');
      }
    } else {
      // ── SSL Commerce flow ───────────────────────────────────────────────────
      try {
        // 1. Create order
        const orderResult = await createOrder({
          ...basePayload,
          paymentMethod: 'ssl_commerce',
        }).unwrap();
        const orderId = orderResult?.data?.id;
        if (!orderId) throw new Error('Order creation failed');

        // 2. Initiate SSL payment
        const sslResult = await initiateSslPayment({ orderId }).unwrap();
        const gatewayUrl = sslResult?.data?.gatewayUrl;
        if (!gatewayUrl) throw new Error('SSL Commerce gateway URL not received');

        toast.success('Redirecting to payment gateway...');
        // 3. Redirect to SSL gateway (cart cleared on success page return)
        window.location.href = gatewayUrl;
      } catch (err: any) {
        toast.error(err?.data?.message ?? err?.message ?? 'Payment initiation failed');
      }
    }
  };

  const isSubmitting = isLoading || isSslLoading;

  if (products.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <ShoppingBag size={40} className="text-black-300" />
        <p className="text-black-500 text-sm">Your cart is empty.</p>
        <Link href="/enjoy/shipping-cart">
          <button className="bg-primary-500 text-white text-sm px-5 py-2.5 rounded-xl hover:bg-primary-600">
            Go to Cart
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-6 md:py-10">
      {/* Breadcrumb */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs text-black-400 mb-2">
          <Link href="/enjoy/shipping-cart" className="hover:text-primary-500 transition-colors">
            Cart
          </Link>
          <ChevronRight size={12} />
          <span className="text-primary-500 font-medium">Checkout</span>
        </div>
        <h1 className="text-2xl font-bold text-black-900">Checkout</h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* ── LEFT ── */}
        <div className="flex-1 w-full min-w-0 flex flex-col gap-5">
          {/* Default address banner */}
          {defaultAddress && (
            <div className="flex items-start gap-3 bg-primary-50 border border-primary-200 rounded-2xl px-4 py-3.5">
              <div className="w-8 h-8 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <MapPin size={15} className="text-primary-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-primary-700 mb-0.5">
                  Delivering to your saved address
                </p>
                <p className="text-xs text-primary-600 leading-relaxed truncate">
                  {defaultAddress.fullName} · {defaultAddress.phone}
                </p>
                <p className="text-xs text-primary-500 leading-relaxed line-clamp-1">
                  {defaultAddress.fullAddress}
                </p>
              </div>
              <Link
                href="/account/addresses"
                className="text-[11px] font-semibold text-primary-500 hover:text-primary-600 flex-shrink-0 underline underline-offset-2"
              >
                Change
              </Link>
            </div>
          )}

          {/* 1. Personal Info */}
          <SectionCard title="Personal Information" icon={User}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <FormInput
                  label="Full Name"
                  id="fullName"
                  placeholder="e.g. Rahim Uddin"
                  value={form.fullName}
                  onChange={set('fullName')}
                  error={errors.fullName}
                  icon={User}
                  required
                />
              </div>
              <FormInput
                label="Mobile Number"
                id="phone"
                type="number"
                placeholder="01XXXXXXXXX"
                value={form.phone}
                onChange={set('phone')}
                error={errors.phone}
                icon={Phone}
                required
              />
              <FormInput
                label="Email Address"
                id="email"
                type="email"
                placeholder="email@example.com (optional)"
                value={form.email}
                onChange={set('email')}
              />
              <div className="md:col-span-2">
                <FormInput
                  label="Full Address"
                  id="address"
                  placeholder="House no, road no, building name..."
                  value={form.address}
                  onChange={set('address')}
                  error={errors.address}
                  icon={Home}
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-medium text-black-600">Optional Note</label>
                <textarea
                  rows={3}
                  placeholder="Any special instructions for your order..."
                  value={form.orderNote}
                  onChange={set('orderNote')}
                  className="w-full mt-1.5 px-3.5 py-2.5 text-sm rounded-xl border border-black-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none resize-none text-black-700 placeholder-black-300"
                />
              </div>
            </div>
          </SectionCard>

          {/* Delivery Method */}
          <SectionCard title="Delivery Method" icon={Truck}>
            {deliveryCharges.length === 0 ? (
              <p className="text-sm text-black-400">Loading delivery options...</p>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {deliveryCharges.map((dc: any) => (
                  <label
                    key={dc.id}
                    className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                      delivery === dc.id
                        ? 'border-primary-400 bg-primary-100/40 ring-1 ring-primary-300'
                        : 'border-black-200 hover:border-black-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="delivery"
                        value={dc.id}
                        checked={delivery === dc.id}
                        onChange={() => setDelivery(dc.id)}
                        className="form-radio h-5 w-5 accent-primary-600"
                      />
                      <div>
                        <p className="text-sm font-medium text-black-700">{dc.name}</p>
                        {dc.description && (
                          <p className="text-[11px] text-black-400">{dc.description}</p>
                        )}
                      </div>
                    </div>
                    <span
                      className={`text-sm font-bold ${Number(dc.charge) === 0 ? 'text-green-600' : 'text-black-800'}`}
                    >
                      {Number(dc.charge) === 0 ? 'FREE' : `৳${Number(dc.charge).toFixed(0)}`}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </SectionCard>

          {/* Payment Method */}
          <SectionCard title="Payment Method" icon={CreditCard}>
            <div className="grid grid-cols-1 gap-3">
              {/* Cash on Delivery */}
              <label
                className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'cod'
                    ? 'border-primary-400 bg-primary-50 ring-1 ring-primary-300'
                    : 'border-black-200 hover:border-black-300 bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                  className="form-radio h-5 w-5 accent-primary-600"
                />
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                    <Banknote size={20} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-black-800">Cash on Delivery</p>
                    <p className="text-[11px] text-black-400">
                      পণ্য পেয়ে ক্যাশ দিন — Pay when you receive
                    </p>
                  </div>
                </div>
              </label>

              {/* SSL Commerce Online Payment */}
              <label
                className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'ssl'
                    ? 'border-primary-400 bg-primary-50 ring-1 ring-primary-300'
                    : 'border-black-200 hover:border-black-300 bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="ssl"
                  checked={paymentMethod === 'ssl'}
                  onChange={() => setPaymentMethod('ssl')}
                  className="form-radio h-5 w-5 accent-primary-600"
                />
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <CreditCard size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-black-800">Online Payment</p>
                    <p className="text-[11px] text-black-400">
                      SSL Commerz — Card, bKash, Nagad, Rocket ও অন্যান্য
                    </p>
                  </div>
                </div>
                {/* SSL Commerce badge */}
                <div className="flex-shrink-0">
                  <div className="bg-[#0070BA] text-white text-[9px] font-bold px-2 py-0.5 rounded">
                    SSLCommerz
                  </div>
                </div>
              </label>
            </div>

            {paymentMethod === 'ssl' && (
              <div className="mt-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
                <p className="text-[11px] text-blue-700">
                  আপনি SSL Commerz-এর নিরাপদ পেমেন্ট গেটওয়েতে redirect হবেন। Visa, MasterCard,
                  bKash, Nagad, Rocket সহ ৩০+ পেমেন্ট মেথড সাপোর্ট করে।
                </p>
              </div>
            )}
          </SectionCard>

          {/* Place Order button (mobile) */}
          <div className="lg:hidden">
            <button
              onClick={handlePlaceOrder}
              disabled={isSubmitting}
              className="w-full disabled:opacity-45 flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 active:scale-[.98] text-white font-semibold py-4 rounded-xl text-sm transition-all"
            >
              {isSubmitting
                ? paymentMethod === 'ssl'
                  ? 'Redirecting to payment...'
                  : 'Placing Order...'
                : paymentMethod === 'ssl'
                  ? 'Pay with SSL Commerce'
                  : 'Place Order (Cash on Delivery)'}
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* ── RIGHT ── */}
        <div className="w-full lg:w-80 flex-shrink-0 flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
          <OrderSummary deliveryPrice={deliveryPrice} couponCode={appliedCouponCode} />

          {/* Coupon */}
          <SectionCard title="Coupon Code" icon={Tag}>
            {!appliedCouponCode ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter coupon code"
                  value={couponInput}
                  onChange={(e) => {
                    setCouponInput(e.target.value);
                    setCouponError('');
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                  className="flex-1 min-w-0 px-3.5 py-2.5 text-sm rounded-xl border border-black-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none"
                />
                <button
                  onClick={handleApplyCoupon}
                  disabled={isCouponLoading || !couponInput.trim()}
                  className="shrink-0 px-4 sm:px-5 py-2.5 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors"
                >
                  {isCouponLoading ? 'Checking...' : 'Apply'}
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                <div className="flex items-center gap-2 text-sm text-green-700">
                  <CheckCircle2 size={15} />
                  <span>
                    <strong>{appliedCouponCode}</strong> — saving ৳{couponDiscount.toFixed(0)}
                  </span>
                </div>
                <button
                  onClick={handleRemoveCoupon}
                  className="text-xs text-red-500 hover:text-red-600 font-medium"
                >
                  Remove
                </button>
              </div>
            )}
            {couponError && <p className="mt-2 text-xs text-red-500">{couponError}</p>}
          </SectionCard>

          <button
            onClick={handlePlaceOrder}
            disabled={isSubmitting}
            className="hidden disabled:opacity-45 lg:flex w-full items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 active:scale-[.98] text-white font-semibold py-4 rounded-xl text-sm transition-all"
          >
            {isSubmitting
              ? paymentMethod === 'ssl'
                ? 'Redirecting...'
                : 'Placing Order...'
              : paymentMethod === 'ssl'
                ? 'Pay with SSL Commerce'
                : 'Place Order (COD)'}
            <ChevronRight size={16} />
          </button>
          <p className="hidden lg:block text-center text-[11px] text-black-400">
            By placing order you agree to our{' '}
            <Link href={'/pages/terms-and-conditions'} className="text-primary-500 cursor-pointer">
              Terms & Conditions
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
