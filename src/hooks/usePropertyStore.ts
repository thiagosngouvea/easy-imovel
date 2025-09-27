import { create } from 'zustand';
import { mockProperties } from '../data/mockProperties';
import { Property, PropertyFilters } from '../types/Property';

interface PropertyState {
  properties: Property[];
  currentIndex: number;
  favorites: Property[];
  rejected: Property[];
  filters: PropertyFilters;
  isLoading: boolean;
  
  // Actions
  loadProperties: () => void;
  nextProperty: () => void;
  likeProperty: (property: Property) => void;
  rejectProperty: (property: Property) => void;
  resetStack: () => void;
  setFilters: (filters: PropertyFilters) => void;
  getCurrentProperty: () => Property | null;
  getRemainingCount: () => number;
}

export const usePropertyStore = create<PropertyState>((set, get) => ({
  properties: [],
  currentIndex: 0,
  favorites: [],
  rejected: [],
  filters: {},
  isLoading: false,

  loadProperties: () => {
    set({ isLoading: true });
    
    // Simulate API call
    setTimeout(() => {
      const { filters } = get();
      let filteredProperties = [...mockProperties];

      // Apply filters
      if (filters.minPrice) {
        filteredProperties = filteredProperties.filter(p => p.price >= filters.minPrice!);
      }
      if (filters.maxPrice) {
        filteredProperties = filteredProperties.filter(p => p.price <= filters.maxPrice!);
      }
      if (filters.bedrooms) {
        filteredProperties = filteredProperties.filter(p => p.bedrooms >= filters.bedrooms!);
      }
      if (filters.bathrooms) {
        filteredProperties = filteredProperties.filter(p => p.bathrooms >= filters.bathrooms!);
      }
      if (filters.minArea) {
        filteredProperties = filteredProperties.filter(p => p.area >= filters.minArea!);
      }
      if (filters.maxArea) {
        filteredProperties = filteredProperties.filter(p => p.area <= filters.maxArea!);
      }
      if (filters.type) {
        filteredProperties = filteredProperties.filter(p => p.type === filters.type);
      }
      if (filters.location) {
        filteredProperties = filteredProperties.filter(p => 
          p.location.toLowerCase().includes(filters.location!.toLowerCase())
        );
      }

      // Shuffle properties for variety
      const shuffled = filteredProperties.sort(() => Math.random() - 0.5);

      set({
        properties: shuffled,
        currentIndex: 0,
        isLoading: false,
      });
    }, 1000);
  },

  nextProperty: () => {
    const { currentIndex, properties } = get();
    if (currentIndex < properties.length - 1) {
      set({ currentIndex: currentIndex + 1 });
    }
  },

  likeProperty: (property: Property) => {
    const { favorites } = get();
    const updatedFavorites = [...favorites, { ...property, isFavorite: true }];
    
    set({ 
      favorites: updatedFavorites,
    });
    
    get().nextProperty();
  },

  rejectProperty: (property: Property) => {
    const { rejected } = get();
    const updatedRejected = [...rejected, property];
    
    set({ 
      rejected: updatedRejected,
    });
    
    get().nextProperty();
  },

  resetStack: () => {
    set({
      currentIndex: 0,
      favorites: [],
      rejected: [],
    });
    get().loadProperties();
  },

  setFilters: (filters: PropertyFilters) => {
    set({ filters });
    get().loadProperties();
  },

  getCurrentProperty: () => {
    const { properties, currentIndex } = get();
    return properties[currentIndex] || null;
  },

  getRemainingCount: () => {
    const { properties, currentIndex } = get();
    return Math.max(0, properties.length - currentIndex);
  },
}));
