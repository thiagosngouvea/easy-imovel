import { PaymentIntent } from '../types/Subscription';

// Configurações do Stripe
const STRIPE_CONFIG = {
  publishableKey: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_...',
  apiUrl: 'https://api.stripe.com/v1'
};

export interface StripePaymentResponse {
  success: boolean;
  paymentIntent?: PaymentIntent;
  error?: string;
}

export interface StripeConfirmationResponse {
  success: boolean;
  transactionId?: string;
  error?: string;
}

export interface CardData {
  number: string;
  expMonth: number;
  expYear: number;
  cvc: string;
  holderName: string;
}

class StripeService {
  /**
   * Cria uma intenção de pagamento no Stripe
   */
  async createPaymentIntent(
    amount: number, 
    currency: string = 'brl',
    description?: string
  ): Promise<StripePaymentResponse> {
    try {
      // Em produção, fazer chamada para seu backend que criará o PaymentIntent no Stripe
      const response = await fetch('/api/stripe/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100), // Stripe usa centavos
          currency: currency.toLowerCase(),
          description,
          automatic_payment_methods: {
            enabled: true,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.client_secret) {
        const paymentIntent: PaymentIntent = {
          id: data.id,
          amount,
          currency,
          paymentMethod: 'credit_card',
          clientSecret: data.client_secret,
          expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutos
        };

        return { success: true, paymentIntent };
      }

      return { success: false, error: 'Falha ao criar intenção de pagamento' };
    } catch (error) {
      console.error('Erro ao criar PaymentIntent:', error);
      return { success: false, error: 'Erro de conexão com o Stripe' };
    }
  }

  /**
   * Confirma um pagamento com cartão de crédito usando Stripe
   */
  async confirmCardPayment(
    paymentIntentId: string,
    clientSecret: string,
    cardData: CardData
  ): Promise<StripeConfirmationResponse> {
    try {
      // Em produção, usar o SDK oficial do Stripe
      // import { confirmCardPayment } from '@stripe/stripe-js';
      
      const response = await fetch('/api/stripe/confirm-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payment_intent_id: paymentIntentId,
          client_secret: clientSecret,
          payment_method: {
            type: 'card',
            card: {
              number: cardData.number.replace(/\s/g, ''),
              exp_month: cardData.expMonth,
              exp_year: cardData.expYear,
              cvc: cardData.cvc,
            },
            billing_details: {
              name: cardData.holderName,
            },
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === 'succeeded') {
        return { 
          success: true, 
          transactionId: data.charges?.data?.[0]?.id || paymentIntentId 
        };
      } else if (data.status === 'requires_action') {
        // Pode precisar de autenticação 3D Secure
        return { 
          success: false, 
          error: 'Pagamento requer autenticação adicional' 
        };
      }

      return { 
        success: false, 
        error: data.last_payment_error?.message || 'Pagamento rejeitado' 
      };
    } catch (error) {
      console.error('Erro ao confirmar pagamento:', error);
      return { success: false, error: 'Erro ao processar pagamento' };
    }
  }

  /**
   * Recupera detalhes de um PaymentIntent
   */
  async retrievePaymentIntent(paymentIntentId: string): Promise<any> {
    try {
      const response = await fetch(`/api/stripe/payment-intent/${paymentIntentId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao recuperar PaymentIntent:', error);
      return null;
    }
  }

  /**
   * Cria uma assinatura recorrente no Stripe
   */
  async createSubscription(
    customerId: string,
    priceId: string,
    paymentMethodId: string
  ): Promise<{ success: boolean; subscriptionId?: string; error?: string }> {
    try {
      const response = await fetch('/api/stripe/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer_id: customerId,
          price_id: priceId,
          payment_method_id: paymentMethodId,
          expand: ['latest_invoice.payment_intent'],
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === 'active' || data.status === 'trialing') {
        return { success: true, subscriptionId: data.id };
      }

      return { success: false, error: 'Falha ao criar assinatura' };
    } catch (error) {
      console.error('Erro ao criar assinatura:', error);
      return { success: false, error: 'Erro ao criar assinatura' };
    }
  }

  /**
   * Cancela uma assinatura no Stripe
   */
  async cancelSubscription(subscriptionId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`/api/stripe/subscriptions/${subscriptionId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cancel_at_period_end: true, // Cancela no final do período atual
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.cancel_at_period_end === true) {
        return { success: true };
      }

      return { success: false, error: 'Falha ao cancelar assinatura' };
    } catch (error) {
      console.error('Erro ao cancelar assinatura:', error);
      return { success: false, error: 'Erro ao cancelar assinatura' };
    }
  }

  /**
   * Atualiza método de pagamento de uma assinatura
   */
  async updateSubscriptionPaymentMethod(
    subscriptionId: string,
    paymentMethodId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`/api/stripe/subscriptions/${subscriptionId}/payment-method`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          default_payment_method: paymentMethodId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.default_payment_method === paymentMethodId) {
        return { success: true };
      }

      return { success: false, error: 'Falha ao atualizar método de pagamento' };
    } catch (error) {
      console.error('Erro ao atualizar método de pagamento:', error);
      return { success: false, error: 'Erro ao atualizar método de pagamento' };
    }
  }

  /**
   * Cria um cliente no Stripe
   */
  async createCustomer(
    email: string,
    name: string,
    metadata?: Record<string, string>
  ): Promise<{ success: boolean; customerId?: string; error?: string }> {
    try {
      const response = await fetch('/api/stripe/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          name,
          metadata,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      return { success: true, customerId: data.id };
    } catch (error) {
      console.error('Erro ao criar cliente:', error);
      return { success: false, error: 'Erro ao criar cliente' };
    }
  }

  /**
   * Valida dados do cartão de crédito
   */
  validateCardData(cardData: CardData): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validar número do cartão (Luhn algorithm básico)
    const cardNumber = cardData.number.replace(/\s/g, '');
    if (!/^\d{13,19}$/.test(cardNumber)) {
      errors.push('Número do cartão inválido');
    }

    // Validar data de expiração
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    if (cardData.expYear < currentYear || 
        (cardData.expYear === currentYear && cardData.expMonth < currentMonth)) {
      errors.push('Cartão expirado');
    }

    if (cardData.expMonth < 1 || cardData.expMonth > 12) {
      errors.push('Mês de expiração inválido');
    }

    // Validar CVV
    if (!/^\d{3,4}$/.test(cardData.cvc)) {
      errors.push('CVV inválido');
    }

    // Validar nome
    if (!cardData.holderName.trim()) {
      errors.push('Nome do portador é obrigatório');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

export const stripeService = new StripeService();
