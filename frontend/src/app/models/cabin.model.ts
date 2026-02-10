export interface Cabin {
  id: number;
  ownerId: number;
  name: string;
  place: string;
  location?: string;
  servicesText?: string;
  phone?: string;
  lat?: number;
  lng?: number;
  priceSummerRsd: number;
  priceWinterRsd: number;
  pricePerNightRsd?: number;
  blockedUntil?: string;
  createdAt: string;
  updatedAt: string;
  images?: string[];
  reviews?: any[];
  ownerName?: string;
  status?: string;
  averageRating?: number;
  description?: string;
  capacity?: number;
  hasLowRatings?: boolean;
  lastThreeRatings?: number[];
}