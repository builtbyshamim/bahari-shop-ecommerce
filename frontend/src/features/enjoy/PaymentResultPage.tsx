'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { XCircle, AlertCircle, ShoppingBag, RotateCcw } from 'lucide-react';

interface Props {
  status: 'fail' | 'cancel';
}

const PaymentResultPage = ({ status }: Props) => {
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason');

  const isFail = status === 'fail';

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-black-200 p-8 flex flex-col items-center text-center gap-5">
        {/* Icon */}
        <div
          className={`w-20 h-20 rounded-full flex items-center justify-center ${
            isFail ? 'bg-red-100' : 'bg-yellow-100'
          }`}
        >
          {isFail ? (
            <XCircle size={40} className="text-red-500" />
          ) : (
            <AlertCircle size={40} className="text-yellow-500" />
          )}
        </div>

        {/* Title */}
        <div>
          <h1 className="text-xl font-bold text-black-900 mb-1">
            {isFail ? 'Payment Failed' : 'Payment Cancelled'}
          </h1>
          <p className="text-sm text-black-500">
            {isFail
              ? 'আপনার পেমেন্ট সফল হয়নি। আবার চেষ্টা করুন।'
              : 'আপনি পেমেন্ট বাতিল করেছেন।'}
          </p>
          {reason && (
            <p className="mt-2 text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {decodeURIComponent(reason)}
            </p>
          )}
        </div>

        {/* Info box */}
        <div className="w-full bg-black-50 border border-black-100 rounded-xl px-4 py-3 text-left">
          <p className="text-xs text-black-600 leading-relaxed">
            {isFail
              ? 'আপনার অর্ডারটি সিস্টেমে সেভ আছে। অর্ডার ট্র্যাক করে পুনরায় পেমেন্ট করতে পারবেন অথবা Cash on Delivery তে অর্ডার করুন।'
              : 'আপনার অর্ডারটি তৈরি হয়েছে কিন্তু পেমেন্ট হয়নি। আপনি চাইলে আবার চেষ্টা করতে পারেন।'}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <Link href="/enjoy/checkout" className="flex-1">
            <button className="w-full flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 rounded-xl text-sm transition-colors">
              <RotateCcw size={15} />
              Try Again
            </button>
          </Link>
          <Link href="/account/orders" className="flex-1">
            <button className="w-full flex items-center justify-center gap-2 bg-white border border-black-200 hover:border-black-300 text-black-700 font-semibold py-3 rounded-xl text-sm transition-colors">
              <ShoppingBag size={15} />
              My Orders
            </button>
          </Link>
        </div>

        <Link href="/" className="text-xs text-black-400 hover:text-primary-500 transition-colors">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
};

export default PaymentResultPage;
