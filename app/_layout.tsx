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
import { useMealsStore } from "@/store/meals-store";
import { useSleepStore } from "@/store/sleep-store";
import { useWaterStore } from "@/store/water-store";
import { useWorkoutsStore } from "@/store/workouts-store";
import { useShotsStore } from "@/store/shots-store";
import { useWorkoutRatingStore } from "@/store/workout-rating-store";
import { useDayRatingStore } from "@/store/day-rating-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from 'expo-notifications';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/config/firebase';

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
    }),
  });
}

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...FontAwesome.font,
  });
  
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null);
  const [isAppReady, setIsAppReady] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [authInitialized, setAuthInitialized] = useState(false);

  const initializeCourses = useCoursesStore(state => state.initializeCourses);
  const initializeBadges = useRewardsStore(state => state.initializeBadges);
  const { requestPermissions, scheduleAllNotifications, setPermission } = useNotificationsStore();
  const { setFirebaseUser, firebaseUser } = useUserStore();
  const router = useRouter();
  const segments = useSegments();
  
  const subscribeToMeals = useMealsStore(state => state.subscribeToMeals);
  const subscribeToSleepEntries = useSleepStore(state => state.subscribeToSleepEntries);
  const subscribeToWaterEntries = useWaterStore(state => state.subscribeToWaterEntries);
  const subscribeToWorkouts = useWorkoutsStore(state => state.subscribeToWorkouts);
  const subscribeToSessions = useShotsStore(state => state.subscribeToSessions);
  const subscribeToWorkoutRatings = useWorkoutRatingStore(state => state.subscribeToWorkoutRatings);
  const subscribeToDayRatings = useDayRatingStore(state => state.subscribeToDayRatings);
  const checkAndResetDaily = useWaterStore(state => state.checkAndResetDaily);

  useEffect(() => {
    if (error) {
      console.error(error);
      throw error;
    }
  }, [error]);
  
  // Initialize Firebase auth listener and data subscriptions
  useEffect(() => {
    let dataUnsubscribers: (() => void)[] = [];
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      
      dataUnsubscribers.forEach(unsub => unsub());
      dataUnsubscribers = [];
      
      if (user) {
        // Initialize data subscriptions for authenticated user
        try {
          const mealsUnsub = subscribeToMeals(user.uid);
          const sleepUnsub = subscribeToSleepEntries(user.uid);
          const waterUnsub = subscribeToWaterEntries(user.uid);
          const workoutsUnsub = subscribeToWorkouts(user.uid);
          const sessionsUnsub = subscribeToSessions(user.uid);
          const workoutRatingsUnsub = subscribeToWorkoutRatings(user.uid);
          const dayRatingsUnsub = subscribeToDayRatings(user.uid);
          
          dataUnsubscribers = [mealsUnsub, sleepUnsub, waterUnsub, workoutsUnsub, sessionsUnsub, workoutRatingsUnsub, dayRatingsUnsub];
          
          await checkAndResetDaily(user.uid);
        } catch (error) {
          console.error('Error initializing data subscriptions:', error);
        }
      }
      
      setAuthInitialized(true);
    });

    return () => {
      unsubscribe();
      dataUnsubscribers.forEach(unsub => unsub());
    };
  }, [setFirebaseUser, subscribeToMeals, subscribeToSleepEntries, subscribeToWaterEntries, subscribeToWorkouts, subscribeToSessions, subscribeToWorkoutRatings, subscribeToDayRatings, checkAndResetDaily]);
  
  // Check if user has completed onboarding
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const value = await AsyncStorage.getItem('hasCompletedOnboarding');
        setHasCompletedOnboarding(value === 'true');
      } catch (error) {
        console.error('Error checking onboarding status:', error);
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

    const inAuthGroup = segments[0] === 'auth';
    const inTabsGroup = segments[0] === '(tabs)';
    const inOnboarding = segments[0] === 'onboarding';

    if (!firebaseUser && !inAuthGroup) {
      router.replace('/auth/login');
    } else if (firebaseUser && !hasCompletedOnboarding && !inOnboarding) {
      router.replace('/onboarding');
    } else if (firebaseUser && hasCompletedOnboarding && !inTabsGroup) {
      router.replace('/(tabs)');
    }
  }, [firebaseUser, hasCompletedOnboarding, isAppReady, showSplash, segments, router]);

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
    <ErrorBoundary>
      <>
        <StatusBar style="light" />
        <RootLayoutNav 
          hasCompletedOnboarding={hasCompletedOnboarding} 
          isAuthenticated={!!firebaseUser}
        />
      </>
    </ErrorBoundary>
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
