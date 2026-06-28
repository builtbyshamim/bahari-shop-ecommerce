'use client';

import { Suspense } from 'react';
import { useTrackingParams } from '@/hooks/useTrackingParams';

function TrackingCapture() {
  useTrackingParams();
  return null;
}

export default function TrackingInitializer() {
  return (
    <Suspense fallback={null}>
      <TrackingCapture />
    </Suspense>
  );
}
