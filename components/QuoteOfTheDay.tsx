import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Quote } from 'lucide-react-native';
import Colors from '@/constants/colors';
import Card from '@/components/Card';
import { getQuoteOfTheDay } from '@/constants/quotes';

interface QuoteOfTheDayProps {
  compact?: boolean;
}

export const QuoteOfTheDay: React.FC<QuoteOfTheDayProps> = ({ compact = false }) => {
  const { quote, author } = getQuoteOfTheDay();
  
  if (compact) {
    return (
      <Card variant="outlined" style={styles.compactCard}>
        <View style={styles.compactQuoteContainer}>
          <Quote size={16} color={Colors.accent.default} />
          <Text style={styles.compactQuoteText} numberOfLines={2}>
            {quote}
          </Text>
        </View>
      </Card>
    );
  }
  
  return (
    <Card variant="elevated" style={styles.card}>
      <View style={styles.header}>
        <Quote size={24} color={Colors.accent.default} />
        <Text style={styles.title}>Quote of the Day</Text>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.quoteText}>"{quote}"</Text>
        <Text style={styles.authorText}>— {author}</Text>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary.background,
    marginLeft: 8,
  },
  content: {
    padding: 16,
  },
  quoteText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: Colors.primary.background,
    lineHeight: 24,
    marginBottom: 12,
  },
  authorText: {
    fontSize: 14,
    color: Colors.accent.default,
    textAlign: 'right',
    fontWeight: '500',
  },
  // Compact styles
  compactCard: {
    padding: 12,
    marginVertical: 8,
  },
  compactQuoteContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  compactQuoteText: {
    flex: 1,
    fontSize: 14,
    fontStyle: 'italic',
    color: Colors.primary.background,
    marginLeft: 8,
  },
});

export default QuoteOfTheDay;