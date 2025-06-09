import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';

const instructions = [
  "You have now completed the lab part of the study. The next phase involves tracking any flashbacks you may experience related to the film.",
  "Flashbacks are spontaneous thoughts, images, or sounds from the film that come to mind unexpectedly. They may occur during the day or night and can sometimes feel as though you are re-experiencing the film.",
  "You will be asked to record any flashbacks three times a day (at 7am, 1pm, and 7pm) for the next week. At the end of the week, you will complete a final survey which includes questions related to the flashbacks that you experienced.",
  "All of this information can be found in the menu section at the top right corner of this application.",
  "Thank you for continuing with the study. Your participation is greatly appreciated!"
];

export default function FlashbackInstructionsScreen() {
  const router = useRouter();

  const handleContinue = () => {
    router.replace('/(tabs)'); // Go to main app/home
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>Next Phase: Flashback Tracking</Text>
        {instructions.map((item, idx) => (
          <View key={idx} style={styles.bulletRow}>
            <Text style={styles.bullet}>{'•'}</Text>
            <Text style={styles.instruction}>{item}</Text>
          </View>
        ))}
        <TouchableOpacity style={styles.button} onPress={handleContinue}>
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
    marginBottom: 20,
    color: '#222',
    textAlign: 'center',
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bullet: {
    fontSize: 22,
    color: '#222',
    marginRight: 8,
    marginTop: -2,
  },
  instruction: {
    fontSize: 16,
    color: '#222',
    flex: 1,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 30,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 