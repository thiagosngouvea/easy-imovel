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
  agent: {
    name: string;
    company: string;
    rating: number;
    responseTime: string;
    phone: string;
    isOwner?: boolean;
  };
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
