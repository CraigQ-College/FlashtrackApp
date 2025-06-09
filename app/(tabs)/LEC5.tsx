import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';

const lec5Items = [
  'Natural disaster (for example, flood, hurricane, tornado, earthquake)',
  'Fire or explosion',
  'Transportation accident (for example, car accident, boat accident, train wreck, plane crash)',
  'Serious accident at work, home, or during recreational activity',
  'Exposure to toxic substance (for example, dangerous chemicals, radiation)',
  'Physical assault (for example, being attacked, hit, slapped, kicked, beaten up)',
  'Assault with a weapon (for example, being shot, stabbed, threatened with a knife, gun, bomb)',
  'Sexual assault (rape, attempted rape, made to perform any type of sexual act through force or threat of harm)',
  'Other unwanted or uncomfortable sexual experience',
  'Combat or exposure to a war-zone (in the military or as a civilian)',
  'Captivity (for example being kidnapped, abducted, held hostage, prison of war)',
  'Life-threatening illness or injury',
  'Witnessed severe human suffering',
  'Witnessed sudden, violent death (for example, homicide; suicide)',
  'Sudden, unexpected death of someone close to you',
  'Serious injury, harm or death you caused to someone else.'
];

export default function LEC5Screen() {
  const [answers, setAnswers] = useState<(boolean | null)[]>(Array(16).fill(null));
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSelect = (idx: number, value: boolean) => {
    setAnswers(prev => prev.map((a, i) => (i === idx ? value : a)));
  };

  const handleSubmit = () => {
    if (answers.some(a => a === null)) {
      setError('Please answer all questions.');
      return;
    }
    setError('');
    // TODO: Save LEC5 responses to database
    router.replace('/(tabs)/PreFilmMood');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>LEC5 Trauma Exposure</Text>
        <Text style={styles.subheader}>
          Listed below are a number of difficult or stressful things that sometimes happen to people. Please indicate if you were directly exposed to each event at any point in your life.
        </Text>
        {lec5Items.map((item, idx) => (
          <View key={idx} style={styles.questionBlock}>
            <Text style={styles.question}>{idx + 1}. {item}</Text>
            <View style={styles.optionsRow}>
              <TouchableOpacity
                style={styles.radioCol}
                onPress={() => handleSelect(idx, false)}
              >
                <View style={[styles.radio, answers[idx] === false && styles.radioSelected]} />
                <Text style={styles.radioLabel}>No</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.radioCol}
                onPress={() => handleSelect(idx, true)}
              >
                <View style={[styles.radio, answers[idx] === true && styles.radioSelected]} />
                <Text style={styles.radioLabel}>Yes</Text>
              </TouchableOpacity>
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
    marginBottom: 20,
  },
  question: {
    fontSize: 15,
    color: '#222',
    marginBottom: 8,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 4,
  },
  radioCol: {
    alignItems: 'center',
    flexDirection: 'row',
    marginRight: 24,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#007AFF',
    marginRight: 6,
    backgroundColor: '#fff',
  },
  radioSelected: {
    backgroundColor: '#007AFF',
  },
  radioLabel: {
    fontSize: 14,
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