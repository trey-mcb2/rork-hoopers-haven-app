import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Colors from '@/constants/colors';
import { useShotsStore } from '@/store/shots-store';
import Input from '@/components/Input';
import Button from '@/components/Button';
import { Target, Minus, Plus } from 'lucide-react-native';

const shotTypeOptions = [
  'Free Throws',
  'Mid-Range',
  'Three-Pointers',
  'Layups',
  'Hook Shots',
  'Floaters',
  'Mixed',
];

const locationOptions = [
  'Gym',
  'Home',
  'Park',
  'School',
  'Other',
];

export default function AddShotSessionScreen() {
  const router = useRouter();
  const { addSession } = useShotsStore();
  
  const [shotsMade, setShotsMade] = useState('0');
  const [shotsAttempted, setShotsAttempted] = useState('0');
  const [shotType, setShotType] = useState('');
  const [location, setLocation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleIncrementMade = () => {
    setShotsMade((parseInt(shotsMade) + 1).toString());
    if (parseInt(shotsMade) + 1 > parseInt(shotsAttempted)) {
      setShotsAttempted((parseInt(shotsMade) + 1).toString());
    }
  };
  
  const handleDecrementMade = () => {
    if (parseInt(shotsMade) > 0) {
      setShotsMade((parseInt(shotsMade) - 1).toString());
    }
  };
  
  const handleIncrementAttempted = () => {
    setShotsAttempted((parseInt(shotsAttempted) + 1).toString());
  };
  
  const handleDecrementAttempted = () => {
    if (parseInt(shotsAttempted) > parseInt(shotsMade)) {
      setShotsAttempted((parseInt(shotsAttempted) - 1).toString());
    }
  };
  
  const handleSubmit = () => {
    if (parseInt(shotsAttempted) <= 0) {
      return;
    }
    
    setIsSubmitting(true);
    
    const newSession = {
      userId: '1', // Use actual user ID in a real app
      date: new Date(),
      shotsMade: parseInt(shotsMade),
      shotsAttempted: parseInt(shotsAttempted),
      shotType: shotType || undefined,
      location: location || undefined,
    };
    
    addSession(newSession);
    
    // Simulate a brief loading state
    setTimeout(() => {
      setIsSubmitting(false);
      router.back();
    }, 500);
  };
  
  // Calculate shooting percentage
  const shootingPercentage = parseInt(shotsAttempted) > 0 
    ? Math.round((parseInt(shotsMade) / parseInt(shotsAttempted)) * 100) 
    : 0;
  
  return (
    <SafeAreaView style={styles.container} edges={['right', 'left', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Target size={32} color={Colors.accent.default} />
          <Text style={styles.title}>Track Your Shots</Text>
        </View>
        
        <View style={styles.form}>
          <View style={styles.counterSection}>
            <View style={styles.counterContainer}>
              <Text style={styles.counterLabel}>Shots Made</Text>
              <View style={styles.counterControls}>
                <TouchableOpacity 
                  style={styles.counterButton}
                  onPress={handleDecrementMade}
                >
                  <Minus size={20} color={Colors.primary.background} />
                </TouchableOpacity>
                <Text style={styles.counterValue}>{shotsMade}</Text>
                <TouchableOpacity 
                  style={styles.counterButton}
                  onPress={handleIncrementMade}
                >
                  <Plus size={20} color={Colors.primary.background} />
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.counterContainer}>
              <Text style={styles.counterLabel}>Shots Attempted</Text>
              <View style={styles.counterControls}>
                <TouchableOpacity 
                  style={styles.counterButton}
                  onPress={handleDecrementAttempted}
                  disabled={parseInt(shotsAttempted) <= parseInt(shotsMade)}
                >
                  <Minus 
                    size={20} 
                    color={parseInt(shotsAttempted) <= parseInt(shotsMade) 
                      ? Colors.neutral.textDark 
                      : Colors.primary.background} 
                  />
                </TouchableOpacity>
                <Text style={styles.counterValue}>{shotsAttempted}</Text>
                <TouchableOpacity 
                  style={styles.counterButton}
                  onPress={handleIncrementAttempted}
                >
                  <Plus size={20} color={Colors.primary.background} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
          
          <View style={styles.percentageContainer}>
            <Text style={styles.percentageLabel}>Shooting Percentage</Text>
            <Text style={styles.percentageValue}>{shootingPercentage}%</Text>
          </View>
          
          <Text style={styles.sectionTitle}>Shot Type (Optional)</Text>
          <View style={styles.optionsContainer}>
            {shotTypeOptions.map(option => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.optionButton,
                  shotType === option && styles.activeOptionButton
                ]}
                onPress={() => setShotType(option)}
              >
                <Text 
                  style={[
                    styles.optionText,
                    shotType === option && styles.activeOptionText
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <Text style={styles.sectionTitle}>Location (Optional)</Text>
          <View style={styles.optionsContainer}>
            {locationOptions.map(option => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.optionButton,
                  location === option && styles.activeOptionButton
                ]}
                onPress={() => setLocation(option)}
              >
                <Text 
                  style={[
                    styles.optionText,
                    location === option && styles.activeOptionText
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
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
          title="Save Session"
          onPress={handleSubmit}
          variant="primary"
          style={styles.footerButton}
          loading={isSubmitting}
          disabled={parseInt(shotsAttempted) <= 0}
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
  counterSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  counterContainer: {
    width: '48%',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  counterLabel: {
    fontSize: 14,
    color: Colors.neutral.textDark,
    marginBottom: 12,
    textAlign: 'center',
  },
  counterControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  counterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary.background,
  },
  percentageContainer: {
    backgroundColor: Colors.accent.default,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  percentageLabel: {
    fontSize: 14,
    color: Colors.white,
    marginBottom: 8,
  },
  percentageValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.white,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary.background,
    marginBottom: 12,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
    backgroundColor: Colors.white,
  },
  activeOptionButton: {
    backgroundColor: Colors.accent.default,
    borderColor: Colors.accent.default,
  },
  optionText: {
    fontSize: 14,
    color: Colors.primary.background,
  },
  activeOptionText: {
    color: Colors.white,
    fontWeight: '600',
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