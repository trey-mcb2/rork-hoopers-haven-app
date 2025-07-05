import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface PlannerEntry {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD format
  timeSlot: string; // HH:MM format
  note: string;
}

interface DayPlannerState {
  entries: PlannerEntry[];
  isLoading: boolean;
  error: string | null;
  addEntry: (entry: Omit<PlannerEntry, 'id'>) => void;
  updateEntry: (id: string, note: string) => void;
  deleteEntry: (id: string) => void;
  getEntriesForDate: (date: string) => PlannerEntry[];
  getEntriesForDateRange: (startDate: string, endDate: string) => PlannerEntry[];
}

export const useDayPlannerStore = create<DayPlannerState>()(
  persist(
    (set, get) => ({
      entries: [],
      isLoading: true,
      error: null,
      
      addEntry: (entryData) => {
        const entry: PlannerEntry = {
          ...entryData,
          id: Date.now().toString(),
        };
        
        set((state) => ({
          entries: [...(state.entries || []), entry],
        }));
      },
      
      updateEntry: (id, note) => {
        set((state) => ({
          entries: (state.entries || []).map((entry) =>
            entry.id === id ? { ...entry, note } : entry
          ),
        }));
      },
      
      deleteEntry: (id) => {
        set((state) => ({
          entries: (state.entries || []).filter((entry) => entry.id !== id),
        }));
      },
      
      getEntriesForDate: (date: string) => {
        return (get().entries || []).filter(entry => entry.date === date);
      },
      
      getEntriesForDateRange: (startDate: string, endDate: string) => {
        return (get().entries || []).filter(entry => 
          entry.date >= startDate && entry.date <= endDate
        );
      },
    }),
    {
      name: 'day-planner-storage',
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