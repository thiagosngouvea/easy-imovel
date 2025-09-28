# Exemplo de Backend para Stripe - Easy Imóvel

Este documento fornece exemplos de implementação das APIs necessárias para integrar o Stripe com o Easy Imóvel.

## Configuração Inicial

### 1. Instalar Dependências (Node.js)

```bash
npm install stripe express cors helmet dotenv
npm install --save-dev @types/node typescript ts-node
```

### 2. Configuração do Stripe

```typescript
// config/stripe.ts
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export default stripe;
```

## APIs de Pagamento

### 1. Criar Payment Intent

```typescript
// routes/stripe/payment-intent.ts
import { Request, Response } from 'express';
import stripe from '../../config/stripe';

export const createPaymentIntent = async (req: Request, res: Response) => {
  try {
    const { amount, currency = 'brl', description } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Converter para centavos
      currency: currency.toLowerCase(),
      description,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        app: 'easy-imovel',
        user_id: req.user?.id || 'anonymous',
      },
    });

    res.json({
      id: paymentIntent.id,
      client_secret: paymentIntent.client_secret,
      amount: amount,
      currency: currency,
      status: paymentIntent.status,
    });
  } catch (error) {
    console.error('Erro ao criar PaymentIntent:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
};
```

### 2. Confirmar Pagamento

```typescript
// routes/stripe/confirm-payment.ts
import { Request, Response } from 'express';
import stripe from '../../config/stripe';

export const confirmPayment = async (req: Request, res: Response) => {
  try {
    const { payment_intent_id, payment_method } = req.body;

    const paymentIntent = await stripe.paymentIntents.confirm(payment_intent_id, {
      payment_method: {
        type: 'card',
        card: {
          number: payment_method.card.number,
          exp_month: payment_method.card.exp_month,
          exp_year: payment_method.card.exp_year,
          cvc: payment_method.card.cvc,
        },
        billing_details: payment_method.billing_details,
      },
    });

    res.json({
      id: paymentIntent.id,
      status: paymentIntent.status,
      charges: paymentIntent.charges,
      last_payment_error: paymentIntent.last_payment_error,
    });
  } catch (error) {
    console.error('Erro ao confirmar pagamento:', error);
    res.status(500).json({ 
      error: 'Erro ao processar pagamento',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
};
```

### 3. Criar Cliente

```typescript
// routes/stripe/customers.ts
import { Request, Response } from 'express';
import stripe from '../../config/stripe';

export const createCustomer = async (req: Request, res: Response) => {
  try {
    const { email, name, metadata } = req.body;

    const customer = await stripe.customers.create({
      email,
      name,
      metadata: {
        app: 'easy-imovel',
        ...metadata,
      },
    });

    res.json({
      id: customer.id,
      email: customer.email,
      name: customer.name,
      created: customer.created,
    });
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    res.status(500).json({ 
      error: 'Erro ao criar cliente',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
};
```

### 4. Criar Assinatura

```typescript
// routes/stripe/subscriptions.ts
import { Request, Response } from 'express';
import stripe from '../../config/stripe';

export const createSubscription = async (req: Request, res: Response) => {
  try {
    const { customer_id, price_id, payment_method_id } = req.body;

    // Anexar método de pagamento ao cliente
    await stripe.paymentMethods.attach(payment_method_id, {
      customer: customer_id,
    });

    // Definir como método padrão
    await stripe.customers.update(customer_id, {
      invoice_settings: {
        default_payment_method: payment_method_id,
      },
    });

    // Criar assinatura
    const subscription = await stripe.subscriptions.create({
      customer: customer_id,
      items: [{ price: price_id }],
      default_payment_method: payment_method_id,
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        app: 'easy-imovel',
        user_id: req.user?.id || 'unknown',
      },
    });

    res.json({
      id: subscription.id,
      status: subscription.status,
      current_period_start: subscription.current_period_start,
      current_period_end: subscription.current_period_end,
      latest_invoice: subscription.latest_invoice,
    });
  } catch (error) {
    console.error('Erro ao criar assinatura:', error);
    res.status(500).json({ 
      error: 'Erro ao criar assinatura',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
};
```

### 5. Cancelar Assinatura

