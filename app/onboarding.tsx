import React, { useState } from 'react';
import { StyleSheet, Text, View, Image, Dimensions, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import Colors from '@/constants/colors';
import Button from '@/components/Button';
import { ChevronRight, ChevronLeft } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    title: 'Welcome to Hoopers Haven',
    description: 'Your all-in-one basketball training companion to help you improve your game, track your progress, and stay motivated.',
    image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=1000',
  },
  {
    id: '2',
    title: 'Track Your Progress',
    description: 'Log your workouts, shooting sessions, meals, water intake, and sleep to see your improvement over time.',
    image: 'https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?q=80&w=1000',
  },
  {
    id: '3',
    title: 'Learn from Experts',
    description: 'Access training courses and resources to improve your basketball skills, from shooting form to advanced moves.',
    image: 'https://images.unsplash.com/photo-1504450758481-7338eba7524a?q=80&w=1000',
  },
  {
    id: '4',
    title: 'Stay Motivated',
    description: 'Set goals, earn badges, and maintain streaks to keep your training consistent and effective.',
    image: 'https://images.unsplash.com/photo-1519861531473-9200262188bf?q=80&w=1000',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  
  const handleNext = () => {
    if (currentSlideIndex < slides.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1);
    } else {
      handleFinish();
    }
  };
  
  const handlePrevious = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1);
    }
  };
  
  const handleFinish = async () => {
    try {
      await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error saving onboarding status:', error);
      router.replace('/(tabs)');
    }
  };
  
  const handleSkip = () => {
    handleFinish();
  };
  
  const currentSlide = slides[currentSlideIndex];
  
  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: currentSlide.image }} 
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.overlay} />
      </View>
      
      <View style={styles.contentContainer}>
        <View style={styles.pagination}>
          {slides.map((_, index) => (
            <View 
              key={index} 
              style={[
                styles.paginationDot,
                index === currentSlideIndex && styles.activePaginationDot
              ]} 
            />
          ))}
        </View>
        
        <Text style={styles.title}>{currentSlide.title}</Text>
        <Text style={styles.description}>{currentSlide.description}</Text>
        
        <View style={styles.buttonsContainer}>
          {currentSlideIndex > 0 ? (
            <TouchableOpacity 
              style={styles.navButton}
              onPress={handlePrevious}
            >
              <ChevronLeft size={24} color={Colors.white} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={styles.skipButton}
              onPress={handleSkip}
            >
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
          )}
          
          <Button
            title={currentSlideIndex === slides.length - 1 ? "Get Started" : "Next"}
            onPress={handleNext}
            variant="primary"
            style={styles.nextButton}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary.background,
  },
  imageContainer: {
    height: height * 0.6,
    width: width,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  contentContainer: {
    flex: 1,
    padding: 24,
    backgroundColor: Colors.primary.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.neutral.text,
    marginHorizontal: 4,
  },
  activePaginationDot: {
    backgroundColor: Colors.accent.default,
    width: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: Colors.neutral.text,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipButton: {
    padding: 12,
  },
  skipText: {
    color: Colors.neutral.text,
    fontSize: 16,
  },
  nextButton: {
    paddingHorizontal: 32,
  },
});