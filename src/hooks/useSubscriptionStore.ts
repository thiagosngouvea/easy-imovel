import { create } from 'zustand';
import { PLANS } from '../data/plans';
import { Payment, PaymentIntent, PaymentMethod, Plan, Subscription } from '../types/Subscription';

interface SubscriptionState {
  currentSubscription: Subscription | null;
  plans: Plan[];
  payments: Payment[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  loadPlans: () => void;
  loadUserSubscription: (userId: string) => Promise<void>;
  createPaymentIntent: (planId: string, paymentMethod: PaymentMethod) => Promise<PaymentIntent | null>;
  confirmPayment: (paymentIntentId: string) => Promise<boolean>;
  cancelSubscription: (reason?: string) => Promise<boolean>;
  updatePaymentMethod: (paymentMethod: PaymentMethod) => Promise<boolean>;
  loadPaymentHistory: (userId: string) => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  currentSubscription: null,
  plans: [],
  payments: [],
  isLoading: false,
  error: null,

  loadPlans: () => {
    set({ plans: PLANS });
  },

  loadUserSubscription: async (userId: string) => {
    set({ isLoading: true, error: null });
    
    try {
      // Simular chamada de API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock subscription data - em produção, buscar do backend
      const mockSubscription: Subscription = {
        id: 'sub_123',
        userId,
        planId: 'premium-monthly',
        status: 'active',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        autoRenew: true,
        paymentMethod: 'credit_card',
        lastPaymentDate: new Date('2024-01-01'),
        nextPaymentDate: new Date('2024-02-01')
      };
      
      set({ 
        currentSubscription: mockSubscription,
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: 'Erro ao carregar assinatura',
        isLoading: false 
      });
    }
  },

  createPaymentIntent: async (planId: string, paymentMethod: PaymentMethod) => {
    set({ isLoading: true, error: null });
    
    try {
      // Simular chamada de API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const plan = PLANS.find(p => p.id === planId);
      if (!plan) {
        throw new Error('Plano não encontrado');
      }

      const paymentIntent: PaymentIntent = {
        id: `pi_${Date.now()}`,
        amount: plan.price,
        currency: 'BRL',
        paymentMethod,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutos
      };

       // Adicionar client secret do Stripe
       paymentIntent.clientSecret = `pi_${Date.now()}_secret_${Math.random()}`;
      
      set({ isLoading: false });
      return paymentIntent;
    } catch (error) {
      set({ 
        error: 'Erro ao criar intenção de pagamento',
        isLoading: false 
      });
      return null;
    }
  },

  confirmPayment: async (paymentIntentId: string) => {
    set({ isLoading: true, error: null });
    
    try {
      // Simular processamento do pagamento
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock success - em produção, confirmar com gateway de pagamento
      const newSubscription: Subscription = {
        id: `sub_${Date.now()}`,
        userId: 'current_user_id', // Pegar do auth store
        planId: 'premium-monthly',
        status: 'active',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
        autoRenew: true,
        paymentMethod: 'credit_card',
        lastPaymentDate: new Date(),
        nextPaymentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      };
      
      set({ 
        currentSubscription: newSubscription,
        isLoading: false 
      });
      
      return true;
    } catch (error) {
      set({ 
        error: 'Erro ao confirmar pagamento',
        isLoading: false 
      });
      return false;
    }
  },

  cancelSubscription: async (reason?: string) => {
    set({ isLoading: true, error: null });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const { currentSubscription } = get();
      if (currentSubscription) {
        const updatedSubscription: Subscription = {
          ...currentSubscription,
          status: 'cancelled',
          autoRenew: false,
          cancelledAt: new Date(),
          cancelReason: reason
        };
        
        set({ 
          currentSubscription: updatedSubscription,
          isLoading: false 
        });
      }
      
      return true;
    } catch (error) {
      set({ 
        error: 'Erro ao cancelar assinatura',
        isLoading: false 
      });
      return false;
    }
  },

  updatePaymentMethod: async (paymentMethod: PaymentMethod) => {
    set({ isLoading: true, error: null });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const { currentSubscription } = get();
      if (currentSubscription) {
        const updatedSubscription: Subscription = {
          ...currentSubscription,
          paymentMethod
        };
        
        set({ 
          currentSubscription: updatedSubscription,
          isLoading: false 
        });
      }
      
      return true;
    } catch (error) {
      set({ 
        error: 'Erro ao atualizar método de pagamento',
        isLoading: false 
      });
      return false;
    }
  },

  loadPaymentHistory: async (userId: string) => {
    set({ isLoading: true, error: null });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock payment history
      const mockPayments: Payment[] = [
        {
          id: 'pay_1',
          subscriptionId: 'sub_123',
          amount: 99.90,
          currency: 'BRL',
          status: 'completed',
          paymentMethod: 'credit_card',
          transactionId: 'txn_123456',
          createdAt: new Date('2024-01-01'),
          completedAt: new Date('2024-01-01')
        },
        {
          id: 'pay_2',
          subscriptionId: 'sub_123',
          amount: 99.90,
          currency: 'BRL',
          status: 'completed',
          paymentMethod: 'credit_card',
          transactionId: 'txn_123457',
          createdAt: new Date('2024-02-01'),
          completedAt: new Date('2024-02-01')
        }
      ];
      
      set({ 
        payments: mockPayments,
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: 'Erro ao carregar histórico de pagamentos',
        isLoading: false 
      });
    }
  },

  setLoading: (isLoading: boolean) => set({ isLoading }),
  
  setError: (error: string | null) => set({ error })
}));
