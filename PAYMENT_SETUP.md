# Configuração do Sistema de Pagamentos - Easy Imóvel (Stripe)

## Dependências Necessárias

Para implementar o sistema de pagamentos com Stripe, você precisará instalar as seguintes dependências:

```bash
# Para integração com Stripe
npm install @stripe/stripe-react-native @stripe/stripe-js

# Para manipulação de datas
npm install date-fns

# Para validação de cartão de crédito
npm install card-validator

# Para formatação de moeda
npm install react-native-currency-input
```

## Configuração do Stripe

### 1. Criar Conta no Stripe

1. Crie uma conta no [Stripe](https://stripe.com)
2. Acesse o Dashboard e vá em "Developers" > "API keys"
3. Obtenha suas chaves de API:
   - **Publishable Key** (pk_test_... para teste, pk_live_... para produção)
   - **Secret Key** (sk_test_... para teste, sk_live_... para produção)

### 2. Configurar Variáveis de Ambiente

```env
# Chaves do Stripe
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# Webhook endpoint secret (para validar webhooks)
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 3. Configurar Webhooks

1. No Dashboard do Stripe, vá em "Developers" > "Webhooks"
2. Clique em "Add endpoint"
3. Configure a URL: `https://seudominio.com/api/stripe/webhook`
4. Selecione os eventos:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`

## Backend APIs Necessárias

Você precisará implementar as seguintes rotas no seu backend:

### Stripe APIs
- `POST /api/stripe/create-payment-intent` - Criar intenção de pagamento
- `POST /api/stripe/confirm-payment` - Confirmar pagamento
- `POST /api/stripe/create-subscription` - Criar assinatura recorrente
- `POST /api/stripe/customers` - Criar cliente no Stripe
- `GET /api/stripe/payment-intent/:id` - Recuperar detalhes do pagamento
- `POST /api/stripe/subscriptions/:id/cancel` - Cancelar assinatura
- `PUT /api/stripe/subscriptions/:id/payment-method` - Atualizar método de pagamento

### Webhooks
- `POST /api/stripe/webhook` - Receber eventos do Stripe (obrigatório para produção)

## Estrutura de Banco de Dados

### Tabela: subscriptions
```sql
CREATE TABLE subscriptions (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  plan_id VARCHAR(255) NOT NULL,
  status ENUM('pending', 'active', 'cancelled', 'expired', 'failed') NOT NULL,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  auto_renew BOOLEAN DEFAULT TRUE,
  payment_method ENUM('credit_card') NOT NULL,
  last_payment_date TIMESTAMP,
  next_payment_date TIMESTAMP,
  cancelled_at TIMESTAMP NULL,
  cancel_reason TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Tabela: payments
```sql
CREATE TABLE payments (
  id VARCHAR(255) PRIMARY KEY,
  subscription_id VARCHAR(255) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'BRL',
  status ENUM('pending', 'completed', 'failed', 'refunded') NOT NULL,
  payment_method ENUM('credit_card') NOT NULL,
  transaction_id VARCHAR(255),
  gateway_response JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  failure_reason TEXT NULL,
  FOREIGN KEY (subscription_id) REFERENCES subscriptions(id)
);
```

### Tabela: plans
```sql
CREATE TABLE plans (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type ENUM('basic', 'premium', 'enterprise') NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  billing_cycle ENUM('monthly', 'yearly') NOT NULL,
  max_properties INT NOT NULL,
  max_photos INT NOT NULL,
  priority_support BOOLEAN DEFAULT FALSE,
  analytics BOOLEAN DEFAULT FALSE,
  custom_branding BOOLEAN DEFAULT FALSE,
  lead_management BOOLEAN DEFAULT FALSE,
  features JSON,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Configuração de Segurança

### 1. Validação de Webhooks
- Sempre validar a assinatura dos webhooks
- Usar HTTPS em produção
- Implementar rate limiting

### 2. Dados Sensíveis
- Nunca armazenar dados completos do cartão
- Usar tokenização para métodos de pagamento
- Criptografar dados sensíveis

### 3. PCI Compliance
- Para cartões de crédito, seguir padrões PCI DSS
- Usar SDKs oficiais dos gateways
- Não processar dados de cartão no frontend

## Funcionalidades Implementadas

✅ **Modelos de Dados**
- Tipos TypeScript para planos, assinaturas e pagamentos
- Store Zustand para gerenciamento de estado

✅ **Telas de Interface**
- Seleção de planos com preços mensais/anuais
- Processamento de pagamentos (cartão, PIX, boleto)
- Gerenciamento de assinaturas

✅ **Integração com Menu**
- Opções de planos e assinatura no menu principal
- Acesso restrito para corretores e imobiliárias

✅ **Serviços de Pagamento**
- Abstração para múltiplos gateways
- Tratamento de erros e validações

## Próximos Passos

1. **Instalar Dependências**: Execute os comandos npm install acima
2. **Configurar Backend**: Implemente as APIs necessárias
3. **Configurar Gateways**: Obtenha credenciais e configure webhooks
4. **Testar Fluxos**: Teste todos os cenários de pagamento
5. **Deploy**: Configure ambiente de produção com HTTPS

## Exemplo de Uso

```typescript
import { useSubscriptionStore } from '../hooks/useSubscriptionStore';

const { createPaymentIntent, confirmPayment } = useSubscriptionStore();

// Criar intenção de pagamento
const intent = await createPaymentIntent('premium-monthly', 'credit_card');

// Confirmar pagamento
if (intent) {
  const success = await confirmPayment(intent.id);
  if (success) {
    // Redirecionar para tela de sucesso
  }
}
```

## Suporte

Para dúvidas sobre implementação:
- Documentação do Stripe: https://stripe.com/docs
- Documentação do Mercado Pago: https://developers.mercadopago.com
- React Native: https://reactnative.dev
