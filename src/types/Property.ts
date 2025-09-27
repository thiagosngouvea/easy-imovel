export interface Agent {
  id: string;
  name: string;
  company: string;
  rating: number;
  responseTime: string;
  phone: string;
  isOwner?: boolean;
  isPremium?: boolean;
  profileImage?: string;
  specialties?: string[];
  experience?: string;
}

export interface Property {
  id: string;
  title: string;
  price: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  area: number; // em m²
  images: string[];
  description: string;
  type: 'apartment' | 'house' | 'studio' | 'commercial';
  agents: Agent[]; // Mudança: agora é um array de agentes
  features: string[];
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  createdAt: Date;
  isFavorite?: boolean;
  likes: number; // Número de curtidas
}

export interface PropertyFilters {
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  minArea?: number;
  maxArea?: number;
  type?: Property['type'];
  location?: string;
}
