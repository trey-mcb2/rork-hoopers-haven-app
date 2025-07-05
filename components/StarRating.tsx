import React from 'react';
import { View, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Star } from 'lucide-react-native';
import Colors from '@/constants/colors';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: number;
  activeColor?: string;
  inactiveColor?: string;
  onRatingChange?: (rating: number) => void;
  style?: ViewStyle;
  disabled?: boolean;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxRating = 5,
  size = 24,
  activeColor = Colors.accent.default,
  inactiveColor = Colors.light.border,
  onRatingChange,
  style,
  disabled = false,
}) => {
  const handlePress = (selectedRating: number) => {
    if (disabled || !onRatingChange) return;
    
    // If user taps the current rating, decrease by 0.5
    if (selectedRating === rating && rating > 0.5) {
      onRatingChange(rating - 0.5);
    } else {
      onRatingChange(selectedRating);
    }
  };

  return (
    <View style={[styles.container, style]}>
      {[...Array(maxRating)].map((_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= rating;
        const isHalfFilled = !isFilled && starValue <= rating + 0.5;
        
        return (
          <TouchableOpacity
            key={index}
            onPress={() => handlePress(starValue)}
            disabled={disabled}
            activeOpacity={disabled ? 1 : 0.7}
            style={styles.starContainer}
          >
            <Star
              size={size}
              color={isFilled || isHalfFilled ? activeColor : inactiveColor}
              fill={isFilled ? activeColor : 'transparent'}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starContainer: {
    padding: 2, // Add padding for better touch area
  },
});

export default StarRating;