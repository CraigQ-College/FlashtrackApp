import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, NativeModules } from 'react-native';

const DEVICE_ID_KEY = 'device_id';

export async function getDeviceId() {
  try {
    let deviceId = await AsyncStorage.getItem(DEVICE_ID_KEY);
    
    if (!deviceId) {
      // Generate a new UUID using device info
      const deviceInfo = Platform.OS === 'ios' 
        ? NativeModules.RNDeviceInfo?.uniqueId 
        : NativeModules.RNDeviceInfo?.androidId;
      
      deviceId = deviceInfo || 'unknown-device';
      if (deviceId) {
        await AsyncStorage.setItem(DEVICE_ID_KEY, deviceId);
      }
    }
    
    return deviceId || 'unknown-device';
  } catch (error) {
    console.error('Error getting device ID:', error);
    return 'unknown-device';
  }
} 