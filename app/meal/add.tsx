import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Colors from '@/constants/colors';
import { useMealsStore } from '@/store/meals-store';
import { useUserStore } from '@/store/user-store';
import Input from '@/components/Input';
import Button from '@/components/Button';
import { Utensils } from 'lucide-react-native';

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export default function AddMealScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { id } = params;
  const isEditing = !!id;
  
  const { addMeal, updateMeal, meals = [], isLoading, error } = useMealsStore();
  const { firebaseUser } = useUserStore();
  
  const [description, setDescription] = useState('');
  const [mealType, setMealType] = useState<MealType>('breakfast');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [date, setDate] = useState<Date>(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Load meal data if editing
  useEffect(() => {
    if (isEditing && id) {
      const mealToEdit = meals.find(meal => meal.id === id);
      if (mealToEdit) {
        setDescription(mealToEdit.description);
        setMealType(mealToEdit.mealType as MealType);
        setCalories(mealToEdit.calories ? mealToEdit.calories.toString() : '');
        setProtein(mealToEdit.protein ? mealToEdit.protein.toString() : '');
        setDate(new Date(mealToEdit.date));
      } else {
        Alert.alert("Error", "Meal not found");
        router.back();
      }
    }
  }, [id, meals]);
  
  const handleSubmit = async () => {
    if (!description.trim() || !firebaseUser) {
      return;
    }
    
    setIsSubmitting(true);
    
    const mealData = {
      userId: firebaseUser.uid,
      date,
      mealType,
      description,
      calories: calories ? parseInt(calories) : undefined,
      protein: protein ? parseInt(protein) : undefined,
    };
    
    try {
      if (isEditing && id) {
        await updateMeal(id as string, mealData);
      } else {
        await addMeal(mealData);
      }
      router.back();
    } catch (error) {
      console.error('Error saving meal:', error);
      Alert.alert('Error', 'Failed to save meal. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['right', 'left', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Utensils size={32} color={Colors.accent.default} />
          <Text style={styles.title}>{isEditing ? 'Edit Meal' : 'Track Your Meal'}</Text>
        </View>
        
        <View style={styles.form}>
          <Text style={styles.sectionTitle}>Meal Type</Text>
          <View style={styles.mealTypeContainer}>
            {(['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.mealTypeButton,
                  mealType === type && styles.activeMealTypeButton
                ]}
                onPress={() => setMealType(type)}
              >
                <Text 
                  style={[
                    styles.mealTypeText,
                    mealType === type && styles.activeMealTypeText
                  ]}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <Text style={styles.sectionTitle}>Meal Details</Text>
          <Input
            label="Description"
            placeholder="What did you eat?"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            style={styles.textArea}
          />
          
          <View style={styles.nutritionRow}>
            <Input
              label="Calories (optional)"
              placeholder="e.g., 500"
              value={calories}
              onChangeText={setCalories}
              keyboardType="numeric"
              containerStyle={styles.halfInput}
            />
            <Input
              label="Protein (g) (optional)"
              placeholder="e.g., 30"
              value={protein}
              onChangeText={setProtein}
              keyboardType="numeric"
              containerStyle={styles.halfInput}
            />
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
          title={isEditing ? "Update Meal" : "Save Meal"}
          onPress={handleSubmit}
          variant="primary"
          style={styles.footerButton}
          loading={isSubmitting || isLoading}
          disabled={!description.trim() || !firebaseUser}
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
    marginBottom: 12,
  },
  mealTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
    gap: 8,
  },
  mealTypeButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
    backgroundColor: Colors.white,
    minWidth: '48%',
    alignItems: 'center',
  },
  activeMealTypeButton: {
    backgroundColor: Colors.accent.default,
    borderColor: Colors.accent.default,
  },
  mealTypeText: {
    fontSize: 14,
    color: Colors.primary.background,
  },
  activeMealTypeText: {
    color: Colors.white,
    fontWeight: '600',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  dateInfo: {
    marginTop: 16,
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
});
