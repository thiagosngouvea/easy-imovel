import { create } from 'zustand';

export interface User {
  id: string;
  name: string;
  email: string;
  city: string;
  state: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, city: string, state: string) => Promise<boolean>;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  
  login: async (email: string, password: string) => {
    set({ isLoading: true });
    
    try {
      // Simular chamada de API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock user data
      const user: User = {
        id: '1',
        name: 'Usuário Teste',
        email,
        city: 'São Paulo',
        state: 'SP'
      };
      
      set({ 
        user, 
        isAuthenticated: true, 
        isLoading: false 
      });
      
      return true;
    } catch (error) {
      set({ isLoading: false });
      return false;
    }
  },

  register: async (name: string, email: string, password: string, city: string, state: string) => {
    set({ isLoading: true });
    
    try {
      // Simular chamada de API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const user: User = {
        id: Date.now().toString(),
        name,
        email,
        city,
        state
      };
      
      set({ 
        user, 
        isAuthenticated: true, 
        isLoading: false 
      });
      
      return true;
    } catch (error) {
      set({ isLoading: false });
      return false;
    }
  },
  
  logout: () => 
    set({ 
      user: null, 
      isAuthenticated: false, 
      isLoading: false 
    }),
  
  setLoading: (isLoading: boolean) => 
    set({ isLoading }),
}));
