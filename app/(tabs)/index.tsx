import { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert, Image, SafeAreaView, Linking, TextInput, ScrollView, Modal, BackHandler, KeyboardAvoidingView, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, Question, TimeSegment } from '../../services/api';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { MaterialIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { uniqueCodeService } from '../../services/uniqueCode';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

interface FlashbackResponse {
  created_at: string;
  device_id: string;
  flashback_number: number;
}

// Update TimeSegment component
const TimeSegmentComponent = ({ name, time, isCompleted }: { 
  name: string, 
  time: string, 
  isCompleted: boolean 
}) => {
  // Determine icon based on time
  const getIcon = (time: string) => {
    const hour = parseInt(time.split(':')[0]);
    if (hour >= 6 && hour < 12) return 'wb-sunny';
    if (hour >= 12 && hour < 18) return 'brightness-high';
    return 'nights-stay';
  };

  return (
    <View style={styles.timeSegment}>
      <MaterialIcons name={getIcon(time)} size={24} color="#FFFFFF" />
      <Text style={styles.periodText}>{name}</Text>
      <Text style={styles.timeText}>{time}</Text>
      {isCompleted ? (
        <MaterialIcons name="check-circle" size={24} color="#4CAF50" />
      ) : (
        <View style={styles.emptyCheck} />
      )}
    </View>
  );
};

export default function HomeScreen() {
  const [selectedNumbers, setSelectedNumbers] = useState<{ [key: number]: string }>({});
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
  const [isNotificationResponse, setIsNotificationResponse] = useState(false);
  const [uniqueCode, setUniqueCode] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasConsented, setHasConsented] = useState(false);
  const [hasSubmittedToday, setHasSubmittedToday] = useState(false);
  const [hasAccessCode, setHasAccessCode] = useState(false);
  const [accessCode, setAccessCode] = useState(['', '', '', '']);
  const [accessCodeError, setAccessCodeError] = useState(false);
  const { notification } = useLocalSearchParams();
  const router = useRouter();
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [isPrivacyPolicyVisible, setIsPrivacyPolicyVisible] = useState(false);
  const inputRefs = useRef<Array<TextInput | null>>([]);
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);
  const [timeSegments, setTimeSegments] = useState<TimeSegment[]>([]);
  const [segmentStatus, setSegmentStatus] = useState<{ [key: number]: boolean }>({});
  const [hasOnboarded, setHasOnboarded] = useState(false);
  const [userUniqueCode, setUserUniqueCode] = useState('');
  const [userUniqueCodeError, setUserUniqueCodeError] = useState('');

  const CORRECT_ACCESS_CODE = '2345'; // Changed from 1234 to 2345

  // Function to check if user has a unique code
  const checkUniqueCode = async () => {
    try {
      const code = await uniqueCodeService.getUniqueCode();
      if (code) {
        setUniqueCode(code);
        setHasAccessCode(true);
      }
    } catch (error) {
      console.error('Error checking unique code:', error);
    } finally {
      setIsCheckingAccess(false);
    }
  };

  // Update handleAccessCodeSubmit to only check the hardcoded value
  const handleAccessCodeSubmit = async () => {
    const enteredCode = accessCode.join('');
    if (enteredCode === CORRECT_ACCESS_CODE) {
      setHasAccessCode(true);
      setAccessCodeError(false);
    } else {
      setAccessCodeError(true);
      Alert.alert(
        'Access Denied',
        'You must be part of the participation team to use this application. This app will now close.',
        [{ text: 'OK', onPress: () => {
          setTimeout(() => {
            BackHandler.exitApp();
          }, 5000);
        }}]
      );
    }
  };

  // New handler for onboarding unique code
  const handleUserUniqueCodeSubmit = async () => {
    if (!userUniqueCode || userUniqueCode.length < 4) {
      setUserUniqueCodeError('Please enter a 4-digit code.');
      return;
    }
    try {
      const isAvailable = await api.checkUniqueCode(userUniqueCode);
      if (!isAvailable) {
        setUserUniqueCodeError('This code is already in use. Please choose another.');
        return;
      }
      await api.storeUniqueCode(userUniqueCode);
      await uniqueCodeService.storeUniqueCode(userUniqueCode);
      setUniqueCode(userUniqueCode);
      setHasOnboarded(true);
      setUserUniqueCodeError('');
    } catch (error) {
      setUserUniqueCodeError('Error saving code. Please try again.');
    }
  };

  const handleAccessCodeChange = (text: string, index: number) => {
    if (/^\d*$/.test(text) && text.length <= 1) {
      const newCode = [...accessCode];
      newCode[index] = text;
      setAccessCode(newCode);
      
      // Auto-focus next input
      if (text && index < 3) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handlePrivacyPolicy = () => {
    Linking.openURL('https://your-website.com/privacy-policy.html');
  };

  // Function to check if user has submitted for current time segment
  const checkRecentSubmission = async () => {
    if (!uniqueCode) return;

    try {
      const now = new Date();
      const currentHour = now.getHours();
      
      // Determine current time segment (morning, afternoon, evening)
      let segmentStart, segmentEnd;
      if (currentHour >= 6 && currentHour < 12) {
        // Morning segment (6am - 12pm)
        segmentStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 6, 0, 0);
        segmentEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0);
      } else if (currentHour >= 12 && currentHour < 18) {
        // Afternoon segment (12pm - 6pm)
        segmentStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0);
        segmentEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 18, 0, 0);
      } else {
        // Evening segment (6pm - 6am next day)
        segmentStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 18, 0, 0);
        segmentEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 6, 0, 0);
      }

      const data = await api.checkRecentSubmission(
        uniqueCode.toString(),
        segmentStart.toISOString(),
        segmentEnd.toISOString()
      );

      setHasSubmittedToday(!!data && data.length > 0);
    } catch (error) {
      console.error('Error checking recent submission:', error);
      // Default to showing the form if there's an error
      setHasSubmittedToday(false);
    }
  };

  // Add function to load time segments
  const loadTimeSegments = async () => {
    try {
      const segments = await api.getTimeSegments();
      setTimeSegments(segments.filter(segment => segment.is_active));
    } catch (error) {
      console.error('Error loading time segments:', error);
    }
  };

  // Update useEffect to load time segments
  useEffect(() => {
    if (uniqueCode) {
      loadTimeSegments();
    }
  }, [uniqueCode]);

  // Update checkSubmissionStatus to use dynamic segments
  const checkSubmissionStatus = async () => {
    if (!uniqueCode) return;

    try {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      const data = await api.checkSubmissionStatus(
        uniqueCode,
        today.toISOString()
      );

      // Create status object for each segment
      const status: { [key: number]: boolean } = {};
      
      // Sort segments by time to determine windows
      const sortedSegments = [...timeSegments].sort((a, b) => {
        const timeA = new Date(`2000-01-01T${a.time}`);
        const timeB = new Date(`2000-01-01T${b.time}`);
        return timeA.getTime() - timeB.getTime();
      });

      // Check each segment
      sortedSegments.forEach((segment, index) => {
        // Parse the segment time
        const [hours, minutes] = segment.time.split(':').map(Number);
        const segmentStart = new Date(today);
        segmentStart.setHours(hours, minutes, 0, 0);

        // Determine the end time (next segment's start time or end of day)
        let segmentEnd: Date;
        if (index < sortedSegments.length - 1) {
          const [nextHours, nextMinutes] = sortedSegments[index + 1].time.split(':').map(Number);
          segmentEnd = new Date(today);
          segmentEnd.setHours(nextHours, nextMinutes, 0, 0);
        } else {
          // For the last segment, use the first segment's time of the next day
          const [firstHours, firstMinutes] = sortedSegments[0].time.split(':').map(Number);
          segmentEnd = new Date(today);
          segmentEnd.setDate(segmentEnd.getDate() + 1);
          segmentEnd.setHours(firstHours, firstMinutes, 0, 0);
        }

        // Check if there's a submission within this segment's time window
        status[segment.id] = data?.some((response: FlashbackResponse) => {
          const responseTime = new Date(response.created_at);
          return responseTime >= segmentStart && responseTime < segmentEnd;
        }) || false;
      });

      setSegmentStatus(status);
    } catch (error) {
      console.error('Error checking submission status:', error);
    }
  };

  // Add function to load active questions
  const loadActiveQuestions = async () => {
    try {
      const activeQuestions = await api.getActiveQuestions();
      setQuestions(activeQuestions);
      // Initialize selected numbers with empty strings
      const initialNumbers = activeQuestions.reduce((acc, q) => {
        acc[q.id] = '';
        return acc;
      }, {} as { [key: number]: string });
      setSelectedNumbers(initialNumbers);
    } catch (error) {
      console.error('Error loading questions:', error);
      Alert.alert('Error', 'Failed to load questions. Please try again.');
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  // Update useEffect to load questions
  useEffect(() => {
    if (uniqueCode) {
      loadActiveQuestions();
    }
  }, [uniqueCode]);

  const handleNumberChange = (questionId: number, value: string) => {
    if (/^\d*$/.test(value)) {
      setSelectedNumbers(prev => ({
        ...prev,
        [questionId]: value
      }));
    }
  };

  // Update useEffect to check for unique code instead of device ID
  useEffect(() => {
    checkUniqueCode();

    // Set initial state based on URL params
    if (notification === 'true') {
      setIsNotificationResponse(true);
    }

    // Listen for notification responses
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;
      if (data && data.type === 'flashback_check') {
        setIsNotificationResponse(true);
      }
    });

    return () => {
      subscription.remove();
    };
  }, [notification]);

  // Check for recent submission when uniqueCode changes
  useEffect(() => {
    if (uniqueCode) {
      checkRecentSubmission();
    }
  }, [uniqueCode]);

  // Add to existing useEffect
  useEffect(() => {
    if (uniqueCode) {
      checkSubmissionStatus();
    }
  }, [uniqueCode]);

  // Update handleSubmit to refresh segment status after submission
  const handleSubmit = async () => {
    if (isSubmitting || !uniqueCode) return;
    setIsSubmitting(true);

    try {
      const responseData = {
        unique_code: uniqueCode,
        created_at: new Date().toISOString(),
        ...questions.reduce((acc, q) => {
          acc[`count_${q.id}`] = parseInt(selectedNumbers[q.id] || '0');
          return acc;
        }, {} as { [key: string]: number })
      };

      console.log('Attempting to submit response:', responseData);
      const result = await api.submitResponse(responseData);
      
      // Refresh the segment status after successful submission
      await checkSubmissionStatus();
      setHasSubmittedToday(true);
      Alert.alert('Success', 'Your responses have been recorded.');
      
      // Reset the form with empty strings
      const resetNumbers = questions.reduce((acc, q) => {
        acc[q.id] = '';
        return acc;
      }, {} as { [key: number]: string });
      setSelectedNumbers(resetNumbers);
    } catch (error) {
      console.error('Error submitting response:', error);
      Alert.alert(
        'Error',
        `Failed to submit response: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update handleDeleteData to clear all data
  const handleDeleteData = async () => {
    if (!uniqueCode) return;
    
    Alert.alert(
      'Confirm Deletion',
      'Are you sure you want to delete all your data? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Delete data from all sources
              await Promise.all([
                api.deleteData(uniqueCode),
                api.deleteUniqueCode(uniqueCode),
                uniqueCodeService.removeUniqueCode(),
                // Clear all notifications
                Notifications.cancelAllScheduledNotificationsAsync(),
                // Clear AsyncStorage
                AsyncStorage.clear()
              ]);

              // Reset all state
              setUniqueCode(null);
              setHasAccessCode(false);
              setHasSubmittedToday(false);
              setSegmentStatus({});
              setSelectedNumbers({});
              setQuestions([]);
              setTimeSegments([]);
              
              Alert.alert('Success', 'All your data has been deleted.');
            } catch (error) {
              console.error('Error deleting data:', error);
              Alert.alert('Error', 'Failed to delete data. Please try again.');
            }
          }
        }
      ]
    );
  };

  const handleConsent = () => {
    setHasConsented(true);
  };

  const PrivacyPolicyModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isPrivacyPolicyVisible}
      onRequestClose={() => setIsPrivacyPolicyVisible(false)}
    >
      <TouchableOpacity 
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setIsPrivacyPolicyVisible(false)}
      >
        <View style={styles.privacyPolicyContainer}>
          <ScrollView style={styles.privacyPolicyScroll}>
            <Text style={styles.privacyPolicyTitle}>Privacy Policy</Text>
            <Text style={styles.privacyPolicyText}>
              This application is part of a PhD research project in Psychology. By using this app, you agree to the following:
              {'\n\n'}
              1. Data Collection
              {'\n'}
              We collect the following minimal information:
              {'\n'}
              • Device ID (anonymous identifier) for tracking your responses
              {'\n'}
              • Your flashback count responses
              {'\n'}
              • Timestamps of your submissions
              {'\n\n'}
              2. Purpose of Data Collection
              {'\n'}
              All data collected is used exclusively for academic research purposes as part of a PhD project in Psychology. The data will help researchers understand patterns and trends in flashback experiences.
              {'\n\n'}
              3. Data Storage and Security
              {'\n'}
              Your data is stored securely using Supabase. We implement appropriate security measures to protect your information. All data is anonymized and cannot be traced back to you personally.
              {'\n\n'}
              4. Data Sharing
              {'\n'}
              Your data will not be shared with any third parties. It will only be used for the purposes of this academic research project.
              {'\n\n'}
              5. Your Rights
              {'\n'}
              You have the right to:
              {'\n'}
              • Access your anonymized data
              {'\n'}
              • Request deletion of your data at any time
              {'\n'}
              • Withdraw from the study at any time
              {'\n\n'}
              6. Data Deletion
              {'\n'}
              You can request deletion of your data at any time by using the "Delete My Data" button in the application. This will permanently remove all your data from our database.
            </Text>
          </ScrollView>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => setIsPrivacyPolicyVisible(false)}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  const MenuModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isMenuVisible}
      onRequestClose={() => setIsMenuVisible(false)}
    >
      <TouchableOpacity 
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setIsMenuVisible(false)}
      >
        <View style={styles.menuContainer}>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => {
              setIsMenuVisible(false);
              setIsPrivacyPolicyVisible(true);
            }}
          >
            <Text style={styles.menuItemText}>Privacy Policy</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => {
              setIsMenuVisible(false);
              handleDeleteData();
            }}
          >
            <Text style={[styles.menuItemText, styles.deleteMenuItemText]}>Delete My Data</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  // Add notification scheduling function
  const scheduleNotifications = async (segments: TimeSegment[]) => {
    try {
      // Cancel any existing notifications first
      await Notifications.cancelAllScheduledNotificationsAsync();

      // Request permissions if not already granted
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        Alert.alert('Permission Required', 'Please enable notifications to receive check-in reminders.');
        return;
      }

      // Schedule a notification for each active time segment
      for (const segment of segments) {
        if (!segment.is_active) continue;

        const [hours, minutes] = segment.time.split(':').map(Number);
        
        // Calculate seconds until next notification
        const now = new Date();
        const scheduledTime = new Date(now);
        scheduledTime.setHours(hours, minutes, 0, 0);
        
        // If the time has already passed today, schedule for tomorrow
        if (scheduledTime <= now) {
          scheduledTime.setDate(scheduledTime.getDate() + 1);
        }
        
        const secondsUntilNotification = Math.floor((scheduledTime.getTime() - now.getTime()) / 1000);
        
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "FlashTrack Check-in",
            body: `Time for your ${segment.name} check-in`,
            data: { type: 'flashback_check' },
          },
          trigger: {
            seconds: secondsUntilNotification,
            repeats: true,
          } as Notifications.NotificationTriggerInput,
        });

        console.log(`Scheduled notification for ${segment.name} at ${hours}:${minutes}`);
      }

      console.log('All notifications scheduled successfully');
    } catch (error) {
      console.error('Error scheduling notifications:', error);
      Alert.alert('Error', 'Failed to schedule notifications. Please try again.');
    }
  };

  // Update useEffect to schedule notifications when time segments are loaded
  useEffect(() => {
    if (timeSegments.length > 0) {
      scheduleNotifications(timeSegments);
    }
  }, [timeSegments]);

  // Add notification response handler
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;
      if (data && data.type === 'flashback_check') {
        setIsNotificationResponse(true);
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // Modify the initial render condition
  if (isCheckingAccess) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.mainContainer}>
          <Image 
            source={require('../../assets/images/logo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
      </SafeAreaView>
    );
  }

  if (!hasAccessCode) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.accessCodeContainer}>
          <View style={styles.accessCodeTop}>
            <Image 
              source={require('../../assets/images/logo.png')} 
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.welcomeText}>Welcome to FlashTrack</Text>
            <Text style={styles.accessCodeLabel}>Please enter the access code:</Text>
            <View style={styles.accessCodeInputs}>
              {accessCode.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={el => {
                    if (el) {
                      inputRefs.current[index] = el;
                    }
                  }}
                  style={[styles.accessCodeInput, accessCodeError && styles.accessCodeInputError]}
                  value={digit}
                  onChangeText={(text) => handleAccessCodeChange(text, index)}
                  keyboardType="numeric"
                  maxLength={1}
                  textAlign="center"
                />
              ))}
            </View>
          </View>

          <View style={styles.accessCodeBottom}>
            <TouchableOpacity 
              style={styles.accessCodeButton}
              onPress={handleAccessCodeSubmit}
            >
              <Text style={styles.accessCodeButtonText}>Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (hasAccessCode && !hasOnboarded) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.accessCodeContainer}>
          <View style={styles.accessCodeTop}>
            <Image 
              source={require('../../assets/images/logo.png')} 
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.welcomeText}>Create Your Unique Code</Text>
            <Text style={styles.accessCodeLabel}>Please enter a unique 4-digit code for your participation:</Text>
            <TextInput
              style={[
                styles.accessCodeInput,
                { width: 200, marginBottom: 10 }, // adjust margin for new message
                userUniqueCodeError ? styles.accessCodeInputError : null
              ]}
              value={userUniqueCode}
              onChangeText={text => {
                setUserUniqueCode(text.replace(/[^0-9]/g, '').slice(0, 4));
                setUserUniqueCodeError('');
              }}
              keyboardType="numeric"
              maxLength={4}
              textAlign="center"
              placeholder="0000"
              placeholderTextColor="#888888"
            />
            <Text style={{ color: '#4FC3F7', fontSize: 13, marginBottom: 20, textAlign: 'center' }}>
              Don't worry, you don't need to remember this code.
            </Text>
            {userUniqueCodeError ? <Text style={{ color: '#FF3B30', marginTop: 10 }}>{userUniqueCodeError}</Text> : null}
          </View>
          <View style={styles.accessCodeBottom}>
            <TouchableOpacity 
              style={styles.accessCodeButton}
              onPress={handleUserUniqueCodeSubmit}
            >
              <Text style={styles.accessCodeButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (!hasConsented) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.consentContainer}>
          <Image 
            source={require('../../assets/images/logo.png')} 
            style={[styles.logo, { marginTop: 5 }]}
            resizeMode="contain"
          />
          <View style={styles.consentBox}>
            <Text style={styles.consentTitle}>Research Study Consent</Text>
            <Text style={styles.consentText}>
              This application is part of a PhD research project in Psychology. By continuing, you agree to:
              {'\n\n'}
              • Participate voluntarily in this research study
              {'\n'}
              • Allow the collection of your device ID, flashback count responses, and timestamps
              {'\n'}
              • Understand that your data will be used exclusively for academic research
              {'\n'}
              • Know that you can withdraw at any time by deleting your data
              {'\n\n'}
              Your data will be anonymized and will not be shared with third parties.
            </Text>
            <TouchableOpacity 
              style={styles.consentButton}
              onPress={handleConsent}
            >
              <Text style={styles.consentButtonText}>I Agree to Participate</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // If user hasn't submitted for current segment, show the form
  if (!hasSubmittedToday) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <TouchableOpacity 
          style={styles.menuButton}
          onPress={() => setIsMenuVisible(true)}
        >
          <View style={styles.menuIcon}>
            <View style={styles.menuIconLine} />
            <View style={styles.menuIconLine} />
            <View style={styles.menuIconLine} />
          </View>
        </TouchableOpacity>
        <MenuModal />
        <PrivacyPolicyModal />
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingView}
        >
          <View style={styles.mainContainer}>
            <Image 
              source={require('../../assets/images/logo.png')} 
              style={[styles.logo, { marginTop: 5 }]}
              resizeMode="contain"
            />
            <ScrollView 
              contentContainerStyle={styles.questionsContainer}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {isLoadingQuestions ? (
                <Text style={styles.loadingText}>Loading questions...</Text>
              ) : (
                questions.map((question) => (
                  <View key={question.id} style={styles.questionContainer}>
                    <Text style={styles.question}>{question.text}</Text>
                    <TextInput
                      style={styles.input}
                      value={selectedNumbers[question.id]}
                      onChangeText={(text) => handleNumberChange(question.id, text)}
                      keyboardType="numeric"
                      placeholder="Enter number"
                      placeholderTextColor="#888888"
                      maxLength={3}
                    />
                  </View>
                ))
              )}
              <TouchableOpacity 
                style={[styles.button, isSubmitting && styles.buttonDisabled]} 
                onPress={handleSubmit}
                disabled={isSubmitting || isLoadingQuestions}
              >
                <Text style={styles.buttonText}>
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </Text>
              </TouchableOpacity>
              <Image 
                source={require('../../assets/images/conductor.png')} 
                style={styles.conductorImage}
                resizeMode="contain"
              />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // If user has already submitted, show the standard home screen
  return (
    <SafeAreaView style={styles.safeArea}>
      <TouchableOpacity 
        style={styles.menuButton}
        onPress={() => setIsMenuVisible(true)}
      >
        <View style={styles.menuIcon}>
          <View style={styles.menuIconLine} />
          <View style={styles.menuIconLine} />
          <View style={styles.menuIconLine} />
        </View>
      </TouchableOpacity>
      <MenuModal />
      <PrivacyPolicyModal />
      <View style={styles.mainContainer}>
        <View style={styles.contentContainer}>
          <Image 
            source={require('../../assets/images/logo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
          <View style={styles.messageContainer}>
            <Text style={styles.welcomeText}>
              Hope you're having a good day. Please come back once you receive your next notification. Thanks
            </Text>
          </View>
          <Text style={styles.trackerTitle}>Check-in Tracker</Text>
          <View style={styles.timeSegmentsContainer}>
            {timeSegments.map((segment) => (
              <TimeSegmentComponent 
                key={segment.id}
                name={segment.name}
                time={segment.time}
                isCompleted={segmentStatus[segment.id] || false}
              />
            ))}
          </View>
          <Image 
            source={require('../../assets/images/conductor.png')} 
            style={styles.conductorImage}
            resizeMode="contain"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  mainContainer: {
    flex: 1,
    backgroundColor: '#000000',
    paddingTop: 5,
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  logo: {
    width: 250,
    height: 250,
    marginTop: -100,
    marginBottom: -30,
    alignSelf: 'center',
  },
  messageContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 20,
    borderRadius: 10,
    width: '100%',
    maxWidth: 300,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  trackerTitle: {
    color: '#4FC3F7',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 25,
  },
  timeSegmentsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap', // Allow wrapping for more than 3 segments
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 10, // Add gap between segments
  },
  timeSegment: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    minWidth: '30%', // Minimum width for each segment
    flex: 1, // Allow segments to grow
    maxWidth: '45%', // Maximum width for each segment
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  conductorImage: {
    width: 200,
    height: 150,
  },
  accessCodeContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  accessCodeTop: {
    alignItems: 'center',
    paddingTop: 40,
  },
  accessCodeCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  accessCodeBottom: {
    paddingBottom: 40,
    alignItems: 'center',
  },
  accessCodeLabel: {
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  accessCodeInputs: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  accessCodeInput: {
    width: 50,
    height: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    marginHorizontal: 10,
    color: '#FFFFFF',
    fontSize: 24,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  accessCodeInputError: {
    borderColor: '#FF3B30',
    borderWidth: 2,
  },
  accessCodeButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    width: 200,
    alignItems: 'center',
  },
  accessCodeButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  picker: {
    width: 200,
    height: 150,
    backgroundColor: '#FFFFFF',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  buttonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  privacyLink: {
    position: 'absolute',
    bottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  privacyText: {
    color: '#FFFFFF',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  consentContainer: {
    flexGrow: 1,
    alignItems: 'center',
    padding: 20,
  },
  consentBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 20,
    borderRadius: 10,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginTop: 20,
  },
  consentTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  consentText: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 24,
    marginBottom: 20,
  },
  consentButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  consentButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  menuButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 1,
    padding: 8,
    backgroundColor: '#000000',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  menuIcon: {
    width: 20,
    height: 20,
    justifyContent: 'center',
  },
  menuIconLine: {
    height: 2,
    backgroundColor: '#FFFFFF',
    marginVertical: 3,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContainer: {
    backgroundColor: '#000000',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    maxWidth: 300,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  menuItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  menuItemText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
  },
  deleteMenuItemText: {
    color: '#FF3B30',
  },
  privacyPolicyContainer: {
    backgroundColor: '#000000',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  privacyPolicyScroll: {
    maxHeight: '80%',
  },
  privacyPolicyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  privacyPolicyText: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 24,
  },
  closeButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  questionsContainer: {
    flexGrow: 1,
    alignItems: 'center',
    padding: 20,
    paddingTop: 0,
    paddingBottom: 100,
    width: '100%',
  },
  questionContainer: {
    width: '100%',
    marginBottom: 20,
    alignItems: 'center',
  },
  question: {
    fontSize: 18, // Reduced from default
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#FFFFFF',
  },
  input: {
    width: '80%',
    height: 50,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  periodText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
  },
  timeText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginVertical: 8,
  },
  emptyCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
});
