import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Course, CourseContent } from '@/types';
import { mockCourses } from '@/mocks/courses';

interface CoursesState {
  courses: Course[];
  completedCourseIds: string[];
  isLoading: boolean;
  error: string | null;
  initializeCourses: () => void;
  markCourseAsCompleted: (courseId: string) => void;
  getCoursesByCategory: (category: string) => Course[];
  getCourseById: (id: string) => Course | undefined;
  isCourseCompleted: (courseId: string) => boolean;
  addCourse: (course: Omit<Course, 'id'>) => void;
}

export const useCoursesStore = create<CoursesState>()(
  persist(
    (set, get) => ({
      courses: [],
      completedCourseIds: [],
      isLoading: false,
      error: null,
      initializeCourses: () => {
        // Only initialize if courses are empty
        if (get().courses.length === 0) {
          set({ courses: mockCourses });
        }
      },
      markCourseAsCompleted: (courseId) => {
        set((state) => {
          if (state.completedCourseIds.includes(courseId)) {
            return state;
          }
          return {
            completedCourseIds: [...state.completedCourseIds, courseId]
          };
        });
      },
      getCoursesByCategory: (category) => {
        return get().courses.filter(course => course.category === category);
      },
      getCourseById: (id) => {
        return get().courses.find(course => course.id === id);
      },
      isCourseCompleted: (courseId) => {
        return get().completedCourseIds.includes(courseId);
      },
      addCourse: (courseData) => {
        const newCourse: Course = {
          ...courseData,
          id: `c${Date.now()}`,
          createdAt: new Date(),
        };
        
        set((state) => ({
          courses: [...state.courses, newCourse]
        }));
      }
    }),
    {
      name: 'courses-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);