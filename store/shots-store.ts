import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ShotSession } from '@/types';
import { useUserStore } from './user-store';

interface ShotsState {
  sessions: ShotSession[];
  isLoading: boolean;
  error: string | null;
  addSession: (session: Omit<ShotSession, 'id'>) => void;
  updateSession: (id: string, session: Partial<ShotSession>) => void;
  deleteSession: (id: string) => void;
  getSessionsByDate: (date: Date) => ShotSession[];
  getSessionsByDateRange: (startDate: Date, endDate: Date) => ShotSession[];
  getWeeklyStats: () => { made: number; attempted: number; date: string }[];
  getMonthlyStats: () => { made: number; attempted: number; month: string }[];
  getYearlyStats: () => { made: number; attempted: number; year: number }[];
}

export const useShotsStore = create<ShotsState>()(
  persist(
    (set, get) => ({
      sessions: [],
      isLoading: false,
      error: null,
      addSession: (sessionData) => {
        const session: ShotSession = {
          ...sessionData,
          id: Date.now().toString(),
        };
        set((state) => ({ sessions: [...state.sessions, session] }));
        useUserStore.getState().incrementStat('totalShotsMade', session.shotsMade);
        useUserStore.getState().incrementStat('totalShotsAttempted', session.shotsAttempted);
      },
      updateSession: (id, updatedSession) => {
        const oldSession = get().sessions.find(s => s.id === id);
        const newSession = { ...oldSession, ...updatedSession };
        
        if (oldSession && 'shotsMade' in updatedSession) {
          const difference = newSession.shotsMade - oldSession.shotsMade;
          useUserStore.getState().incrementStat('totalShotsMade', difference);
        }
        
        if (oldSession && 'shotsAttempted' in updatedSession) {
          const difference = newSession.shotsAttempted - oldSession.shotsAttempted;
          useUserStore.getState().incrementStat('totalShotsAttempted', difference);
        }
        
        set((state) => ({
          sessions: state.sessions.map((session) =>
            session.id === id ? { ...session, ...updatedSession } : session
          ),
        }));
      },
      deleteSession: (id) => {
        const session = get().sessions.find(s => s.id === id);
        if (session) {
          useUserStore.getState().incrementStat('totalShotsMade', -session.shotsMade);
          useUserStore.getState().incrementStat('totalShotsAttempted', -session.shotsAttempted);
        }
        
        set((state) => ({
          sessions: state.sessions.filter((session) => session.id !== id),
        }));
      },
      getSessionsByDate: (date) => {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        
        return get().sessions.filter(
          (session) => {
            const sessionDate = new Date(session.date);
            return sessionDate >= startOfDay && sessionDate <= endOfDay;
          }
        );
      },
      getSessionsByDateRange: (startDate, endDate) => {
        return get().sessions.filter(
          (session) => {
            const sessionDate = new Date(session.date);
            return sessionDate >= startDate && sessionDate <= endDate;
          }
        );
      },
      getWeeklyStats: () => {
        const now = new Date();
        const sessions = get().sessions;
        const weeklyStats: { made: number; attempted: number; date: string }[] = [];
        
        // Get last 4 weeks
        for (let i = 0; i < 4; i++) {
          const endDate = new Date(now);
          endDate.setDate(now.getDate() - (i * 7));
          
          const startDate = new Date(endDate);
          startDate.setDate(endDate.getDate() - 6);
          
          const weekSessions = sessions.filter(session => {
            const sessionDate = new Date(session.date);
            return sessionDate >= startDate && sessionDate <= endDate;
          });
          
          const made = weekSessions.reduce((sum, session) => sum + session.shotsMade, 0);
          const attempted = weekSessions.reduce((sum, session) => sum + session.shotsAttempted, 0);
          
          weeklyStats.push({
            made,
            attempted,
            date: `${startDate.getMonth() + 1}/${startDate.getDate()} - ${endDate.getMonth() + 1}/${endDate.getDate()}`
          });
        }
        
        return weeklyStats.reverse();
      },
      getMonthlyStats: () => {
        const sessions = get().sessions;
        const monthlyStats: { made: number; attempted: number; month: string }[] = [];
        
        const months: { [key: string]: { made: number; attempted: number } } = {};
        
        sessions.forEach(session => {
          const date = new Date(session.date);
          const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
          
          if (!months[monthKey]) {
            months[monthKey] = { made: 0, attempted: 0 };
          }
          
          months[monthKey].made += session.shotsMade;
          months[monthKey].attempted += session.shotsAttempted;
        });
        
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        Object.entries(months).forEach(([key, value]) => {
          const [year, month] = key.split('-').map(Number);
          monthlyStats.push({
            ...value,
            month: `${monthNames[month - 1]} ${year}`
          });
        });
        
        return monthlyStats.sort((a, b) => a.month.localeCompare(b.month));
      },
      getYearlyStats: () => {
        const sessions = get().sessions;
        const yearlyStats: { made: number; attempted: number; year: number }[] = [];
        
        const years: { [key: number]: { made: number; attempted: number } } = {};
        
        sessions.forEach(session => {
          const date = new Date(session.date);
          const year = date.getFullYear();
          
          if (!years[year]) {
            years[year] = { made: 0, attempted: 0 };
          }
          
          years[year].made += session.shotsMade;
          years[year].attempted += session.shotsAttempted;
        });
        
        Object.entries(years).forEach(([yearStr, value]) => {
          const year = parseInt(yearStr);
          yearlyStats.push({
            ...value,
            year
          });
        });
        
        return yearlyStats.sort((a, b) => a.year - b.year);
      },
    }),
    {
      name: 'shots-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);