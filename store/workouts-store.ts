import { create } from 'zustand';
import { collection, addDoc, updateDoc, deleteDoc, doc, query, where, getDocs, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/config/firebase';

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
      
      const workoutsRef = collection(db, 'users', workoutData.userId, 'workouts');
      const docRef = await addDoc(workoutsRef, workoutData);
      
      const workout: Workout = {
        ...workoutData,
        id: docRef.id,
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
      
      const currentWorkout = get().workouts.find(workout => workout.id === id);
      if (!currentWorkout) {
        throw new Error('Workout not found');
      }
      
      const workoutRef = doc(db, 'users', currentWorkout.userId, 'workouts', id);
      await updateDoc(workoutRef, updatedWorkout);
      
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
      
      const currentWorkout = get().workouts.find(workout => workout.id === id);
      if (!currentWorkout) {
        throw new Error('Workout not found');
      }
      
      const workoutRef = doc(db, 'users', currentWorkout.userId, 'workouts', id);
      await deleteDoc(workoutRef);
      
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
      
      const workoutsRef = collection(db, 'users', userId, 'workouts');
      const q = query(workoutsRef, orderBy('date', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const workouts: Workout[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Workout[];
      
      set({ workouts, isLoading: false });
    } catch (error) {
      console.error('Error loading workouts:', error);
      set({ error: 'Failed to load workouts', isLoading: false });
    }
  },
  
  subscribeToWorkouts: (userId) => {
    const workoutsRef = collection(db, 'users', userId, 'workouts');
    const q = query(workoutsRef, orderBy('date', 'desc'));
    
    return onSnapshot(q, (querySnapshot) => {
      const workouts: Workout[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Workout[];
      
      set({ workouts, isLoading: false });
    }, (error) => {
      console.error('Error in workouts subscription:', error);
      set({ error: 'Failed to sync workouts', isLoading: false });
    });
  },
}));
