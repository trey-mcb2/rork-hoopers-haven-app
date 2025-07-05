import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Calendar, Edit2 } from 'lucide-react-native';
import Colors from '@/constants/colors';
import Card from '@/components/Card';
import StarRating from '@/components/StarRating';
import { useDayRatingStore } from '@/store/day-rating-store';

interface DayRatingProps {
  compact?: boolean;
  onRatePress?: () => void;
}

export const DayRating: React.FC<DayRatingProps> = ({ 
  compact = false,
  onRatePress 
}) => {
  const { getRatingByDate, getAverageRating } = useDayRatingStore();
  
  // Get today's rating
  const today = new Date();
  const todayRating = getRatingByDate(today);
  
  // Get 7-day average
  const avgRating = getAverageRating(7);
  
  if (compact) {
    return (
      <Card variant="elevated" style={styles.compactCard}>
        <View style={styles.compactHeader}>
          <Calendar size={20} color={Colors.accent.default} />
          <Text style={styles.compactTitle}>Today's Rating</Text>
        </View>
        
        {todayRating ? (
          <View style={styles.compactContent}>
            <StarRating 
              rating={todayRating.rating} 
              size={16} 
              disabled={true}
            />
            <TouchableOpacity 
              style={styles.compactButton}
              onPress={onRatePress}
            >
              <Edit2 size={14} color={Colors.primary.background} />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity 
            style={styles.compactAddButton}
            onPress={onRatePress}
          >
            <Text style={styles.compactAddText}>Rate Your Day</Text>
          </TouchableOpacity>
        )}
      </Card>
    );
  }
  
  return (
    <Card variant="elevated" style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Calendar size={24} color={Colors.accent.default} />
          <Text style={styles.title}>Rate Your Day</Text>
        </View>
        <Text style={styles.subtitle}>Track how your days are going</Text>
      </View>
      
      <View style={styles.content}>
        <View style={styles.todayContainer}>
          <Text style={styles.todayLabel}>Today's Rating:</Text>
          
          {todayRating ? (
            <View style={styles.ratingContainer}>
              <StarRating 
                rating={todayRating.rating} 
                size={32} 
                disabled={true}
              />
              {todayRating.notes && (
                <Text style={styles.notes}>{todayRating.notes}</Text>
              )}
            </View>
          ) : (
            <Text style={styles.noRating}>Not rated yet</Text>
          )}
        </View>
        
        <View style={styles.averageContainer}>
          <Text style={styles.averageLabel}>7-Day Average:</Text>
          <View style={styles.averageRating}>
            <Text style={styles.averageValue}>{avgRating.toFixed(1)}</Text>
            <StarRating 
              rating={avgRating} 
              size={16} 
              disabled={true}
              style={styles.averageStars}
            />
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.rateButton}
          onPress={onRatePress}
        >
          <Text style={styles.rateButtonText}>
            {todayRating ? "Update Today's Rating" : "Rate Your Day"}
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
  todayContainer: {
    marginBottom: 16,
  },
  todayLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary.background,
    marginBottom: 12,
  },
  ratingContainer: {
    alignItems: 'center',
  },
  noRating: {
    fontSize: 16,
    color: Colors.neutral.textDark,
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 16,
  },
  notes: {
    fontSize: 14,
    color: Colors.neutral.textDark,
    marginTop: 12,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  averageContainer: {
    backgroundColor: Colors.light.background,
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
  averageRating: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  averageValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary.background,
    marginRight: 8,
  },
  averageStars: {
    marginTop: 2,
  },
  rateButton: {
    backgroundColor: Colors.accent.default,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  rateButtonText: {
    color: Colors.white,
    fontWeight: '600',
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
  compactButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.light.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  compactAddButton: {
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
  },
});

export default DayRating;