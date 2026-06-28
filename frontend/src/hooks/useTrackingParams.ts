'use client';

import { useEffect } from 'react';
import Cookies from 'js-cookie';
import { useSearchParams } from 'next/navigation';

export interface TrackingParams {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  clickId?: string;
  fbp?: string;
  fbc?: string;
}

const COOKIE_EXPIRES = 30; // days
const COOKIE_KEY = 'kc_tracking';

function getFromCookies(): TrackingParams {
  try {
    const raw = Cookies.get(COOKIE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveToCoookies(params: TrackingParams): void {
  Cookies.set(COOKIE_KEY, JSON.stringify(params), {
    expires: COOKIE_EXPIRES,
    sameSite: 'lax',
  });
}

function getFbpFromCookie(): string | undefined {
  return Cookies.get('_fbp');
}

function getFbcFromParam(searchParams: URLSearchParams, fbclid?: string): string | undefined {
  if (!fbclid) return Cookies.get('_fbc');
  const ts = Math.floor(Date.now() / 1000);
  return `fb.1.${ts}.${fbclid}`;
}

export function useTrackingParams(): void {
  const searchParams = useSearchParams();

  useEffect(() => {
    const utmSource = searchParams.get('utm_source') ?? undefined;
    const utmMedium = searchParams.get('utm_medium') ?? undefined;
    const utmCampaign = searchParams.get('utm_campaign') ?? undefined;
    const utmContent = searchParams.get('utm_content') ?? undefined;
    const utmTerm = searchParams.get('utm_term') ?? undefined;
    const fbclid = searchParams.get('fbclid') ?? undefined;
    const gclid = searchParams.get('gclid') ?? undefined;
    const clickId = fbclid ?? gclid;

    const hasNewParams = utmSource || utmMedium || utmCampaign || clickId;
    if (!hasNewParams) return;

    const existing = getFromCookies();
    const updated: TrackingParams = {
      ...existing,
      ...(utmSource && { utmSource }),
      ...(utmMedium && { utmMedium }),
      ...(utmCampaign && { utmCampaign }),
      ...(utmContent && { utmContent }),
      ...(utmTerm && { utmTerm }),
      ...(clickId && { clickId }),
      fbp: getFbpFromCookie(),
      fbc: getFbcFromParam(searchParams as any, fbclid),
    };

    saveToCoookies(updated);
  }, [searchParams]);
}

export function getStoredTrackingParams(): TrackingParams {
  const stored = getFromCookies();
  return {
    ...stored,
    fbp: stored.fbp ?? getFbpFromCookie(),
    fbc: stored.fbc ?? Cookies.get('_fbc'),
  };
}
