import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { useCoursesStore } from '@/store/courses-store';
import Card from '@/components/Card';
import Button from '@/components/Button';
import { 
  Play, 
  FileText, 
  File, 
  CheckCircle, 
  ChevronDown, 
  ChevronUp,
  Clock,
  BarChart
} from 'lucide-react-native';

export default function CourseDetailScreen() {
  const { id } = useLocalSearchParams();
  const { getCourseById, markCourseAsCompleted, isCourseCompleted } = useCoursesStore();
  const [expandedContent, setExpandedContent] = useState<string | null>(null);
  
  const course = getCourseById(id as string);
  const completed = course ? isCourseCompleted(course.id) : false;
  
  if (!course) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Course not found</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  const toggleContentExpand = (contentId: string) => {
    if (expandedContent === contentId) {
      setExpandedContent(null);
    } else {
      setExpandedContent(contentId);
    }
  };
  
  const handleMarkAsCompleted = () => {
    markCourseAsCompleted(course.id);
  };
  
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
  
  const getContentIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Play size={20} color={Colors.accent.default} />;
      case 'pdf':
        return <FileText size={20} color={Colors.accent.default} />;
      case 'text':
        return <File size={20} color={Colors.accent.default} />;
      default:
        return <File size={20} color={Colors.accent.default} />;
    }
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['right', 'left', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: course.thumbnail }} 
            style={styles.image}
            resizeMode="cover"
          />
          {completed && (
            <View style={styles.completedBadge}>
              <CheckCircle size={20} color={Colors.white} />
              <Text style={styles.completedText}>Completed</Text>
            </View>
          )}
        </View>
        
        <View style={styles.headerContainer}>
          <Text style={styles.title}>{course.title}</Text>
          
          <View style={styles.metaContainer}>
            <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor() }]}>
              <Text style={styles.difficultyText}>
                {course.difficulty.charAt(0).toUpperCase() + course.difficulty.slice(1)}
              </Text>
            </View>
            <Text style={styles.category}>
              {course.category.charAt(0).toUpperCase() + course.category.slice(1)}
            </Text>
          </View>
          
          <Text style={styles.description}>{course.description}</Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <BarChart size={16} color={Colors.accent.default} />
              <Text style={styles.statText}>{course.difficulty.charAt(0).toUpperCase() + course.difficulty.slice(1)}</Text>
            </View>
            <View style={styles.statItem}>
              <Clock size={16} color={Colors.accent.default} />
              <Text style={styles.statText}>
                {course.content.reduce((total, item) => total + (item.duration || 0), 0)} min
              </Text>
            </View>
          </View>
        </View>
        
        <View style={styles.contentSection}>
          <Text style={styles.sectionTitle}>Course Content</Text>
          
          {course.content.map((content, index) => (
            <Card 
              key={content.id} 
              variant="outlined" 
              style={[
                styles.contentCard,
                expandedContent === content.id && styles.expandedCard
              ]}
            >
              <TouchableOpacity 
                style={styles.contentHeader}
                onPress={() => toggleContentExpand(content.id)}
              >
                <View style={styles.contentTitleContainer}>
                  <View style={styles.contentIconContainer}>
                    {getContentIcon(content.type)}
                  </View>
                  <View style={styles.contentInfo}>
                    <Text style={styles.contentTitle}>{content.title}</Text>
                    <Text style={styles.contentType}>
                      {content.type.charAt(0).toUpperCase() + content.type.slice(1)}
                      {content.duration && ` • ${content.duration} min`}
                    </Text>
                  </View>
                </View>
                {expandedContent === content.id ? (
                  <ChevronUp size={20} color={Colors.neutral.textDark} />
                ) : (
                  <ChevronDown size={20} color={Colors.neutral.textDark} />
                )}
              </TouchableOpacity>
              
              {expandedContent === content.id && (
                <View style={styles.contentDetails}>
                  {content.type === 'text' && content.content && (
                    <Text style={styles.textContent}>{content.content}</Text>
                  )}
                  
                  {content.type === 'video' && (
                    <View style={styles.videoPlaceholder}>
                      <Play size={32} color={Colors.white} />
                      <Text style={styles.videoPlaceholderText}>Video Preview</Text>
                    </View>
                  )}
                  
                  {content.type === 'pdf' && (
                    <Button
                      title="View PDF"
                      onPress={() => {}}
                      variant="outline"
                      style={styles.pdfButton}
                    />
                  )}
                </View>
              )}
            </Card>
          ))}
        </View>
      </ScrollView>
      
      {!completed && (
        <View style={styles.footer}>
          <Button
            title="Mark as Completed"
            onPress={handleMarkAsCompleted}
            variant="primary"
            fullWidth
          />
        </View>
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
    paddingBottom: 80,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 18,
    color: Colors.neutral.textDark,
  },
  imageContainer: {
    position: 'relative',
    height: 200,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  completedBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: Colors.success,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  completedText: {
    color: Colors.white,
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 4,
  },
  headerContainer: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary.background,
    marginBottom: 12,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
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
    fontSize: 16,
    color: Colors.primary.background,
    marginBottom: 16,
    lineHeight: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statText: {
    fontSize: 14,
    color: Colors.neutral.textDark,
    marginLeft: 6,
  },
  contentSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary.background,
    marginBottom: 16,
  },
  contentCard: {
    marginBottom: 12,
    padding: 0,
    overflow: 'hidden',
  },
  expandedCard: {
    borderColor: Colors.accent.light,
  },
  contentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  contentTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  contentIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.accent.light + '20', // 20% opacity
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  contentInfo: {
    flex: 1,
  },
  contentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary.background,
    marginBottom: 4,
  },
  contentType: {
    fontSize: 12,
    color: Colors.neutral.textDark,
  },
  contentDetails: {
    padding: 16,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  textContent: {
    fontSize: 14,
    color: Colors.primary.background,
    lineHeight: 22,
  },
  videoPlaceholder: {
    height: 180,
    backgroundColor: Colors.primary.background,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoPlaceholderText: {
    color: Colors.white,
    marginTop: 8,
    fontSize: 14,
  },
  pdfButton: {
    marginTop: 8,
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