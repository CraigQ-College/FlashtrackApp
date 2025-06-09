import React, { useLayoutEffect } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useNavigation } from 'expo-router';

export default function ThankYou() {
  const navigation = useNavigation();
  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Image source={require('../../assets/images/logo.png')} style={styles.logo} resizeMode="contain" />
      <Text style={styles.text}>Thank you. You can now close and remove this app.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 260,
    height: 260,
    marginBottom: 40,
  },
  text: {
    color: '#4FC3F7',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingHorizontal: 24,
  },
}); 