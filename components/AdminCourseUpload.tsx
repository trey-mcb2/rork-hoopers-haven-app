import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Alert } from 'react-native';
import Colors from '@/constants/colors';
import { useCoursesStore } from '@/store/courses-store';
import { useUserStore } from '@/store/user-store';
import Card from '@/components/Card';
import Input from '@/components/Input';
import Button from '@/components/Button';
import { 
  Upload, 
  Youtube, 
  FileText, 
  Plus,
  ChevronDown,
  ChevronUp
} from 'lucide-react-native';
import { courseCategories } from '@/mocks/courses';

const DEFAULT_THUMBNAIL = 'https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=1000';

export const AdminCourseUpload: React.FC = () => {
  const { addCourse } = useCoursesStore();
  const { user } = useUserStore();
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('shooting');
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [contentType, setContentType] = useState<'video' | 'pdf'>('video');
  const [contentTitle, setContentTitle] = useState('');
  const [contentUrl, setContentUrl] = useState('');
  const [contentDuration, setContentDuration] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };
  
  const validateYoutubeUrl = (url: string) => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
    return youtubeRegex.test(url);
  };
  
  const validatePdfUrl = (url: string) => {
    const pdfRegex = /^(https?:\/\/)?.+\.pdf$/;
    return pdfRegex.test(url);
  };
  
  const handleSubmit = () => {
    // Validate required fields
    if (!title.trim() || !description.trim() || !contentTitle.trim() || !contentUrl.trim()) {
      Alert.alert('Missing Information', 'Please fill in all required fields');
      return;
    }
    
    // Validate URL based on content type
    if (contentType === 'video' && !validateYoutubeUrl(contentUrl)) {
      Alert.alert('Invalid URL', 'Please enter a valid YouTube URL');
      return;
    }
    
    if (contentType === 'pdf' && !validatePdfUrl(contentUrl)) {
      Alert.alert('Invalid URL', 'Please enter a valid PDF URL');
      return;
    }
    
    setIsSubmitting(true);
    
    const courseContent: any = {
      id: `content-${Date.now()}`,
      title: contentTitle,
      type: contentType,
      url: contentUrl,
    };
    
    if (contentType === 'video' && contentDuration) {
      courseContent.duration = parseInt(contentDuration);
    }
    
    const newCourse = {
      title,
      description,
      thumbnail: DEFAULT_THUMBNAIL, // Using default thumbnail for now
      category,
      difficulty,
      content: [courseContent],
      createdBy: user?.id || 'admin',
    };
    
    addCourse(newCourse);
    
    // Reset form
    setTitle('');
    setDescription('');
    setCategory('shooting');
    setDifficulty('beginner');
    setContentType('video');
    setContentTitle('');
    setContentUrl('');
    setContentDuration('');
    setIsSubmitting(false);
    
    Alert.alert('Success', 'Course added successfully');
  };
  
  if (!user?.isAdmin) {
    return null;
  }
  
  return (
    <Card variant="elevated" style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Upload size={20} color={Colors.accent.default} />
          <Text style={styles.headerTitle}>Admin Course Upload</Text>
        </View>
        <Button
          title={isExpanded ? "Hide" : "Show"}
          onPress={toggleExpand}
          variant="text"
          size="small"
          rightIcon={isExpanded ? <ChevronUp size={16} color={Colors.accent.default} /> : <ChevronDown size={16} color={Colors.accent.default} />}
        />
      </View>
      
      {isExpanded && (
        <View style={styles.formContainer}>
          <Input
            label="Course Title"
            placeholder="Enter course title"
            value={title}
            onChangeText={setTitle}
          />
          
          <Input
            label="Description"
            placeholder="Enter course description"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            style={styles.textArea}
          />
          
          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Category</Text>
              <View style={styles.pickerContainer}>
                {courseCategories.map(cat => (
                  <Button
                    key={cat.id}
                    title={cat.name}
                    onPress={() => setCategory(cat.id)}
                    variant={category === cat.id ? "primary" : "outline"}
                    size="small"
                    style={styles.pickerButton}
                  />
                ))}
              </View>
            </View>
            
            <View style={styles.halfInput}>
              <Text style={styles.label}>Difficulty</Text>
              <View style={styles.pickerContainer}>
                <Button
                  title="Beginner"
                  onPress={() => setDifficulty('beginner')}
                  variant={difficulty === 'beginner' ? "primary" : "outline"}
                  size="small"
                  style={styles.pickerButton}
                />
                <Button
                  title="Intermediate"
                  onPress={() => setDifficulty('intermediate')}
                  variant={difficulty === 'intermediate' ? "primary" : "outline"}
                  size="small"
                  style={styles.pickerButton}
                />
                <Button
                  title="Advanced"
                  onPress={() => setDifficulty('advanced')}
                  variant={difficulty === 'advanced' ? "primary" : "outline"}
                  size="small"
                  style={styles.pickerButton}
                />
              </View>
            </View>
          </View>
          
          <Text style={styles.sectionTitle}>Content</Text>
          
          <View style={styles.contentTypeContainer}>
            <Button
              title="YouTube Video"
              onPress={() => setContentType('video')}
              variant={contentType === 'video' ? "primary" : "outline"}
              size="small"
              leftIcon={<Youtube size={16} color={contentType === 'video' ? Colors.white : Colors.accent.default} />}
              style={styles.contentTypeButton}
            />
            <Button
              title="PDF Document"
              onPress={() => setContentType('pdf')}
              variant={contentType === 'pdf' ? "primary" : "outline"}
              size="small"
              leftIcon={<FileText size={16} color={contentType === 'pdf' ? Colors.white : Colors.accent.default} />}
              style={styles.contentTypeButton}
            />
          </View>
          
          <Input
            label="Content Title"
            placeholder="Enter content title"
            value={contentTitle}
            onChangeText={setContentTitle}
          />
          
          <Input
            label={contentType === 'video' ? "YouTube URL" : "PDF URL"}
            placeholder={contentType === 'video' ? "https://youtube.com/..." : "https://example.com/document.pdf"}
            value={contentUrl}
            onChangeText={setContentUrl}
          />
          
          {contentType === 'video' && (
            <Input
              label="Duration (minutes)"
              placeholder="e.g., 15"
              value={contentDuration}
              onChangeText={setContentDuration}
              keyboardType="numeric"
            />
          )}
          
          <Button
            title="Add Course"
            onPress={handleSubmit}
            variant="primary"
            loading={isSubmitting}
            style={styles.submitButton}
            leftIcon={<Plus size={18} color={Colors.white} />}
          />
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary.background,
    marginLeft: 8,
  },
  formContainer: {
    marginTop: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
    color: Colors.primary.background,
    fontWeight: '500',
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  pickerButton: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary.background,
    marginTop: 8,
    marginBottom: 12,
  },
  contentTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  contentTypeButton: {
    width: '48%',
  },
  submitButton: {
    marginTop: 16,
  },
});

export default AdminCourseUpload;