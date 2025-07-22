import { create } from 'zustand';
import { collection, addDoc, updateDoc, deleteDoc, doc, query, where, getDocs, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { ShotSession } from '@/types';

interface ShotsState {
  sessions: ShotSession[];
  isLoading: boolean;
  error: string | null;
  addSession: (session: Omit<ShotSession, 'id'>) => Promise<void>;
  updateSession: (id: string, session: Partial<ShotSession>) => Promise<void>;
  deleteSession: (id: string) => Promise<void>;
  getSessionsByDate: (date: Date) => ShotSession[];
  getSessionsByDateRange: (startDate: Date, endDate: Date) => ShotSession[];
  getWeeklyStats: () => { made: number; attempted: number; date: string }[];
  getMonthlyStats: () => { made: number; attempted: number; month: string }[];
  getYearlyStats: () => { made: number; attempted: number; year: number }[];
  loadSessions: (userId: string) => Promise<void>;
  subscribeToSessions: (userId: string) => () => void;
}

export const useShotsStore = create<ShotsState>()((set, get) => ({
  sessions: [],
  isLoading: false,
  error: null,
  
  addSession: async (sessionData) => {
    try {
      set({ isLoading: true, error: null });
      
      const sessionsRef = collection(db, 'users', sessionData.userId, 'shots');
      const docRef = await addDoc(sessionsRef, sessionData);
      
      const session: ShotSession = {
        ...sessionData,
        id: docRef.id,
      };
      
      set((state) => ({
        sessions: [...state.sessions, session],
        isLoading: false
      }));
    } catch (error) {
      console.error('Error adding shot session:', error);
      set({ error: 'Failed to add shot session', isLoading: false });
    }
  },
  
  updateSession: async (id, updatedSession) => {
    try {
      set({ isLoading: true, error: null });
      
      const currentSession = get().sessions.find(session => session.id === id);
      if (!currentSession) {
        throw new Error('Shot session not found');
      }
      
      const sessionRef = doc(db, 'users', currentSession.userId, 'shots', id);
      await updateDoc(sessionRef, updatedSession);
      
      set((state) => ({
        sessions: state.sessions.map((session) =>
          session.id === id ? { ...session, ...updatedSession } : session
        ),
        isLoading: false
      }));
    } catch (error) {
      console.error('Error updating shot session:', error);
      set({ error: 'Failed to update shot session', isLoading: false });
    }
  },
  
  deleteSession: async (id) => {
    try {
      set({ isLoading: true, error: null });
      
      const currentSession = get().sessions.find(session => session.id === id);
      if (!currentSession) {
        throw new Error('Shot session not found');
      }
      
      const sessionRef = doc(db, 'users', currentSession.userId, 'shots', id);
      await deleteDoc(sessionRef);
      
      set((state) => ({
        sessions: state.sessions.filter((session) => session.id !== id),
        isLoading: false
      }));
    } catch (error) {
      console.error('Error deleting shot session:', error);
      set({ error: 'Failed to delete shot session', isLoading: false });
    }
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
      
      loadSessions: async (userId) => {
        try {
          set({ isLoading: true, error: null });
          
          const sessionsRef = collection(db, 'users', userId, 'shots');
          const q = query(sessionsRef, orderBy('date', 'desc'));
          const querySnapshot = await getDocs(q);
          
          const sessions: ShotSession[] = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          })) as ShotSession[];
          
          set({ sessions, isLoading: false });
        } catch (error) {
          console.error('Error loading shot sessions:', error);
          set({ error: 'Failed to load shot sessions', isLoading: false });
        }
      },
      
      subscribeToSessions: (userId) => {
        const sessionsRef = collection(db, 'users', userId, 'shots');
        const q = query(sessionsRef, orderBy('date', 'desc'));
        
        return onSnapshot(q, (querySnapshot) => {
          const sessions: ShotSession[] = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          })) as ShotSession[];
          
          set({ sessions, isLoading: false });
        }, (error) => {
          console.error('Error in shot sessions subscription:', error);
          set({ error: 'Failed to sync shot sessions', isLoading: false });
        });
      },
    }));
