import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Target, Edit2, Check } from 'lucide-react-native';
import Colors from '@/constants/colors';
import Card from '@/components/Card';
import { useUserStore } from '@/store/user-store';

interface PersonalGoalProps {
  compact?: boolean;
}

export const PersonalGoal: React.FC<PersonalGoalProps> = ({ compact = false }) => {
  const { personalGoal, setPersonalGoal } = useUserStore();
  const [isEditing, setIsEditing] = useState(false);
  const [goalText, setGoalText] = useState(personalGoal || '');
  
  const handleStartEditing = () => {
    setGoalText(personalGoal || '');
    setIsEditing(true);
  };
  
  const handleSaveGoal = () => {
    setPersonalGoal(goalText.trim());
    setIsEditing(false);
  };
  
  if (compact) {
    return (
      <Card variant="elevated" style={styles.compactCard}>
        <View style={styles.compactHeader}>
          <Target size={20} color={Colors.accent.default} />
          <Text style={styles.compactTitle}>Personal Goal</Text>
        </View>
        
        {!isEditing ? (
          <View style={styles.compactContent}>
            <Text style={styles.compactGoalText} numberOfLines={2}>
              {personalGoal || "Set a personal goal"}
            </Text>
            <TouchableOpacity 
              style={styles.compactButton}
              onPress={handleStartEditing}
            >
              <Edit2 size={14} color={Colors.primary.background} />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.compactEditContainer}>
            <TextInput
              style={styles.compactInput}
              value={goalText}
              onChangeText={setGoalText}
              placeholder="Enter your goal"
              autoFocus
            />
            <TouchableOpacity 
              style={[styles.compactButton, styles.compactSaveButton]}
              onPress={handleSaveGoal}
            >
              <Check size={14} color={Colors.white} />
            </TouchableOpacity>
          </View>
        )}
      </Card>
    );
  }
  
  return (
    <Card variant="elevated" style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Target size={24} color={Colors.accent.default} />
          <Text style={styles.title}>My Personal Goal</Text>
        </View>
      </View>
      
      <View style={styles.content}>
        {!isEditing ? (
          <>
            <View style={styles.goalContainer}>
              {personalGoal ? (
                <Text style={styles.goalText}>{personalGoal}</Text>
              ) : (
                <Text style={styles.placeholderText}>
                  Set a personal goal to stay motivated and focused
                </Text>
              )}
            </View>
            
            <TouchableOpacity 
              style={styles.editButton}
              onPress={handleStartEditing}
            >
              <Edit2 size={18} color={Colors.white} />
              <Text style={styles.editButtonText}>
                {personalGoal ? "Edit Goal" : "Set Goal"}
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TextInput
              style={styles.input}
              value={goalText}
              onChangeText={setGoalText}
              placeholder="Enter your personal goal"
              multiline
              numberOfLines={3}
              autoFocus
            />
            
            <TouchableOpacity 
              style={styles.saveButton}
              onPress={handleSaveGoal}
            >
              <Check size={18} color={Colors.white} />
              <Text style={styles.saveButtonText}>Save Goal</Text>
            </TouchableOpacity>
          </>
        )}
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
  goalContainer: {
    backgroundColor: Colors.light.background,
    borderRadius: 8,
    padding: 16,
    minHeight: 80,
    justifyContent: 'center',
    marginBottom: 16,
  },
  goalText: {
    fontSize: 16,
    color: Colors.primary.background,
    lineHeight: 24,
  },
  placeholderText: {
    fontSize: 16,
    color: Colors.neutral.textDark,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  editButton: {
    flexDirection: 'row',
    backgroundColor: Colors.accent.default,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButtonText: {
    color: Colors.white,
    fontWeight: '600',
    marginLeft: 8,
  },
  input: {
    backgroundColor: Colors.light.background,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.primary.background,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  saveButton: {
    flexDirection: 'row',
    backgroundColor: Colors.success,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: Colors.white,
    fontWeight: '600',
    marginLeft: 8,
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
  compactGoalText: {
    flex: 1,
    fontSize: 14,
    color: Colors.primary.background,
  },
  compactButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.light.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  compactSaveButton: {
    backgroundColor: Colors.success,
  },
  compactEditContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compactInput: {
    flex: 1,
    backgroundColor: Colors.light.background,
    borderRadius: 6,
    padding: 8,
    fontSize: 14,
    color: Colors.primary.background,
  },
});

export default PersonalGoal;