```typescript
// routes/stripe/cancel-subscription.ts
import { Request, Response } from 'express';
import stripe from '../../config/stripe';

export const cancelSubscription = async (req: Request, res: Response) => {
  try {
    const { subscriptionId } = req.params;
    const { cancel_at_period_end = true } = req.body;

    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end,
      metadata: {
        cancelled_by: req.user?.id || 'system',
        cancelled_at: new Date().toISOString(),
      },
    });

    res.json({
      id: subscription.id,
      status: subscription.status,
      cancel_at_period_end: subscription.cancel_at_period_end,
      canceled_at: subscription.canceled_at,
    });
  } catch (error) {
    console.error('Erro ao cancelar assinatura:', error);
    res.status(500).json({ 
      error: 'Erro ao cancelar assinatura',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
};
```

## Webhook Handler

```typescript
// routes/stripe/webhook.ts
import { Request, Response } from 'express';
import stripe from '../../config/stripe';

export const handleWebhook = async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return res.status(400).send(`Webhook Error: ${err}`);
  }

  // Processar eventos
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      await handlePaymentSuccess(paymentIntent);
      break;

    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object as Stripe.PaymentIntent;
      await handlePaymentFailure(failedPayment);
      break;

    case 'invoice.payment_succeeded':
      const invoice = event.data.object as Stripe.Invoice;
      await handleInvoicePaymentSuccess(invoice);
      break;

    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionChange(subscription);
      break;

    case 'customer.subscription.deleted':
      const deletedSubscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionCancellation(deletedSubscription);
      break;

    default:
      console.log(`Evento não tratado: ${event.type}`);
  }

  res.json({ received: true });
};

// Funções auxiliares para processar eventos
async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  console.log('Pagamento bem-sucedido:', paymentIntent.id);
  // Atualizar banco de dados, enviar email de confirmação, etc.
}

async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
  console.log('Pagamento falhou:', paymentIntent.id);
  // Notificar usuário, tentar novamente, etc.
}

async function handleInvoicePaymentSuccess(invoice: Stripe.Invoice) {
  console.log('Fatura paga:', invoice.id);
  // Ativar/renovar assinatura no banco de dados
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  console.log('Assinatura alterada:', subscription.id);
  // Atualizar status da assinatura no banco de dados
}

async function handleSubscriptionCancellation(subscription: Stripe.Subscription) {
  console.log('Assinatura cancelada:', subscription.id);
  // Desativar recursos premium, enviar email de despedida
}
```

## Configuração das Rotas

```typescript
// routes/index.ts
import express from 'express';
import { createPaymentIntent } from './stripe/payment-intent';
import { confirmPayment } from './stripe/confirm-payment';
import { createCustomer } from './stripe/customers';
import { createSubscription, cancelSubscription } from './stripe/subscriptions';
import { handleWebhook } from './stripe/webhook';

const router = express.Router();

// Stripe routes
router.post('/stripe/create-payment-intent', createPaymentIntent);
router.post('/stripe/confirm-payment', confirmPayment);
router.post('/stripe/customers', createCustomer);
router.post('/stripe/create-subscription', createSubscription);
router.post('/stripe/subscriptions/:subscriptionId/cancel', cancelSubscription);

// Webhook (deve usar raw body)
router.post('/stripe/webhook', express.raw({ type: 'application/json' }), handleWebhook);

export default router;
```

## Middleware de Segurança

```typescript
// middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, process.env.JWT_SECRET!, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};
```

## Exemplo de Uso Completo

```typescript
// app.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import routes from './routes';
import { authenticateToken } from './middleware/auth';

dotenv.config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());

// Autenticação (exceto webhook)
app.use('/api', (req, res, next) => {
  if (req.path === '/stripe/webhook') {
    return next();
  }
  return authenticateToken(req, res, next);
});

// Rotas
app.use('/api', routes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
```

## Variáveis de Ambiente

```env
# .env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
JWT_SECRET=seu_jwt_secret_aqui
DATABASE_URL=sua_url_do_banco
PORT=3000
```

## Testes

```typescript
// tests/stripe.test.ts
import request from 'supertest';
import app from '../app';

describe('Stripe Integration', () => {
  test('Criar Payment Intent', async () => {
    const response = await request(app)
      .post('/api/stripe/create-payment-intent')
      .send({
        amount: 99.90,
        currency: 'brl',
        description: 'Plano Premium Mensal'
      })
      .expect(200);

    expect(response.body).toHaveProperty('client_secret');
    expect(response.body.amount).toBe(99.90);
  });
});
```

Este exemplo fornece uma base sólida para implementar a integração com Stripe no backend do Easy Imóvel.
