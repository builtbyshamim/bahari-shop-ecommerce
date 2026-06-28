'use client';

import { useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useGetOrderByIdQuery, useGetOrderByIdPublicQuery } from '@/redux/api/orderApi';
import OrderCompletePage from '@/features/enjoy/OrderCompletePage';
import NotFoundPage from '@/components/ui/NotFoundPage';
import { useAppDispatch } from '@/redux/hooks';
import { clearCart } from '@/redux/features/cartSlice';

export default function OrderCompleteRoute() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();

  // Clear cart when returning from SSL Commerce successful payment
  useEffect(() => {
    if (searchParams.get('payment') === 'ssl_success') {
      dispatch(clearCart());
    }
  }, []);

  const { data: authData, isLoading: authLoading, isError: authError } = useGetOrderByIdQuery(id, { skip: !id });
  const { data: publicData, isLoading: publicLoading } = useGetOrderByIdPublicQuery(id, { skip: !id || !authError });

  const isLoading = authLoading || (authError && publicLoading);
  const isError = authError && !publicData;
  const order = authData?.data ?? publicData?.data;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black-100/60 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="animate-spin text-primary-400" />
          <p className="text-sm text-black-500 font-medium">Loading your order…</p>
        </div>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <NotFoundPage
        title="অর্ডার পাওয়া যায়নি"
        message="এই অর্ডারটি পাওয়া যায়নি অথবা এটি আপনার অ্যাকাউন্টের সাথে সম্পর্কিত নয়।"
        showSearch={false}
      />
    );
  }

  return <OrderCompletePage order={order} />;
}
