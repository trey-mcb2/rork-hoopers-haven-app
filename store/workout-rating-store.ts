import { create } from 'zustand';
import { collection, addDoc, updateDoc, deleteDoc, doc, query, where, getDocs, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/config/firebase';

export interface WorkoutRating {
  id: string;
  userId: string;
  workoutId: string;
  date: string; // YYYY-MM-DD format
  focus: number; // 1-5 rating
  effort: number; // 1-5 rating
  recovery: number; // 1-5 rating
  notes?: string;
}

interface WorkoutRatingState {
  ratings: WorkoutRating[];
  isLoading: boolean;
  error: string | null;
  addRating: (rating: Omit<WorkoutRating, 'id'>) => Promise<void>;
  updateRating: (id: string, rating: Partial<WorkoutRating>) => Promise<void>;
  deleteRating: (id: string) => Promise<void>;
  getRatingByWorkoutId: (workoutId: string) => WorkoutRating | undefined;
  getRatingsForDate: (date: string) => WorkoutRating[];
  getAverageRatings: (days: number) => { focus: number; effort: number; recovery: number };
  loadRatings: (userId: string) => Promise<void>;
  subscribeToWorkoutRatings: (userId: string) => () => void;
}

const formatDate = (date: Date): string => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

export const useWorkoutRatingStore = create<WorkoutRatingState>()((set, get) => ({
  ratings: [],
  isLoading: false,
  error: null,
  
  addRating: async (ratingData) => {
    try {
      set({ isLoading: true, error: null });
      
      // Check if a rating already exists for this workout
      const existingRating = get().ratings.find(r => 
        r.workoutId === ratingData.workoutId && r.userId === ratingData.userId
      );
      
      if (existingRating) {
        // Update existing rating
        await get().updateRating(existingRating.id, ratingData);
      } else {
        // Add new rating
        const ratingsRef = collection(db, 'users', ratingData.userId, 'workout-ratings');
        const docRef = await addDoc(ratingsRef, ratingData);
        
        const rating: WorkoutRating = {
          ...ratingData,
          id: docRef.id,
        };
        
        set((state) => ({
          ratings: [...state.ratings, rating],
          isLoading: false
        }));
      }
    } catch (error) {
      console.error('Error adding workout rating:', error);
      set({ error: 'Failed to add workout rating', isLoading: false });
    }
  },
  
  updateRating: async (id, updatedRating) => {
    try {
      set({ isLoading: true, error: null });
      
      const currentRating = get().ratings.find(rating => rating.id === id);
      if (!currentRating) {
        throw new Error('Workout rating not found');
      }
      
      const ratingRef = doc(db, 'users', currentRating.userId, 'workout-ratings', id);
      await updateDoc(ratingRef, updatedRating);
      
      set((state) => ({
        ratings: state.ratings.map((rating) =>
          rating.id === id ? { ...rating, ...updatedRating } : rating
        ),
        isLoading: false
      }));
    } catch (error) {
      console.error('Error updating workout rating:', error);
      set({ error: 'Failed to update workout rating', isLoading: false });
    }
  },
  
  deleteRating: async (id) => {
    try {
      set({ isLoading: true, error: null });
      
      const currentRating = get().ratings.find(rating => rating.id === id);
      if (!currentRating) {
        throw new Error('Workout rating not found');
      }
      
      const ratingRef = doc(db, 'users', currentRating.userId, 'workout-ratings', id);
      await deleteDoc(ratingRef);
      
      set((state) => ({
        ratings: state.ratings.filter((rating) => rating.id !== id),
        isLoading: false
      }));
    } catch (error) {
      console.error('Error deleting workout rating:', error);
      set({ error: 'Failed to delete workout rating', isLoading: false });
    }
  },
      
      getRatingByWorkoutId: (workoutId: string) => {
        return (get().ratings || []).find(rating => rating.workoutId === workoutId);
      },
      
      getRatingsForDate: (date: string) => {
        return (get().ratings || []).filter(rating => rating.date === date);
      },
      
      getAverageRatings: (days: number) => {
        const { ratings } = get();
        if (!ratings || ratings.length === 0) {
          return { focus: 0, effort: 0, recovery: 0 };
        }
        
        const now = new Date();
        const startDate = new Date();
        startDate.setDate(now.getDate() - days);
        const startDateStr = formatDate(startDate);
        
        // Filter ratings within the date range
        const filteredRatings = (ratings || []).filter(rating => {
          return rating.date >= startDateStr && rating.date <= formatDate(now);
        });
        
        if (filteredRatings.length === 0) {
          return { focus: 0, effort: 0, recovery: 0 };
        }
        
        const totalFocus = filteredRatings.reduce((sum, rating) => sum + rating.focus, 0);
        const totalEffort = filteredRatings.reduce((sum, rating) => sum + rating.effort, 0);
        const totalRecovery = filteredRatings.reduce((sum, rating) => sum + rating.recovery, 0);
        
        return {
          focus: totalFocus / filteredRatings.length,
          effort: totalEffort / filteredRatings.length,
          recovery: totalRecovery / filteredRatings.length,
        };
      },
      
      loadRatings: async (userId) => {
        try {
          set({ isLoading: true, error: null });
          
          const ratingsRef = collection(db, 'users', userId, 'workout-ratings');
          const q = query(ratingsRef, orderBy('date', 'desc'));
          const querySnapshot = await getDocs(q);
          
          const ratings: WorkoutRating[] = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          })) as WorkoutRating[];
          
          set({ ratings, isLoading: false });
        } catch (error) {
          console.error('Error loading workout ratings:', error);
          set({ error: 'Failed to load workout ratings', isLoading: false });
        }
      },
      
      subscribeToWorkoutRatings: (userId) => {
        const ratingsRef = collection(db, 'users', userId, 'workout-ratings');
        const q = query(ratingsRef, orderBy('date', 'desc'));
        
        return onSnapshot(q, (querySnapshot) => {
          const ratings: WorkoutRating[] = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          })) as WorkoutRating[];
          
          set({ ratings, isLoading: false });
        }, (error) => {
          console.error('Error in workout ratings subscription:', error);
          set({ error: 'Failed to sync workout ratings', isLoading: false });
        });
      },
    }));
