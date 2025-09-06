export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  height?: number;
  weight?: number;
  heightUnit?: 'cm' | 'in';
  weightUnit?: 'kg' | 'lbs';
  goal?: string;
  createdAt: Date;
  joinDate?: Date;
  isAdmin?: boolean;
  stats?: UserStats;
}

export interface UserStats {
  totalWorkouts: number;
  totalShotsMade: number;
  totalShotsAttempted: number;
  totalMealsTracked: number;
  streakDays: number;
  badgesEarned: number;
}

export interface Meal {
  id: string;
  userId: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  date: Date;
  imageUrl?: string;
  description: string;
  mealType: string;
}

export interface Workout {
  id: string;
  userId: string;
  type?: string;
  duration: number;
  date: string;
  notes?: string;
  rating?: WorkoutRating;
  description: string;
  intensity?: 'low' | 'medium' | 'high';
  focusArea?: string[];
}

export interface WorkoutRating {
  id: string;
  userId: string;
  workoutId: string;
  date: string;
  focus: number; // 1-5
  effort: number; // 1-5
  recovery: number; // 1-5
  notes?: string;
}

export interface Shot {
  id: string;
  userId: string;
  type: string;
  made: number;
  attempted: number;
  date: Date;
  location?: string;
  shotType?: string;
  shotsMade: number;
  shotsAttempted: number;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // in minutes
  instructor: string;
  price: number;
  rating: number;
  ratingCount: number;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  title: string;
  duration: number; // in minutes
  videoUrl?: string;
  content?: string;
  completed?: boolean;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  criteria: string;
  earned: boolean;
  earnedAt?: Date;
}

export interface DayPlannerEntry {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD format
  timeSlot: string; // HH:MM format
  note: string;
}

export interface Quote {
  id: string;
  text: string;
  author: string;
}

export interface WaterEntry {
  id: string;
  date: string;
  glasses: number;
}

export interface SleepEntry {
  id: string;
  date: string;
  hours: number;
  quality: number;
  notes?: string;
}

export interface DayRating {
  id: string;
  date: string;
  rating: number;
  note?: string;
}

export interface NotificationSettings {
  workoutReminder: {
    enabled: boolean;
    time: string; // HH:MM format
    title: string;
    body: string;
  };
  mealReminder: {
    enabled: boolean;
    time: string; // HH:MM format
    title: string;
    body: string;
  };
  waterReminder: {
    enabled: boolean;
    time: string; // HH:MM format
    title: string;
    body: string;
  };
  sleepReminder: {
    enabled: boolean;
    time: string; // HH:MM format
    title: string;
    body: string;
  };
  shotsReminder: {
    enabled: boolean;
    time: string; // HH:MM format
    title: string;
    body: string;
  };
}

export interface NotificationPermission {
  granted: boolean;
  canAskAgain: boolean;
}