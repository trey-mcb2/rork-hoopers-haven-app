import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Workout {
  id: string;
  userId: string;
  description: string;
  duration: number; // in minutes
  date: string; // ISO date string
  intensity?: 'low' | 'medium' | 'high';
  focusArea?: string[];
  notes?: string;
}

interface WorkoutsState {
  workouts: Workout[];
  isLoading: boolean;
  error: string | null;
  addWorkout: (workout: Workout) => void;
  updateWorkout: (id: string, workout: Partial<Workout>) => void;
  deleteWorkout: (id: string) => void;
  getWorkoutsByDate: (date: string) => Workout[];
  getWorkoutsForLastDays: (days: number) => Workout[];
  getTotalDuration: (days: number) => number;
}

export const useWorkoutsStore = create<WorkoutsState>()(
  persist(
    (set, get) => ({
      workouts: [],
      isLoading: true,
      error: null,
      
      addWorkout: (workout) => {
        set((state) => ({
          workouts: [...(state.workouts || []), workout],
        }));
      },
      
      updateWorkout: (id, updatedWorkout) => {
        set((state) => ({
          workouts: (state.workouts || []).map((workout) =>
            workout.id === id ? { ...workout, ...updatedWorkout } : workout
          ),
        }));
      },
      
      deleteWorkout: (id) => {
        set((state) => ({
          workouts: (state.workouts || []).filter((workout) => workout.id !== id),
        }));
      },
      
      getWorkoutsByDate: (date: string) => {
        return (get().workouts || []).filter(workout => {
          const workoutDate = new Date(workout.date).toISOString().split('T')[0];
          return workoutDate === date;
        });
      },
      
      getWorkoutsForLastDays: (days: number) => {
        const { workouts } = get();
        if (!workouts || workouts.length === 0) return [];
        
        const now = new Date();
        const startDate = new Date();
        startDate.setDate(now.getDate() - days);
        
        // Filter workouts within the date range
        return (workouts || []).filter(workout => {
          const workoutDate = new Date(workout.date);
          return workoutDate >= startDate && workoutDate <= now;
        });
      },
      
      getTotalDuration: (days: number) => {
        const workouts = get().getWorkoutsForLastDays(days);
        if (!workouts || workouts.length === 0) return 0;
        
        return workouts.reduce((total, workout) => total + workout.duration, 0);
      },
    }),
    {
      name: 'workouts-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        // When the store is rehydrated, set loading to false
        if (state) {
          state.isLoading = false;
        }
      },
    }
  )
);