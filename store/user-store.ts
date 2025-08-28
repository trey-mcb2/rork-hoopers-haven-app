import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User as FirebaseUser } from 'firebase/auth';
import { User, UserStats } from '@/types';
import { Platform } from 'react-native';

interface UserState {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  stats: UserStats;
  isLoading: boolean;
  error: string | null;
  personalGoal: string | null;
  height: { value: number | null; unit: 'cm' | 'in' };
  weight: { value: number | null; unit: 'kg' | 'lbs' };
  setUser: (user: User | null) => void;
  setFirebaseUser: (firebaseUser: FirebaseUser | null) => void;
  updateStats: (stats: Partial<UserStats>) => void;
  incrementStat: (key: keyof UserStats, value?: number) => void;
  toggleAdminMode: () => void;
  setPersonalGoal: (goal: string) => void;
  setHeight: (value: number, unit: 'cm' | 'in') => void;
  setWeight: (value: number, unit: 'kg' | 'lbs') => void;
  convertHeight: (toUnit: 'cm' | 'in') => void;
  convertWeight: (toUnit: 'kg' | 'lbs') => void;
  logout: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      firebaseUser: null,
      stats: {
        totalWorkouts: 0,
        totalShotsMade: 0,
        totalShotsAttempted: 0,
        totalMealsTracked: 0,
        streakDays: 0,
        badgesEarned: 0,
      },
      isLoading: false,
      error: null,
      personalGoal: null,
      height: { value: null, unit: 'cm' },
      weight: { value: null, unit: 'kg' },
      
      setUser: (user) => set({ user }),
      
      setFirebaseUser: (firebaseUser) => {
        set({ firebaseUser });
        
        // Create or update local user from Firebase user
        if (firebaseUser) {
          const localUser: User = {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || 'Basketball Player',
            email: firebaseUser.email || '',
            createdAt: firebaseUser.metadata.creationTime ? new Date(firebaseUser.metadata.creationTime) : new Date(),
            joinDate: firebaseUser.metadata.creationTime ? new Date(firebaseUser.metadata.creationTime) : new Date(),
            isAdmin: false,
            stats: get().stats,
          };
          set({ user: localUser });
        } else {
          set({ user: null });
        }
      },
      
      updateStats: (partialStats) => 
        set((state) => ({ 
          stats: { ...state.stats, ...partialStats } 
        })),
        
      incrementStat: (key, value = 1) => 
        set((state) => ({
          stats: {
            ...state.stats,
            [key]: (state.stats[key] as number) + value
          }
        })),
        
      toggleAdminMode: () => 
        set((state) => ({
          user: state.user ? {
            ...state.user,
            isAdmin: !state.user.isAdmin
          } : null
        })),
        
      setPersonalGoal: (goal) => set({ personalGoal: goal }),
      
      setHeight: (value, unit) => set({ height: { value, unit } }),
      
      setWeight: (value, unit) => set({ weight: { value, unit } }),
      
      convertHeight: (toUnit) => 
        set((state) => {
          if (!state.height.value) return state;
          
          if (state.height.unit === toUnit) return state;
          
          let newValue: number;
          if (toUnit === 'cm' && state.height.unit === 'in') {
            // Convert inches to cm
            newValue = state.height.value * 2.54;
          } else {
            // Convert cm to inches
            newValue = state.height.value / 2.54;
          }
          
          return {
            height: {
              value: Math.round(newValue * 10) / 10, // Round to 1 decimal place
              unit: toUnit
            }
          };
        }),
        
      convertWeight: (toUnit) => 
        set((state) => {
          if (!state.weight.value) return state;
          
          if (state.weight.unit === toUnit) return state;
          
          let newValue: number;
          if (toUnit === 'kg' && state.weight.unit === 'lbs') {
            // Convert lbs to kg
            newValue = state.weight.value * 0.453592;
          } else {
            // Convert kg to lbs
            newValue = state.weight.value * 2.20462;
          }
          
          return {
            weight: {
              value: Math.round(newValue * 10) / 10, // Round to 1 decimal place
              unit: toUnit
            }
          };
        }),
        
      logout: () => {
        set({ 
          user: null, 
          firebaseUser: null,
          personalGoal: null,
          // Keep stats and measurements as they might be useful for next login
        });
        
        if (Platform.OS === 'web') {
          localStorage.removeItem('user-storage');
        } else {
          AsyncStorage.removeItem('user-storage');
        }
      },
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Don't persist Firebase user as it should be handled by Firebase auth state
      partialize: (state) => ({
        stats: state.stats,
        personalGoal: state.personalGoal,
        height: state.height,
        weight: state.weight,
        user: state.user ? {
          ...state.user,
          // Don't persist sensitive data
          email: undefined,
        } : null,
      }),
    }
  )
);
