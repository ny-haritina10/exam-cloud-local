import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Alert, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import messaging from '@react-native-firebase/messaging';

export default function Notification() {
  const requestUserPermission = async () => {
    try {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('Authorization status:', authStatus);
        return true;
      }
      
      console.log('Permission not granted:', authStatus);
      return false;
    } catch (error) {
      console.error('Permission request error:', error);
      return false;
    }
  };

  useEffect(() => {
    const setupPushNotifications = async () => {
      const permissionGranted = await requestUserPermission();
      
      if (permissionGranted) {
        try {
          const token = await messaging().getToken();
          console.log('FCM Token:', token);
        } catch (error) {
          console.error('Error getting FCM token:', error);
        }
      }

      // Vérification de la notification initiale
      const initialNotification = await messaging().getInitialNotification();
      if (initialNotification) {
        console.log(
          'Notification caused app to open from quit state:',
          initialNotification.notification
        );
      }

      // Gestion des notifications en arrière-plan
      messaging().onNotificationOpenedApp((remoteMessage) => {
        console.log(
          'Notification caused app to open from background state:',
          remoteMessage.notification
        );
      });

      // Gestion des messages en arrière-plan
      messaging().setBackgroundMessageHandler(async (remoteMessage) => {
        console.log('Background message received:', remoteMessage.notification);
        return Promise.resolve();
      });

      // Gestion des messages au premier plan
      const unsubscribe = messaging().onMessage(async (remoteMessage) => {
        Alert.alert(
          'Nouveau message',
          JSON.stringify(remoteMessage)
        );
      });

      return () => unsubscribe();
    };

    setupPushNotifications();
  }, []);

  return (
    <View style={styles.container}>
      <Text>Notification Tuto</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});