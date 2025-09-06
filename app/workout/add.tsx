import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Colors from '@/constants/colors';
import { useWorkoutsStore } from '@/store/workouts-store';
import { useWorkoutRatingStore } from '@/store/workout-rating-store';
import { useUserStore } from '@/store/user-store';
import Input from '@/components/Input';
import Button from '@/components/Button';
import StarRating from '@/components/StarRating';
import { Dumbbell, Plus, X } from 'lucide-react-native';

type IntensityType = 'low' | 'medium' | 'high';

const focusAreaOptions = [
  'Shooting',
  'Dribbling',
  'Defense',
  'Conditioning',
  'Strength',
  'Agility',
  'Footwork',
  'Post Moves',
  'Ball Handling',
  'Passing',
  'Rebounding',
  'Free Throws',
];

function AddWorkoutScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { id } = params;
  const isEditing = !!id;
  
  const { addWorkout, updateWorkout, workouts = [] } = useWorkoutsStore();
  const { addRating, getRatingByWorkoutId, updateRating } = useWorkoutRatingStore();
  const { firebaseUser } = useUserStore();
  
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('');
  const [intensity, setIntensity] = useState<IntensityType>('medium');
  const [focusAreas, setFocusAreas] = useState<string[]>([]);
  const [date, setDate] = useState<Date>(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [workoutId, setWorkoutId] = useState<string>('');
  
  // Workout rating
  const [showRating, setShowRating] = useState(false);
  const [focusRating, setFocusRating] = useState(3);
  const [effortRating, setEffortRating] = useState(3);
  const [recoveryRating, setRecoveryRating] = useState(3);
  const [ratingNotes, setRatingNotes] = useState('');
  
  // Load workout data if editing
  useEffect(() => {
    if (isEditing && id) {
      const workoutToEdit = workouts.find(workout => workout.id === id);
      if (workoutToEdit) {
        setDescription(workoutToEdit.description);
        setDuration(workoutToEdit.duration.toString());
        setIntensity((workoutToEdit.intensity || 'medium') as IntensityType);
        setFocusAreas(workoutToEdit.focusArea || []);
        setDate(new Date(workoutToEdit.date));
        setWorkoutId(workoutToEdit.id);
        
        // Load existing rating if available
        const existingRating = getRatingByWorkoutId(workoutToEdit.id);
        if (existingRating) {
          setFocusRating(existingRating.focus);
          setEffortRating(existingRating.effort);
          setRecoveryRating(existingRating.recovery);
          setRatingNotes(existingRating.notes || '');
        }
      } else {
        Alert.alert("Error", "Workout not found");
        router.back();
      }
    }
  }, [id, workouts, getRatingByWorkoutId]);
  
  const handleAddFocusArea = (area: string) => {
    if (!focusAreas.includes(area)) {
      setFocusAreas([...focusAreas, area]);
    }
  };
  
  const handleRemoveFocusArea = (area: string) => {
    setFocusAreas(focusAreas.filter(a => a !== area));
  };
  
  const handleSubmit = async () => {
    if (!description.trim() || !duration) {
      return;
    }
    
    setIsSubmitting(true);
    
    const workoutData = {
      userId: firebaseUser?.uid || '',
      date: isEditing ? date.toISOString() : new Date().toISOString(),
      description,
      duration: parseInt(duration),
      intensity,
      focusArea: focusAreas.length > 0 ? focusAreas : undefined,
    };
    
    try {
      if (isEditing && id) {
        await updateWorkout(id as string, workoutData);
        
        Alert.alert(
          "Update Rating",
          "Would you like to update your workout rating?",
          [
            {
              text: "No",
              onPress: () => {
                setIsSubmitting(false);
                router.back();
              },
              style: "cancel"
            },
            {
              text: "Yes",
              onPress: () => {
                setIsSubmitting(false);
                setShowRating(true);
              }
            }
          ]
        );
      } else {
        const newWorkoutId = Date.now().toString();
        await addWorkout(workoutData);
        setWorkoutId(newWorkoutId);
        
        setShowRating(true);
        setIsSubmitting(false);
      }
    } catch (error) {
      setIsSubmitting(false);
      Alert.alert('Error', 'Failed to save workout. Please try again.');
    }
  };
  
  const handleSubmitRating = async () => {
    setIsSubmitting(true);
    
    const currentDate = new Date();
    const formattedDate = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
    
    const workoutRating = {
      userId: firebaseUser?.uid || '',
      workoutId: isEditing ? id as string : workoutId,
      date: formattedDate,
      focus: focusRating,
      effort: effortRating,
      recovery: recoveryRating,
      notes: ratingNotes.trim() || undefined,
    };
    
    try {
      if (isEditing && getRatingByWorkoutId && getRatingByWorkoutId(id as string)) {
        const existingRating = getRatingByWorkoutId(id as string);
        if (existingRating) {
          await updateRating(existingRating.id, workoutRating);
        }
      } else {
        await addRating(workoutRating);
      }
      
      setTimeout(() => {
        setIsSubmitting(false);
        router.back();
      }, 500);
    } catch (error) {
      setIsSubmitting(false);
      Alert.alert('Error', 'Failed to save rating. Please try again.');
    }
  };
  
  const handleSkipRating = () => {
    router.back();
  };
  
  if (showRating) {
    return (
      <SafeAreaView style={styles.container} edges={['right', 'left', 'bottom']}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Dumbbell size={32} color={Colors.accent.default} />
            <Text style={styles.title}>Rate Your Workout</Text>
          </View>
          
          <View style={styles.form}>
            <View style={styles.ratingSection}>
              <Text style={styles.ratingLabel}>Focus</Text>
              <Text style={styles.ratingDescription}>How well were you able to concentrate?</Text>
              <StarRating
                rating={focusRating}
                onRatingChange={setFocusRating}
                size={36}
                style={styles.starRating}
              />
            </View>
            
            <View style={styles.ratingSection}>
              <Text style={styles.ratingLabel}>Effort</Text>
              <Text style={styles.ratingDescription}>How hard did you push yourself?</Text>
              <StarRating
                rating={effortRating}
                onRatingChange={setEffortRating}
                size={36}
                style={styles.starRating}
              />
            </View>
            
            <View style={styles.ratingSection}>
              <Text style={styles.ratingLabel}>Recovery</Text>
              <Text style={styles.ratingDescription}>How do you feel after the workout?</Text>
              <StarRating
                rating={recoveryRating}
                onRatingChange={setRecoveryRating}
                size={36}
                style={styles.starRating}
              />
            </View>
            
            <Input
              label="Notes (Optional)"
              placeholder="Any additional thoughts about this workout?"
              value={ratingNotes}
              onChangeText={setRatingNotes}
              multiline
              numberOfLines={3}
              style={styles.textArea}
            />
          </View>
        </ScrollView>
        
        <View style={styles.footer}>
          <Button
            title="Skip"
            onPress={handleSkipRating}
            variant="outline"
            style={styles.footerButton}
          />
          <Button
            title={isEditing ? "Update Rating" : "Save Rating"}
            onPress={handleSubmitRating}
            variant="primary"
            style={styles.footerButton}
            loading={isSubmitting}
          />
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container} edges={['right', 'left', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Dumbbell size={32} color={Colors.accent.default} />
          <Text style={styles.title}>{isEditing ? 'Edit Workout' : 'Log Your Workout'}</Text>
        </View>
        
        <View style={styles.form}>
          <Input
            label="Workout Description"
            placeholder="Describe your workout"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            style={styles.textArea}
          />
          
          <Input
            label="Duration (minutes)"
            placeholder="e.g., 45"
            value={duration}
            onChangeText={setDuration}
            keyboardType="numeric"
          />
          
          <Text style={styles.sectionTitle}>Intensity</Text>
          <View style={styles.intensityContainer}>
            {(['low', 'medium', 'high'] as IntensityType[]).map((level) => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.intensityButton,
                  intensity === level && styles.activeIntensityButton,
                  level === 'low' && styles.lowIntensity,
                  level === 'medium' && styles.mediumIntensity,
                  level === 'high' && styles.highIntensity,
                ]}
                onPress={() => setIntensity(level)}
              >
                <Text 
                  style={[
                    styles.intensityText,
                    intensity === level && styles.activeIntensityText
                  ]}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <Text style={styles.sectionTitle}>Focus Areas (Optional)</Text>
          
          {focusAreas.length > 0 && (
            <View style={styles.selectedAreasContainer}>
              {focusAreas.map(area => (
                <View key={area} style={styles.selectedArea}>
                  <Text style={styles.selectedAreaText}>{area}</Text>
                  <TouchableOpacity
                    onPress={() => handleRemoveFocusArea(area)}
                    style={styles.removeAreaButton}
                  >
                    <X size={14} color={Colors.neutral.textDark} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
          
          <View style={styles.focusAreasContainer}>
            {focusAreaOptions.map(area => (
              <TouchableOpacity
                key={area}
                style={[
                  styles.focusAreaButton,
                  focusAreas.includes(area) && styles.disabledFocusAreaButton
                ]}
                onPress={() => handleAddFocusArea(area)}
                disabled={focusAreas.includes(area)}
              >
                <Text 
                  style={[
                    styles.focusAreaText,
                    focusAreas.includes(area) && styles.disabledFocusAreaText
                  ]}
                >
                  {area}
                </Text>
                {!focusAreas.includes(area) && (
                  <Plus size={14} color={Colors.accent.default} />
                )}
              </TouchableOpacity>
            ))}
          </View>
          
          {isEditing && (
            <View style={styles.dateInfo}>
              <Text style={styles.dateInfoText}>
                Original date: {date.toLocaleDateString()} {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
              <Text style={styles.dateInfoNote}>
                Note: Editing will preserve the original date and time
              </Text>
            </View>
          )}
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
          title={isEditing ? "Update Workout" : "Save Workout"}
          onPress={handleSubmit}
          variant="primary"
          style={styles.footerButton}
          loading={isSubmitting}
          disabled={!description.trim() || !duration}
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
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary.background,
    marginTop: 16,
    marginBottom: 12,
  },
  intensityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  intensityButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
  },
  lowIntensity: {
    borderColor: Colors.success,
    backgroundColor: Colors.success + '10', // 10% opacity
  },
  mediumIntensity: {
    borderColor: Colors.warning,
    backgroundColor: Colors.warning + '10', // 10% opacity
  },
  highIntensity: {
    borderColor: Colors.error,
    backgroundColor: Colors.error + '10', // 10% opacity
  },
  activeIntensityButton: {
    borderWidth: 2,
  },
  intensityText: {
    fontSize: 14,
    fontWeight: '500',
  },
  activeIntensityText: {
    fontWeight: 'bold',
  },
  selectedAreasContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    gap: 8,
  },
  selectedArea: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accent.light + '20', // 20% opacity
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  selectedAreaText: {
    fontSize: 14,
    color: Colors.accent.default,
    marginRight: 4,
  },
  removeAreaButton: {
    padding: 2,
  },
  focusAreasContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  focusAreaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
    gap: 6,
  },
  disabledFocusAreaButton: {
    backgroundColor: Colors.light.border,
    opacity: 0.6,
  },
  focusAreaText: {
    fontSize: 14,
    color: Colors.primary.background,
  },
  disabledFocusAreaText: {
    color: Colors.neutral.textDark,
  },
  dateInfo: {
    marginTop: 24,
    padding: 12,
    backgroundColor: Colors.light.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  dateInfoText: {
    fontSize: 14,
    color: Colors.primary.background,
  },
  dateInfoNote: {
    fontSize: 12,
    color: Colors.neutral.textDark,
    marginTop: 4,
    fontStyle: 'italic',
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
  // Rating styles
  ratingSection: {
    marginBottom: 24,
  },
  ratingLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.primary.background,
    marginBottom: 4,
  },
  ratingDescription: {
    fontSize: 14,
    color: Colors.neutral.textDark,
    marginBottom: 12,
  },
  starRating: {
    alignSelf: 'center',
  },
});

export default AddWorkoutScreen;
