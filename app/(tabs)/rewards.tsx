import React from 'react';
import { StyleSheet, Text, View, ScrollView, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { useRewardsStore } from '@/store/rewards-store';
import { useUserStore } from '@/store/user-store';
import BadgeCard from '@/components/BadgeCard';
import Card from '@/components/Card';
import { Award, Trophy } from 'lucide-react-native';

export default function RewardsScreen() {
  const { availableBadges, earnedBadges } = useRewardsStore();
  const { stats } = useUserStore();
  
  return (
    <SafeAreaView style={styles.container} edges={['right', 'left']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Your Achievements</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{earnedBadges.length}</Text>
              <Text style={styles.statLabel}>Badges Earned</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{availableBadges.length}</Text>
              <Text style={styles.statLabel}>Total Badges</Text>
            </View>
          </View>
        </View>
        
        {earnedBadges.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Trophy size={20} color={Colors.accent.default} />
              <Text style={styles.sectionTitle}>Earned Badges</Text>
            </View>
            
            {earnedBadges.map(badge => (
              <BadgeCard key={badge.id} badge={badge} earned={true} />
            ))}
          </View>
        )}
        
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Award size={20} color={Colors.accent.default} />
            <Text style={styles.sectionTitle}>Available Badges</Text>
          </View>
          
          {availableBadges
            .filter(badge => !earnedBadges.some(earned => earned.id === badge.id))
            .map(badge => (
              <BadgeCard key={badge.id} badge={badge} earned={false} />
            ))}
        </View>
        
        <Card variant="elevated" style={styles.progressCard}>
          <Text style={styles.progressTitle}>Your Progress</Text>
          
          <View style={styles.progressItem}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Shots Made</Text>
              <Text style={styles.progressValue}>{stats.totalShotsMade}</Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View 
                style={[
                  styles.progressBar, 
                  { width: `${Math.min(stats.totalShotsMade / 10000 * 100, 100)}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressTarget}>Target: 10,000 shots</Text>
          </View>
          
          <View style={styles.progressItem}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Workouts Completed</Text>
              <Text style={styles.progressValue}>{stats.totalWorkouts}</Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View 
                style={[
                  styles.progressBar, 
                  { width: `${Math.min(stats.totalWorkouts / 50 * 100, 100)}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressTarget}>Target: 50 workouts</Text>
          </View>
          
          <View style={styles.progressItem}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Meals Tracked</Text>
              <Text style={styles.progressValue}>{stats.totalMealsTracked}</Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View 
                style={[
                  styles.progressBar, 
                  { width: `${Math.min(stats.totalMealsTracked / 50 * 100, 100)}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressTarget}>Target: 50 meals</Text>
          </View>
          
          <View style={styles.progressItem}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Streak Days</Text>
              <Text style={styles.progressValue}>{stats.streakDays}</Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View 
                style={[
                  styles.progressBar, 
                  { width: `${Math.min(stats.streakDays / 30 * 100, 100)}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressTarget}>Target: 30 day streak</Text>
          </View>
        </Card>
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
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary.background,
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary.background,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.neutral.textDark,
  },
  statDivider: {
    width: 1,
    height: '80%',
    backgroundColor: Colors.light.border,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary.background,
    marginLeft: 8,
  },
  progressCard: {
    padding: 16,
    marginBottom: 24,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary.background,
    marginBottom: 16,
  },
  progressItem: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: Colors.primary.background,
  },
  progressValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.accent.default,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: Colors.light.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.accent.default,
    borderRadius: 4,
  },
  progressTarget: {
    fontSize: 12,
    color: Colors.neutral.textDark,
  },
});