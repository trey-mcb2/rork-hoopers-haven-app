import React from 'react';
import { StyleSheet, View, Text, ScrollView, ActivityIndicator } from 'react-native';
import Colors from '@/constants/colors';
import { useDayRatingStore } from '@/store/day-rating-store';
import { useWaterStore } from '@/store/water-store';
import { useSleepStore } from '@/store/sleep-store';
import { useWorkoutsStore } from '@/store/workouts-store';
import { useWorkoutRatingStore } from '@/store/workout-rating-store';
import StarRating from '@/components/StarRating';
import { Droplet, Moon, Dumbbell } from 'lucide-react-native';

interface DayDetailsProps {
  date: Date;
}

const DayDetails: React.FC<DayDetailsProps> = ({ date }) => {
  const formatDate = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };
  
  const dateString = formatDate(date);
  
  // Get day rating
  const { ratings = [], isLoading: isLoadingRatings } = useDayRatingStore();
  const dayRating = ratings?.find(r => r.date === dateString);
  
  // Get water intake
  const { logs = [], isLoading: isLoadingWater } = useWaterStore();
  const waterLog = logs?.find(l => l.date === dateString);
  
  // Get sleep data
  const { entries: sleepLogs = [], isLoading: isLoadingSleep } = useSleepStore();
  const sleepLog = sleepLogs?.find(l => l.date === dateString);
  
  // Get workouts
  const { workouts = [], isLoading: isLoadingWorkouts } = useWorkoutsStore();
  const dayWorkouts = workouts?.filter(w => formatDate(new Date(w.date)) === dateString) || [];
  
  // Get workout ratings
  const { ratings: workoutRatings = [], isLoading: isLoadingWorkoutRatings } = useWorkoutRatingStore();
  const dayWorkoutRatings = workoutRatings?.filter(r => r.date === dateString) || [];
  
  const isLoading = isLoadingRatings || isLoadingWater || isLoadingSleep || isLoadingWorkouts || isLoadingWorkoutRatings;
  
  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Day Summary</Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={Colors.accent.default} />
          <Text style={styles.loadingText}>Loading day details...</Text>
        </View>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Day Summary</Text>
      
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Mood Rating</Text>
        </View>
        {dayRating ? (
          <View style={styles.ratingContainer}>
            <StarRating 
              rating={dayRating.rating} 
              size={24} 
              readonly={true}
            />
            {dayRating.note && (
              <Text style={styles.note}>{dayRating.note}</Text>
            )}
          </View>
        ) : (
          <Text style={styles.emptyText}>No mood rating for this day</Text>
        )}
      </View>
      
      <View style={styles.row}>
        <View style={[styles.section, styles.halfSection]}>
          <View style={styles.sectionHeader}>
            <Droplet size={18} color={Colors.accent.default} />
            <Text style={styles.sectionTitle}>Water</Text>
          </View>
          {waterLog ? (
            <View style={styles.metricContainer}>
              <Text style={styles.metricValue}>{waterLog.amount || waterLog.glasses || 0}</Text>
              <Text style={styles.metricUnit}>glasses</Text>
            </View>
          ) : (
            <Text style={styles.emptyText}>No data</Text>
          )}
        </View>
        
        <View style={[styles.section, styles.halfSection]}>
          <View style={styles.sectionHeader}>
            <Moon size={18} color={Colors.accent.default} />
            <Text style={styles.sectionTitle}>Sleep</Text>
          </View>
          {sleepLog ? (
            <View>
              <View style={styles.metricContainer}>
                <Text style={styles.metricValue}>{sleepLog.hours}</Text>
                <Text style={styles.metricUnit}>hours</Text>
              </View>
              <StarRating 
                rating={sleepLog.quality} 
                size={16} 
                readonly={true}
              />
            </View>
          ) : (
            <Text style={styles.emptyText}>No data</Text>
          )}
        </View>
      </View>
      
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Dumbbell size={18} color={Colors.accent.default} />
          <Text style={styles.sectionTitle}>Workouts</Text>
        </View>
        {dayWorkouts && dayWorkouts.length > 0 ? (
          <View>
            {dayWorkouts.map((workout, index) => (
              <View key={workout.id} style={styles.workoutItem}>
                <Text style={styles.workoutTitle}>{workout.description}</Text>
                <Text style={styles.workoutDetail}>
                  {workout.duration} min • {workout.intensity || 'Medium'} intensity
                </Text>
                {workout.focusArea && workout.focusArea.length > 0 && (
                  <View style={styles.tagsContainer}>
                    {workout.focusArea.map((area, i) => (
                      <View key={i} style={styles.tag}>
                        <Text style={styles.tagText}>{area}</Text>
                      </View>
                    ))}
                  </View>
                )}
                
                {dayWorkoutRatings && dayWorkoutRatings.find(r => r.workoutId === workout.id) && (
                  <View style={styles.workoutRatings}>
                    <Text style={styles.ratingLabel}>Ratings:</Text>
                    <View style={styles.ratingRow}>
                      <Text style={styles.ratingType}>Focus:</Text>
                      <StarRating 
                        rating={dayWorkoutRatings.find(r => r.workoutId === workout.id)?.focus || 0} 
                        size={14} 
                        readonly={true}
                      />
                    </View>
                    <View style={styles.ratingRow}>
                      <Text style={styles.ratingType}>Effort:</Text>
                      <StarRating 
                        rating={dayWorkoutRatings.find(r => r.workoutId === workout.id)?.effort || 0} 
                        size={14} 
                        readonly={true}
                      />
                    </View>
                    <View style={styles.ratingRow}>
                      <Text style={styles.ratingType}>Recovery:</Text>
                      <StarRating 
                        rating={dayWorkoutRatings.find(r => r.workoutId === workout.id)?.recovery || 0} 
                        size={14} 
                        readonly={true}
                      />
                    </View>
                  </View>
                )}
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.emptyText}>No workouts for this day</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary.background,
    marginBottom: 16,
  },
  section: {
    marginBottom: 16,
    backgroundColor: Colors.light.background,
    borderRadius: 8,
    padding: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfSection: {
    width: '48%',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary.background,
    marginLeft: 6,
  },
  ratingContainer: {
    alignItems: 'flex-start',
  },
  note: {
    marginTop: 8,
    fontSize: 14,
    color: Colors.neutral.textDark,
    fontStyle: 'italic',
  },
  emptyText: {
    fontSize: 14,
    color: Colors.neutral.textDark,
    fontStyle: 'italic',
  },
  metricContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary.background,
  },
  metricUnit: {
    fontSize: 14,
    color: Colors.neutral.textDark,
    marginLeft: 4,
  },
  workoutItem: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  workoutTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary.background,
    marginBottom: 4,
  },
  workoutDetail: {
    fontSize: 14,
    color: Colors.neutral.textDark,
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  tag: {
    backgroundColor: Colors.accent.light,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 6,
  },
  tagText: {
    fontSize: 12,
    color: Colors.white,
  },
  workoutRatings: {
    marginTop: 8,
    backgroundColor: Colors.white,
    borderRadius: 6,
    padding: 8,
  },
  ratingLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.primary.background,
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingType: {
    width: 70,
    fontSize: 13,
    color: Colors.neutral.textDark,
  },
  loadingContainer: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: Colors.neutral.textDark,
  },
});

export default DayDetails;