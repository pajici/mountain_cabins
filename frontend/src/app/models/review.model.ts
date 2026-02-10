export interface Review {
  id: number;
  reservationId: number;
  rating: number;
  comment?: string;
  createdAt: string;
}