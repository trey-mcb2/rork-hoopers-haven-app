import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface WaterEntry {
  id: string;
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
  addWater: (glasses: number) => void;
  resetTodayWater: () => void;
  checkAndResetDaily: () => void;
  getEntryByDate: (date: Date) => WaterEntry | null;
  getEntriesForLastDays: (days: number) => WaterEntry[];
}

const formatDate = (date: Date): string => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

const createTodayEntry = (): WaterEntry => ({
  id: Date.now().toString(),
  date: formatDate(new Date()),
  glasses: 0,
  liters: 0,
});

const isSameDay = (date1: string, date2: string): boolean => {
  return date1 === date2;
};

export const useWaterStore = create<WaterState>()(
  persist(
    (set, get) => ({
      logs: [],
      todayEntry: null,
      isLoading: true, // Start with loading state
      error: null,
      
      addWater: (glasses: number) => {
        const { todayEntry, logs } = get();
        const today = formatDate(new Date());
        
        if (todayEntry && isSameDay(todayEntry.date, today)) {
          // Update today's entry
          const updatedEntry = {
            ...todayEntry,
            glasses: todayEntry.glasses + glasses,
            liters: ((todayEntry.glasses + glasses) * 0.25), // 1 glass = 250ml = 0.25L
            amount: todayEntry.glasses + glasses, // For backward compatibility
          };
          
          set({
            todayEntry: updatedEntry,
            logs: (logs || []).map(entry => 
              entry.id === updatedEntry.id ? updatedEntry : entry
            ),
          });
        } else {
          // Create a new entry for today
          const newEntry = {
            id: Date.now().toString(),
            date: today,
            glasses,
            liters: glasses * 0.25,
            amount: glasses, // For backward compatibility
          };
          
          set({
            todayEntry: newEntry,
            logs: [...(logs || []), newEntry],
          });
        }
      },
      
      resetTodayWater: () => {
        const newEntry = createTodayEntry();
        const { logs } = get();
        const today = formatDate(new Date());
        
        // Remove any existing entry for today
        const filteredEntries = (logs || []).filter(entry => 
          !isSameDay(entry.date, today)
        );
        
        set({
          todayEntry: newEntry,
          logs: [...filteredEntries, newEntry],
        });
      },
      
      checkAndResetDaily: () => {
        const { todayEntry } = get();
        const today = formatDate(new Date());
        
        if (!todayEntry) {
          // No entry exists, create one
          get().resetTodayWater();
          return;
        }
        
        // Check if the entry is from today
        if (!isSameDay(todayEntry.date, today)) {
          // Entry is from a previous day, reset
          get().resetTodayWater();
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
    }),
    {
      name: 'water-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        // When the store is rehydrated, check if we need to reset the daily counter
        // and set loading to false
        if (state) {
          state.checkAndResetDaily();
          state.isLoading = false;
        }
      },
    }
  )
);