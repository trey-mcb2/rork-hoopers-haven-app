import React from 'react';
import { StyleSheet, Text, View, ScrollView, Image, Linking, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import { auth } from '@/config/firebase';
import Colors from '@/constants/colors';
import { useUserStore } from '@/store/user-store';
import { useNotificationsStore } from '@/store/notifications-store';
import Card from '@/components/Card';
import Button from '@/components/Button';
import { 
  User, 
  Calendar, 
  Target, 
  Dumbbell, 
  Utensils, 
  Award,
  ExternalLink,
  ChevronRight,
  Mail,
  Globe,
  Instagram,
  Youtube,
  Settings,
  Shield,
  Edit,
  Ruler,
  Weight,
  Bell,
  BellOff,
  LogOut
} from 'lucide-react-native';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, firebaseUser, toggleAdminMode, height, weight, logout } = useUserStore();
  const { permission, settings } = useNotificationsStore();
  
  const handleOpenWebsite = () => {
    Linking.openURL('https://hoopershaven.net');
  };
  
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleToggleAdmin = () => {
    toggleAdminMode();
    Alert.alert(
      'Admin Mode',
      user?.isAdmin ? 'Admin mode disabled' : 'Admin mode enabled',
      [{ text: 'OK' }]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut(auth);
              logout();
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          },
        },
      ]
    );
  };

  // Count enabled notifications
  const enabledNotifications = Object.values(settings).filter(setting => setting.enabled).length;
  
  return (
    <SafeAreaView style={styles.container} edges={['right', 'left']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileHeader}>
          <View style={styles.profileImageContainer}>
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=300' }} 
              style={styles.profileImage}
            />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              {firebaseUser?.displayName || user?.name || 'Basketball Player'}
            </Text>
            <Text style={styles.profileEmail}>
              {firebaseUser?.email || user?.email || 'player@hoopershaven.com'}
            </Text>
            <View style={styles.joinDateContainer}>
              <Calendar size={14} color={Colors.neutral.textDark} />
              <Text style={styles.joinDate}>
                Joined {user?.joinDate ? formatDate(user.joinDate) : 'Recently'}
              </Text>
            </View>
            {user?.isAdmin && (
              <View style={styles.adminBadge}>
                <Shield size={12} color={Colors.white} />
                <Text style={styles.adminText}>Admin</Text>
              </View>
            )}
          </View>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => router.push('/profile/edit')}
          >
            <Edit size={20} color={Colors.accent.default} />
          </TouchableOpacity>
        </View>
        
        {/* Height and Weight */}
        {(height.value || weight.value) && (
          <Card variant="outlined" style={styles.measurementsCard}>
            <View style={styles.measurementsContainer}>
              {height.value && (
                <View style={styles.measurement}>
                  <Ruler size={20} color={Colors.accent.default} />
                  <Text style={styles.measurementValue}>
                    {height.value} {height.unit}
                  </Text>
                </View>
              )}
              {weight.value && (
                <View style={styles.measurement}>
                  <Weight size={20} color={Colors.accent.default} />
                  <Text style={styles.measurementValue}>
                    {weight.value} {weight.unit}
                  </Text>
                </View>
              )}
            </View>
          </Card>
        )}

        {/* Notifications Status */}
        <Card variant="outlined" style={styles.notificationsCard}>
          <TouchableOpacity 
            style={styles.notificationsItem}
            onPress={() => router.push('/notifications/settings')}
          >
            <View style={styles.notificationsIcon}>
              {permission?.granted && enabledNotifications > 0 ? (
                <Bell size={20} color={Colors.accent.default} />
              ) : (
                <BellOff size={20} color={Colors.neutral.textDark} />
              )}
            </View>
            <View style={styles.notificationsContent}>
              <Text style={styles.notificationsTitle}>Daily Reminders</Text>
              <Text style={styles.notificationsDescription}>
                {permission?.granted 
                  ? enabledNotifications > 0 
                    ? `${enabledNotifications} reminder${enabledNotifications > 1 ? 's' : ''} active`
                    : 'No reminders set'
                  : 'Notifications disabled'
                }
              </Text>
            </View>
            <ChevronRight size={20} color={Colors.neutral.textDark} />
          </TouchableOpacity>
        </Card>
        
        <Card variant="elevated" style={styles.statsCard}>
          <Text style={styles.statsTitle}>Your Stats</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Target size={20} color={Colors.accent.default} />
              <Text style={styles.statValue}>{user?.stats?.totalShotsMade || 0}</Text>
              <Text style={styles.statLabel}>Shots Made</Text>
            </View>
            <View style={styles.statItem}>
              <Dumbbell size={20} color={Colors.accent.default} />
              <Text style={styles.statValue}>{user?.stats?.totalWorkouts || 0}</Text>
              <Text style={styles.statLabel}>Workouts</Text>
            </View>
            <View style={styles.statItem}>
              <Utensils size={20} color={Colors.accent.default} />
              <Text style={styles.statValue}>{user?.stats?.totalMealsTracked || 0}</Text>
              <Text style={styles.statLabel}>Meals</Text>
            </View>
            <View style={styles.statItem}>
              <Award size={20} color={Colors.accent.default} />
              <Text style={styles.statValue}>{user?.stats?.badgesEarned || 0}</Text>
              <Text style={styles.statLabel}>Badges</Text>
            </View>
          </View>
        </Card>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resources</Text>
          <Card variant="outlined" style={styles.resourceCard}>
            <TouchableOpacity 
              style={styles.resourceItem}
              onPress={handleOpenWebsite}
            >
              <View style={styles.resourceIcon}>
                <Globe size={20} color={Colors.accent.default} />
              </View>
              <View style={styles.resourceContent}>
                <Text style={styles.resourceTitle}>Hoopers Haven Website</Text>
                <Text style={styles.resourceDescription}>
                  hoopershaven.net
                </Text>
              </View>
              <ChevronRight size={20} color={Colors.neutral.textDark} />
            </TouchableOpacity>
            
            <View style={styles.divider} />
            
            <TouchableOpacity 
              style={styles.resourceItem}
              onPress={() => Linking.openURL('https://instagram.com/Trey_mcb22')}
            >
              <View style={styles.resourceIcon}>
                <Instagram size={20} color={Colors.accent.default} />
              </View>
              <View style={styles.resourceContent}>
                <Text style={styles.resourceTitle}>Follow on Instagram</Text>
                <Text style={styles.resourceDescription}>
                  @Trey_mcb22
                </Text>
              </View>
              <ChevronRight size={20} color={Colors.neutral.textDark} />
            </TouchableOpacity>
            
            <View style={styles.divider} />
            
            <TouchableOpacity 
              style={styles.resourceItem}
              onPress={() => Linking.openURL('https://youtube.com/@Hoopers_Haven2')}
            >
              <View style={styles.resourceIcon}>
                <Youtube size={20} color={Colors.accent.default} />
              </View>
              <View style={styles.resourceContent}>
                <Text style={styles.resourceTitle}>YouTube Channel</Text>
                <Text style={styles.resourceDescription}>
                  @Hoopers_Haven2
                </Text>
              </View>
              <ChevronRight size={20} color={Colors.neutral.textDark} />
            </TouchableOpacity>
          </Card>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <Card variant="outlined" style={styles.supportCard}>
            <TouchableOpacity 
              style={styles.supportItem}
              onPress={() => Linking.openURL('mailto:support@hoopershaven.com')}
            >
              <Mail size={20} color={Colors.accent.default} />
              <Text style={styles.supportText}>Contact Support</Text>
            </TouchableOpacity>
            
            <View style={styles.divider} />
            
            <TouchableOpacity 
              style={styles.supportItem}
              onPress={handleToggleAdmin}
            >
              <Settings size={20} color={Colors.accent.default} />
              <Text style={styles.supportText}>
                {user?.isAdmin ? 'Disable Admin Mode' : 'Enable Admin Mode'}
              </Text>
            </TouchableOpacity>
            
            <View style={styles.divider} />
            
            <TouchableOpacity 
              style={styles.supportItem}
              onPress={handleLogout}
            >
              <LogOut size={20} color={Colors.accent.default} />
              <Text style={styles.supportText}>Sign Out</Text>
            </TouchableOpacity>
          </Card>
        </View>
        
        <View style={styles.appInfo}>
          <Text style={styles.appVersion}>Hoopers Haven v1.0.1</Text>
          <Text style={styles.copyright}>© 2023 Hoopers Haven. All rights reserved.</Text>
        </View>
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
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  profileImageContainer: {
    marginRight: 16,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: Colors.accent.default,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary.background,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: Colors.neutral.textDark,
    marginBottom: 8,
  },
  joinDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  joinDate: {
    fontSize: 12,
    color: Colors.neutral.textDark,
    marginLeft: 4,
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accent.default,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  adminText: {
    fontSize: 12,
    color: Colors.white,
    fontWeight: '600',
    marginLeft: 4,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  measurementsCard: {
    marginBottom: 16,
    padding: 12,
  },
  measurementsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  measurement: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  measurementValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary.background,
    marginLeft: 8,
  },
  notificationsCard: {
    marginBottom: 16,
    padding: 0,
    overflow: 'hidden',
  },
  notificationsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  notificationsIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.accent.light + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  notificationsContent: {
    flex: 1,
  },
  notificationsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary.background,
    marginBottom: 4,
  },
  notificationsDescription: {
    fontSize: 14,
    color: Colors.neutral.textDark,
  },
  statsCard: {
    padding: 16,
    marginBottom: 24,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary.background,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary.background,
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.neutral.textDark,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary.background,
    marginBottom: 12,
  },
  resourceCard: {
    padding: 0,
    overflow: 'hidden',
  },
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  resourceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.accent.light + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  resourceContent: {
    flex: 1,
  },
  resourceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary.background,
    marginBottom: 4,
  },
  resourceDescription: {
    fontSize: 14,
    color: Colors.neutral.textDark,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.light.border,
    marginHorizontal: 16,
  },
  supportCard: {
    padding: 0,
    overflow: 'hidden',
  },
  supportItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  supportText: {
    fontSize: 16,
    color: Colors.primary.background,
    marginLeft: 12,
  },
  appInfo: {
    alignItems: 'center',
    marginVertical: 24,
  },
  appVersion: {
    fontSize: 14,
    color: Colors.neutral.textDark,
    marginBottom: 4,
  },
  copyright: {
    fontSize: 12,
    color: Colors.neutral.textDark,
  },
});