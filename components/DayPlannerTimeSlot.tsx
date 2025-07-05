import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import Colors from '@/constants/colors';
import { DayPlannerEntry } from '@/types';
import { Edit, Save, X, Trash2 } from 'lucide-react-native';

interface DayPlannerTimeSlotProps {
  timeSlot: string;
  note: string;
  onSave: (note: string) => void;
  onDelete?: () => void;
}

const DayPlannerTimeSlot: React.FC<DayPlannerTimeSlotProps> = ({ 
  timeSlot, 
  note, 
  onSave,
  onDelete
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedNote, setEditedNote] = useState(note);
  
  const handleSave = () => {
    onSave(editedNote);
    setIsEditing(false);
  };
  
  const handleDelete = () => {
    if (onDelete) {
      Alert.alert(
        "Delete Event",
        "Are you sure you want to delete this event?",
        [
          {
            text: "Cancel",
            style: "cancel"
          },
          { 
            text: "Delete", 
            onPress: () => {
              onDelete();
              setIsEditing(false);
            },
            style: "destructive"
          }
        ]
      );
    }
  };
  
  const formatTimeSlot = (slot: string) => {
    const hour = parseInt(slot.split(':')[0]);
    return `${hour % 12 === 0 ? 12 : hour % 12}:00 ${hour >= 12 ? 'PM' : 'AM'}`;
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.timeContainer}>
        <Text style={styles.timeText}>{formatTimeSlot(timeSlot)}</Text>
      </View>
      
      <View style={styles.noteContainer}>
        {isEditing ? (
          <View style={styles.editContainer}>
            <TextInput
              style={styles.input}
              value={editedNote}
              onChangeText={setEditedNote}
              placeholder="Add note for this time slot..."
              placeholderTextColor={Colors.neutral.textDark}
              multiline
              autoFocus
            />
            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={[styles.button, styles.cancelButton]} 
                onPress={() => {
                  setEditedNote(note);
                  setIsEditing(false);
                }}
              >
                <X size={16} color={Colors.neutral.textDark} />
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              {note && onDelete && (
                <TouchableOpacity 
                  style={[styles.button, styles.deleteButton]} 
                  onPress={handleDelete}
                >
                  <Trash2 size={16} color={Colors.error} />
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity 
                style={[styles.button, styles.saveButton]} 
                onPress={handleSave}
              >
                <Save size={16} color={Colors.white} />
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity 
            style={[styles.noteDisplay, note ? styles.hasNote : styles.noNote]} 
            onPress={() => setIsEditing(true)}
          >
            {note ? (
              <View style={styles.noteContent}>
                <Text style={styles.noteText}>{note}</Text>
                <Edit size={16} color={Colors.neutral.textDark} style={styles.editIcon} />
              </View>
            ) : (
              <Text style={styles.placeholderText}>Tap to add note</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  timeContainer: {
    width: 80,
    justifyContent: 'center',
  },
  timeText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary.background,
  },
  noteContainer: {
    flex: 1,
    borderLeftWidth: 1,
    borderLeftColor: Colors.light.border,
    paddingLeft: 12,
  },
  noteDisplay: {
    padding: 12,
    borderRadius: 8,
    minHeight: 50,
    justifyContent: 'center',
  },
  hasNote: {
    backgroundColor: Colors.light.card,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  noNote: {
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderStyle: 'dashed',
  },
  noteContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  noteText: {
    fontSize: 14,
    color: Colors.primary.background,
    flex: 1,
  },
  editIcon: {
    marginLeft: 8,
  },
  placeholderText: {
    fontSize: 14,
    color: Colors.neutral.textDark,
    fontStyle: 'italic',
  },
  editContainer: {
    backgroundColor: Colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.accent.default,
    padding: 8,
  },
  input: {
    fontSize: 14,
    color: Colors.primary.background,
    minHeight: 50,
    padding: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
    gap: 8,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    gap: 4,
  },
  cancelButton: {
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  deleteButton: {
    backgroundColor: Colors.error + '20',
    borderWidth: 1,
    borderColor: Colors.error + '40',
  },
  saveButton: {
    backgroundColor: Colors.accent.default,
  },
  cancelButtonText: {
    color: Colors.primary.background,
    fontSize: 14,
    fontWeight: '500',
  },
  deleteButtonText: {
    color: Colors.error,
    fontSize: 14,
    fontWeight: '500',
  },
  saveButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '500',
  },
});

export default DayPlannerTimeSlot;