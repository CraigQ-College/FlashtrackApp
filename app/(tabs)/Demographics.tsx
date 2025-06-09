import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';

const ageOptions = Array.from({ length: 83 }, (_, i) => 18 + i); // 18 to 100

export default function DemographicsScreen() {
  const [sex, setSex] = useState('');
  const [sexOther, setSexOther] = useState('');
  const [age, setAge] = useState(18);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = () => {
    if (!sex || (sex === 'Other' && !sexOther)) {
      setError('Please select your sex.');
      return;
    }
    if (!age) {
      setError('Please select your age.');
      return;
    }
    setError('');
    // TODO: Save demographics to database
    router.replace('/(tabs)/PHQ4');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.sectionLabel}>SEX</Text>
        <Text style={styles.question}>What is your sex?</Text>
        <TouchableOpacity style={styles.radioRow} onPress={() => setSex('Female')}>
          <View style={[styles.radio, sex === 'Female' && styles.radioSelected]} />
          <Text style={styles.radioLabel}>Female</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.radioRow} onPress={() => setSex('Male')}>
          <View style={[styles.radio, sex === 'Male' && styles.radioSelected]} />
          <Text style={styles.radioLabel}>Male</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.radioRow} onPress={() => setSex('Other')}>
          <View style={[styles.radio, sex === 'Other' && styles.radioSelected]} />
          <Text style={styles.radioLabel}>Other, please specify</Text>
        </TouchableOpacity>
        {sex === 'Other' && (
          <TextInput
            style={styles.input}
            value={sexOther}
            onChangeText={setSexOther}
            placeholder="Please specify"
            placeholderTextColor="#888"
          />
        )}
        <Text style={styles.sectionLabel}>AGE</Text>
        <Text style={styles.question}>What age are you?</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={age}
            onValueChange={setAge}
            style={styles.picker}
            itemStyle={styles.pickerItem}
          >
            {ageOptions.map(a => (
              <Picker.Item key={a} label={a.toString()} value={a} />
            ))}
          </Picker>
        </View>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
  },
  sectionLabel: {
    fontWeight: 'bold',
    color: '#222',
    marginTop: 16,
    marginBottom: 4,
    fontSize: 15,
  },
  question: {
    fontSize: 18,
    color: '#222',
    marginBottom: 10,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#007AFF',
    marginRight: 10,
    backgroundColor: '#fff',
  },
  radioSelected: {
    backgroundColor: '#007AFF',
  },
  radioLabel: {
    fontSize: 16,
    color: '#222',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    color: '#222',
    fontSize: 16,
    backgroundColor: '#fff',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  picker: {
    width: '100%',
    height: 44,
  },
  pickerItem: {
    fontSize: 16,
    color: '#222',
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