import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';

const consentStatements = [
  "The purpose and nature of the study have been explained to me verbally & in writing.",
  "I've been able to ask questions about the study, which were answered satisfactorily.",
  "I understand that I am not obliged to participate and am doing so voluntarily.",
  "I understand that the film clips to be viewed depict traumatic events and will be distressing.",
  "I understand that I can withdraw from the study, without explanation and without repercussions, at any time, whether that is before it starts or while I am participating.",
  "I understand that I can withdraw permission to use my data during the study week but not after.",
  "I understand the limits of confidentiality as described in the information sheet."
];

export default function ConsentScreen() {
  const [agreed, setAgreed] = useState(false);
  const router = useRouter();

  const handleContinue = () => {
    if (agreed) {
      router.replace('/(tabs)/Demographics');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>Please read each statement below:</Text>
        {consentStatements.map((statement, idx) => (
          <Text key={idx} style={styles.statement}>{statement}</Text>
        ))}
        <Text style={styles.boldText}>
          If you agree to each statement and are willing to participate in this study, please click the "I agree to participate" button below.
        </Text>
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => setAgreed(!agreed)}
        >
          <View style={[styles.checkbox, agreed && styles.checkboxChecked]} />
          <Text style={styles.checkboxLabel}>I agree to participate</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, !agreed && styles.buttonDisabled]}
          onPress={handleContinue}
          disabled={!agreed}
        >
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
    alignItems: 'flex-start',
  },
  header: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 18,
    color: '#333',
  },
  statement: {
    fontSize: 16,
    color: '#333',
    marginBottom: 12,
  },
  boldText: {
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 18,
    marginBottom: 18,
    color: '#222',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: '#007AFF',
    borderRadius: 11,
    marginRight: 10,
    backgroundColor: '#fff',
  },
  checkboxChecked: {
    backgroundColor: '#007AFF',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#222',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#cccccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 