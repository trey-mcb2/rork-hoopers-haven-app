import { create } from 'zustand';
// 🔥 Removed Firebase logic, will rewire with tRPC
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
  addMeal: (meal: Omit<Meal, 'id'>) => Promise<void>;
  updateMeal: (id: string, meal: Partial<Meal>) => Promise<void>;
  deleteMeal: (id: string) => Promise<void>;
  getMealsByDate: (date: Date) => Meal[];
  loadMeals: (userId: string) => Promise<void>;
  subscribeToMeals: (userId: string) => () => void;
}

export const useMealsStore = create<MealsState>()((set, get) => ({
  meals: [],
  isLoading: false,
  error: null,
  
  addMeal: async (mealData) => {
    try {
      set({ isLoading: true, error: null });
      
      // 🔥 Removed Firebase logic, will rewire with tRPC
      
      const meal: Meal = {
        ...mealData,
        id: Date.now().toString(),
      };
      
      set((state) => ({ 
        meals: [...state.meals, meal],
        isLoading: false 
      }));
      
      useUserStore.getState().incrementStat('totalMealsTracked');
    } catch (error) {
      console.error('Error adding meal:', error);
      set({ error: 'Failed to add meal', isLoading: false });
    }
  },
  
  updateMeal: async (id, updatedMeal) => {
    try {
      set({ isLoading: true, error: null });
      
      // 🔥 Removed Firebase logic, will rewire with tRPC
      
      set((state) => ({
        meals: state.meals.map((meal) =>
          meal.id === id ? { ...meal, ...updatedMeal } : meal
        ),
        isLoading: false
      }));
    } catch (error) {
      console.error('Error updating meal:', error);
      set({ error: 'Failed to update meal', isLoading: false });
    }
  },
  
  deleteMeal: async (id) => {
    try {
      set({ isLoading: true, error: null });
      
      // 🔥 Removed Firebase logic, will rewire with tRPC
      
      set((state) => ({
        meals: state.meals.filter((meal) => meal.id !== id),
        isLoading: false
      }));
    } catch (error) {
      console.error('Error deleting meal:', error);
      set({ error: 'Failed to delete meal', isLoading: false });
    }
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
  
  loadMeals: async (userId) => {
    try {
      set({ isLoading: true, error: null });
      
      // 🔥 Removed Firebase logic, will rewire with tRPC
      
      set({ meals: [], isLoading: false });
    } catch (error) {
      console.error('Error loading meals:', error);
      set({ error: 'Failed to load meals', isLoading: false });
    }
  },
  
  subscribeToMeals: (userId) => {
    // 🔥 Removed Firebase logic, will rewire with tRPC
    return () => {};
  },
}));
