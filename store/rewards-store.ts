import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Badge } from '@/types';
import { mockBadges } from '@/mocks/badges';
import { useUserStore } from './user-store';

interface RewardsState {
  availableBadges: Badge[];
  earnedBadges: Badge[];
  isLoading: boolean;
  error: string | null;
  initializeBadges: () => void;
  checkAndAwardBadges: () => void;
  awardBadge: (badgeId: string) => void;
  getBadgeById: (id: string) => Badge | undefined;
}

export const useRewardsStore = create<RewardsState>()(
  persist(
    (set, get) => ({
      availableBadges: [],
      earnedBadges: [],
      isLoading: false,
      error: null,
      initializeBadges: () => {
        // Only initialize if badges are empty
        if (get().availableBadges.length === 0) {
          set({ availableBadges: mockBadges });
        }
      },
      checkAndAwardBadges: () => {
        const userStats = useUserStore.getState().stats;
        const availableBadges = get().availableBadges;
        const earnedBadges = get().earnedBadges;
        
        const earnedBadgeIds = earnedBadges.map(badge => badge.id);
        
        // Check for meal tracking badges
        if (userStats.totalMealsTracked >= 10 && !earnedBadgeIds.includes('meal-tracker-10')) {
          get().awardBadge('meal-tracker-10');
        }
        
        if (userStats.totalMealsTracked >= 50 && !earnedBadgeIds.includes('meal-tracker-50')) {
          get().awardBadge('meal-tracker-50');
        }
        
        // Check for workout badges
        if (userStats.totalWorkouts >= 10 && !earnedBadgeIds.includes('workout-10')) {
          get().awardBadge('workout-10');
        }
        
        if (userStats.totalWorkouts >= 50 && !earnedBadgeIds.includes('workout-50')) {
          get().awardBadge('workout-50');
        }
        
        // Check for shot badges
        if (userStats.totalShotsMade >= 100 && !earnedBadgeIds.includes('shots-100')) {
          get().awardBadge('shots-100');
        }
        
        if (userStats.totalShotsMade >= 1000 && !earnedBadgeIds.includes('shots-1000')) {
          get().awardBadge('shots-1000');
        }
        
        if (userStats.totalShotsMade >= 10000 && !earnedBadgeIds.includes('shots-10000')) {
          get().awardBadge('shots-10000');
        }
        
        // Check for streak badges
        if (userStats.streakDays >= 7 && !earnedBadgeIds.includes('streak-7')) {
          get().awardBadge('streak-7');
        }
        
        if (userStats.streakDays >= 30 && !earnedBadgeIds.includes('streak-30')) {
          get().awardBadge('streak-30');
        }
      },
      awardBadge: (badgeId) => {
        const badge = get().availableBadges.find(b => b.id === badgeId);
        
        if (!badge) return;
        
        const badgeWithDate: Badge = {
          ...badge,
          dateEarned: new Date()
        };
        
        set((state) => ({
          earnedBadges: [...state.earnedBadges, badgeWithDate]
        }));
        
        useUserStore.getState().incrementStat('badgesEarned');
      },
      getBadgeById: (id) => {
        return [...get().availableBadges, ...get().earnedBadges].find(badge => badge.id === id);
      }
    }),
    {
      name: 'rewards-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);