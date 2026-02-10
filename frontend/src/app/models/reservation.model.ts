export interface Reservation {
  id: number;
  cabinId: number;
  touristId: number;
  startDate: string;
  endDate: string;
  adults: number;
  children: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';
  ownerComment?: string;
  touristNote?: string;
  totalPriceRsd: number;
  cardType?: 'VISA' | 'MASTERCARD' | 'DINERS';
  cardLast4?: string;
  createdAt: string;
  cabinName?: string;
  touristName?: string;
  cabinLocation?: string;
  isReviewed?: boolean;
}