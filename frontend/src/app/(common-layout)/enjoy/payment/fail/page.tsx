import { Suspense } from 'react';
import PaymentResultPage from '@/features/enjoy/PaymentResultPage';

export default function PaymentFailPage() {
  return (
    <Suspense>
      <PaymentResultPage status="fail" />
    </Suspense>
  );
}
