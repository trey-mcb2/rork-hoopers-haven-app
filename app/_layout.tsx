import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
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

  useEffect(() => {
    if (error) {
      console.error(error);
      throw error;
    }
  }, [error]);
  
  // Initialize Firebase auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      setAuthInitialized(true);
    });

    return unsubscribe;
  }, [setFirebaseUser]);
  
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

        // If permissions are granted, schedule notifications
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
      {!isAuthenticated && (
        <>
          <Stack.Screen 
            name="auth/login" 
            options={{ headerShown: false }} 
          />
          <Stack.Screen 
            name="auth/signup" 
            options={{ headerShown: false }} 
          />
        </>
      )}
      {!hasCompletedOnboarding && isAuthenticated && (
        <Stack.Screen 
          name="onboarding" 
          options={{ headerShown: false }} 
        />
      )}
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