export interface User {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'ADMIN' | 'OWNER' | 'TOURIST';
  active: boolean;
  gender?: 'M' | 'Ž';
  address?: string;
  phone?: string;
  profileImageId?: number;
  profileImageUrl?: string;
  creditCardNumber?: string;
}