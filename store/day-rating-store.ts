import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface DayRating {
  id: string;
  date: string; // YYYY-MM-DD format
  rating: number; // 1-5 rating
  note?: string;
}

interface DayRatingState {
  ratings: DayRating[];
  isLoading: boolean;
  error: string | null;
  addRating: (rating: Omit<DayRating, 'id'>) => void;
  updateRating: (id: string, rating: Partial<DayRating>) => void;
  deleteRating: (id: string) => void;
  getRatingByDate: (date: string) => DayRating | undefined;
  getRatingsForLastDays: (days: number) => DayRating[];
  getAverageRating: (days: number) => number;
}

const formatDate = (date: Date): string => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

export const useDayRatingStore = create<DayRatingState>()(
  persist(
    (set, get) => ({
      ratings: [],
      isLoading: true,
      error: null,
      
      addRating: (ratingData) => {
        const rating: DayRating = {
          ...ratingData,
          id: Date.now().toString(),
        };
        
        // Check if a rating already exists for this date
        const existingRatingIndex = (get().ratings || []).findIndex(r => 
          r.date === rating.date
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
      
      getRatingByDate: (date: string) => {
        return (get().ratings || []).find(rating => rating.date === date);
      },
      
      getRatingsForLastDays: (days: number) => {
        const { ratings } = get();
        if (!ratings || ratings.length === 0) return [];
        
        const now = new Date();
        const startDate = new Date();
        startDate.setDate(now.getDate() - days);
        const startDateStr = formatDate(startDate);
        
        // Filter ratings within the date range
        const filteredRatings = (ratings || []).filter(rating => {
          return rating.date >= startDateStr && rating.date <= formatDate(now);
        });
        
        // Sort by date (oldest first)
        return filteredRatings.sort((a, b) => 
          a.date.localeCompare(b.date)
        );
      },
      
      getAverageRating: (days: number) => {
        const ratings = get().getRatingsForLastDays(days);
        if (!ratings || ratings.length === 0) return 0;
        
        const totalRating = ratings.reduce((sum, rating) => sum + rating.rating, 0);
        return totalRating / ratings.length;
      },
    }),
    {
      name: 'day-rating-storage',
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