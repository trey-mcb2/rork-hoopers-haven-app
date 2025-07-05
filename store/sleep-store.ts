import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface SleepEntry {
  id: string;
  date: string; // Changed to string format YYYY-MM-DD for consistency
  hours: number;
  quality: number; // 1-5 rating
  notes?: string;
}

interface SleepState {
  entries: SleepEntry[];
  isLoading: boolean;
  error: string | null;
  addSleepEntry: (entry: Omit<SleepEntry, 'id'>) => void;
  updateSleepEntry: (id: string, entry: Partial<SleepEntry>) => void;
  deleteSleepEntry: (id: string) => void;
  getEntryByDate: (date: Date) => SleepEntry | null;
  getEntriesForLastDays: (days: number) => SleepEntry[];
  getAverageSleepHours: (days: number) => number;
  getAverageSleepQuality: (days: number) => number;
}

const formatDate = (date: Date): string => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

const isSameDay = (date1: string, date2: string): boolean => {
  return date1 === date2;
};

export const useSleepStore = create<SleepState>()(
  persist(
    (set, get) => ({
      entries: [],
      isLoading: true, // Start with loading state
      error: null,
      
      addSleepEntry: (entryData) => {
        const entry: SleepEntry = {
          ...entryData,
          id: Date.now().toString(),
        };
        
        // Check if an entry already exists for this date
        const existingEntryIndex = (get().entries || []).findIndex(e => 
          isSameDay(e.date, entry.date)
        );
        
        if (existingEntryIndex >= 0) {
          // Update existing entry
          set((state) => ({
            entries: (state.entries || []).map((e, index) => 
              index === existingEntryIndex ? entry : e
            ),
          }));
        } else {
          // Add new entry
          set((state) => ({
            entries: [...(state.entries || []), entry],
          }));
        }
      },
      
      updateSleepEntry: (id, updatedEntry) => {
        set((state) => ({
          entries: (state.entries || []).map((entry) =>
            entry.id === id ? { ...entry, ...updatedEntry } : entry
          ),
        }));
      },
      
      deleteSleepEntry: (id) => {
        set((state) => ({
          entries: (state.entries || []).filter((entry) => entry.id !== id),
        }));
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
    }),
    {
      name: 'sleep-storage',
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