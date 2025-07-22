import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Colors from '@/constants/colors';
import { useDayRatingStore } from '@/store/day-rating-store';
import { useUserStore } from '@/store/user-store';
import Input from '@/components/Input';
import Button from '@/components/Button';
import StarRating from '@/components/StarRating';
import { Calendar } from 'lucide-react-native';

export default function RateDayScreen() {
  const router = useRouter();
  const { getRatingByDate, addRating } = useDayRatingStore();
  const { firebaseUser } = useUserStore();
  
  const [rating, setRating] = useState(0);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Check if there's already a rating for today
  useEffect(() => {
    const todayRating = getRatingByDate(new Date());
    if (todayRating) {
      setRating(todayRating.rating);
      setNotes(todayRating.notes || '');
    }
  }, [getRatingByDate]);
  
  const handleSubmit = async () => {
    if (rating === 0) {
      return;
    }
    
    setIsSubmitting(true);
    
    const ratingData = {
      userId: firebaseUser?.uid || '',
      rating,
      date: new Date().toISOString().split('T')[0],
      notes: notes.trim() || undefined,
    };
    
    try {
      await addRating(ratingData);
      
      setTimeout(() => {
        setIsSubmitting(false);
        router.back();
      }, 500);
    } catch (error) {
      setIsSubmitting(false);
      Alert.alert('Error', 'Failed to save rating. Please try again.');
    }
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['right', 'left', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Calendar size={32} color={Colors.accent.default} />
          <Text style={styles.title}>Rate Your Day</Text>
          <Text style={styles.subtitle}>
            {new Date().toLocaleDateString(undefined, { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Text>
        </View>
        
        <View style={styles.form}>
          <Text style={styles.sectionTitle}>How was your day?</Text>
          <View style={styles.ratingContainer}>
            <StarRating
              rating={rating}
              onRatingChange={setRating}
              size={48}
              style={styles.starRating}
            />
            <Text style={styles.ratingLabel}>
              {rating === 0 ? "Tap to rate" : 
               rating === 1 ? "Poor" : 
               rating === 2 ? "Fair" : 
               rating === 3 ? "Good" : 
               rating === 4 ? "Very Good" : "Excellent"}
            </Text>
          </View>
          
          <Input
            label="Notes (Optional)"
            placeholder="What made today special? What could have been better?"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            style={styles.textArea}
          />
          
          <View style={styles.tipContainer}>
            <Text style={styles.tipTitle}>Reflection Tip:</Text>
            <Text style={styles.tipText}>
              Taking a moment to reflect on your day can help you identify patterns, celebrate wins, and find areas for improvement in your basketball journey.
            </Text>
          </View>
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <Button
          title="Cancel"
          onPress={() => router.back()}
          variant="outline"
          style={styles.footerButton}
        />
        <Button
          title="Save Rating"
          onPress={handleSubmit}
          variant="primary"
          style={styles.footerButton}
          loading={isSubmitting}
          disabled={rating === 0}
        />
      </View>
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
    paddingBottom: 100,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary.background,
    marginTop: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.neutral.textDark,
    marginTop: 4,
  },
  form: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.primary.background,
    marginBottom: 16,
  },
  ratingContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  starRating: {
    marginBottom: 12,
  },
  ratingLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.primary.background,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
    marginBottom: 24,
  },
  tipContainer: {
    backgroundColor: Colors.accent.light + '20', // 20% opacity
    borderRadius: 8,
    padding: 16,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary.background,
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: Colors.primary.background,
    lineHeight: 20,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerButton: {
    width: '48%',
  },
});
