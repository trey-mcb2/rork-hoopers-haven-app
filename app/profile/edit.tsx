import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { updateProfile } from 'firebase/auth';
import { auth } from '@/config/firebase';
import Colors from '@/constants/colors';
import { useUserStore } from '@/store/user-store';
import Input from '@/components/Input';
import Button from '@/components/Button';
import { User, Save, ArrowLeft } from 'lucide-react-native';

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, firebaseUser, height, weight, setHeight, setWeight, convertHeight, convertWeight } = useUserStore();
  
  const [name, setName] = useState(firebaseUser?.displayName || user?.name || '');
  const [email, setEmail] = useState(firebaseUser?.email || user?.email || '');
  const [heightValue, setHeightValue] = useState(height.value?.toString() || '');
  const [weightValue, setWeightValue] = useState(weight.value?.toString() || '');
  const [useMetric, setUseMetric] = useState(height.unit === 'cm' && weight.unit === 'kg');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Update height/weight units when metric toggle changes
  useEffect(() => {
    if (useMetric) {
      if (height.unit !== 'cm') convertHeight('cm');
      if (weight.unit !== 'kg') convertWeight('kg');
    } else {
      if (height.unit !== 'in') convertHeight('in');
      if (weight.unit !== 'lbs') convertWeight('lbs');
    }
    
    // Update displayed values after conversion
    setHeightValue(height.value?.toString() || '');
    setWeightValue(weight.value?.toString() || '');
  }, [useMetric, convertHeight, convertWeight, height.unit, weight.unit]);
  
  const handleToggleMetric = () => {
    setUseMetric(!useMetric);
  };
  
  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Update Firebase profile if name changed
      if (firebaseUser && name !== firebaseUser.displayName) {
        await updateProfile(firebaseUser, {
          displayName: name,
        });
      }
      
      // Update height and weight
      if (heightValue) {
        setHeight(parseFloat(heightValue), useMetric ? 'cm' : 'in');
      }
      
      if (weightValue) {
        setWeight(parseFloat(weightValue), useMetric ? 'kg' : 'lbs');
      }
      
      Alert.alert('Success', 'Profile updated successfully');
      router.back();
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['right', 'left', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={Colors.primary.background} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileIconContainer}>
          <User size={64} color={Colors.accent.default} />
        </View>
        
        <View style={styles.form}>
          <Input
            label="Name"
            placeholder="Your name"
            value={name}
            onChangeText={setName}
          />
          
          <Input
            label="Email"
            placeholder="Your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            editable={false}
            style={styles.disabledInput}
          />
          <Text style={styles.emailNote}>
            Email cannot be changed. Contact support if you need to update your email.
          </Text>
          
          <View style={styles.unitsToggleContainer}>
            <Text style={styles.unitsLabel}>Units</Text>
            <View style={styles.unitsToggle}>
              <Text style={[
                styles.unitText,
                !useMetric && styles.activeUnitText
              ]}>
                Imperial (in/lbs)
              </Text>
              <Switch
                value={useMetric}
                onValueChange={handleToggleMetric}
                trackColor={{ false: Colors.light.border, true: Colors.accent.light }}
                thumbColor={useMetric ? Colors.accent.default : Colors.neutral.textDark}
              />
              <Text style={[
                styles.unitText,
                useMetric && styles.activeUnitText
              ]}>
                Metric (cm/kg)
              </Text>
            </View>
          </View>
          
          <View style={styles.measurementsContainer}>
            <Input
              label={`Height (${useMetric ? 'cm' : 'in'})`}
              placeholder={useMetric ? "e.g., 180" : "e.g., 71"}
              value={heightValue}
              onChangeText={setHeightValue}
              keyboardType="numeric"
              containerStyle={styles.halfInput}
            />
            
            <Input
              label={`Weight (${useMetric ? 'kg' : 'lbs'})`}
              placeholder={useMetric ? "e.g., 75" : "e.g., 165"}
              value={weightValue}
              onChangeText={setWeightValue}
              keyboardType="numeric"
              containerStyle={styles.halfInput}
            />
          </View>
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <Button
          title="Save Changes"
          onPress={handleSubmit}
          variant="primary"
          loading={isSubmitting}
          fullWidth
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
    backgroundColor: Colors.white,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary.background,
  },
  placeholder: {
    width: 32,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  profileIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.accent.light + '20',
    alignSelf: 'center',
    marginBottom: 24,
  },
  form: {
    marginBottom: 24,
  },
  disabledInput: {
    opacity: 0.6,
  },
  emailNote: {
    fontSize: 12,
    color: Colors.neutral.textDark,
    marginTop: -12,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  unitsToggleContainer: {
    marginBottom: 16,
  },
  unitsLabel: {
    fontSize: 14,
    marginBottom: 6,
    color: Colors.primary.background,
    fontWeight: '500',
  },
  unitsToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.light.card,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  unitText: {
    fontSize: 14,
    color: Colors.neutral.textDark,
  },
  activeUnitText: {
    color: Colors.accent.default,
    fontWeight: '600',
  },
  measurementsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
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
  },
});