import { Plan } from '../types/Subscription';

export const PLANS: Plan[] = [
  {
    id: 'basic-monthly',
    name: 'Básico',
    type: 'basic',
    price: 49.90,
    billingCycle: 'monthly',
    maxProperties: 10,
    maxPhotos: 5,
    prioritySupport: false,
    analytics: false,
    customBranding: false,
    leadManagement: false,
    features: [
      'Até 10 imóveis ativos',
      'Até 5 fotos por imóvel',
      'Suporte por email',
      'Painel básico',
      'Filtros de busca'
    ]
  },
  {
    id: 'premium-monthly',
    name: 'Premium',
    type: 'premium',
    price: 99.90,
    billingCycle: 'monthly',
    maxProperties: 50,
    maxPhotos: 15,
    prioritySupport: true,
    analytics: true,
    customBranding: false,
    leadManagement: true,
    popular: true,
    features: [
      'Até 50 imóveis ativos',
      'Até 15 fotos por imóvel',
      'Suporte prioritário',
      'Analytics avançado',
      'Gerenciamento de leads',
      'Destaque nos resultados',
      'Tour virtual básico'
    ]
  },
  {
    id: 'enterprise-monthly',
    name: 'Empresarial',
    type: 'enterprise',
    price: 199.90,
    billingCycle: 'monthly',
    maxProperties: -1, // Ilimitado
    maxPhotos: -1, // Ilimitado
    prioritySupport: true,
    analytics: true,
    customBranding: true,
    leadManagement: true,
    features: [
      'Imóveis ilimitados',
      'Fotos ilimitadas',
      'Suporte 24/7',
      'Analytics completo',
      'Marca personalizada',
      'API de integração',
      'Tour virtual premium',
      'Múltiplos usuários',
      'Relatórios personalizados'
    ]
  },
  {
    id: 'basic-yearly',
    name: 'Básico Anual',
    type: 'basic',
    price: 499.00, // 2 meses grátis
    billingCycle: 'yearly',
    maxProperties: 10,
    maxPhotos: 5,
    prioritySupport: false,
    analytics: false,
    customBranding: false,
    leadManagement: false,
    features: [
      'Até 10 imóveis ativos',
      'Até 5 fotos por imóvel',
      'Suporte por email',
      'Painel básico',
      'Filtros de busca',
      '2 meses grátis'
    ]
  },
  {
    id: 'premium-yearly',
    name: 'Premium Anual',
    type: 'premium',
    price: 999.00, // 2 meses grátis
    billingCycle: 'yearly',
    maxProperties: 50,
    maxPhotos: 15,
    prioritySupport: true,
    analytics: true,
    customBranding: false,
    leadManagement: true,
    features: [
      'Até 50 imóveis ativos',
      'Até 15 fotos por imóvel',
      'Suporte prioritário',
      'Analytics avançado',
      'Gerenciamento de leads',
      'Destaque nos resultados',
      'Tour virtual básico',
      '2 meses grátis'
    ]
  },
  {
    id: 'enterprise-yearly',
    name: 'Empresarial Anual',
    type: 'enterprise',
    price: 1999.00, // 2 meses grátis
    billingCycle: 'yearly',
    maxProperties: -1,
    maxPhotos: -1,
    prioritySupport: true,
    analytics: true,
    customBranding: true,
    leadManagement: true,
    features: [
      'Imóveis ilimitados',
      'Fotos ilimitadas',
      'Suporte 24/7',
      'Analytics completo',
      'Marca personalizada',
      'API de integração',
      'Tour virtual premium',
      'Múltiplos usuários',
      'Relatórios personalizados',
      '2 meses grátis'
    ]
  }
];

export const getPlansForUserType = (userType: 'agent' | 'agency') => {
  // Corretores podem usar todos os planos
  // Imobiliárias geralmente preferem planos Premium ou Enterprise
  if (userType === 'agency') {
    return PLANS.filter(plan => plan.type !== 'basic');
  }
  return PLANS;
};

export const getPlanById = (planId: string): Plan | undefined => {
  return PLANS.find(plan => plan.id === planId);
};

export const getMonthlyEquivalent = (plan: Plan): number => {
  if (plan.billingCycle === 'monthly') {
    return plan.price;
  }
  return plan.price / 12;
};
