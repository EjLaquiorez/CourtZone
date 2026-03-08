// Stripe payment integration service
import { apiClient } from '@/lib/api';

export interface PaymentIntent {
  id: string;
  clientSecret: string;
  amount: number;
  currency: string;
  status: 'requires_payment_method' | 'requires_confirmation' | 'requires_action' | 'processing' | 'succeeded' | 'canceled';
}

export interface Subscription {
  id: string;
  customerId: string;
  priceId: string;
  status: 'active' | 'canceled' | 'incomplete' | 'past_due' | 'trialing';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
}

export interface PaymentMethod {
  id: string;
  type: 'card';
  card: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  };
  isDefault: boolean;
}

export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  popular?: boolean;
}

// Mock pricing plans
export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'Perfect for casual players',
    price: 0,
    currency: 'usd',
    interval: 'month',
    features: [
      'Join up to 5 games per month',
      'Basic court search',
      'Team creation (1 team)',
      'Basic stats tracking',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'For serious players',
    price: 9.99,
    currency: 'usd',
    interval: 'month',
    features: [
      'Unlimited games',
      'Advanced court search with filters',
      'Multiple team creation',
      'Advanced stats and analytics',
      'Priority game matching',
      'Tournament entry discounts',
    ],
    popular: true,
  },
  {
    id: 'elite',
    name: 'Elite',
    description: 'For competitive teams',
    price: 19.99,
    currency: 'usd',
    interval: 'month',
    features: [
      'Everything in Pro',
      'Team management tools',
      'Custom team branding',
      'Advanced tournament features',
      'Performance coaching insights',
      'Priority customer support',
    ],
  },
];

export const paymentService = {
  // Create payment intent for one-time payments
  async createPaymentIntent(amount: number, currency: string = 'usd'): Promise<PaymentIntent> {
    const response = await apiClient.post<PaymentIntent>('/payments/create-intent', {
      amount,
      currency,
    });
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to create payment intent');
  },

  // Create subscription
  async createSubscription(priceId: string, paymentMethodId?: string): Promise<Subscription> {
    const response = await apiClient.post<Subscription>('/payments/create-subscription', {
      priceId,
      paymentMethodId,
    });
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to create subscription');
  },

  // Cancel subscription
  async cancelSubscription(subscriptionId: string, cancelAtPeriodEnd: boolean = true): Promise<Subscription> {
    const response = await apiClient.post<Subscription>(`/payments/subscriptions/${subscriptionId}/cancel`, {
      cancelAtPeriodEnd,
    });
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to cancel subscription');
  },

  // Get user's current subscription
  async getCurrentSubscription(): Promise<Subscription | null> {
    try {
      const response = await apiClient.get<Subscription>('/payments/subscription');
      return response.success && response.data ? response.data : null;
    } catch (error) {
      console.error('Failed to get current subscription:', error);
      return null;
    }
  },

  // Get payment methods
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    const response = await apiClient.get<PaymentMethod[]>('/payments/payment-methods');
    
    if (response.success && response.data) {
      return response.data;
    }
    
    return [];
  },

  // Add payment method
  async addPaymentMethod(paymentMethodId: string): Promise<PaymentMethod> {
    const response = await apiClient.post<PaymentMethod>('/payments/payment-methods', {
      paymentMethodId,
    });
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to add payment method');
  },

  // Remove payment method
  async removePaymentMethod(paymentMethodId: string): Promise<void> {
    const response = await apiClient.delete(`/payments/payment-methods/${paymentMethodId}`);
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to remove payment method');
    }
  },

  // Set default payment method
  async setDefaultPaymentMethod(paymentMethodId: string): Promise<void> {
    const response = await apiClient.post(`/payments/payment-methods/${paymentMethodId}/set-default`);
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to set default payment method');
    }
  },

  // Get billing history
  async getBillingHistory(page: number = 1, limit: number = 10): Promise<{
    invoices: Array<{
      id: string;
      amount: number;
      currency: string;
      status: string;
      date: Date;
      description: string;
      downloadUrl?: string;
    }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const response = await apiClient.get('/payments/billing-history', { page, limit });
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to get billing history');
  },

  // Process tournament entry payment
  async payTournamentEntry(tournamentId: string, amount: number): Promise<PaymentIntent> {
    const response = await apiClient.post<PaymentIntent>('/payments/tournament-entry', {
      tournamentId,
      amount,
    });
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to process tournament entry payment');
  },

  // Get pricing plans
  getPricingPlans(): PricingPlan[] {
    return PRICING_PLANS;
  },

  // Format price for display
  formatPrice(amount: number, currency: string = 'usd'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount);
  },
};
