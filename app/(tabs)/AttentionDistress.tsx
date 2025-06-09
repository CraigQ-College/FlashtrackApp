import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StyleSheet, ScrollView } from 'react-native';
import Slider from '@react-native-community/slider';
import { useRouter } from 'expo-router';

export default function AttentionDistressScreen() {
  const [attention, setAttention] = useState(0);
  const [distress, setDistress] = useState(0);
  const router = useRouter();

  const handleSubmit = () => {
    // TODO: Save attention/distress to database
    router.replace('/(tabs)/FlashbackInstructions');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>ATTENTION</Text>
        <Text style={styles.question}>
          How well did you pay attention to the film on a scale of 0 (Did Not Pay Attention At All) to 10 (Paid Full Attention)?
        </Text>
        <Text style={styles.sliderLabel}>Attention To Film</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={10}
          step={1}
          value={attention}
          onValueChange={setAttention}
          minimumTrackTintColor="#4FC3F7"
          maximumTrackTintColor="#ccc"
          thumbTintColor="#4FC3F7"
        />
        <View style={styles.sliderValueRow}>
          <Text style={styles.sliderValueText}>0</Text>
          <Text style={styles.sliderValueText}>{attention}</Text>
          <Text style={styles.sliderValueText}>10</Text>
        </View>

        <Text style={styles.header}>FILM DISTRESS</Text>
        <Text style={styles.question}>
          How distressing did you find the film on a scale of 0 (Not At All Distressing) to 10 (Extremely Distressing)?
        </Text>
        <Text style={styles.sliderLabel}>Distress Rating</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={10}
          step={1}
          value={distress}
          onValueChange={setDistress}
          minimumTrackTintColor="#4FC3F7"
          maximumTrackTintColor="#ccc"
          thumbTintColor="#4FC3F7"
        />
        <View style={styles.sliderValueRow}>
          <Text style={styles.sliderValueText}>0</Text>
          <Text style={styles.sliderValueText}>{distress}</Text>
          <Text style={styles.sliderValueText}>10</Text>
        </View>

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
    fontSize: 18,
    marginTop: 24,
    marginBottom: 10,
    color: '#222',
  },
  question: {
    fontSize: 16,
    color: '#222',
    marginBottom: 8,
  },
  sliderLabel: {
    fontSize: 15,
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
    marginBottom: 16,
  },
  sliderValueText: {
    fontSize: 12,
    color: '#888',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 