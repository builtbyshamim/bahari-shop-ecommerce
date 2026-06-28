import { Suspense } from 'react';
import PaymentResultPage from '@/features/enjoy/PaymentResultPage';

export default function PaymentCancelPage() {
  return (
    <Suspense>
      <PaymentResultPage status="cancel" />
    </Suspense>
  );
}
