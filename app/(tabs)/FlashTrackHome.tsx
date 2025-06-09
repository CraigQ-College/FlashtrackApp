import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { uniqueCodeService } from '../../services/uniqueCode';
import { api } from '../../services/api';
import { MaterialIcons } from '@expo/vector-icons';

// ProgressBar component
const ProgressBar = ({ currentDay }: { currentDay: number }) => {
  return (
    <View style={styles.progressContainer}>
      <Text style={styles.dayCounterText}>Day {currentDay} of 7</Text>
      <View style={styles.progressBar}>
        {[...Array(7)].map((_, index) => (
          <View key={index} style={styles.progressDayContainer}>
            <View
              style={[
                styles.progressDay,
                index < currentDay - 1 ? styles.progressDayCompleted :
                index === currentDay - 1 ? styles.progressDayCurrent :
                styles.progressDayPending
              ]}
            >
              {index < currentDay - 1 && (
                <MaterialIcons name="check-circle" size={24} color="#4CAF50" />
              )}
            </View>
            <Text style={styles.progressDayText}>Day {index + 1}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default function FlashTrackHomeScreen() {
  const router = useRouter();
  const [currentDay, setCurrentDay] = useState(1);
  const [uniqueCode, setUniqueCode] = useState<string | null>(null);

  // Fetch unique code and calculate current day
  useEffect(() => {
    const fetchAndCalculateDay = async () => {
      try {
        const code = await uniqueCodeService.getUniqueCode();
        setUniqueCode(code);
        if (code) {
          const startDate = await api.getUserStartDate(code);
          if (!startDate) return;
          const start = new Date(startDate);
          const now = new Date();
          start.setHours(0, 0, 0, 0);
          now.setHours(0, 0, 0, 0);
          const diffTime = now.getTime() - start.getTime();
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          const day = Math.min(Math.max(diffDays + 1, 1), 7);
          setCurrentDay(day);
        }
      } catch (error) {
        // fallback: day 1
        setCurrentDay(1);
      }
    };
    fetchAndCalculateDay();
  }, []);

  const handleCheckIn = () => {
    router.push('/(tabs)/DailyQuestions');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ProgressBar currentDay={currentDay} />
        <Text style={styles.header}>FlashTrack Home</Text>
        <Text style={styles.info}>This is where your progress tracker and check-in tracker will go.</Text>
        <TouchableOpacity style={styles.button} onPress={handleCheckIn}>
          <Text style={styles.buttonText}>Go to Daily Questions</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#000',
  },
  header: {
    fontWeight: 'bold',
    fontSize: 24,
    marginBottom: 20,
    color: '#4FC3F7',
    textAlign: 'center',
  },
  info: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 40,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    width: 220,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  // Progress bar styles
  progressContainer: {
    width: '100%',
    paddingHorizontal: 20,
    marginTop: 30,
    marginBottom: 15,
  },
  progressBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressDayContainer: {
    alignItems: 'center',
    minWidth: 45,
  },
  progressDay: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressDayCompleted: {
    borderColor: '#4CAF50',
    backgroundColor: 'transparent',
  },
  progressDayCurrent: {
    borderColor: '#4FC3F7',
    backgroundColor: 'transparent',
  },
  progressDayPending: {
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: 'transparent',
  },
  progressDayText: {
    color: '#FFFFFF',
    fontSize: 11,
    marginTop: 4,
  },
  dayCounterText: {
    color: '#4FC3F7',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
}); 