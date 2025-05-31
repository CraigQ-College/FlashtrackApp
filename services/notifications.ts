import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Configure how notifications appear when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return;
    }
    token = (await Notifications.getExpoPushTokenAsync()).data;
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  return token;
}

// Add helper function to schedule a single notification
const scheduleNotification = async ({ title, body, hour, minute }: { 
  title: string; 
  body: string; 
  hour: number; 
  minute: number; 
}) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
    },
    trigger: {
      type: 'daily',
      hour,
      minute,
      repeats: true,
    } as Notifications.DailyTriggerInput,
  });
};

export const scheduleDailyNotifications = async () => {
  try {
    // Cancel any existing notifications
    await cancelAllNotifications();

    // Schedule notifications for 7am, 1pm, and 7pm
    const notifications = [
      {
        title: 'Morning Check-in',
        body: 'Time for your morning flashback check-in',
        hour: 7,
        minute: 0
      },
      {
        title: 'Afternoon Check-in',
        body: 'Time for your afternoon flashback check-in',
        hour: 13,
        minute: 0
      },
      {
        title: 'Evening Check-in',
        body: 'Time for your evening flashback check-in',
        hour: 19,
        minute: 0
      }
    ];

    for (const notification of notifications) {
      await scheduleNotification(notification);
    }

    console.log('Daily notifications scheduled successfully');
  } catch (error) {
    console.error('Error scheduling notifications:', error);
  }
};

// Add function to schedule a test notification
export const scheduleTestNotification = async () => {
  try {
    // Get current time
    const now = new Date();
    
    // Set notification time to 11am today
    const notificationTime = new Date(now);
    notificationTime.setHours(11, 0, 0, 0);
    
    // If it's already past 11am, schedule for tomorrow
    if (now > notificationTime) {
      notificationTime.setDate(notificationTime.getDate() + 1);
    }

    // Schedule the test notification
    await scheduleNotification({
      title: 'Test Notification',
      body: 'This is a test notification for 11am',
      hour: 11,
      minute: 0
    });

    console.log('Test notification scheduled for 11am');
  } catch (error) {
    console.error('Error scheduling test notification:', error);
  }
};

export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

// Add notification response handler
export function setupNotificationResponseHandler(router: any) {
  return Notifications.addNotificationResponseReceivedListener(() => {
    // Navigate to the questions screen
    router.push({
      pathname: '/(tabs)',
      params: { notification: true }
    });
  });
}
