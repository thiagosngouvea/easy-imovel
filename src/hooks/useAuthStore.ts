import { create } from 'zustand';

export interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  
  login: (user: User) => 
    set({ 
      user, 
      isAuthenticated: true, 
      isLoading: false 
    }),
  
  logout: () => 
    set({ 
      user: null, 
      isAuthenticated: false, 
      isLoading: false 
    }),
  
  setLoading: (isLoading: boolean) => 
    set({ isLoading }),
}));
