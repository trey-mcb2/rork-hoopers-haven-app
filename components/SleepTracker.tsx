import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Moon, Plus, Minus } from 'lucide-react-native';
import Colors from '@/constants/colors';
import Card from '@/components/Card';
import StarRating from '@/components/StarRating';
import { useSleepStore } from '@/store/sleep-store';

interface SleepTrackerProps {
  compact?: boolean;
  onAddPress?: () => void;
}

export const SleepTracker: React.FC<SleepTrackerProps> = ({ 
  compact = false,
  onAddPress 
}) => {
  const { entries = [], getAverageSleepHours, getAverageSleepQuality, isLoading } = useSleepStore();
  
  // Get the most recent sleep entry
  const latestEntry = entries && entries.length > 0 
    ? entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
    : null;
  
  // Get 7-day averages
  const avgHours = getAverageSleepHours ? getAverageSleepHours(7) : 0;
  const avgQuality = getAverageSleepQuality ? getAverageSleepQuality(7) : 0;
  
  if (isLoading) {
    return (
      <Card variant="elevated" style={compact ? styles.compactCard : styles.card}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={Colors.accent.default} />
          <Text style={styles.loadingText}>Loading sleep data...</Text>
        </View>
      </Card>
    );
  }
  
  if (compact) {
    return (
      <Card variant="elevated" style={styles.compactCard}>
        <View style={styles.compactHeader}>
          <Moon size={20} color={Colors.accent.default} />
          <Text style={styles.compactTitle}>Sleep Tracker</Text>
        </View>
        
        {latestEntry ? (
          <View style={styles.compactContent}>
            <View style={styles.compactStats}>
              <Text style={styles.compactHours}>{latestEntry.hours}h</Text>
              <StarRating 
                rating={latestEntry.quality} 
                size={14} 
                disabled={true}
                style={styles.compactStars}
              />
            </View>
            <TouchableOpacity 
              style={styles.compactButton}
              onPress={onAddPress}
            >
              <Plus size={16} color={Colors.primary.background} />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity 
            style={styles.compactAddButton}
            onPress={onAddPress}
          >
            <Plus size={16} color={Colors.white} />
            <Text style={styles.compactAddText}>Add Sleep</Text>
          </TouchableOpacity>
        )}
      </Card>
    );
  }
  
  return (
    <Card variant="elevated" style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Moon size={24} color={Colors.accent.default} />
          <Text style={styles.title}>Sleep Tracker</Text>
        </View>
        <Text style={styles.subtitle}>Track your sleep quality and duration</Text>
      </View>
      
      <View style={styles.content}>
        {latestEntry ? (
          <>
            <View style={styles.latestEntry}>
              <Text style={styles.latestLabel}>Last Recorded Sleep:</Text>
              <Text style={styles.latestDate}>
                {new Date(latestEntry.date).toLocaleDateString()}
              </Text>
              <View style={styles.latestStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{latestEntry.hours}</Text>
                  <Text style={styles.statLabel}>Hours</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <StarRating 
                    rating={latestEntry.quality} 
                    size={20} 
                    disabled={true}
                    style={styles.stars}
                  />
                  <Text style={styles.statLabel}>Quality</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.averages}>
              <Text style={styles.averageLabel}>7-Day Averages:</Text>
              <View style={styles.averageStats}>
                <View style={styles.averageItem}>
                  <Text style={styles.averageValue}>{avgHours.toFixed(1)}</Text>
                  <Text style={styles.averageItemLabel}>Hours</Text>
                </View>
                <View style={styles.averageItem}>
                  <Text style={styles.averageValue}>{avgQuality.toFixed(1)}</Text>
                  <Text style={styles.averageItemLabel}>Quality</Text>
                </View>
              </View>
            </View>
          </>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No sleep data recorded yet</Text>
            <Text style={styles.emptySubtext}>
              Start tracking your sleep to see patterns and improve your rest
            </Text>
          </View>
        )}
        
        <TouchableOpacity 
          style={styles.addButton}
          onPress={onAddPress}
        >
          <Plus size={20} color={Colors.white} />
          <Text style={styles.addButtonText}>
            {latestEntry ? "Add New Sleep Entry" : "Start Tracking Sleep"}
          </Text>
        </TouchableOpacity>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 16,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary.background,
    marginLeft: 8,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.neutral.textDark,
  },
  content: {
    padding: 16,
  },
  latestEntry: {
    marginBottom: 16,
  },
  latestLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary.background,
    marginBottom: 4,
  },
  latestDate: {
    fontSize: 12,
    color: Colors.neutral.textDark,
    marginBottom: 8,
  },
  latestStats: {
    flexDirection: 'row',
    backgroundColor: Colors.light.background,
    borderRadius: 8,
    padding: 12,
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
    fontSize: 12,
    color: Colors.neutral.textDark,
  },
  statDivider: {
    width: 1,
    height: '80%',
    backgroundColor: Colors.light.border,
    alignSelf: 'center',
  },
  stars: {
    marginBottom: 4,
  },
  averages: {
    backgroundColor: Colors.accent.light + '20', // 20% opacity
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  averageLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary.background,
    marginBottom: 8,
  },
  averageStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  averageItem: {
    alignItems: 'center',
  },
  averageValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.accent.default,
    marginBottom: 2,
  },
  averageItemLabel: {
    fontSize: 12,
    color: Colors.neutral.textDark,
  },
  emptyState: {
    alignItems: 'center',
    padding: 16,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary.background,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.neutral.textDark,
    textAlign: 'center',
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: Colors.accent.default,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: Colors.white,
    fontWeight: '600',
    marginLeft: 8,
  },
  // Compact styles
  compactCard: {
    padding: 12,
    marginVertical: 8,
  },
  compactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  compactTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary.background,
    marginLeft: 6,
  },
  compactContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  compactStats: {
    flexDirection: 'column',
  },
  compactHours: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary.background,
    marginBottom: 2,
  },
  compactStars: {
    marginTop: 2,
  },
  compactButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.light.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  compactAddButton: {
    flexDirection: 'row',
    backgroundColor: Colors.accent.default,
    borderRadius: 6,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactAddText: {
    color: Colors.white,
    fontWeight: '600',
    fontSize: 12,
    marginLeft: 4,
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

export default SleepTracker;