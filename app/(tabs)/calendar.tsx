import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import Colors from '@/constants/colors';
import CalendarView from '@/components/CalendarView';
import DayDetails from '@/components/DayDetails';
import DayPlannerTimeSlot from '@/components/DayPlannerTimeSlot';
import { useDayPlannerStore } from '@/store/day-planner-store';
import { useDayRatingStore } from '@/store/day-rating-store';
import { useWaterStore } from '@/store/water-store';
import { useSleepStore } from '@/store/sleep-store';
import { useWorkoutsStore } from '@/store/workouts-store';
import { Calendar as CalendarIcon, Plus, Clock } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Button from '@/components/Button';
import Input from '@/components/Input';

export default function CalendarScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { entries = [], addEntry, updateEntry, deleteEntry, getEntriesForDate, isLoading: isLoadingPlanner } = useDayPlannerStore();
  
  // Get data from other stores for marked dates
  const { ratings: dayRatings = [], isLoading: isLoadingRatings } = useDayRatingStore();
  const { logs: waterLogs = [], isLoading: isLoadingWater } = useWaterStore();
  const { entries: sleepLogs = [], isLoading: isLoadingSleep } = useSleepStore();
  const { workouts = [], isLoading: isLoadingWorkouts } = useWorkoutsStore();
  
  // State for adding a new custom event
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [newEventTime, setNewEventTime] = useState(new Date());
  const [newEventNote, setNewEventNote] = useState('');
  const [showTimePicker, setShowTimePicker] = useState(false);
  
  // Format date to string (YYYY-MM-DD)
  const formatDate = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };
  
  const selectedDateString = formatDate(selectedDate);
  const dayEntries = getEntriesForDate ? getEntriesForDate(selectedDateString) || [] : [];
  
  // Generate time slots from 6 AM to 10 PM
  const timeSlots = Array.from({ length: 17 }, (_, i) => {
    const hour = i + 6;
    return `${String(hour).padStart(2, '0')}:00`;
  });
  
  // Handle saving a note for a time slot
  const handleSaveNote = (timeSlot: string, note: string) => {
    if (!addEntry || !updateEntry) return;
    
    const existingEntry = dayEntries.find(entry => entry.timeSlot === timeSlot);
    
    if (existingEntry) {
      updateEntry(existingEntry.id, note);
    } else if (note.trim() !== '') {
      addEntry({
        userId: '1', // Assuming a default user ID
        date: selectedDateString,
        timeSlot,
        note,
      });
    }
  };
  
  // Handle deleting a note
  const handleDeleteNote = (id: string) => {
    if (!deleteEntry) return;
    
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
          onPress: () => deleteEntry(id),
          style: "destructive"
        }
      ]
    );
  };
  
  // Handle adding a custom event
  const handleAddCustomEvent = () => {
    if (!newEventNote.trim()) {
      Alert.alert("Error", "Please enter a note for the event");
      return;
    }
    
    const hours = newEventTime.getHours();
    const minutes = newEventTime.getMinutes();
    const timeSlot = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    
    addEntry({
      userId: '1',
      date: selectedDateString,
      timeSlot,
      note: newEventNote,
    });
    
    // Reset form
    setNewEventNote('');
    setShowAddEvent(false);
  };
  
  // Prepare marked dates for the calendar
  const getMarkedDates = () => {
    const markedDates: Record<string, { marked: boolean; dotColor?: string }> = {};
    
    // Mark days with ratings
    if (dayRatings && dayRatings.length > 0) {
      dayRatings.forEach(rating => {
        if (rating && rating.date) {
          const dateStr = typeof rating.date === 'string' ? rating.date : formatDate(new Date(rating.date));
          markedDates[dateStr] = { marked: true, dotColor: Colors.accent.default };
        }
      });
    }
    
    // Mark days with water logs
    if (Array.isArray(waterLogs) && waterLogs.length > 0) {
      waterLogs.forEach(log => {
        if (log && log.date) {
          const dateStr = typeof log.date === 'string' ? log.date : formatDate(new Date(log.date));
          markedDates[dateStr] = { marked: true, dotColor: '#2196F3' }; // Blue for water
        }
      });
    }
    
    // Mark days with sleep logs
    if (sleepLogs && sleepLogs.length > 0) {
      sleepLogs.forEach(log => {
        if (log && log.date) {
          const dateStr = typeof log.date === 'string' ? log.date : formatDate(new Date(log.date));
          markedDates[dateStr] = { marked: true, dotColor: '#9C27B0' }; // Purple for sleep
        }
      });
    }
    
    // Mark days with workouts
    if (workouts && workouts.length > 0) {
      workouts.forEach(workout => {
        if (workout && workout.date) {
          const dateStr = formatDate(new Date(workout.date));
          markedDates[dateStr] = { marked: true, dotColor: Colors.success };
        }
      });
    }
    
    // Mark days with planner entries
    if (entries && entries.length > 0) {
      entries.forEach(entry => {
        if (entry && entry.date) {
          markedDates[entry.date] = { marked: true, dotColor: Colors.primary.background };
        }
      });
    }
    
    return markedDates;
  };
  
  const isLoading = isLoadingPlanner || isLoadingRatings || isLoadingWater || isLoadingSleep || isLoadingWorkouts;
  
  // Sort day entries by time
  const sortedDayEntries = [...dayEntries].sort((a, b) => {
    const timeA = a.timeSlot.split(':').map(Number);
    const timeB = b.timeSlot.split(':').map(Number);
    
    if (timeA[0] !== timeB[0]) {
      return timeA[0] - timeB[0];
    }
    return timeA[1] - timeB[1];
  });
  
  return (
    <SafeAreaView style={styles.container} edges={['right', 'left']}>
      <Stack.Screen 
        options={{
          title: 'Calendar & Planner',
          headerStyle: {
            backgroundColor: Colors.primary.background,
          },
          headerTintColor: Colors.white,
        }} 
      />
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.accent.default} />
          <Text style={styles.loadingText}>Loading calendar data...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <CalendarView 
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
            markedDates={getMarkedDates()}
          />
          
          <DayDetails date={selectedDate} />
          
          <View style={styles.plannerContainer}>
            <View style={styles.plannerHeader}>
              <CalendarIcon size={20} color={Colors.accent.default} />
              <Text style={styles.plannerTitle}>Day Planner</Text>
              <TouchableOpacity 
                style={styles.addEventButton}
                onPress={() => setShowAddEvent(!showAddEvent)}
              >
                <Plus size={16} color={Colors.white} />
                <Text style={styles.addEventButtonText}>
                  {showAddEvent ? 'Cancel' : 'Add Event'}
                </Text>
              </TouchableOpacity>
            </View>
            
            <Text style={styles.plannerDate}>
              {selectedDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric' 
              })}
            </Text>
            
            {showAddEvent && (
              <View style={styles.addEventForm}>
                <Text style={styles.addEventTitle}>Add Custom Event</Text>
                
                <TouchableOpacity 
                  style={styles.timePickerButton}
                  onPress={() => setShowTimePicker(true)}
                >
                  <Clock size={18} color={Colors.accent.default} />
                  <Text style={styles.timePickerButtonText}>
                    {newEventTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </TouchableOpacity>
                
                {showTimePicker && (
                  <DateTimePicker
                    value={newEventTime}
                    mode="time"
                    is24Hour={false}
                    display="default"
                    onChange={(event, selectedTime) => {
                      setShowTimePicker(false);
                      if (selectedTime) {
                        setNewEventTime(selectedTime);
                      }
                    }}
                  />
                )}
                
                <Input
                  label="Event Details"
                  placeholder="Enter event details..."
                  value={newEventNote}
                  onChangeText={setNewEventNote}
                  multiline
                  numberOfLines={3}
                  style={styles.eventInput}
                />
                
                <Button
                  title="Add to Calendar"
                  onPress={handleAddCustomEvent}
                  variant="primary"
                  style={styles.addEventSubmitButton}
                  disabled={!newEventNote.trim()}
                />
              </View>
            )}
            
            {sortedDayEntries.length > 0 && (
              <View style={styles.customEventsContainer}>
                <Text style={styles.customEventsTitle}>Scheduled Events</Text>
                {sortedDayEntries.map(entry => (
                  <View key={entry.id} style={styles.customEventItem}>
                    <View style={styles.customEventTime}>
                      <Text style={styles.customEventTimeText}>
                        {entry.timeSlot}
                      </Text>
                    </View>
                    <View style={styles.customEventContent}>
                      <Text style={styles.customEventNote}>{entry.note}</Text>
                      <TouchableOpacity 
                        style={styles.deleteEventButton}
                        onPress={() => handleDeleteNote(entry.id)}
                      >
                        <Text style={styles.deleteEventButtonText}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}
            
            <View style={styles.timeSlots}>
              <Text style={styles.timeSlotsTitle}>Daily Schedule</Text>
              {timeSlots.map(timeSlot => {
                const entry = dayEntries.find(e => e.timeSlot === timeSlot);
                return (
                  <DayPlannerTimeSlot
                    key={timeSlot}
                    timeSlot={timeSlot}
                    note={entry?.note || ''}
                    onSave={(note) => handleSaveNote(timeSlot, note)}
                    onDelete={entry ? () => handleDeleteNote(entry.id) : undefined}
                  />
                );
              })}
            </View>
          </View>
        </ScrollView>
      )}
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
  },
  plannerContainer: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  plannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  plannerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary.background,
    marginLeft: 8,
    flex: 1,
  },
  plannerDate: {
    fontSize: 16,
    color: Colors.accent.default,
    marginBottom: 16,
  },
  timeSlots: {
    marginTop: 16,
  },
  timeSlotsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary.background,
    marginBottom: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.neutral.textDark,
  },
  addEventButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accent.default,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    gap: 4,
  },
  addEventButtonText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  addEventForm: {
    backgroundColor: Colors.light.card,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  addEventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary.background,
    marginBottom: 12,
  },
  timePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  timePickerButtonText: {
    fontSize: 16,
    color: Colors.primary.background,
    marginLeft: 8,
  },
  eventInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  addEventSubmitButton: {
    marginTop: 8,
  },
  customEventsContainer: {
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 8,
    padding: 12,
  },
  customEventsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary.background,
    marginBottom: 12,
  },
  customEventItem: {
    flexDirection: 'row',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
    paddingBottom: 12,
  },
  customEventTime: {
    width: 80,
    justifyContent: 'center',
  },
  customEventTimeText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.accent.default,
  },
  customEventContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  customEventNote: {
    fontSize: 14,
    color: Colors.primary.background,
    flex: 1,
  },
  deleteEventButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: Colors.error + '20',
    borderRadius: 4,
  },
  deleteEventButtonText: {
    fontSize: 12,
    color: Colors.error,
    fontWeight: '500',
  },
});
