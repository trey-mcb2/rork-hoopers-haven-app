import { create } from 'zustand';
// 🔥 Removed Firebase logic, will rewire with tRPC

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
  addWorkout: (workout: Omit<Workout, 'id'>) => Promise<void>;
  updateWorkout: (id: string, workout: Partial<Workout>) => Promise<void>;
  deleteWorkout: (id: string) => Promise<void>;
  getWorkoutsByDate: (date: string) => Workout[];
  getWorkoutsForLastDays: (days: number) => Workout[];
  getTotalDuration: (days: number) => number;
  loadWorkouts: (userId: string) => Promise<void>;
  subscribeToWorkouts: (userId: string) => () => void;
}

export const useWorkoutsStore = create<WorkoutsState>()((set, get) => ({
  workouts: [],
  isLoading: false,
  error: null,
  
  addWorkout: async (workoutData) => {
    try {
      set({ isLoading: true, error: null });
      
      // 🔥 Removed Firebase logic, will rewire with tRPC
      const workout: Workout = {
        ...workoutData,
        id: Date.now().toString(),
      };
      
      set((state) => ({
        workouts: [...state.workouts, workout],
        isLoading: false
      }));
    } catch (error) {
      console.error('Error adding workout:', error);
      set({ error: 'Failed to add workout', isLoading: false });
    }
  },
  
  updateWorkout: async (id, updatedWorkout) => {
    try {
      set({ isLoading: true, error: null });
      
      // 🔥 Removed Firebase logic, will rewire with tRPC
      
      set((state) => ({
        workouts: state.workouts.map((workout) =>
          workout.id === id ? { ...workout, ...updatedWorkout } : workout
        ),
        isLoading: false
      }));
    } catch (error) {
      console.error('Error updating workout:', error);
      set({ error: 'Failed to update workout', isLoading: false });
    }
  },
  
  deleteWorkout: async (id) => {
    try {
      set({ isLoading: true, error: null });
      
      // 🔥 Removed Firebase logic, will rewire with tRPC
      
      set((state) => ({
        workouts: state.workouts.filter((workout) => workout.id !== id),
        isLoading: false
      }));
    } catch (error) {
      console.error('Error deleting workout:', error);
      set({ error: 'Failed to delete workout', isLoading: false });
    }
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
  
  loadWorkouts: async (userId) => {
    try {
      set({ isLoading: true, error: null });
      
      // 🔥 Removed Firebase logic, will rewire with tRPC
      
      set({ workouts: [], isLoading: false });
    } catch (error) {
      console.error('Error loading workouts:', error);
      set({ error: 'Failed to load workouts', isLoading: false });
    }
  },
  
  subscribeToWorkouts: (userId) => {
    // 🔥 Removed Firebase logic, will rewire with tRPC
    return () => {};
  },
}));
