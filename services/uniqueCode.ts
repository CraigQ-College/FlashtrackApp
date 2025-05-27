import AsyncStorage from '@react-native-async-storage/async-storage';

const UNIQUE_CODE_KEY = '@flashtrack_unique_code';

export const uniqueCodeService = {
  // Store the unique code
  async storeUniqueCode(code: string): Promise<void> {
    try {
      await AsyncStorage.setItem(UNIQUE_CODE_KEY, code);
    } catch (error) {
      console.error('Error storing unique code:', error);
      throw error;
    }
  },

  // Get the stored unique code
  async getUniqueCode(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(UNIQUE_CODE_KEY);
    } catch (error) {
      console.error('Error getting unique code:', error);
      return null;
    }
  },

  // Check if user has a unique code
  async hasUniqueCode(): Promise<boolean> {
    const code = await this.getUniqueCode();
    return code !== null;
  },

  // Remove the unique code (for data deletion)
  async removeUniqueCode(): Promise<void> {
    try {
      await AsyncStorage.removeItem(UNIQUE_CODE_KEY);
    } catch (error) {
      console.error('Error removing unique code:', error);
      throw error;
    }
  }
}; 