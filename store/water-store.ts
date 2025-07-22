import { create } from 'zustand';
import { collection, addDoc, updateDoc, deleteDoc, doc, query, where, getDocs, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/config/firebase';

export interface WaterEntry {
  id: string;
  userId: string;
  date: string; // Changed to string format YYYY-MM-DD for consistency
  glasses: number; // Number of glasses (1 glass = 250ml)
  liters?: number; // Optional liters value
  amount?: number; // For backward compatibility
}

interface WaterState {
  logs: WaterEntry[];
  todayEntry: WaterEntry | null;
  isLoading: boolean;
  error: string | null;
  addWater: (glasses: number, userId: string) => Promise<void>;
  resetTodayWater: (userId: string) => Promise<void>;
  checkAndResetDaily: (userId: string) => Promise<void>;
  getEntryByDate: (date: Date) => WaterEntry | null;
  getEntriesForLastDays: (days: number) => WaterEntry[];
  loadWaterEntries: (userId: string) => Promise<void>;
  subscribeToWaterEntries: (userId: string) => () => void;
}

const formatDate = (date: Date): string => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

const createTodayEntry = (userId: string): WaterEntry => ({
  id: Date.now().toString(),
  userId,
  date: formatDate(new Date()),
  glasses: 0,
  liters: 0,
});

const isSameDay = (date1: string, date2: string): boolean => {
  return date1 === date2;
};

export const useWaterStore = create<WaterState>()((set, get) => ({
  logs: [],
  todayEntry: null,
  isLoading: false,
  error: null,
  
  addWater: async (glasses: number, userId: string) => {
    try {
      set({ isLoading: true, error: null });
      
      const { todayEntry, logs } = get();
      const today = formatDate(new Date());
      
      if (todayEntry && isSameDay(todayEntry.date, today) && todayEntry.userId === userId) {
        // Update today's entry
        const updatedEntry = {
          ...todayEntry,
          glasses: todayEntry.glasses + glasses,
          liters: ((todayEntry.glasses + glasses) * 0.25), // 1 glass = 250ml = 0.25L
          amount: todayEntry.glasses + glasses, // For backward compatibility
        };
        
        const entryRef = doc(db, 'users', userId, 'water', todayEntry.id);
        await updateDoc(entryRef, {
          glasses: updatedEntry.glasses,
          liters: updatedEntry.liters,
          amount: updatedEntry.amount,
        });
        
        set({
          todayEntry: updatedEntry,
          logs: (logs || []).map(entry => 
            entry.id === updatedEntry.id ? updatedEntry : entry
          ),
          isLoading: false
        });
      } else {
        // Create a new entry for today
        const newEntryData = {
          userId,
          date: today,
          glasses,
          liters: glasses * 0.25,
          amount: glasses, // For backward compatibility
        };
        
        const waterRef = collection(db, 'users', userId, 'water');
        const docRef = await addDoc(waterRef, newEntryData);
        
        const newEntry: WaterEntry = {
          id: docRef.id,
          ...newEntryData,
        };
        
        set({
          todayEntry: newEntry,
          logs: [...(logs || []), newEntry],
          isLoading: false
        });
      }
    } catch (error) {
      console.error('Error adding water:', error);
      set({ error: 'Failed to add water', isLoading: false });
    }
  },
  
  resetTodayWater: async (userId: string) => {
    try {
      set({ isLoading: true, error: null });
      
      const newEntryData = {
        userId,
        date: formatDate(new Date()),
        glasses: 0,
        liters: 0,
        amount: 0,
      };
      
      const { logs } = get();
      const today = formatDate(new Date());
      
      // Remove any existing entry for today from Firestore
      const existingEntry = logs.find(entry => 
        isSameDay(entry.date, today) && entry.userId === userId
      );
      
      if (existingEntry) {
        const entryRef = doc(db, 'users', userId, 'water', existingEntry.id);
        await deleteDoc(entryRef);
      }
      
      // Create new entry in Firestore
      const waterRef = collection(db, 'users', userId, 'water');
      const docRef = await addDoc(waterRef, newEntryData);
      
      const newEntry: WaterEntry = {
        id: docRef.id,
        ...newEntryData,
      };
      
      // Remove any existing entry for today from local state
      const filteredEntries = (logs || []).filter(entry => 
        !isSameDay(entry.date, today) || entry.userId !== userId
      );
      
      set({
        todayEntry: newEntry,
        logs: [...filteredEntries, newEntry],
        isLoading: false
      });
    } catch (error) {
      console.error('Error resetting water:', error);
      set({ error: 'Failed to reset water', isLoading: false });
    }
  },
  
  checkAndResetDaily: async (userId: string) => {
    const { todayEntry } = get();
    const today = formatDate(new Date());
    
    if (!todayEntry || todayEntry.userId !== userId) {
      // No entry exists for this user, create one
      await get().resetTodayWater(userId);
      return;
    }
    
    // Check if the entry is from today
    if (!isSameDay(todayEntry.date, today)) {
      // Entry is from a previous day, reset
      await get().resetTodayWater(userId);
    }
  },
  
  getEntryByDate: (date: Date) => {
    const { logs } = get();
    const dateStr = formatDate(date);
    return (logs || []).find(entry => isSameDay(entry.date, dateStr)) || null;
  },
  
  getEntriesForLastDays: (days: number) => {
    const { logs } = get();
    if (!logs || logs.length === 0) return [];
    
    const now = new Date();
    const startDate = new Date();
    startDate.setDate(now.getDate() - days);
    const startDateStr = formatDate(startDate);
    
    // Filter entries within the date range
    const filteredEntries = (logs || []).filter(entry => {
      // Compare dates as strings in format YYYY-MM-DD
      return entry.date >= startDateStr && entry.date <= formatDate(now);
    });
    
    // Sort by date (oldest first)
    return filteredEntries.sort((a, b) => 
      a.date.localeCompare(b.date)
    );
  },
  
  loadWaterEntries: async (userId: string) => {
    try {
      set({ isLoading: true, error: null });
      
      const waterRef = collection(db, 'users', userId, 'water');
      const q = query(waterRef, orderBy('date', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const logs: WaterEntry[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as WaterEntry[];
      
      // Find today's entry
      const today = formatDate(new Date());
      const todayEntry = logs.find(entry => 
        isSameDay(entry.date, today) && entry.userId === userId
      ) || null;
      
      set({ logs, todayEntry, isLoading: false });
    } catch (error) {
      console.error('Error loading water entries:', error);
      set({ error: 'Failed to load water entries', isLoading: false });
    }
  },
  
  subscribeToWaterEntries: (userId: string) => {
    const waterRef = collection(db, 'users', userId, 'water');
    const q = query(waterRef, orderBy('date', 'desc'));
    
    return onSnapshot(q, (querySnapshot) => {
      const logs: WaterEntry[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as WaterEntry[];
      
      // Find today's entry
      const today = formatDate(new Date());
      const todayEntry = logs.find(entry => 
        isSameDay(entry.date, today) && entry.userId === userId
      ) || null;
      
      set({ logs, todayEntry, isLoading: false });
    }, (error) => {
      console.error('Error in water entries subscription:', error);
      set({ error: 'Failed to sync water entries', isLoading: false });
    });
  },
}));
