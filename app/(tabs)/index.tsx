import React, { useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Colors from '@/constants/colors';
import { useUserStore } from '@/store/user-store';
import { useShotsStore } from '@/store/shots-store';
import { useWorkoutsStore } from '@/store/workouts-store';
import { useMealsStore } from '@/store/meals-store';
import { useRewardsStore } from '@/store/rewards-store';
import { useNotificationsStore } from '@/store/notifications-store';
import Card from '@/components/Card';
import Button from '@/components/Button';
import StatCard from '@/components/StatCard';
import WaterTracker from '@/components/WaterTracker';
import SleepTracker from '@/components/SleepTracker';
import DayRating from '@/components/DayRating';
import QuoteOfTheDay from '@/components/QuoteOfTheDay';
import PersonalGoal from '@/components/PersonalGoal';
import { 
  Target, 
  Dumbbell, 
  Utensils, 
  Award, 
  ChevronRight,
  Flame,
  Moon,
  Droplet,
  Calendar,
  Bell,
  BellOff
} from 'lucide-react-native';

export default function HomeScreen() {
  const router = useRouter();
  const { stats, user, setUser } = useUserStore();
  const { getWeeklyStats } = useShotsStore();
  const checkAndAwardBadges = useRewardsStore(state => state.checkAndAwardBadges);
  const { permission, settings } = useNotificationsStore();
  
  // Initialize user if not set
  useEffect(() => {
    if (!user) {
      setUser({
        id: '1',
        name: 'Basketball Player',
        email: 'player@hoopershaven.com',
        joinDate: new Date(),
      });
    }
    
    // Check for new badges
    if (checkAndAwardBadges) {
      checkAndAwardBadges();
    }
  }, [user, setUser, checkAndAwardBadges]);
  
  // Get weekly shot stats
  const weeklyStats = getWeeklyStats ? getWeeklyStats() : [];
  const currentWeekShots = weeklyStats.length > 0 ? weeklyStats[weeklyStats.length - 1].made : 0;
  
  // Calculate shooting percentage
  const shootingPercentage = stats && stats.totalShotsAttempted > 0 
    ? Math.round((stats.totalShotsMade / stats.totalShotsAttempted) * 100) 
    : 0;

  // Count enabled notifications
  const enabledNotifications = Object.values(settings).filter(setting => setting.enabled).length;

  return (
    <SafeAreaView style={styles.container} edges={['right', 'left']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeText}>Welcome to</Text>
            <Text style={styles.appName}>Hoopers Haven</Text>
          </View>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=300' }} 
            style={styles.headerImage}
          />
        </View>

        {/* Notification Status */}
        <TouchableOpacity 
          style={styles.notificationBanner}
          onPress={() => router.push('/notifications/settings')}
        >
          <View style={styles.notificationIcon}>
            {permission?.granted && enabledNotifications > 0 ? (
              <Bell size={16} color={Colors.accent.default} />
            ) : (
              <BellOff size={16} color={Colors.neutral.textDark} />
            )}
          </View>
          <Text style={styles.notificationText}>
            {permission?.granted 
              ? enabledNotifications > 0 
                ? `${enabledNotifications} daily reminder${enabledNotifications > 1 ? 's' : ''} active`
                : 'Set up daily reminders'
              : 'Enable notifications for reminders'
            }
          </Text>
          <ChevronRight size={16} color={Colors.neutral.textDark} />
        </TouchableOpacity>
        
        {/* Quote of the Day */}
        <QuoteOfTheDay />
        
        {/* Personal Goal */}
        <PersonalGoal compact={true} />
        
        {/* Trackers Row */}
        <View style={styles.trackersRow}>
          <View style={styles.trackerItem}>
            <WaterTracker compact={true} />
          </View>
          <View style={styles.trackerItem}>
            <SleepTracker 
              compact={true} 
              onAddPress={() => router.push('/sleep/add')}
            />
          </View>
          <View style={styles.trackerItem}>
            <DayRating 
              compact={true} 
              onRatePress={() => router.push('/day/rate')}
            />
          </View>
        </View>
        
        <View style={styles.statsContainer}>
          <StatCard 
            title="Total Shots Made" 
            value={stats ? stats.totalShotsMade.toLocaleString() : "0"}
            subtitle={`${shootingPercentage}% shooting`}
            icon={<Target size={24} color={Colors.accent.default} />}
          />
          <StatCard 
            title="Workouts" 
            value={stats ? stats.totalWorkouts : "0"}
            subtitle="completed"
            icon={<Dumbbell size={24} color={Colors.accent.default} />}
          />
        </View>
        
        <View style={styles.statsContainer}>
          <StatCard 
            title="Meals Tracked" 
            value={stats ? stats.totalMealsTracked : "0"}
            icon={<Utensils size={24} color={Colors.accent.default} />}
          />
          <StatCard 
            title="Badges Earned" 
            value={stats ? stats.badgesEarned : "0"}
            icon={<Award size={24} color={Colors.accent.default} />}
          />
        </View>
        
        <Card variant="elevated" style={styles.streakCard}>
          <View style={styles.streakHeader}>
            <Flame size={24} color={Colors.accent.default} />
            <Text style={styles.streakTitle}>Current Streak</Text>
          </View>
          <Text style={styles.streakCount}>{stats ? stats.streakDays : 0} days</Text>
          <Text style={styles.streakMessage}>
            {stats && stats.streakDays > 0 
              ? "Keep it up! Consistency is key to improvement." 
              : "Start your streak today by tracking a workout or shots!"}
          </Text>
        </Card>
        
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <Button 
              title="Track Shots" 
              onPress={() => router.push('/shots/add')}
              style={styles.actionButton}
              variant="primary"
            />
            <Button 
              title="Log Workout" 
              onPress={() => router.push('/workout/add')}
              style={styles.actionButton}
              variant="primary"
            />
            <Button 
              title="Record Meal" 
              onPress={() => router.push('/meal/add')}
              style={styles.actionButton}
              variant="primary"
            />
            <Button 
              title="Browse Courses" 
              onPress={() => router.push('/courses')}
              style={styles.actionButton}
              variant="primary"
            />
          </View>
        </View>
        
        <Card variant="outlined" style={styles.weeklyGoalCard}>
          <Text style={styles.weeklyGoalTitle}>Weekly Shot Goal</Text>
          <View style={styles.weeklyGoalContent}>
            <View style={styles.weeklyGoalProgress}>
              <Text style={styles.weeklyGoalCount}>{currentWeekShots}</Text>
              <Text style={styles.weeklyGoalTarget}>/ 500</Text>
            </View>
            <View style={styles.weeklyGoalBar}>
              <View 
                style={[
                  styles.weeklyGoalFill, 
                  { width: `${Math.min(currentWeekShots / 500 * 100, 100)}%` }
                ]} 
              />
            </View>
          </View>
          <Text style={styles.weeklyGoalMessage}>
            {currentWeekShots >= 500 
              ? "Great job! You've hit your weekly shot goal." 
              : `${500 - currentWeekShots} more shots to reach your weekly goal.`}
          </Text>
        </Card>
        
        <Button 
          title="View All Trackers" 
          onPress={() => router.push('/trackers')}
          variant="outline"
          style={styles.viewAllButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  welcomeContainer: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 16,
    color: Colors.neutral.textDark,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.primary.background,
  },
  headerImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  notificationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.card,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  notificationIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.accent.light + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  notificationText: {
    flex: 1,
    fontSize: 14,
    color: Colors.primary.background,
    fontWeight: '500',
  },
  trackersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  trackerItem: {
    width: '32%',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  streakCard: {
    marginVertical: 16,
    padding: 16,
  },
  streakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  streakTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary.background,
    marginLeft: 8,
  },
  streakCount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary.background,
    marginBottom: 8,
  },
  streakMessage: {
    fontSize: 14,
    color: Colors.neutral.textDark,
  },
  quickActionsContainer: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary.background,
    marginBottom: 12,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48%',
    marginBottom: 12,
  },
  weeklyGoalCard: {
    marginVertical: 16,
    padding: 16,
  },
  weeklyGoalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary.background,
    marginBottom: 12,
  },
  weeklyGoalContent: {
    marginBottom: 12,
  },
  weeklyGoalProgress: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  weeklyGoalCount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary.background,
  },
  weeklyGoalTarget: {
    fontSize: 16,
    color: Colors.neutral.textDark,
    marginLeft: 4,
  },
  weeklyGoalBar: {
    height: 8,
    backgroundColor: Colors.light.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  weeklyGoalFill: {
    height: '100%',
    backgroundColor: Colors.accent.default,
    borderRadius: 4,
  },
  weeklyGoalMessage: {
    fontSize: 14,
    color: Colors.neutral.textDark,
  },
  viewAllButton: {
    marginVertical: 16,
  },
});