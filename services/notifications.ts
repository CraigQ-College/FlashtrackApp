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
        body: 'Time to track your flashbacks',
        hour: 7,
        minute: 0
      },
      {
        title: 'Afternoon Check-in',
        body: 'Time to track your flashbacks',
        hour: 13,
        minute: 0
      },
      {
        title: 'Evening Check-in',
        body: 'Time to track your flashbacks',
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

export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

// Add notification response handler
export function setupNotificationResponseHandler(router: any) {
  return Notifications.addNotificationResponseReceivedListener((response) => {
    const notification = response.notification;
    const title = notification.request.content.title;
    
    // Navigate to the home screen with notification info
    router.push({
      pathname: '/(tabs)',
      params: { 
        notification: true,
        notificationType: title // Pass the notification type (Morning/Afternoon/Evening)
      }
    });
  });
}
