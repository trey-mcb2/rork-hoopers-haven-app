import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUserStore } from './user-store';

export interface Meal {
  id: string;
  userId: string;
  description: string;
  mealType: string;
  date: Date;
  calories?: number;
  protein?: number;
}

interface MealsState {
  meals: Meal[];
  isLoading: boolean;
  error: string | null;
  addMeal: (meal: Omit<Meal, 'id'>) => void;
  updateMeal: (id: string, meal: Partial<Meal>) => void;
  deleteMeal: (id: string) => void;
  getMealsByDate: (date: Date) => Meal[];
}

export const useMealsStore = create<MealsState>()(
  persist(
    (set, get) => ({
      meals: [],
      isLoading: false,
      error: null,
      addMeal: (mealData) => {
        const meal: Meal = {
          ...mealData,
          id: Date.now().toString(),
        };
        set((state) => ({ meals: [...state.meals, meal] }));
        useUserStore.getState().incrementStat('totalMealsTracked');
      },
      updateMeal: (id, updatedMeal) => {
        set((state) => ({
          meals: state.meals.map((meal) =>
            meal.id === id ? { ...meal, ...updatedMeal } : meal
          ),
        }));
      },
      deleteMeal: (id) => {
        set((state) => ({
          meals: state.meals.filter((meal) => meal.id !== id),
        }));
      },
      getMealsByDate: (date) => {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        
        return get().meals.filter(
          (meal) => {
            const mealDate = new Date(meal.date);
            return mealDate >= startOfDay && mealDate <= endOfDay;
          }
        );
      },
    }),
    {
      name: 'meals-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);