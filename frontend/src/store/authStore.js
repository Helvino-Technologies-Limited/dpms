import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth: (userData, token) => {
        localStorage.setItem('dpms_token', token);
        set({ user: userData, token, isAuthenticated: true });
      },

      logout: () => {
        localStorage.removeItem('dpms_token');
        localStorage.removeItem('dpms_user');
        set({ user: null, token: null, isAuthenticated: false });
      },

      updateUser: (userData) => set({ user: { ...get().user, ...userData } }),
    }),
    {
      name: 'dpms_auth',
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
    }
  )
);

export default useAuthStore;
