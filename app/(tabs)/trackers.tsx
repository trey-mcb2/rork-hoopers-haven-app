import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Colors from '@/constants/colors';
import { useMealsStore } from '@/store/meals-store';
import { useWorkoutsStore } from '@/store/workouts-store';
import { useWorkoutRatingStore } from '@/store/workout-rating-store';
import { useShotsStore } from '@/store/shots-store';
import { useWaterStore } from '@/store/water-store';
import { useSleepStore } from '@/store/sleep-store';
import { useDayRatingStore } from '@/store/day-rating-store';
import Card from '@/components/Card';
import Button from '@/components/Button';
import EmptyState from '@/components/EmptyState';
import WaterTracker from '@/components/WaterTracker';
import SleepTracker from '@/components/SleepTracker';
import DayRating from '@/components/DayRating';
import StarRating from '@/components/StarRating';
import { 
  Utensils, 
  Dumbbell, 
  Target,
  Plus,
  ChevronRight,
  Calendar,
  BarChart3,
  Droplet,
  Moon,
  Edit,
  Trash2,
  Star
} from 'lucide-react-native';

type TrackerTab = 'meals' | 'workouts' | 'shots' | 'water' | 'sleep' | 'day';

export default function TrackersScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TrackerTab>('meals');
  
  const { meals = [], isLoading: isLoadingMeals, deleteMeal } = useMealsStore();
  const { workouts = [], isLoading: isLoadingWorkouts, deleteWorkout } = useWorkoutsStore();
  const { ratings: workoutRatings = [], getRatingByWorkoutId, isLoading: isLoadingWorkoutRatings } = useWorkoutRatingStore();
  const { sessions = [], getWeeklyStats, getMonthlyStats, isLoading: isLoadingShots } = useShotsStore();
  const { logs: waterEntries = [], getEntriesForLastDays: getWaterEntries, isLoading: isLoadingWater } = useWaterStore();
  const { entries: sleepEntries = [], getEntriesForLastDays: getSleepEntries, isLoading: isLoadingSleep } = useSleepStore();
  const { ratings: dayRatings = [], getRatingsForLastDays: getDayRatings, isLoading: isLoadingDayRatings } = useDayRatingStore();
  
  const isLoading = () => {
    switch (activeTab) {
      case 'meals': return isLoadingMeals;
      case 'workouts': return isLoadingWorkouts || isLoadingWorkoutRatings;
      case 'shots': return isLoadingShots;
      case 'water': return isLoadingWater;
      case 'sleep': return isLoadingSleep;
      case 'day': return isLoadingDayRatings;
      default: return false;
    }
  };
  
  const handleEditMeal = (mealId: string) => {
    router.push({
      pathname: '/meal/add',
      params: { id: mealId }
    });
  };
  
  const handleDeleteMeal = (mealId: string) => {
    Alert.alert(
      "Delete Meal",
      "Are you sure you want to delete this meal?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Delete", 
          onPress: () => deleteMeal(mealId),
          style: "destructive"
        }
      ]
    );
  };
  
  const handleEditWorkout = (workoutId: string) => {
    router.push({
      pathname: '/workout/add',
      params: { id: workoutId }
    });
  };
  
  const handleDeleteWorkout = (workoutId: string) => {
    Alert.alert(
      "Delete Workout",
      "Are you sure you want to delete this workout?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Delete", 
          onPress: () => deleteWorkout(workoutId),
          style: "destructive"
        }
      ]
    );
  };
  
  const renderTabContent = () => {
    if (isLoading()) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.accent.default} />
          <Text style={styles.loadingText}>Loading {activeTab} data...</Text>
        </View>
      );
    }
    
    switch (activeTab) {
      case 'meals':
        return renderMealsTab();
      case 'workouts':
        return renderWorkoutsTab();
      case 'shots':
        return renderShotsTab();
      case 'water':
        return renderWaterTab();
      case 'sleep':
        return renderSleepTab();
      case 'day':
        return renderDayRatingTab();
      default:
        return null;
    }
  };
  
  const renderMealsTab = () => {
    if (!meals || meals.length === 0) {
      return (
        <EmptyState
          icon={<Utensils size={32} color={Colors.neutral.textDark} />}
          title="No Meals Tracked Yet"
          message="Start tracking your nutrition to fuel your performance on the court."
          actionLabel="Add Meal"
          onAction={() => router.push('/meal/add')}
        />
      );
    }
    
    // Group meals by date
    const mealsByDate: Record<string, typeof meals> = {};
    
    meals.forEach(meal => {
      const date = new Date(meal.date).toDateString();
      if (!mealsByDate[date]) {
        mealsByDate[date] = [];
      }
      mealsByDate[date].push(meal);
    });
    
    // Sort dates in descending order
    const sortedDates = Object.keys(mealsByDate).sort((a, b) => 
      new Date(b).getTime() - new Date(a).getTime()
    );
    
    return (
      <View style={styles.tabContent}>
        <Button
          title="Add Meal"
          onPress={() => router.push('/meal/add')}
          variant="primary"
          style={styles.addButton}
          leftIcon={<Plus size={18} color={Colors.white} />}
        />
        
        {sortedDates.map(date => (
          <View key={date} style={styles.dateGroup}>
            <Text style={styles.dateHeader}>{date}</Text>
            {mealsByDate[date].map(meal => (
              <Card key={meal.id} style={styles.mealCard}>
                <View style={styles.mealHeader}>
                  <Text style={styles.mealType}>
                    {meal.mealType && meal.mealType.charAt(0).toUpperCase() + meal.mealType.slice(1)}
                  </Text>
                  <Text style={styles.mealTime}>
                    {new Date(meal.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
                <Text style={styles.mealDescription}>{meal.description}</Text>
                {(meal.calories || meal.protein) && (
                  <View style={styles.mealNutrition}>
                    {meal.calories && (
                      <Text style={styles.nutritionItem}>{meal.calories} calories</Text>
                    )}
                    {meal.protein && (
                      <Text style={styles.nutritionItem}>{meal.protein}g protein</Text>
                    )}
                  </View>
                )}
                <View style={styles.actionButtons}>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleEditMeal(meal.id)}
                  >
                    <Edit size={16} color={Colors.accent.default} />
                    <Text style={styles.actionButtonText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleDeleteMeal(meal.id)}
                  >
                    <Trash2 size={16} color={Colors.error} />
                    <Text style={[styles.actionButtonText, styles.deleteText]}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            ))}
          </View>
        ))}
      </View>
    );
  };
  
  const renderWorkoutsTab = () => {
    if (!workouts || workouts.length === 0) {
      return (
        <EmptyState
          icon={<Dumbbell size={32} color={Colors.neutral.textDark} />}
          title="No Workouts Logged Yet"
          message="Track your basketball workouts to monitor your progress and consistency."
          actionLabel="Add Workout"
          onAction={() => router.push('/workout/add')}
        />
      );
    }
    
    // Group workouts by date
    const workoutsByDate: Record<string, typeof workouts> = {};
    
    workouts.forEach(workout => {
      const date = new Date(workout.date).toDateString();
      if (!workoutsByDate[date]) {
        workoutsByDate[date] = [];
      }
      workoutsByDate[date].push(workout);
    });
    
    // Sort dates in descending order
    const sortedDates = Object.keys(workoutsByDate).sort((a, b) => 
      new Date(b).getTime() - new Date(a).getTime()
    );
    
    return (
      <View style={styles.tabContent}>
        <Button
          title="Add Workout"
          onPress={() => router.push('/workout/add')}
          variant="primary"
          style={styles.addButton}
          leftIcon={<Plus size={18} color={Colors.white} />}
        />
        
        {sortedDates.map(date => (
          <View key={date} style={styles.dateGroup}>
            <Text style={styles.dateHeader}>{date}</Text>
            {workoutsByDate[date].map(workout => {
              // Get rating for this workout if it exists
              const workoutRating = getRatingByWorkoutId ? getRatingByWorkoutId(workout.id) : undefined;
              
              return (
                <Card key={workout.id} style={styles.workoutCard}>
                  <View style={styles.workoutHeader}>
                    <Text style={styles.workoutDuration}>{workout.duration} min</Text>
                    {workout.intensity && (
                      <View style={[
                        styles.intensityBadge,
                        workout.intensity === 'high' ? styles.highIntensity :
                        workout.intensity === 'medium' ? styles.mediumIntensity :
                        styles.lowIntensity
                      ]}>
                        <Text style={styles.intensityText}>
                          {workout.intensity.toUpperCase()}
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.workoutDescription}>{workout.description}</Text>
                  
                  {/* Display workout rating if available */}
                  {workoutRating && (
                    <View style={styles.workoutRatingContainer}>
                      <View style={styles.workoutRatingHeader}>
                        <Star size={16} color={Colors.accent.default} />
                        <Text style={styles.workoutRatingTitle}>Workout Rating</Text>
                      </View>
                      <View style={styles.workoutRatingDetails}>
                        <View style={styles.workoutRatingItem}>
                          <Text style={styles.workoutRatingLabel}>Focus:</Text>
                          <StarRating 
                            rating={workoutRating.focus} 
                            size={14} 
                            disabled={true}
                          />
                        </View>
                        <View style={styles.workoutRatingItem}>
                          <Text style={styles.workoutRatingLabel}>Effort:</Text>
                          <StarRating 
                            rating={workoutRating.effort} 
                            size={14} 
                            disabled={true}
                          />
                        </View>
                        <View style={styles.workoutRatingItem}>
                          <Text style={styles.workoutRatingLabel}>Recovery:</Text>
                          <StarRating 
                            rating={workoutRating.recovery} 
                            size={14} 
                            disabled={true}
                          />
                        </View>
                      </View>
                      {workoutRating.notes && (
                        <Text style={styles.workoutRatingNotes}>
                          "{workoutRating.notes}"
                        </Text>
                      )}
                    </View>
                  )}
                  
                  {workout.focusArea && workout.focusArea.length > 0 && (
                    <View style={styles.focusAreaContainer}>
                      <Text style={styles.focusAreaLabel}>Focus Areas:</Text>
                      <View style={styles.focusAreaTags}>
                        {workout.focusArea.map((area, index) => (
                          <View key={index} style={styles.focusAreaTag}>
                            <Text style={styles.focusAreaText}>{area}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
                  <View style={styles.actionButtons}>
                    <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={() => handleEditWorkout(workout.id)}
                    >
                      <Edit size={16} color={Colors.accent.default} />
                      <Text style={styles.actionButtonText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={() => handleDeleteWorkout(workout.id)}
                    >
                      <Trash2 size={16} color={Colors.error} />
                      <Text style={[styles.actionButtonText, styles.deleteText]}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </Card>
              );
            })}
          </View>
        ))}
      </View>
    );
  };
  
  const renderShotsTab = () => {
    const weeklyStats = getWeeklyStats ? getWeeklyStats() : [];
    const monthlyStats = getMonthlyStats ? getMonthlyStats() : [];
    
    if (!sessions || sessions.length === 0) {
      return (
        <EmptyState
          icon={<Target size={32} color={Colors.neutral.textDark} />}
          title="No Shot Sessions Recorded"
          message="Track your shooting sessions to improve your accuracy and monitor progress."
          actionLabel="Add Shot Session"
          onAction={() => router.push('/shots/add')}
        />
      );
    }
    
    // Group sessions by date
    const sessionsByDate: Record<string, typeof sessions> = {};
    
    sessions.forEach(session => {
      const date = new Date(session.date).toDateString();
      if (!sessionsByDate[date]) {
        sessionsByDate[date] = [];
      }
      sessionsByDate[date].push(session);
    });
    
    // Sort dates in descending order
    const sortedDates = Object.keys(sessionsByDate).sort((a, b) => 
      new Date(b).getTime() - new Date(a).getTime()
    );
    
    return (
      <View style={styles.tabContent}>
        <Button
          title="Add Shot Session"
          onPress={() => router.push('/shots/add')}
          variant="primary"
          style={styles.addButton}
          leftIcon={<Plus size={18} color={Colors.white} />}
        />
        
        <Card style={styles.statsCard}>
          <Text style={styles.statsTitle}>Weekly Shot Totals</Text>
          <View style={styles.statsChartContainer}>
            {weeklyStats.map((week, index) => (
              <View key={index} style={styles.chartBar}>
                <View style={styles.barLabels}>
                  <Text style={styles.barValue}>{week.made}</Text>
                  <Text style={styles.barLabel}>{week.date}</Text>
                </View>
                <View style={styles.barContainer}>
                  <View 
                    style={[
                      styles.barFill, 
                      { width: `${Math.min(week.made / 500 * 100, 100)}%` }
                    ]} 
                  />
                </View>
              </View>
            ))}
          </View>
        </Card>
        
        {sortedDates.map(date => (
          <View key={date} style={styles.dateGroup}>
            <Text style={styles.dateHeader}>{date}</Text>
            {sessionsByDate[date].map(session => (
              <Card key={session.id} style={styles.sessionCard}>
                <View style={styles.sessionHeader}>
                  <View style={styles.sessionStats}>
                    <Text style={styles.sessionMade}>{session.shotsMade}</Text>
                    <Text style={styles.sessionDivider}>/</Text>
                    <Text style={styles.sessionAttempted}>{session.shotsAttempted}</Text>
                  </View>
                  <Text style={styles.sessionPercentage}>
                    {Math.round((session.shotsMade / session.shotsAttempted) * 100)}%
                  </Text>
                </View>
                {session.shotType && (
                  <Text style={styles.sessionType}>Shot Type: {session.shotType}</Text>
                )}
                {session.location && (
                  <Text style={styles.sessionLocation}>Location: {session.location}</Text>
                )}
              </Card>
            ))}
          </View>
        ))}
      </View>
    );
  };
  
  const renderWaterTab = () => {
    const last7DaysEntries = getWaterEntries ? getWaterEntries(7) : [];
    const last30DaysEntries = getWaterEntries ? getWaterEntries(30) : [];
    
    if (!waterEntries || waterEntries.length === 0) {
      return (
        <EmptyState
          icon={<Droplet size={32} color={Colors.neutral.textDark} />}
          title="No Water Intake Tracked Yet"
          message="Start tracking your water intake to stay hydrated and perform at your best."
          actionLabel="Track Water"
          onAction={() => setActiveTab('water')}
        />
      );
    }
    
    return (
      <View style={styles.tabContent}>
        <WaterTracker />
        
        <Card style={styles.statsCard}>
          <Text style={styles.statsTitle}>7-Day Water Intake</Text>
          <View style={styles.statsChartContainer}>
            {last7DaysEntries.map((entry, index) => (
              <View key={index} style={styles.chartBar}>
                <View style={styles.barLabels}>
                  <Text style={styles.barValue}>{entry.glasses}</Text>
                  <Text style={styles.barLabel}>
                    {new Date(entry.date).toLocaleDateString(undefined, { weekday: 'short' })}
                  </Text>
                </View>
                <View style={styles.barContainer}>
                  <View 
                    style={[
                      styles.barFill, 
                      { width: `${Math.min(entry.glasses / 8 * 100, 100)}%` }
                    ]} 
                  />
                </View>
              </View>
            ))}
          </View>
        </Card>
        
        <Card style={styles.statsCard}>
          <Text style={styles.statsTitle}>30-Day Overview</Text>
          <View style={styles.monthlyStatsContainer}>
            <Text style={styles.monthlyStatsValue}>
              {last30DaysEntries.reduce((sum, entry) => sum + entry.glasses, 0)} glasses
            </Text>
            <Text style={styles.monthlyStatsLabel}>
              {(last30DaysEntries.reduce((sum, entry) => sum + entry.glasses, 0) * 0.25).toFixed(1)} liters
            </Text>
          </View>
          <Text style={styles.monthlyStatsDescription}>
            {last30DaysEntries.length > 0 
              ? `Average: ${(last30DaysEntries.reduce((sum, entry) => sum + entry.glasses, 0) / last30DaysEntries.length).toFixed(1)} glasses per day`
              : "No data for the last 30 days"}
          </Text>
        </Card>
      </View>
    );
  };
  
  const renderSleepTab = () => {
    const last7DaysEntries = getSleepEntries ? getSleepEntries(7) : [];
    
    if (!sleepEntries || sleepEntries.length === 0) {
      return (
        <EmptyState
          icon={<Moon size={32} color={Colors.neutral.textDark} />}
          title="No Sleep Data Recorded Yet"
          message="Track your sleep to improve recovery and performance."
          actionLabel="Track Sleep"
          onAction={() => router.push('/sleep/add')}
        />
      );
    }
    
    return (
      <View style={styles.tabContent}>
        <Button
          title="Add Sleep Entry"
          onPress={() => router.push('/sleep/add')}
          variant="primary"
          style={styles.addButton}
          leftIcon={<Plus size={18} color={Colors.white} />}
        />
        
        <SleepTracker onAddPress={() => router.push('/sleep/add')} />
        
        <Card style={styles.statsCard}>
          <Text style={styles.statsTitle}>7-Day Sleep History</Text>
          <View style={styles.sleepHistoryContainer}>
            {last7DaysEntries.map((entry, index) => (
              <Card key={index} variant="outlined" style={styles.sleepHistoryCard}>
                <Text style={styles.sleepHistoryDate}>
                  {new Date(entry.date).toLocaleDateString(undefined, { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </Text>
                <View style={styles.sleepHistoryDetails}>
                  <Text style={styles.sleepHistoryHours}>{entry.hours}h</Text>
                  <StarRating 
                    rating={entry.quality} 
                    size={16} 
                    disabled={true}
                  />
                </View>
                {entry.notes && (
                  <Text style={styles.sleepHistoryNotes} numberOfLines={2}>
                    {entry.notes}
                  </Text>
                )}
              </Card>
            ))}
          </View>
        </Card>
      </View>
    );
  };
  
  const renderDayRatingTab = () => {
    const last7DaysRatings = getDayRatings ? getDayRatings(7) : [];
    
    if (!dayRatings || dayRatings.length === 0) {
      return (
        <EmptyState
          icon={<Calendar size={32} color={Colors.neutral.textDark} />}
          title="No Day Ratings Yet"
          message="Rate your days to track your overall well-being and identify patterns."
          actionLabel="Rate Today"
          onAction={() => router.push('/day/rate')}
        />
      );
    }
    
    return (
      <View style={styles.tabContent}>
        <Button
          title="Rate Today"
          onPress={() => router.push('/day/rate')}
          variant="primary"
          style={styles.addButton}
          leftIcon={<Plus size={18} color={Colors.white} />}
        />
        
        <DayRating onRatePress={() => router.push('/day/rate')} />
        
        <Card style={styles.statsCard}>
          <Text style={styles.statsTitle}>7-Day Rating History</Text>
          <View style={styles.dayRatingHistoryContainer}>
            {last7DaysRatings.map((rating, index) => (
              <Card key={index} variant="outlined" style={styles.dayRatingHistoryCard}>
                <Text style={styles.dayRatingHistoryDate}>
                  {new Date(rating.date).toLocaleDateString(undefined, { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </Text>
                <StarRating 
                  rating={rating.rating} 
                  size={20} 
                  disabled={true}
                  style={styles.dayRatingHistoryStars}
                />
                {rating.note && (
                  <Text style={styles.dayRatingHistoryNotes} numberOfLines={2}>
                    "{rating.note}"
                  </Text>
                )}
              </Card>
            ))}
          </View>
        </Card>
      </View>
    );
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['right', 'left']}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScrollContainer}>
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'meals' && styles.activeTab]}
            onPress={() => setActiveTab('meals')}
          >
            <Utensils 
              size={20} 
              color={activeTab === 'meals' ? Colors.accent.default : Colors.neutral.textDark} 
            />
            <Text 
              style={[
                styles.tabText, 
                activeTab === 'meals' && styles.activeTabText
              ]}
            >
              Meals
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'workouts' && styles.activeTab]}
            onPress={() => setActiveTab('workouts')}
          >
            <Dumbbell 
              size={20} 
              color={activeTab === 'workouts' ? Colors.accent.default : Colors.neutral.textDark} 
            />
            <Text 
              style={[
                styles.tabText, 
                activeTab === 'workouts' && styles.activeTabText
              ]}
            >
              Workouts
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'shots' && styles.activeTab]}
            onPress={() => setActiveTab('shots')}
          >
            <Target 
              size={20} 
              color={activeTab === 'shots' ? Colors.accent.default : Colors.neutral.textDark} 
            />
            <Text 
              style={[
                styles.tabText, 
                activeTab === 'shots' && styles.activeTabText
              ]}
            >
              Shots
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'water' && styles.activeTab]}
            onPress={() => setActiveTab('water')}
          >
            <Droplet 
              size={20} 
              color={activeTab === 'water' ? Colors.accent.default : Colors.neutral.textDark} 
            />
            <Text 
              style={[
                styles.tabText, 
                activeTab === 'water' && styles.activeTabText
              ]}
            >
              Water
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'sleep' && styles.activeTab]}
            onPress={() => setActiveTab('sleep')}
          >
            <Moon 
              size={20} 
              color={activeTab === 'sleep' ? Colors.accent.default : Colors.neutral.textDark} 
            />
            <Text 
              style={[
                styles.tabText, 
                activeTab === 'sleep' && styles.activeTabText
              ]}
            >
              Sleep
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'day' && styles.activeTab]}
            onPress={() => setActiveTab('day')}
          >
            <Calendar 
              size={20} 
              color={activeTab === 'day' ? Colors.accent.default : Colors.neutral.textDark} 
            />
            <Text 
              style={[
                styles.tabText, 
                activeTab === 'day' && styles.activeTabText
              ]}
            >
              Day Rating
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {renderTabContent()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  tabsScrollContainer: {
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.accent.default,
  },
  tabText: {
    fontSize: 14,
    color: Colors.neutral.textDark,
  },
  activeTabText: {
    color: Colors.accent.default,
    fontWeight: '600',
  },
  scrollContent: {
    padding: 16,
  },
  tabContent: {
    flex: 1,
  },
  addButton: {
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  dateGroup: {
    marginBottom: 16,
  },
  dateHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary.background,
    marginBottom: 8,
  },
  mealCard: {
    marginBottom: 12,
    padding: 16,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  mealType: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary.background,
  },
  mealTime: {
    fontSize: 14,
    color: Colors.neutral.textDark,
  },
  mealDescription: {
    fontSize: 14,
    color: Colors.primary.background,
    marginBottom: 8,
  },
  mealNutrition: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  nutritionItem: {
    fontSize: 12,
    color: Colors.accent.default,
    fontWeight: '500',
  },
  workoutCard: {
    marginBottom: 12,
    padding: 16,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  workoutDuration: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary.background,
  },
  intensityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  highIntensity: {
    backgroundColor: Colors.error + '20', // 20% opacity
  },
  mediumIntensity: {
    backgroundColor: Colors.warning + '20', // 20% opacity
  },
  lowIntensity: {
    backgroundColor: Colors.success + '20', // 20% opacity
  },
  intensityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  workoutDescription: {
    fontSize: 14,
    color: Colors.primary.background,
    marginBottom: 8,
  },
  workoutRatingContainer: {
    marginTop: 8,
    marginBottom: 12,
    padding: 12,
    backgroundColor: Colors.light.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  workoutRatingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  workoutRatingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary.background,
    marginLeft: 6,
  },
  workoutRatingDetails: {
    marginBottom: 8,
  },
  workoutRatingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  workoutRatingLabel: {
    fontSize: 12,
    color: Colors.neutral.textDark,
    width: 70,
  },
  workoutRatingNotes: {
    fontSize: 12,
    fontStyle: 'italic',
    color: Colors.neutral.textDark,
    marginTop: 4,
  },
  focusAreaContainer: {
    marginTop: 8,
    marginBottom: 12,
  },
  focusAreaLabel: {
    fontSize: 14,
    color: Colors.neutral.textDark,
    marginBottom: 4,
  },
  focusAreaTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  focusAreaTag: {
    backgroundColor: Colors.accent.light + '20', // 20% opacity
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  focusAreaText: {
    fontSize: 12,
    color: Colors.accent.default,
  },
  sessionCard: {
    marginBottom: 12,
    padding: 16,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sessionStats: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  sessionMade: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary.background,
  },
  sessionDivider: {
    fontSize: 16,
    color: Colors.neutral.textDark,
    marginHorizontal: 4,
  },
  sessionAttempted: {
    fontSize: 16,
    color: Colors.neutral.textDark,
  },
  sessionPercentage: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.accent.default,
  },
  sessionType: {
    fontSize: 14,
    color: Colors.primary.background,
    marginBottom: 4,
  },
  sessionLocation: {
    fontSize: 14,
    color: Colors.primary.background,
  },
  statsCard: {
    marginBottom: 16,
    padding: 16,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary.background,
    marginBottom: 16,
  },
  statsChartContainer: {
    gap: 12,
  },
  chartBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  barLabels: {
    width: 80,
    alignItems: 'flex-end',
  },
  barValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary.background,
  },
  barLabel: {
    fontSize: 12,
    color: Colors.neutral.textDark,
  },
  barContainer: {
    flex: 1,
    height: 12,
    backgroundColor: Colors.light.border,
    borderRadius: 6,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: Colors.accent.default,
    borderRadius: 6,
  },
  monthlyStatsContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  monthlyStatsValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary.background,
  },
  monthlyStatsLabel: {
    fontSize: 16,
    color: Colors.neutral.textDark,
  },
  monthlyStatsDescription: {
    fontSize: 14,
    color: Colors.neutral.textDark,
    textAlign: 'center',
  },
  sleepHistoryContainer: {
    gap: 12,
  },
  sleepHistoryCard: {
    padding: 12,
  },
  sleepHistoryDate: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary.background,
    marginBottom: 8,
  },
  sleepHistoryDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 4,
  },
  sleepHistoryHours: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary.background,
  },
  sleepHistoryNotes: {
    fontSize: 12,
    color: Colors.neutral.textDark,
    fontStyle: 'italic',
    marginTop: 4,
  },
  dayRatingHistoryContainer: {
    gap: 12,
  },
  dayRatingHistoryCard: {
    padding: 12,
  },
  dayRatingHistoryDate: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary.background,
    marginBottom: 8,
  },
  dayRatingHistoryStars: {
    marginBottom: 4,
  },
  dayRatingHistoryNotes: {
    fontSize: 12,
    color: Colors.neutral.textDark,
    fontStyle: 'italic',
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.neutral.textDark,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    paddingTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginLeft: 8,
    borderRadius: 4,
    backgroundColor: Colors.light.background,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.accent.default,
    marginLeft: 4,
  },
  deleteText: {
    color: Colors.error,
  },
});