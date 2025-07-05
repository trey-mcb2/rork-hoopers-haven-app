import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Switch, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import Colors from '@/constants/colors';
import { useNotificationsStore } from '@/store/notifications-store';
import Card from '@/components/Card';
import Button from '@/components/Button';
import { 
  Bell, 
  BellOff, 
  Clock, 
  Dumbbell, 
  Utensils, 
  Droplet, 
  Moon, 
  Target,
  Settings,
  AlertCircle
} from 'lucide-react-native';

type ReminderType = 'workoutReminder' | 'mealReminder' | 'waterReminder' | 'sleepReminder' | 'shotsReminder';

interface ReminderConfig {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

const reminderConfigs: Record<ReminderType, ReminderConfig> = {
  workoutReminder: {
    icon: <Dumbbell size={24} color={Colors.accent.default} />,
    title: 'Workout Reminder',
    description: 'Get reminded to log your basketball training sessions',
    color: Colors.accent.default,
  },
  mealReminder: {
    icon: <Utensils size={24} color={Colors.success} />,
    title: 'Meal Reminder',
    description: 'Stay on top of your nutrition tracking',
    color: Colors.success,
  },
  waterReminder: {
    icon: <Droplet size={24} color={Colors.accent.light} />,
    title: 'Water Reminder',
    description: 'Remember to stay hydrated throughout the day',
    color: Colors.accent.light,
  },
  sleepReminder: {
    icon: <Moon size={24} color={Colors.primary.light} />,
    title: 'Sleep Reminder',
    description: 'Get reminded to track your sleep for better recovery',
    color: Colors.primary.light,
  },
  shotsReminder: {
    icon: <Target size={24} color={Colors.warning} />,
    title: 'Shooting Practice',
    description: 'Never miss your daily shooting practice',
    color: Colors.warning,
  },
};

export default function NotificationSettingsScreen() {
  const router = useRouter();
  const { 
    settings, 
    permission, 
    isLoading,
    updateReminderSettings, 
    requestPermissions,
    scheduleAllNotifications,
    cancelAllNotifications
  } = useNotificationsStore();
  
  const [showTimePicker, setShowTimePicker] = useState<ReminderType | null>(null);

  const handlePermissionRequest = async () => {
    const granted = await requestPermissions();
    if (granted) {
      Alert.alert(
        'Notifications Enabled',
        'You can now receive daily reminders to help you stay on track with your basketball training goals.',
        [{ text: 'OK' }]
      );
      await scheduleAllNotifications();
    } else {
      Alert.alert(
        'Notifications Disabled',
        'To receive reminders, please enable notifications in your device settings.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleToggleReminder = async (type: ReminderType, enabled: boolean) => {
    updateReminderSettings(type, { enabled });
    
    if (enabled && permission?.granted) {
      Alert.alert(
        'Reminder Enabled',
        `You'll now receive daily ${reminderConfigs[type].title.toLowerCase()} notifications.`,
        [{ text: 'OK' }]
      );
    }
  };

  const handleTimeChange = (type: ReminderType, event: any, selectedTime?: Date) => {
    setShowTimePicker(null);
    
    if (selectedTime && event.type === 'set') {
      const timeString = selectedTime.toTimeString().slice(0, 5); // HH:MM format
      updateReminderSettings(type, { time: timeString });
    }
  };

  const parseTime = (timeString: string): Date => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  const formatTime = (timeString: string): string => {
    const date = parseTime(timeString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderReminderCard = (type: ReminderType) => {
    const config = reminderConfigs[type];
    const reminderSettings = settings[type];
    const canToggle = permission?.granted || !reminderSettings.enabled;

    return (
      <Card key={type} variant="outlined" style={styles.reminderCard}>
        <View style={styles.reminderHeader}>
          <View style={styles.reminderInfo}>
            {config.icon}
            <View style={styles.reminderText}>
              <Text style={styles.reminderTitle}>{config.title}</Text>
              <Text style={styles.reminderDescription}>{config.description}</Text>
            </View>
          </View>
          <Switch
            value={reminderSettings.enabled}
            onValueChange={(enabled) => handleToggleReminder(type, enabled)}
            trackColor={{ false: Colors.light.border, true: config.color + '40' }}
            thumbColor={reminderSettings.enabled ? config.color : Colors.neutral.textDark}
            disabled={!canToggle}
          />
        </View>
        
        {reminderSettings.enabled && (
          <View style={styles.reminderDetails}>
            <TouchableOpacity 
              style={styles.timeSelector}
              onPress={() => setShowTimePicker(type)}
              disabled={Platform.OS === 'web'}
            >
              <Clock size={16} color={Colors.accent.default} />
              <Text style={styles.timeText}>
                {formatTime(reminderSettings.time)}
              </Text>
            </TouchableOpacity>
            
            <View style={styles.reminderPreview}>
              <Text style={styles.previewTitle}>{reminderSettings.title}</Text>
              <Text style={styles.previewBody}>{reminderSettings.body}</Text>
            </View>
          </View>
        )}
        
        {showTimePicker === type && Platform.OS !== 'web' && (
          <DateTimePicker
            value={parseTime(reminderSettings.time)}
            mode="time"
            is24Hour={true}
            display="default"
            onChange={(event, time) => handleTimeChange(type, event, time)}
          />
        )}
      </Card>
    );
  };

  if (Platform.OS === 'web') {
    return (
      <SafeAreaView style={styles.container} edges={['right', 'left']}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Card variant="outlined" style={styles.webNoticeCard}>
            <View style={styles.webNoticeHeader}>
              <AlertCircle size={24} color={Colors.warning} />
              <Text style={styles.webNoticeTitle}>Notifications Not Available</Text>
            </View>
            <Text style={styles.webNoticeText}>
              Push notifications are not supported in web browsers. To receive daily reminders, 
              please use the mobile app on your iOS or Android device.
            </Text>
          </Card>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['right', 'left']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Bell size={24} color={Colors.accent.default} />
          </View>
          <Text style={styles.headerTitle}>Daily Reminders</Text>
          <Text style={styles.headerSubtitle}>
            Stay consistent with your basketball training goals
          </Text>
        </View>

        {!permission?.granted && (
          <Card variant="elevated" style={styles.permissionCard}>
            <View style={styles.permissionHeader}>
              <BellOff size={24} color={Colors.warning} />
              <Text style={styles.permissionTitle}>Enable Notifications</Text>
            </View>
            <Text style={styles.permissionText}>
              To receive daily reminders, you need to allow notifications for this app.
            </Text>
            <Button
              title="Enable Notifications"
              onPress={handlePermissionRequest}
              variant="primary"
              style={styles.permissionButton}
              disabled={isLoading}
            />
          </Card>
        )}

        <View style={styles.remindersSection}>
          <Text style={styles.sectionTitle}>Reminder Settings</Text>
          {Object.keys(reminderConfigs).map((type) => 
            renderReminderCard(type as ReminderType)
          )}
        </View>

        {permission?.granted && (
          <View style={styles.actionsSection}>
            <Button
              title="Test All Notifications"
              onPress={scheduleAllNotifications}
              variant="outline"
              style={styles.actionButton}
              disabled={isLoading}
            />
            <Button
              title="Disable All Reminders"
              onPress={async () => {
                await cancelAllNotifications();
                Object.keys(reminderConfigs).forEach((type) => {
                  updateReminderSettings(type as ReminderType, { enabled: false });
                });
                Alert.alert('All Reminders Disabled', 'You will no longer receive daily reminders.');
              }}
              variant="outline"
              style={styles.actionButton}
              disabled={isLoading}
            />
          </View>
        )}

        <Card variant="outlined" style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Settings size={20} color={Colors.accent.default} />
            <Text style={styles.infoTitle}>How It Works</Text>
          </View>
          <Text style={styles.infoText}>
            • Reminders are sent daily at your chosen times{'\n'}
            • Notifications work even when the app is closed{'\n'}
            • You can customize the time for each reminder type{'\n'}
            • All reminders are stored locally on your device
          </Text>
        </Card>
      </ScrollView>
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
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  headerIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.accent.light + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary.background,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: Colors.neutral.textDark,
    textAlign: 'center',
  },
  permissionCard: {
    marginBottom: 24,
    padding: 16,
  },
  permissionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  permissionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.primary.background,
    marginLeft: 12,
  },
  permissionText: {
    fontSize: 14,
    color: Colors.neutral.textDark,
    marginBottom: 16,
    lineHeight: 20,
  },
  permissionButton: {
    marginTop: 8,
  },
  remindersSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary.background,
    marginBottom: 16,
  },
  reminderCard: {
    marginBottom: 16,
    padding: 16,
  },
  reminderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reminderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  reminderText: {
    marginLeft: 12,
    flex: 1,
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary.background,
    marginBottom: 4,
  },
  reminderDescription: {
    fontSize: 14,
    color: Colors.neutral.textDark,
  },
  reminderDetails: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  timeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  timeText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary.background,
    marginLeft: 8,
  },
  reminderPreview: {
    backgroundColor: Colors.accent.light + '10',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: Colors.accent.default,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary.background,
    marginBottom: 4,
  },
  previewBody: {
    fontSize: 12,
    color: Colors.neutral.textDark,
  },
  actionsSection: {
    marginBottom: 24,
  },
  actionButton: {
    marginBottom: 12,
  },
  infoCard: {
    padding: 16,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary.background,
    marginLeft: 8,
  },
  infoText: {
    fontSize: 14,
    color: Colors.neutral.textDark,
    lineHeight: 20,
  },
  webNoticeCard: {
    padding: 16,
    marginTop: 24,
  },
  webNoticeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  webNoticeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.primary.background,
    marginLeft: 12,
  },
  webNoticeText: {
    fontSize: 14,
    color: Colors.neutral.textDark,
    lineHeight: 20,
  },
});