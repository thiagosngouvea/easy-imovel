import { Property } from '../types/Property';

export const mockProperties: Property[] = [
  {
    id: '1',
    title: 'Apartamento 2 quartos',
    price: 1800,
    location: 'Centro',
    bedrooms: 2,
    bathrooms: 1,
    area: 65,
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=400'
    ],
    description: 'Apartamento moderno no centro da cidade, próximo ao metrô e comércio local.',
    type: 'apartment',
    agent: {
      name: 'Imobiliária X',
      company: 'Imobiliária X',
      rating: 4.8,
      responseTime: 'até 2h',
      phone: '(11) 99999-9999'
    },
    features: ['Elevador', 'Portaria 24h', 'Área de lazer', 'Garagem'],
    coordinates: {
      latitude: -23.5505,
      longitude: -46.6333
    },
    createdAt: new Date('2024-01-15'),
    isFavorite: false
  },
  {
    id: '2',
    title: 'Casa 3 quartos com quintal',
    price: 2500,
    location: 'Vila Madalena',
    bedrooms: 3,
    bathrooms: 2,
    area: 120,
    images: [
      'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400',
      'https://images.unsplash.com/photo-1448630360428-65456885c650?w=400',
      'https://images.unsplash.com/photo-1513584684374-8bab748fbf90?w=400'
    ],
    description: 'Casa aconchegante com quintal, ideal para famílias. Localizada em bairro residencial.',
    type: 'house',
    agent: {
      name: 'João Silva',
      company: 'Corretor Independente',
      rating: 4.5,
      responseTime: 'até 1h',
      phone: '(11) 88888-8888'
    },
    features: ['Quintal', 'Churrasqueira', 'Garagem para 2 carros', 'Lavanderia'],
    coordinates: {
      latitude: -23.5440,
      longitude: -46.6890
    },
    createdAt: new Date('2024-01-10'),
    isFavorite: false
  },
  {
    id: '3',
    title: 'Studio moderno',
    price: 1200,
    location: 'Pinheiros',
    bedrooms: 1,
    bathrooms: 1,
    area: 35,
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400',
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=400'
    ],
    description: 'Studio compacto e moderno, perfeito para jovens profissionais.',
    type: 'studio',
    agent: {
      name: 'Maria Santos',
      company: 'Proprietário direto',
      rating: 0,
      responseTime: 'sem avaliação',
      phone: '(11) 77777-7777',
      isOwner: true
    },
    features: ['Mobiliado', 'Internet incluída', 'Próximo ao metrô'],
    coordinates: {
      latitude: -23.5629,
      longitude: -46.7009
    },
    createdAt: new Date('2024-01-20'),
    isFavorite: false
  },
  {
    id: '4',
    title: 'Apartamento de luxo 4 quartos',
    price: 4500,
    location: 'Jardins',
    bedrooms: 4,
    bathrooms: 3,
    area: 180,
    images: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=400'
    ],
    description: 'Apartamento de alto padrão com vista panorâmica da cidade.',
    type: 'apartment',
    agent: {
      name: 'Premium Imóveis',
      company: 'Premium Imóveis',
      rating: 4.9,
      responseTime: 'até 30min',
      phone: '(11) 66666-6666'
    },
    features: ['Vista panorâmica', 'Piscina', 'Academia', 'Concierge', 'Varanda gourmet'],
    coordinates: {
      latitude: -23.5614,
      longitude: -46.6562
    },
    createdAt: new Date('2024-01-25'),
    isFavorite: false
  },
  {
    id: '5',
    title: 'Loft industrial',
    price: 2200,
    location: 'Vila Olímpia',
    bedrooms: 1,
    bathrooms: 1,
    area: 80,
    images: [
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400',
      'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=400',
      'https://images.unsplash.com/photo-1560449752-b4b1b9c4e9b3?w=400'
    ],
    description: 'Loft com design industrial, pé direito alto e muito estilo.',
    type: 'apartment',
    agent: {
      name: 'Carlos Oliveira',
      company: 'Oliveira Imóveis',
      rating: 4.7,
      responseTime: 'até 1h',
      phone: '(11) 55555-5555'
    },
    features: ['Pé direito alto', 'Design industrial', 'Vaga de garagem', 'Próximo ao metrô'],
    coordinates: {
      latitude: -23.5955,
      longitude: -46.6890
    },
    createdAt: new Date('2024-01-12'),
    isFavorite: false
  }
];
