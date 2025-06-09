import React, { useEffect, useState, useLayoutEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert, ActivityIndicator, Image } from 'react-native';
import Slider from '@react-native-community/slider';
import { api } from '../../services/api';
import { useRouter, useNavigation } from 'expo-router';
import { uniqueCodeService } from '../../services/uniqueCode';

interface EndOfStudyQuestion {
  id: number;
  question_no: number;
  question: string;
}

export default function EndOfStudyQuestionnaire() {
  const [questions, setQuestions] = useState<EndOfStudyQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const navigation = useNavigation();
  const [uniqueCode, setUniqueCode] = useState<string | null>(null);

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  useEffect(() => {
    const checkAndLoad = async () => {
      const code = await uniqueCodeService.getUniqueCode();
      setUniqueCode(code);
      if (!code) {
        Alert.alert('Error', 'No unique code found.');
        return;
      }
      // Check if already completed
      const alreadyDone = await api.hasEndOfStudyResponse(code);
      if (alreadyDone) {
        router.replace({ pathname: '/ThankYou' });
        return;
      }
      // Load questions
      api.getEndOfStudyQuestions().then((qs: EndOfStudyQuestion[]) => {
        setQuestions(qs);
        // Initialize all answers to 5 (midpoint)
        const initial: Record<number, number> = {};
        qs.forEach(q => { initial[q.id] = 5; });
        setAnswers(initial);
        setLoading(false);
      }).catch(() => {
        Alert.alert('Error', 'Failed to load questions.');
        setLoading(false);
      });
    };
    checkAndLoad();
  }, []);

  const handleChange = (id: number, value: number) => {
    setAnswers(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async () => {
    if (!uniqueCode) return;
    setSubmitting(true);
    try {
      // Map answers to Q1, Q2, ... as strings
      const responseData: Record<string, string> = { unique_code: uniqueCode };
      questions.forEach((q, idx) => {
        responseData[`Q${idx + 1}`] = String(answers[q.id] ?? 5);
      });
      await api.submitEndOfStudyResponse(responseData);
      router.replace({ pathname: '/ThankYou' });
    } catch (e) {
      Alert.alert('Error', 'Failed to submit your answers.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#4FC3F7" /></View>;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={require('../../assets/images/logo.png')} style={styles.logo} resizeMode="contain" />
      {questions.map((q) => (
        <View key={q.id} style={styles.card}>
          <Text style={styles.question}>{q.question}</Text>
          <Text style={styles.sliderValue}>Selected: {answers[q.id]}</Text>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={10}
            step={1}
            value={answers[q.id]}
            onValueChange={(value: number) => handleChange(q.id, value)}
            minimumTrackTintColor="#4FC3F7"
            maximumTrackTintColor="#ccc"
            thumbTintColor="#4FC3F7"
          />
          <View style={styles.sliderLabels}>
            <Text style={styles.sliderLabel}>0</Text>
            <Text style={styles.sliderLabel}>10</Text>
          </View>
        </View>
      ))}
      <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={submitting}>
        <Text style={styles.buttonText}>{submitting ? 'Submitting...' : 'Submit'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#000',
    minHeight: '100%',
    alignItems: 'center',
  },
  logo: {
    width: 180,
    height: 180,
    marginBottom: 24,
    marginTop: 12,
    alignSelf: 'center',
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 12,
    padding: 18,
    marginBottom: 20,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.13)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  question: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -8,
  },
  sliderLabel: {
    color: '#fff',
    fontSize: 12,
  },
  sliderValue: {
    color: '#4FC3F7',
    fontSize: 14,
    marginBottom: 4,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#4FC3F7',
    padding: 16,
    borderRadius: 8,
    marginTop: 24,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
}); 