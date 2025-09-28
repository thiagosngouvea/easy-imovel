export type PlanType = 'basic' | 'premium' | 'enterprise';
export type PaymentStatus = 'pending' | 'active' | 'cancelled' | 'expired' | 'failed';
export type PaymentMethod = 'credit_card';

export interface Plan {
  id: string;
  name: string;
  type: PlanType;
  price: number;
  billingCycle: 'monthly' | 'yearly';
  features: string[];
  maxProperties: number;
  maxPhotos: number;
  prioritySupport: boolean;
  analytics: boolean;
  customBranding: boolean;
  leadManagement: boolean;
  popular?: boolean;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: PaymentStatus;
  startDate: Date;
  endDate: Date;
  autoRenew: boolean;
  paymentMethod: PaymentMethod;
  lastPaymentDate?: Date;
  nextPaymentDate?: Date;
  cancelledAt?: Date;
  cancelReason?: string;
}

export interface Payment {
  id: string;
  subscriptionId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: PaymentMethod;
  transactionId?: string;
  createdAt: Date;
  completedAt?: Date;
  failureReason?: string;
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  clientSecret: string; // Stripe client secret
  expiresAt: Date;
}
