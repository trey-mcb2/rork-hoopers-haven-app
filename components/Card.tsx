import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Colors from '@/constants/colors';

interface CardProps {
  children: ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'outlined' | 'elevated';
  padding?: number | string;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  variant = 'default',
  padding = 16,
}) => {
  const getCardStyle = () => {
    switch (variant) {
      case 'outlined':
        return {
          ...styles.card,
          ...styles.outlined,
        };
      case 'elevated':
        return {
          ...styles.card,
          ...styles.elevated,
        };
      default:
        return styles.card;
    }
  };

  return (
    <View style={[getCardStyle(), { padding }, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    overflow: 'hidden',
  },
  outlined: {
    borderWidth: 1,
    borderColor: Colors.light.border,
    shadowOpacity: 0,
  },
  elevated: {
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
});

export default Card;