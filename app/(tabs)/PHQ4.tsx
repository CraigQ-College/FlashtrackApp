import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';

const phq4Questions = [
  'Feeling nervous, anxious or on edge',
  'Not being able to stop or control worrying',
  'Feeling down, depressed or hopeless',
  'Little interest or pleasure in doing things',
];

const options = [
  'Not at all',
  'Several days',
  'More than half the days',
  'Nearly every day',
];

export default function PHQ4Screen() {
  const [answers, setAnswers] = useState<number[]>([-1, -1, -1, -1]);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSelect = (qIdx: number, optIdx: number) => {
    setAnswers(prev => prev.map((a, i) => (i === qIdx ? optIdx : a)));
  };

  const handleSubmit = () => {
    if (answers.some(a => a === -1)) {
      setError('Please answer all questions.');
      return;
    }
    setError('');
    // TODO: Save PHQ-4 responses to database
    router.replace('/(tabs)/LEC5');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>PHQ-4</Text>
        <Text style={styles.subheader}>Over the last two weeks, how often have you been bothered by the following problems?</Text>
        {phq4Questions.map((q, qIdx) => (
          <View key={qIdx} style={styles.questionBlock}>
            <Text style={styles.question}>{q}</Text>
            <View style={styles.optionsRow}>
              {options.map((opt, optIdx) => (
                <TouchableOpacity
                  key={optIdx}
                  style={styles.radioCol}
                  onPress={() => handleSelect(qIdx, optIdx)}
                >
                  <View style={[styles.radio, answers[qIdx] === optIdx && styles.radioSelected]} />
                  <Text style={styles.radioLabel}>{opt}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    padding: 24,
    backgroundColor: '#fff',
  },
  header: {
    fontWeight: 'bold',
    fontSize: 20,
    marginBottom: 10,
    color: '#222',
  },
  subheader: {
    fontSize: 16,
    color: '#222',
    marginBottom: 18,
  },
  questionBlock: {
    marginBottom: 24,
  },
  question: {
    fontSize: 16,
    color: '#222',
    marginBottom: 8,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  radioCol: {
    alignItems: 'center',
    flex: 1,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#007AFF',
    marginBottom: 4,
    backgroundColor: '#fff',
  },
  radioSelected: {
    backgroundColor: '#007AFF',
  },
  radioLabel: {
    fontSize: 12,
    color: '#222',
    textAlign: 'center',
  },
  error: {
    color: '#FF3B30',
    marginBottom: 10,
    marginTop: 10,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 