export interface TrackingJobData {
  orderNumber: string;
  totalPrice: number;
  createdAt: string;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  clickId: string | null;
  fbp: string | null;
  fbc: string | null;
  address: {
    email?: string | null;
    phone?: string | null;
  } | null;
  items: Array<{ productId: string; quantity: number }>;
}
