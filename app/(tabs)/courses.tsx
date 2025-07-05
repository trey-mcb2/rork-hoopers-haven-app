import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, FlatList, Linking, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Colors from '@/constants/colors';
import { useCoursesStore } from '@/store/courses-store';
import { useUserStore } from '@/store/user-store';
import { courseCategories } from '@/mocks/courses';
import CourseCard from '@/components/CourseCard';
import AdminCourseUpload from '@/components/AdminCourseUpload';
import { Search } from 'lucide-react-native';
import Input from '@/components/Input';
import * as Haptics from 'expo-haptics';

export default function CoursesScreen() {
  const router = useRouter();
  const { courses, getCoursesByCategory, isCourseCompleted } = useCoursesStore();
  const { user } = useUserStore();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredCourses = courses.filter(course => {
    const matchesCategory = activeCategory === 'all' || course.category === activeCategory;
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         course.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });
  
  // Sort courses with newest first if they have createdAt
  const sortedCourses = [...filteredCourses].sort((a, b) => {
    if (a.createdAt && b.createdAt) {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (a.createdAt) return -1;
    if (b.createdAt) return 1;
    return 0;
  });
  
  const handleCoursePress = async (course) => {
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
        return;
      }
    }
    
    // For other courses, navigate to the course detail screen
    router.push(`/course/${course.id}`);
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['right', 'left']}>
      <View style={styles.header}>
        <Text style={styles.title}>Basketball Courses</Text>
        <Input
          placeholder="Search courses..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          leftIcon={<Search size={20} color={Colors.neutral.textDark} />}
          containerStyle={styles.searchContainer}
        />
      </View>
      
      {user?.isAdmin && <AdminCourseUpload />}
      
      {/* Fixed category scroll section with improved spacing */}
      <View style={styles.categoriesWrapper}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          <TouchableOpacity
            style={[
              styles.categoryButton,
              activeCategory === 'all' && styles.activeCategoryButton
            ]}
            onPress={() => setActiveCategory('all')}
          >
            <Text 
              style={[
                styles.categoryText,
                activeCategory === 'all' && styles.activeCategoryText
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
          
          {courseCategories.map(category => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                activeCategory === category.id && styles.activeCategoryButton
              ]}
              onPress={() => setActiveCategory(category.id)}
            >
              <Text 
                style={[
                  styles.categoryText,
                  activeCategory === category.id && styles.activeCategoryText
                ]}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      
      <FlatList
        data={sortedCourses}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.coursesContainer}
        renderItem={({ item }) => (
          <CourseCard
            course={item}
            onPress={handleCoursePress}
            completed={isCourseCompleted(item.id)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {searchQuery 
                ? "No courses match your search" 
                : "No courses available in this category"}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    padding: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary.background,
    marginBottom: 16,
  },
  searchContainer: {
    marginBottom: 8,
  },
  // New wrapper to ensure proper spacing and visibility
  categoriesWrapper: {
    paddingVertical: 12,
    backgroundColor: Colors.light.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
    marginBottom: 8,
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    paddingVertical: 4, // Added vertical padding
    minHeight: 44, // Ensure minimum height for buttons
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 10, // Increased vertical padding
    borderRadius: 20,
    marginRight: 12, // Increased spacing between buttons
    backgroundColor: Colors.light.card,
    // Add shadow for better visibility
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  activeCategoryButton: {
    backgroundColor: Colors.accent.default,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500', // Added medium weight for better readability
    color: Colors.primary.background,
  },
  activeCategoryText: {
    color: Colors.white,
    fontWeight: '600',
  },
  coursesContainer: {
    padding: 16,
    paddingTop: 8, // Reduced top padding since we have the category wrapper
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: Colors.neutral.textDark,
    textAlign: 'center',
  },
});