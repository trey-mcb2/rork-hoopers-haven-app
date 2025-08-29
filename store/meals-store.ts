import { create } from 'zustand';
import { collection, addDoc, updateDoc, deleteDoc, doc, query, where, getDocs, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/config/firebase';
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
      
      const mealsRef = collection(db, 'users', mealData.userId, 'meals');
      const docRef = await addDoc(mealsRef, {
        ...mealData,
        date: mealData.date.toISOString(),
      });
      
      const meal: Meal = {
        ...mealData,
        id: docRef.id,
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
      
      const currentMeal = get().meals.find(meal => meal.id === id);
      if (!currentMeal) {
        throw new Error('Meal not found');
      }
      
      const mealRef = doc(db, 'users', currentMeal.userId, 'meals', id);
      const updateData = { ...updatedMeal };
      
      if (updateData.date) {
        updateData.date = updateData.date.toISOString();
      }
      
      await updateDoc(mealRef, updateData);
      
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
      
      const currentMeal = get().meals.find(meal => meal.id === id);
      if (!currentMeal) {
        throw new Error('Meal not found');
      }
      
      const mealRef = doc(db, 'users', currentMeal.userId, 'meals', id);
      await deleteDoc(mealRef);
      
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
      
      const mealsRef = collection(db, 'users', userId, 'meals');
      const q = query(mealsRef, orderBy('date', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const meals: Meal[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: new Date(doc.data().date),
      })) as Meal[];
      
      set({ meals, isLoading: false });
    } catch (error) {
      console.error('Error loading meals:', error);
      set({ error: 'Failed to load meals', isLoading: false });
    }
  },
  
  subscribeToMeals: (userId) => {
    const mealsRef = collection(db, 'users', userId, 'meals');
    const q = query(mealsRef, orderBy('date', 'desc'));
    
    return onSnapshot(q, (querySnapshot) => {
      const meals: Meal[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: new Date(doc.data().date),
      })) as Meal[];
      
      set({ meals, isLoading: false });
    }, (error) => {
      console.error('Error in meals subscription:', error);
      set({ error: 'Failed to sync meals', isLoading: false });
    });
  },
}));
