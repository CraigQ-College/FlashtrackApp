import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Alert, SafeAreaView, StyleSheet } from 'react-native';
import { api } from '../../services/api';
import { uniqueCodeService } from '../../services/uniqueCode';
import { useRouter } from 'expo-router';

export default function UniqueCodeScreen() {
  const [userUniqueCode, setUserUniqueCode] = useState('');
  const [userUniqueCodeError, setUserUniqueCodeError] = useState('');
  const router = useRouter();

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
      setUserUniqueCodeError('');
      // Navigate to consent screen
      router.replace('/(tabs)/Consent');
    } catch (error) {
      setUserUniqueCodeError('Error saving code. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Image 
          source={require('../../assets/images/logo.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>Create Your Unique Code</Text>
        <Text style={styles.label}>Please enter a unique 4-digit code for your participation:</Text>
        <TextInput
          style={[styles.input, userUniqueCodeError ? styles.inputError : null]}
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
        <Text style={styles.infoText}>
          Don't worry, you don't need to remember this code.
        </Text>
        {userUniqueCodeError ? <Text style={styles.errorText}>{userUniqueCodeError}</Text> : null}
        <TouchableOpacity 
          style={styles.button}
          onPress={handleUserUniqueCodeSubmit}
        >
          <Text style={styles.buttonText}>Continue</Text>
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
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#000',
  },
  logo: {
    width: 180,
    height: 180,
    marginBottom: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4FC3F7',
    marginBottom: 16,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  input: {
    width: 200,
    height: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    color: '#FFFFFF',
    fontSize: 24,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: 10,
  },
  inputError: {
    borderColor: '#FF3B30',
    borderWidth: 2,
  },
  infoText: {
    color: '#4FC3F7',
    fontSize: 13,
    marginBottom: 20,
    textAlign: 'center',
  },
  errorText: {
    color: '#FF3B30',
    marginTop: 10,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    width: 200,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 