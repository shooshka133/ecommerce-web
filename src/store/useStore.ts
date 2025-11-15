import { create } from 'zustand';
import { persist } from 'zustand/middleware';
interface PreferencesState {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

export const useStore = create<PreferencesState>()(
  persist(
    (set, get) => ({
      darkMode: false,
      toggleDarkMode: () => {
        const darkMode = get().darkMode;
        const newDarkMode = !darkMode;
        set({ darkMode: newDarkMode });
        if (newDarkMode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      },
    }),
    {
      name: 'ecommerce-preferences',
      partialize: (state) => ({
        darkMode: state.darkMode,
      }),
    }
  )
);

