import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import Camera from './ecran/Camera'; // Vérifiez le chemin
import Notification from './ecran/Notification';

const App = () => {
  const [cloudinaryUrl, setCloudinaryUrl] = useState<string | null>(null);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Application de prise de photos</Text>
      <Notification />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  cameraContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  imageContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  userImg: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginTop: 10,  // Ajustez ce margin pour déplacer l'image
  },
  noImageText: {
    marginTop: 10,
    fontStyle: 'italic',
    color: 'gray',
  },
});

export default App;
