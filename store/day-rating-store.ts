import { create } from 'zustand';
import { collection, addDoc, updateDoc, deleteDoc, doc, query, where, getDocs, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/config/firebase';

export interface DayRating {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD format
  rating: number; // 1-5 rating
  note?: string;
}

interface DayRatingState {
  ratings: DayRating[];
  isLoading: boolean;
  error: string | null;
  addRating: (rating: Omit<DayRating, 'id'>) => Promise<void>;
  updateRating: (id: string, rating: Partial<DayRating>) => Promise<void>;
  deleteRating: (id: string) => Promise<void>;
  getRatingByDate: (date: string) => DayRating | undefined;
  getRatingsForLastDays: (days: number) => DayRating[];
  getAverageRating: (days: number) => number;
  loadRatings: (userId: string) => Promise<void>;
  subscribeToDayRatings: (userId: string) => () => void;
}

const formatDate = (date: Date): string => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

export const useDayRatingStore = create<DayRatingState>()((set, get) => ({
  ratings: [],
  isLoading: false,
  error: null,
  
  addRating: async (ratingData) => {
    try {
      set({ isLoading: true, error: null });
      
      // Check if a rating already exists for this date
      const existingRating = get().ratings.find(r => 
        r.date === ratingData.date && r.userId === ratingData.userId
      );
      
      if (existingRating) {
        // Update existing rating
        await get().updateRating(existingRating.id, ratingData);
      } else {
        // Add new rating
        const ratingsRef = collection(db, 'users', ratingData.userId, 'day-ratings');
        const docRef = await addDoc(ratingsRef, ratingData);
        
        const rating: DayRating = {
          ...ratingData,
          id: docRef.id,
        };
        
        set((state) => ({
          ratings: [...state.ratings, rating],
          isLoading: false
        }));
      }
    } catch (error) {
      console.error('Error adding day rating:', error);
      set({ error: 'Failed to add day rating', isLoading: false });
    }
  },
  
  updateRating: async (id, updatedRating) => {
    try {
      set({ isLoading: true, error: null });
      
      const currentRating = get().ratings.find(rating => rating.id === id);
      if (!currentRating) {
        throw new Error('Day rating not found');
      }
      
      const ratingRef = doc(db, 'users', currentRating.userId, 'day-ratings', id);
      await updateDoc(ratingRef, updatedRating);
      
      set((state) => ({
        ratings: state.ratings.map((rating) =>
          rating.id === id ? { ...rating, ...updatedRating } : rating
        ),
        isLoading: false
      }));
    } catch (error) {
      console.error('Error updating day rating:', error);
      set({ error: 'Failed to update day rating', isLoading: false });
    }
  },
  
  deleteRating: async (id) => {
    try {
      set({ isLoading: true, error: null });
      
      const currentRating = get().ratings.find(rating => rating.id === id);
      if (!currentRating) {
        throw new Error('Day rating not found');
      }
      
      const ratingRef = doc(db, 'users', currentRating.userId, 'day-ratings', id);
      await deleteDoc(ratingRef);
      
      set((state) => ({
        ratings: state.ratings.filter((rating) => rating.id !== id),
        isLoading: false
      }));
    } catch (error) {
      console.error('Error deleting day rating:', error);
      set({ error: 'Failed to delete day rating', isLoading: false });
    }
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
      
      loadRatings: async (userId) => {
        try {
          set({ isLoading: true, error: null });
          
          const ratingsRef = collection(db, 'users', userId, 'day-ratings');
          const q = query(ratingsRef, orderBy('date', 'desc'));
          const querySnapshot = await getDocs(q);
          
          const ratings: DayRating[] = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          })) as DayRating[];
          
          set({ ratings, isLoading: false });
        } catch (error) {
          console.error('Error loading day ratings:', error);
          set({ error: 'Failed to load day ratings', isLoading: false });
        }
      },
      
      subscribeToDayRatings: (userId) => {
        const ratingsRef = collection(db, 'users', userId, 'day-ratings');
        const q = query(ratingsRef, orderBy('date', 'desc'));
        
        return onSnapshot(q, (querySnapshot) => {
          const ratings: DayRating[] = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          })) as DayRating[];
          
          set({ ratings, isLoading: false });
        }, (error) => {
          console.error('Error in day ratings subscription:', error);
          set({ error: 'Failed to sync day ratings', isLoading: false });
        });
      },
    }));
