import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { View, Text, StyleSheet, Image, Platform } from "react-native";
import { ErrorBoundary } from "./error-boundary";
import Colors from "@/constants/colors";
import { useCoursesStore } from "@/store/courses-store";
import { useRewardsStore } from "@/store/rewards-store";
import { useNotificationsStore } from "@/store/notifications-store";
import { useUserStore } from "@/store/user-store";
// 🔥 Removed Firebase logic, will rewire with tRPC
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from 'expo-notifications';
// 🔥 Removed Firebase logic, will rewire with tRPC
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { trpc, trpcClient } from "@/lib/trpc";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(tabs)",
};

// Configure notification behavior
if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Create a client for React Query
const queryClient = new QueryClient();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...FontAwesome.font,
  });
  
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null);
  const [isAppReady, setIsAppReady] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [authInitialized] = useState(true);

  const initializeCourses = useCoursesStore(state => state.initializeCourses);
  const initializeBadges = useRewardsStore(state => state.initializeBadges);
  const { scheduleAllNotifications, setPermission } = useNotificationsStore();
  const { user } = useUserStore();
  const router = useRouter();
  const segments = useSegments();
  
  // 🔥 Removed Firebase logic, will rewire with tRPC

  useEffect(() => {
    if (error) {
      console.error(error);
      throw error;
    }
  }, [error]);
  
  // 🔥 Removed Firebase logic, will rewire with tRPC
  
  // Check if user has completed onboarding
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const value = await AsyncStorage.getItem('hasCompletedOnboarding');
        setHasCompletedOnboarding(value === 'true');
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        console.warn('AsyncStorage failed, defaulting to incomplete onboarding');
        setHasCompletedOnboarding(false);
      }
    };
    
    checkOnboardingStatus();
  }, []);

  // Initialize notifications
  useEffect(() => {
    const initializeNotifications = async () => {
      if (Platform.OS === 'web') {
        setPermission({ granted: false, canAskAgain: false });
        return;
      }

      try {
        // Check existing permissions
        const { status } = await Notifications.getPermissionsAsync();
        const granted = status === 'granted';
        
        setPermission({
          granted,
          canAskAgain: status !== 'denied'
        });

        if (granted) {
          await scheduleAllNotifications();
        }
      } catch (error) {
        console.error('Error initializing notifications:', error);
        setPermission({ granted: false, canAskAgain: true });
      }
    };

    initializeNotifications();
  }, [setPermission, scheduleAllNotifications]);

  useEffect(() => {
    if (loaded && hasCompletedOnboarding !== null && authInitialized) {
      // Initialize app data
      initializeCourses();
      initializeBadges();
      
      // Set app as ready
      setIsAppReady(true);
      
      // Show custom splash for 2.5 seconds
      const timer = setTimeout(() => {
        setShowSplash(false);
        SplashScreen.hideAsync();
      }, 2500);
      
      return () => clearTimeout(timer);
    }
  }, [loaded, hasCompletedOnboarding, authInitialized, initializeCourses, initializeBadges]);

  useEffect(() => {
    if (!isAppReady || showSplash) return;

    const inTabsGroup = segments[0] === '(tabs)';
    const inOnboarding = segments[0] === 'onboarding';

    // 🔥 Removed Firebase logic, will rewire with tRPC
    if (!hasCompletedOnboarding && !inOnboarding) {
      router.replace('/onboarding');
    } else if (hasCompletedOnboarding && !inTabsGroup) {
      router.replace('/(tabs)');
    }
  }, [hasCompletedOnboarding, isAppReady, showSplash, segments, router]);

  if (!loaded || hasCompletedOnboarding === null || !isAppReady || !authInitialized) {
    return null;
  }

  if (showSplash) {
    return (
      <View style={styles.splashContainer}>
        <StatusBar style="light" />
        <Image 
          source={require('../assets/images/splash-icon.png')}
          style={styles.splashImage}
          resizeMode="contain"
        />
        <Text style={styles.splashText}>The World Is Yours</Text>
      </View>
    );
  }

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary>
          <>
            <StatusBar style="light" />
            <RootLayoutNav 
              hasCompletedOnboarding={hasCompletedOnboarding} 
              isAuthenticated={!!user}
            />
          </>
        </ErrorBoundary>
      </QueryClientProvider>
    </trpc.Provider>
  );
}

function RootLayoutNav({ 
  hasCompletedOnboarding, 
  isAuthenticated 
}: { 
  hasCompletedOnboarding: boolean;
  isAuthenticated: boolean;
}) {
  return (
    <Stack>
      <Stack.Screen 
        name="auth/login" 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="auth/signup" 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="onboarding" 
        options={{ headerShown: false }} 
      />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen 
        name="course/[id]" 
        options={{ 
          headerTitle: "Course Details",
          headerStyle: {
            backgroundColor: Colors.primary.background,
          },
          headerTintColor: Colors.white,
        }} 
      />
      <Stack.Screen 
        name="meal/add" 
        options={{ 
          headerTitle: "Add Meal",
          presentation: "modal",
          headerStyle: {
            backgroundColor: Colors.primary.background,
          },
          headerTintColor: Colors.white,
        }} 
      />
      <Stack.Screen 
        name="workout/add" 
        options={{ 
          headerTitle: "Add Workout",
          presentation: "modal",
          headerStyle: {
            backgroundColor: Colors.primary.background,
          },
          headerTintColor: Colors.white,
        }} 
      />
      <Stack.Screen 
        name="shots/add" 
        options={{ 
          headerTitle: "Add Shot Session",
          presentation: "modal",
          headerStyle: {
            backgroundColor: Colors.primary.background,
          },
          headerTintColor: Colors.white,
        }} 
      />
      <Stack.Screen 
        name="sleep/add" 
        options={{ 
          headerTitle: "Track Sleep",
          presentation: "modal",
          headerStyle: {
            backgroundColor: Colors.primary.background,
          },
          headerTintColor: Colors.white,
        }} 
      />
      <Stack.Screen 
        name="day/rate" 
        options={{ 
          headerTitle: "Rate Your Day",
          presentation: "modal",
          headerStyle: {
            backgroundColor: Colors.primary.background,
          },
          headerTintColor: Colors.white,
        }} 
      />
      <Stack.Screen 
        name="profile/edit" 
        options={{ 
          headerTitle: "Edit Profile",
          headerShown: false,
          presentation: "modal",
        }} 
      />
      <Stack.Screen 
        name="notifications/settings" 
        options={{ 
          headerTitle: "Notification Settings",
          presentation: "modal",
          headerStyle: {
            backgroundColor: Colors.primary.background,
          },
          headerTintColor: Colors.white,
        }} 
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: Colors.primary.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashImage: {
    width: '70%',
    height: '30%',
    marginBottom: 20,
  },
  splashText: {
    color: Colors.white,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  }
});
