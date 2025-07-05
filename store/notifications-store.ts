import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { NotificationSettings, NotificationPermission } from '@/types';

interface NotificationState {
  settings: NotificationSettings;
  permission: NotificationPermission | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  updateSettings: (settings: Partial<NotificationSettings>) => void;
  updateReminderSettings: (type: keyof NotificationSettings, settings: Partial<NotificationSettings[keyof NotificationSettings]>) => void;
  requestPermissions: () => Promise<boolean>;
  scheduleAllNotifications: () => Promise<void>;
  cancelAllNotifications: () => Promise<void>;
  scheduleNotification: (type: keyof NotificationSettings) => Promise<void>;
  cancelNotification: (type: keyof NotificationSettings) => Promise<void>;
  setPermission: (permission: NotificationPermission) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const defaultSettings: NotificationSettings = {
  workoutReminder: {
    enabled: false,
    time: '08:00',
    title: 'Time to Train! 🏀',
    body: 'Get ready to dominate the court with your workout session.'
  },
  mealReminder: {
    enabled: false,
    time: '12:00',
    title: 'Fuel Your Game! 🍎',
    body: "Don't forget to track your meal and stay properly fueled."
  },
  waterReminder: {
    enabled: false,
    time: '14:00',
    title: 'Stay Hydrated! 💧',
    body: 'Remember to drink water and track your hydration.'
  },
  sleepReminder: {
    enabled: false,
    time: '22:00',
    title: 'Recovery Time! 😴',
    body: 'Good sleep is essential for peak performance. Time to wind down.'
  },
  shotsReminder: {
    enabled: false,
    time: '16:00',
    title: 'Practice Makes Perfect! 🎯',
    body: 'Time to work on your shooting and track your progress.'
  }
};

export const useNotificationsStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      settings: defaultSettings,
      permission: null,
      isLoading: false,
      error: null,

      updateSettings: (newSettings) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings }
        }));
        // Re-schedule notifications with new settings
        get().scheduleAllNotifications();
      },

      updateReminderSettings: (type, reminderSettings) => {
        set((state) => ({
          settings: {
            ...state.settings,
            [type]: { ...state.settings[type], ...reminderSettings }
          }
        }));
        // Re-schedule this specific notification
        get().scheduleNotification(type);
      },

      requestPermissions: async () => {
        try {
          set({ isLoading: true, error: null });
          
          if (Platform.OS === 'web') {
            set({ 
              permission: { granted: false, canAskAgain: false },
              isLoading: false 
            });
            return false;
          }

          const { status: existingStatus } = await Notifications.getPermissionsAsync();
          let finalStatus = existingStatus;

          if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
          }

          const granted = finalStatus === 'granted';
          const permission = {
            granted,
            canAskAgain: finalStatus !== 'denied'
          };

          set({ permission, isLoading: false });
          return granted;
        } catch (error) {
          console.error('Error requesting notification permissions:', error);
          set({ 
            error: 'Failed to request notification permissions',
            isLoading: false 
          });
          return false;
        }
      },

      scheduleAllNotifications: async () => {
        try {
          const { settings, permission } = get();
          
          if (!permission?.granted || Platform.OS === 'web') {
            return;
          }

          // Cancel all existing notifications first
          await Notifications.cancelAllScheduledNotificationsAsync();

          // Schedule each enabled notification
          for (const [type, config] of Object.entries(settings)) {
            if (config.enabled) {
              await get().scheduleNotification(type as keyof NotificationSettings);
            }
          }
        } catch (error) {
          console.error('Error scheduling notifications:', error);
          set({ error: 'Failed to schedule notifications' });
        }
      },

      cancelAllNotifications: async () => {
        try {
          if (Platform.OS === 'web') return;
          
          await Notifications.cancelAllScheduledNotificationsAsync();
        } catch (error) {
          console.error('Error canceling notifications:', error);
          set({ error: 'Failed to cancel notifications' });
        }
      },

      scheduleNotification: async (type) => {
        try {
          const { settings, permission } = get();
          
          if (!permission?.granted || Platform.OS === 'web') {
            return;
          }

          const config = settings[type];
          if (!config.enabled) {
            return;
          }

          // Cancel existing notification for this type
          await get().cancelNotification(type);

          // Parse time
          const [hours, minutes] = config.time.split(':').map(Number);
          
          // Create trigger for daily notification
          const trigger = {
            hour: hours,
            minute: minutes,
            repeats: true,
          };

          await Notifications.scheduleNotificationAsync({
            identifier: `${type}_reminder`,
            content: {
              title: config.title,
              body: config.body,
              sound: true,
              priority: Notifications.AndroidNotificationPriority.HIGH,
            },
            trigger,
          });
        } catch (error) {
          console.error(`Error scheduling ${type} notification:`, error);
          set({ error: `Failed to schedule ${type} reminder` });
        }
      },

      cancelNotification: async (type) => {
        try {
          if (Platform.OS === 'web') return;
          
          await Notifications.cancelScheduledNotificationAsync(`${type}_reminder`);
        } catch (error) {
          console.error(`Error canceling ${type} notification:`, error);
        }
      },

      setPermission: (permission) => set({ permission }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
    }),
    {
      name: 'notifications-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ settings: state.settings }),
    }
  )
);