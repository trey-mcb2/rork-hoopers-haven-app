import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface WorkoutRating {
  id: string;
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
  addRating: (rating: Omit<WorkoutRating, 'id'>) => void;
  updateRating: (id: string, rating: Partial<WorkoutRating>) => void;
  deleteRating: (id: string) => void;
  getRatingByWorkoutId: (workoutId: string) => WorkoutRating | undefined;
  getRatingsForDate: (date: string) => WorkoutRating[];
  getAverageRatings: (days: number) => { focus: number; effort: number; recovery: number };
}

const formatDate = (date: Date): string => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

export const useWorkoutRatingStore = create<WorkoutRatingState>()(
  persist(
    (set, get) => ({
      ratings: [],
      isLoading: true,
      error: null,
      
      addRating: (ratingData) => {
        const rating: WorkoutRating = {
          ...ratingData,
          id: Date.now().toString(),
        };
        
        // Check if a rating already exists for this workout
        const existingRatingIndex = (get().ratings || []).findIndex(r => 
          r.workoutId === rating.workoutId
        );
        
        if (existingRatingIndex >= 0) {
          // Update existing rating
          set((state) => ({
            ratings: (state.ratings || []).map((r, index) => 
              index === existingRatingIndex ? { ...r, ...rating } : r
            ),
          }));
        } else {
          // Add new rating
          set((state) => ({
            ratings: [...(state.ratings || []), rating],
          }));
        }
      },
      
      updateRating: (id, updatedRating) => {
        set((state) => ({
          ratings: (state.ratings || []).map((rating) =>
            rating.id === id ? { ...rating, ...updatedRating } : rating
          ),
        }));
      },
      
      deleteRating: (id) => {
        set((state) => ({
          ratings: (state.ratings || []).filter((rating) => rating.id !== id),
        }));
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
    }),
    {
      name: 'workout-rating-storage',
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