import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Linking, Platform } from 'react-native';
import { Course } from '@/types';
import Colors from '@/constants/colors';
import { CheckCircle, Play, ExternalLink } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

interface CourseCardProps {
  course: Course;
  onPress: (course: Course) => void;
  completed?: boolean;
}

export const CourseCard: React.FC<CourseCardProps> = ({
  course,
  onPress,
  completed = false,
}) => {
  const [isPressed, setIsPressed] = useState(false);
  
  const getDifficultyColor = () => {
    switch (course.difficulty) {
      case 'beginner':
        return Colors.success;
      case 'intermediate':
        return Colors.warning;
      case 'advanced':
        return Colors.error;
      default:
        return Colors.neutral.textDark;
    }
  };

  const handlePress = async () => {
    // Check if this is the E-Book course
    if (course.title === "Hoopers Haven E-Book" && course.content && course.content.length > 0) {
      // Provide haptic feedback on devices that support it
      if (Platform.OS !== 'web') {
        await Haptics.selectionAsync();
      }
      
      // Get the PDF URL from the course content
      const pdfUrl = course.content[0].url;
      if (pdfUrl) {
        // Open the URL in the device's browser
        Linking.openURL(pdfUrl);
      }
    } else {
      // For other courses, use the normal onPress handler
      onPress(course);
    }
  };

  const handlePressIn = () => {
    setIsPressed(true);
  };

  const handlePressOut = () => {
    setIsPressed(false);
  };

  const isEbook = course.title === "Hoopers Haven E-Book";

  return (
    <TouchableOpacity 
      style={[
        styles.container,
        isPressed && styles.pressed
      ]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.9}
    >
      <View style={styles.card}>
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: course.thumbnail }} 
            style={styles.image}
            resizeMode="cover"
          />
          <View style={styles.overlay}>
            <View style={styles.playButton}>
              {isEbook ? (
                <ExternalLink size={24} color={Colors.white} />
              ) : (
                <Play size={24} color={Colors.white} />
              )}
            </View>
          </View>
          {completed && (
            <View style={styles.completedBadge}>
              <CheckCircle size={20} color={Colors.white} />
            </View>
          )}
          {isEbook && (
            <View style={styles.ebookBadge}>
              <Text style={styles.ebookText}>E-Book</Text>
            </View>
          )}
        </View>
        <View style={styles.contentContainer}>
          <Text style={styles.title}>{course.title}</Text>
          <View style={styles.metaContainer}>
            <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor() }]}>
              <Text style={styles.difficultyText}>
                {course.difficulty.charAt(0).toUpperCase() + course.difficulty.slice(1)}
              </Text>
            </View>
            <Text style={styles.category}>{course.category.charAt(0).toUpperCase() + course.category.slice(1)}</Text>
          </View>
          <Text style={styles.description} numberOfLines={2}>
            {course.description}
          </Text>
          <Text style={styles.contentCount}>
            {isEbook ? "Opens in browser" : `${course.content.length} ${course.content.length === 1 ? 'lesson' : 'lessons'}`}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
    transform: [{ scale: 1 }],
  },
  pressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  card: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
    height: 160,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: Colors.success,
    borderRadius: 12,
    padding: 4,
  },
  ebookBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: Colors.accent.default,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  ebookText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  contentContainer: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary.background,
    marginBottom: 8,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
  },
  difficultyText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '500',
  },
  category: {
    fontSize: 14,
    color: Colors.neutral.textDark,
  },
  description: {
    fontSize: 14,
    color: Colors.neutral.textDark,
    marginBottom: 8,
  },
  contentCount: {
    fontSize: 12,
    color: Colors.accent.default,
    fontWeight: '500',
  },
});

export default CourseCard;