import React, { useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Alert, SafeAreaView, StyleSheet, BackHandler } from 'react-native';

const CORRECT_ACCESS_CODE = '2345';

export default function ParticipationCodeScreen({ navigation }: any) {
  const [accessCode, setAccessCode] = useState(['', '', '', '']);
  const [accessCodeError, setAccessCodeError] = useState(false);
  const inputRefs = useRef<Array<TextInput | null>>([]);

  const handleAccessCodeChange = (text: string, index: number) => {
    if (/^\d*$/.test(text) && text.length <= 1) {
      const newCode = [...accessCode];
      newCode[index] = text;
      setAccessCode(newCode);
      // Auto-focus next input
      if (text && index < 3) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleAccessCodeSubmit = async () => {
    const enteredCode = accessCode.join('');
    if (enteredCode === CORRECT_ACCESS_CODE) {
      setAccessCodeError(false);
      // Navigate to the next onboarding step (unique code screen)
      navigation.replace('/'); // Adjust this route as needed
    } else {
      setAccessCodeError(true);
      Alert.alert(
        'Access Denied',
        'You must be part of the participation team to use this application. This app will now close.',
        [{ text: 'OK', onPress: () => {
          setTimeout(() => {
            BackHandler.exitApp();
          }, 5000);
        }}]
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.accessCodeContainer}>
        <View style={styles.accessCodeTop}>
          <Image 
            source={require('../../assets/images/logo.png')} 
            style={[styles.logo, { marginTop: 0 }]}
            resizeMode="contain"
          />
          <Text style={styles.welcomeText}>Welcome to FlashTrack</Text>
          <Text style={styles.accessCodeLabel}>Please enter the access code:</Text>
          <View style={styles.accessCodeInputs}>
            {accessCode.map((digit, index) => (
              <TextInput
                key={index}
                ref={el => {
                  if (el) {
                    inputRefs.current[index] = el;
                  }
                }}
                style={[styles.accessCodeInput, accessCodeError && styles.accessCodeInputError]}
                value={digit}
                onChangeText={(text) => handleAccessCodeChange(text, index)}
                keyboardType="numeric"
                maxLength={1}
                textAlign="center"
              />
            ))}
          </View>
        </View>
        <View style={styles.accessCodeBottom}>
          <TouchableOpacity 
            style={styles.accessCodeButton}
            onPress={handleAccessCodeSubmit}
          >
            <Text style={styles.accessCodeButtonText}>Submit</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
  accessCodeContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  accessCodeTop: {
    alignItems: 'center',
    paddingTop: 40,
  },
  accessCodeBottom: {
    paddingBottom: 40,
    alignItems: 'center',
  },
  logo: {
    width: 200,
    height: 200,
    marginTop: -40,
    marginBottom: -30,
    alignSelf: 'center',
  },
  welcomeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  accessCodeLabel: {
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  accessCodeInputs: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  accessCodeInput: {
    width: 50,
    height: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    marginHorizontal: 10,
    color: '#FFFFFF',
    fontSize: 24,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  accessCodeInputError: {
    borderColor: '#FF3B30',
    borderWidth: 2,
  },
  accessCodeButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    width: 200,
    alignItems: 'center',
  },
  accessCodeButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 