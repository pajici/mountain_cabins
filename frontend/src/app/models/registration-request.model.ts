export interface RegistrationRequest {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: 'OWNER' | 'TOURIST';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: Date;
  rejectionReason?: string;
}