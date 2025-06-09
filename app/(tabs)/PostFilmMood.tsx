import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StyleSheet, ScrollView } from 'react-native';
import Slider from '@react-native-community/slider';
import { useRouter } from 'expo-router';

const moodItems = [
  'Sad',
  'Hopeless',
  'Fearful',
  'Horrified',
  'Depressed',
];

export default function PostFilmMoodScreen() {
  const [moods, setMoods] = useState<number[]>(Array(5).fill(0));
  const [error, setError] = useState('');
  const router = useRouter();

  const handleChange = (idx: number, value: number) => {
    setMoods(prev => prev.map((v, i) => (i === idx ? value : v)));
  };

  const handleSubmit = () => {
    setError('');
    // TODO: Save post-film mood to database
    router.replace('/(tabs)/AttentionDistress');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>POST-FILM MOOD</Text>
        <Text style={styles.subheader}>
          Please complete these mood ratings based on how you feel after watching the film on a scale from 0 (Not At All) to 100 (Overwhelmingly)
        </Text>
        {moodItems.map((item, idx) => (
          <View key={idx} style={styles.sliderBlock}>
            <Text style={styles.sliderLabel}>{item}</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={100}
              step={1}
              value={moods[idx]}
              onValueChange={value => handleChange(idx, value)}
              minimumTrackTintColor="#4FC3F7"
              maximumTrackTintColor="#ccc"
              thumbTintColor="#4FC3F7"
            />
            <View style={styles.sliderValueRow}>
              <Text style={styles.sliderValueText}>Not At All (0)</Text>
              <Text style={styles.sliderValueText}>{moods[idx]}</Text>
              <Text style={styles.sliderValueText}>Overwhelmingly (100)</Text>
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
  sliderBlock: {
    marginBottom: 32,
  },
  sliderLabel: {
    fontSize: 16,
    color: '#222',
    marginBottom: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderValueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  sliderValueText: {
    fontSize: 12,
    color: '#888',
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