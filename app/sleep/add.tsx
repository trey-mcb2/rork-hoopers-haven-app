import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Colors from '@/constants/colors';
import { useSleepStore } from '@/store/sleep-store';
import { useUserStore } from '@/store/user-store';
import Input from '@/components/Input';
import Button from '@/components/Button';
import StarRating from '@/components/StarRating';
import { Moon, Plus, Minus } from 'lucide-react-native';

export default function AddSleepScreen() {
  const router = useRouter();
  const { addSleepEntry, isLoading, error } = useSleepStore();
  const { firebaseUser } = useUserStore();
  
  const [hours, setHours] = useState('7');
  const [quality, setQuality] = useState(3);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleIncrementHours = () => {
    const currentHours = parseFloat(hours);
    if (currentHours < 12) {
      setHours((currentHours + 0.5).toString());
    }
  };
  
  const handleDecrementHours = () => {
    const currentHours = parseFloat(hours);
    if (currentHours > 0.5) {
      setHours((currentHours - 0.5).toString());
    }
  };
  
  const handleSubmit = async () => {
    if (parseFloat(hours) <= 0 || !firebaseUser) {
      return;
    }
    
    setIsSubmitting(true);
    
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    const newSleepEntry = {
      userId: firebaseUser.uid,
      date: dateStr,
      hours: parseFloat(hours),
      quality,
      notes: notes.trim() || undefined,
    };
    
    try {
      await addSleepEntry(newSleepEntry);
      router.back();
    } catch (error) {
      console.error('Error saving sleep entry:', error);
      Alert.alert('Error', 'Failed to save sleep entry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['right', 'left', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Moon size={32} color={Colors.accent.default} />
          <Text style={styles.title}>Track Your Sleep</Text>
        </View>
        
        <View style={styles.form}>
          <Text style={styles.sectionTitle}>Hours Slept</Text>
          <View style={styles.hoursContainer}>
            <TouchableOpacity 
              style={styles.controlButton}
              onPress={handleDecrementHours}
              disabled={parseFloat(hours) <= 0.5}
            >
              <Minus 
                size={24} 
                color={parseFloat(hours) <= 0.5 ? Colors.neutral.textDark : Colors.white} 
              />
            </TouchableOpacity>
            
            <View style={styles.hoursDisplay}>
              <Text style={styles.hoursValue}>{hours}</Text>
              <Text style={styles.hoursLabel}>hours</Text>
            </View>
            
            <TouchableOpacity 
              style={styles.controlButton}
              onPress={handleIncrementHours}
              disabled={parseFloat(hours) >= 12}
            >
              <Plus 
                size={24} 
                color={parseFloat(hours) >= 12 ? Colors.neutral.textDark : Colors.white} 
              />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.sectionTitle}>Sleep Quality</Text>
          <View style={styles.qualityContainer}>
            <StarRating
              rating={quality}
              onRatingChange={setQuality}
              size={36}
              style={styles.starRating}
            />
            <Text style={styles.qualityLabel}>
              {quality === 1 ? "Poor" : 
               quality === 2 ? "Fair" : 
               quality === 3 ? "Good" : 
               quality === 4 ? "Very Good" : "Excellent"}
            </Text>
          </View>
          
          <Input
            label="Notes (Optional)"
            placeholder="How did you feel when you woke up? Any dreams?"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            style={styles.textArea}
          />
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
          title="Save Sleep Entry"
          onPress={handleSubmit}
          variant="primary"
          style={styles.footerButton}
          loading={isSubmitting || isLoading}
          disabled={parseFloat(hours) <= 0 || !firebaseUser}
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
  form: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary.background,
    marginBottom: 16,
  },
  hoursContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  controlButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.accent.default,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hoursDisplay: {
    alignItems: 'center',
  },
  hoursValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: Colors.primary.background,
  },
  hoursLabel: {
    fontSize: 14,
    color: Colors.neutral.textDark,
  },
  qualityContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  starRating: {
    marginBottom: 12,
  },
  qualityLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary.background,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
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
