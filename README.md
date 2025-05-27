# FlashTrack

FlashTrack is a mobile application designed to help track and monitor flashback experiences as part of a PhD research project in Psychology. The app provides a simple and user-friendly way for participants to log their flashback experiences at regular intervals throughout the day.

## Features

- **Secure Access**: Protected by a unique access code to ensure only authorized participants can use the app
- **Daily Check-ins**: Three scheduled check-in times per day:
  - Morning: 6:00 AM
  - Afternoon: 12:00 PM
  - Evening: 6:00 PM
- **Progress Tracking**: Visual indicators show which check-ins have been completed for the day
- **Privacy Focused**: 
  - Minimal data collection (only device ID, flashback count, and timestamps)
  - Option to delete all data at any time
  - Data anonymization
  - No third-party sharing

## How It Works

1. **First Time Setup**:
   - Enter the provided access code
   - Review and accept the research consent form
   - The app will remember your device for future use

2. **Daily Usage**:
   - Receive notifications at scheduled check-in times
   - Log the number of flashbacks experienced
   - Track your progress through the day with the check-in tracker
   - All data resets at midnight for a new day

3. **Data Management**:
   - Access the menu to view the privacy policy
   - Option to delete all your data at any time
   - Data is stored securely using Supabase

## Privacy and Data Collection

This application is part of an academic research project. We collect only the minimal information necessary:
- Device ID (anonymous identifier)
- Flashback count responses
- Timestamps of submissions

All data is:
- Used exclusively for academic research
- Stored securely
- Anonymized
- Not shared with third parties

## Getting Started

1. Download and install the app
2. Enter the provided access code
3. Review and accept the consent form
4. Start tracking your experiences

## Support

If you have any questions or concerns about the app or the research project, please contact the research team through the provided contact information in the privacy policy.

## Technical Details

- Built with React Native and Expo
- Uses Supabase for secure data storage
- Implements push notifications for check-in reminders
- Supports both iOS and Android platforms

# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
    npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.