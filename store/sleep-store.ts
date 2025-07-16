import { create } from 'zustand';
import { collection, addDoc, updateDoc, deleteDoc, doc, query, where, getDocs, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/config/firebase';

export interface SleepEntry {
  id: string;
  userId: string;
  date: string; // Changed to string format YYYY-MM-DD for consistency
  hours: number;
  quality: number; // 1-5 rating
  notes?: string;
}

interface SleepState {
  entries: SleepEntry[];
  isLoading: boolean;
  error: string | null;
  addSleepEntry: (entry: Omit<SleepEntry, 'id'>) => Promise<void>;
  updateSleepEntry: (id: string, entry: Partial<SleepEntry>) => Promise<void>;
  deleteSleepEntry: (id: string) => Promise<void>;
  getEntryByDate: (date: Date) => SleepEntry | null;
  getEntriesForLastDays: (days: number) => SleepEntry[];
  getAverageSleepHours: (days: number) => number;
  getAverageSleepQuality: (days: number) => number;
  loadSleepEntries: (userId: string) => Promise<void>;
  subscribeToSleepEntries: (userId: string) => () => void;
}

const formatDate = (date: Date): string => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

const isSameDay = (date1: string, date2: string): boolean => {
  return date1 === date2;
};

export const useSleepStore = create<SleepState>()((set, get) => ({
  entries: [],
  isLoading: false,
  error: null,
  
  addSleepEntry: async (entryData) => {
    try {
      set({ isLoading: true, error: null });
      
      // Check if an entry already exists for this date
      const existingEntry = get().entries.find(e => 
        isSameDay(e.date, entryData.date) && e.userId === entryData.userId
      );
      
      if (existingEntry) {
        // Update existing entry
        await get().updateSleepEntry(existingEntry.id, entryData);
      } else {
        // Add new entry
        const sleepRef = collection(db, 'users', entryData.userId, 'sleep');
        const docRef = await addDoc(sleepRef, entryData);
        
        const entry: SleepEntry = {
          ...entryData,
          id: docRef.id,
        };
        
        set((state) => ({
          entries: [...state.entries, entry],
          isLoading: false
        }));
      }
    } catch (error) {
      console.error('Error adding sleep entry:', error);
      set({ error: 'Failed to add sleep entry', isLoading: false });
    }
  },
  
  updateSleepEntry: async (id, updatedEntry) => {
    try {
      set({ isLoading: true, error: null });
      
      const currentEntry = get().entries.find(entry => entry.id === id);
      if (!currentEntry) {
        throw new Error('Sleep entry not found');
      }
      
      const entryRef = doc(db, 'users', currentEntry.userId, 'sleep', id);
      await updateDoc(entryRef, updatedEntry);
      
      set((state) => ({
        entries: state.entries.map((entry) =>
          entry.id === id ? { ...entry, ...updatedEntry } : entry
        ),
        isLoading: false
      }));
    } catch (error) {
      console.error('Error updating sleep entry:', error);
      set({ error: 'Failed to update sleep entry', isLoading: false });
    }
  },
  
  deleteSleepEntry: async (id) => {
    try {
      set({ isLoading: true, error: null });
      
      const currentEntry = get().entries.find(entry => entry.id === id);
      if (!currentEntry) {
        throw new Error('Sleep entry not found');
      }
      
      const entryRef = doc(db, 'users', currentEntry.userId, 'sleep', id);
      await deleteDoc(entryRef);
      
      set((state) => ({
        entries: state.entries.filter((entry) => entry.id !== id),
        isLoading: false
      }));
    } catch (error) {
      console.error('Error deleting sleep entry:', error);
      set({ error: 'Failed to delete sleep entry', isLoading: false });
    }
  },
  
  getEntryByDate: (date: Date) => {
    const { entries } = get();
    const dateStr = formatDate(date);
    return (entries || []).find(entry => isSameDay(entry.date, dateStr)) || null;
  },
  
  getEntriesForLastDays: (days: number) => {
    const { entries } = get();
    if (!entries || entries.length === 0) return [];
    
    const now = new Date();
    const startDate = new Date();
    startDate.setDate(now.getDate() - days);
    const startDateStr = formatDate(startDate);
    
    // Filter entries within the date range
    const filteredEntries = (entries || []).filter(entry => {
      // Compare dates as strings in format YYYY-MM-DD
      return entry.date >= startDateStr && entry.date <= formatDate(now);
    });
    
    // Sort by date (oldest first)
    return filteredEntries.sort((a, b) => 
      a.date.localeCompare(b.date)
    );
  },
  
  getAverageSleepHours: (days: number) => {
    const entries = get().getEntriesForLastDays(days);
    if (!entries || entries.length === 0) return 0;
    
    const totalHours = entries.reduce((sum, entry) => sum + entry.hours, 0);
    return totalHours / entries.length;
  },
  
  getAverageSleepQuality: (days: number) => {
    const entries = get().getEntriesForLastDays(days);
    if (!entries || entries.length === 0) return 0;
    
    const totalQuality = entries.reduce((sum, entry) => sum + entry.quality, 0);
    return totalQuality / entries.length;
  },
  
  loadSleepEntries: async (userId) => {
    try {
      set({ isLoading: true, error: null });
      
      const sleepRef = collection(db, 'users', userId, 'sleep');
      const q = query(sleepRef, orderBy('date', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const entries: SleepEntry[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as SleepEntry[];
      
      set({ entries, isLoading: false });
    } catch (error) {
      console.error('Error loading sleep entries:', error);
      set({ error: 'Failed to load sleep entries', isLoading: false });
    }
  },
  
  subscribeToSleepEntries: (userId) => {
    const sleepRef = collection(db, 'users', userId, 'sleep');
    const q = query(sleepRef, orderBy('date', 'desc'));
    
    return onSnapshot(q, (querySnapshot) => {
      const entries: SleepEntry[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as SleepEntry[];
      
      set({ entries, isLoading: false });
    }, (error) => {
      console.error('Error in sleep entries subscription:', error);
      set({ error: 'Failed to sync sleep entries', isLoading: false });
    });
  },
}));
