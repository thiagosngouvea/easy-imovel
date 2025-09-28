import { PaymentIntent, PaymentMethod } from '../types/Subscription';

// Configurações dos gateways de pagamento
const STRIPE_CONFIG = {
  publishableKey: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_...',
  apiUrl: 'https://api.stripe.com/v1'
};

const MERCADO_PAGO_CONFIG = {
  publicKey: process.env.EXPO_PUBLIC_MERCADO_PAGO_PUBLIC_KEY || 'TEST-...',
  apiUrl: 'https://api.mercadopago.com/v1'
};

export interface PaymentGatewayResponse {
  success: boolean;
  paymentIntent?: PaymentIntent;
  error?: string;
}

export interface PaymentConfirmationResponse {
  success: boolean;
  transactionId?: string;
  error?: string;
}

class PaymentService {
  /**
   * Cria uma intenção de pagamento com Stripe
   */
  async createStripePaymentIntent(
    amount: number, 
    currency: string = 'brl',
    paymentMethod: PaymentMethod = 'credit_card'
  ): Promise<PaymentGatewayResponse> {
    try {
      // Em produção, fazer chamada para seu backend que criará o PaymentIntent no Stripe
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100), // Stripe usa centavos
          currency,
          payment_method_types: ['card'],
        }),
      });

      const data = await response.json();

      if (data.client_secret) {
        const paymentIntent: PaymentIntent = {
          id: data.id,
          amount,
          currency,
          paymentMethod,
          clientSecret: data.client_secret,
          expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutos
        };

        return { success: true, paymentIntent };
      }

      return { success: false, error: 'Falha ao criar intenção de pagamento' };
    } catch (error) {
      console.error('Erro ao criar PaymentIntent:', error);
      return { success: false, error: 'Erro de conexão com o gateway de pagamento' };
    }
  }

  /**
   * Cria um pagamento PIX com Mercado Pago
   */
  async createMercadoPagoPix(
    amount: number,
    description: string,
    userEmail: string
  ): Promise<PaymentGatewayResponse> {
    try {
      // Em produção, fazer chamada para seu backend
      const response = await fetch('/api/mercadopago/create-pix', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transaction_amount: amount,
          description,
          payment_method_id: 'pix',
          payer: {
            email: userEmail,
          },
        }),
      });

      const data = await response.json();

      if (data.point_of_interaction?.transaction_data?.qr_code) {
        const paymentIntent: PaymentIntent = {
          id: data.id.toString(),
          amount,
          currency: 'BRL',
          paymentMethod: 'pix',
          pixCode: data.point_of_interaction.transaction_data.qr_code,
          expiresAt: new Date(data.date_of_expiration),
        };

        return { success: true, paymentIntent };
      }

      return { success: false, error: 'Falha ao gerar código PIX' };
    } catch (error) {
      console.error('Erro ao criar PIX:', error);
      return { success: false, error: 'Erro de conexão com o Mercado Pago' };
    }
  }

  /**
   * Confirma um pagamento com cartão de crédito
   */
  async confirmCardPayment(
    paymentIntentId: string,
    cardData: {
      number: string;
      expMonth: number;
      expYear: number;
      cvc: string;
      holderName: string;
    }
  ): Promise<PaymentConfirmationResponse> {
    try {
      // Em produção, usar SDK do Stripe ou fazer chamada para backend
      const response = await fetch('/api/confirm-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payment_intent_id: paymentIntentId,
          payment_method: {
            type: 'card',
            card: cardData,
          },
        }),
      });

      const data = await response.json();

      if (data.status === 'succeeded') {
        return { 
          success: true, 
          transactionId: data.charges?.data?.[0]?.id || paymentIntentId 
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
   * Verifica o status de um pagamento PIX
   */
  async checkPixPaymentStatus(paymentId: string): Promise<PaymentConfirmationResponse> {
    try {
      const response = await fetch(`/api/mercadopago/payment/${paymentId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.status === 'approved') {
        return { 
          success: true, 
          transactionId: data.id.toString() 
        };
      } else if (data.status === 'pending') {
        return { success: false, error: 'Pagamento pendente' };
      }

      return { success: false, error: 'Pagamento não aprovado' };
    } catch (error) {
      console.error('Erro ao verificar status do PIX:', error);
      return { success: false, error: 'Erro ao verificar pagamento' };
    }
  }

  /**
   * Gera um boleto bancário
   */
  async createBankSlip(
    amount: number,
    description: string,
    userEmail: string,
    userName: string,
    dueDate: Date
  ): Promise<PaymentGatewayResponse> {
    try {
      const response = await fetch('/api/create-boleto', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          description,
          payer: {
            email: userEmail,
            name: userName,
          },
          due_date: dueDate.toISOString(),
        }),
      });

      const data = await response.json();

      if (data.boleto_url) {
        const paymentIntent: PaymentIntent = {
          id: data.id,
          amount,
          currency: 'BRL',
          paymentMethod: 'bank_slip',
          boletoUrl: data.boleto_url,
          expiresAt: dueDate,
        };

        return { success: true, paymentIntent };
      }

      return { success: false, error: 'Falha ao gerar boleto' };
    } catch (error) {
      console.error('Erro ao criar boleto:', error);
      return { success: false, error: 'Erro ao gerar boleto' };
    }
  }

  /**
   * Cancela uma assinatura
   */
  async cancelSubscription(subscriptionId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`/api/subscriptions/${subscriptionId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.status === 'canceled') {
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
      const response = await fetch(`/api/subscriptions/${subscriptionId}/payment-method`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payment_method: paymentMethodId,
        }),
      });

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
}

export const paymentService = new PaymentService();
