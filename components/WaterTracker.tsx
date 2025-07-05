import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Droplet, Plus, Minus } from 'lucide-react-native';
import Colors from '@/constants/colors';
import Card from '@/components/Card';
import { useWaterStore } from '@/store/water-store';

interface WaterTrackerProps {
  compact?: boolean;
}

export const WaterTracker: React.FC<WaterTrackerProps> = ({ compact = false }) => {
  const { todayEntry, addWater, checkAndResetDaily, isLoading } = useWaterStore();
  
  // Check if we need to reset the daily counter
  useEffect(() => {
    if (checkAndResetDaily) {
      checkAndResetDaily();
    }
  }, [checkAndResetDaily]);
  
  const handleAddGlass = () => {
    if (addWater) {
      addWater(1);
    }
  };
  
  const handleRemoveGlass = () => {
    if (todayEntry && todayEntry.glasses > 0 && addWater) {
      addWater(-1);
    }
  };
  
  const glasses = todayEntry?.glasses || 0;
  const liters = (glasses * 0.25).toFixed(1); // 1 glass = 250ml = 0.25L
  
  // Calculate progress percentage (target: 8 glasses)
  const progressPercentage = Math.min((glasses / 8) * 100, 100);
  
  if (isLoading) {
    return (
      <Card variant="elevated" style={compact ? styles.compactCard : styles.card}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={Colors.accent.default} />
          <Text style={styles.loadingText}>Loading water data...</Text>
        </View>
      </Card>
    );
  }
  
  if (compact) {
    return (
      <Card variant="elevated" style={styles.compactCard}>
        <View style={styles.compactHeader}>
          <Droplet size={20} color={Colors.accent.default} />
          <Text style={styles.compactTitle}>Water Intake</Text>
        </View>
        <View style={styles.compactContent}>
          <Text style={styles.compactCount}>{glasses} <Text style={styles.compactUnit}>glasses</Text></Text>
          <View style={styles.compactControls}>
            <TouchableOpacity 
              style={styles.compactButton}
              onPress={handleRemoveGlass}
              disabled={glasses <= 0}
            >
              <Minus size={16} color={glasses <= 0 ? Colors.neutral.textDark : Colors.primary.background} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.compactButton}
              onPress={handleAddGlass}
            >
              <Plus size={16} color={Colors.primary.background} />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: `${progressPercentage}%` }]} />
        </View>
      </Card>
    );
  }
  
  return (
    <Card variant="elevated" style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Droplet size={24} color={Colors.accent.default} />
          <Text style={styles.title}>Water Intake Tracker</Text>
        </View>
        <Text style={styles.subtitle}>Today's Goal: 8 glasses (2L)</Text>
      </View>
      
      <View style={styles.content}>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{glasses}</Text>
            <Text style={styles.statLabel}>Glasses</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{liters}</Text>
            <Text style={styles.statLabel}>Liters</Text>
          </View>
        </View>
        
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: `${progressPercentage}%` }]} />
        </View>
        
        <View style={styles.controls}>
          <TouchableOpacity 
            style={styles.controlButton}
            onPress={handleRemoveGlass}
            disabled={glasses <= 0}
          >
            <Minus size={24} color={glasses <= 0 ? Colors.neutral.textDark : Colors.white} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.controlButton}
            onPress={handleAddGlass}
          >
            <Plus size={24} color={Colors.white} />
          </TouchableOpacity>
        </View>
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.primary.background,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.neutral.textDark,
  },
  statDivider: {
    width: 1,
    height: '80%',
    backgroundColor: Colors.light.border,
    alignSelf: 'center',
  },
  progressContainer: {
    height: 12,
    backgroundColor: Colors.light.border,
    borderRadius: 6,
    marginBottom: 16,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.accent.default,
    borderRadius: 6,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  controlButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.accent.default,
    justifyContent: 'center',
    alignItems: 'center',
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
    marginBottom: 8,
  },
  compactCount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary.background,
  },
  compactUnit: {
    fontSize: 14,
    fontWeight: 'normal',
    color: Colors.neutral.textDark,
  },
  compactControls: {
    flexDirection: 'row',
    gap: 8,
  },
  compactButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.light.border,
    justifyContent: 'center',
    alignItems: 'center',
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

export default WaterTracker;