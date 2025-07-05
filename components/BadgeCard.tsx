import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import Card from './Card';
import Colors from '@/constants/colors';
import { Badge } from '@/types';
import { Award } from 'lucide-react-native';

interface BadgeCardProps {
  badge: Badge;
  earned?: boolean;
}

export const BadgeCard: React.FC<BadgeCardProps> = ({
  badge,
  earned = false,
}) => {
  const formattedDate = badge.dateEarned 
    ? new Date(badge.dateEarned).toLocaleDateString() 
    : null;

  return (
    <Card 
      variant="outlined" 
      style={[
        styles.card,
        earned ? styles.earnedCard : styles.unearnedCard
      ]}
    >
      <View style={styles.container}>
        <View style={[
          styles.iconContainer,
          earned ? styles.earnedIconContainer : styles.unearnedIconContainer
        ]}>
          <Award 
            size={32} 
            color={earned ? Colors.accent.default : Colors.neutral.textDark} 
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={[
            styles.title,
            earned ? styles.earnedTitle : styles.unearnedTitle
          ]}>
            {badge.name}
          </Text>
          <Text style={styles.description}>{badge.description}</Text>
          {earned && formattedDate && (
            <Text style={styles.date}>Earned on {formattedDate}</Text>
          )}
          {!earned && (
            <Text style={styles.criteria}>{badge.criteria}</Text>
          )}
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
    marginHorizontal: 4,
  },
  earnedCard: {
    borderColor: Colors.accent.light,
  },
  unearnedCard: {
    opacity: 0.7,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 12,
    padding: 10,
    borderRadius: 8,
  },
  earnedIconContainer: {
    backgroundColor: Colors.accent.light + '20', // 20% opacity
  },
  unearnedIconContainer: {
    backgroundColor: Colors.light.border,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  earnedTitle: {
    color: Colors.primary.background,
  },
  unearnedTitle: {
    color: Colors.neutral.textDark,
  },
  description: {
    fontSize: 14,
    color: Colors.neutral.textDark,
    marginBottom: 2,
  },
  date: {
    fontSize: 12,
    color: Colors.accent.default,
    fontWeight: '500',
  },
  criteria: {
    fontSize: 12,
    color: Colors.neutral.textDark,
    fontStyle: 'italic',
  },
});

export default BadgeCard;