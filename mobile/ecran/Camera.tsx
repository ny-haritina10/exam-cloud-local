import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CLOUDINARY_URL_KEY = '@cloudinary_url';

interface CameraProps {
  setCloudinaryUrl: (url: string) => void;
}

const Camera: React.FC<CameraProps> = ({ setCloudinaryUrl }) => {
  const [imageUri, setImageUri] = useState<string | null>(null);

  useEffect(() => {
    loadSavedImage();
  }, []);

  const loadSavedImage = async () => {
    try {
      const savedUrl = await AsyncStorage.getItem(CLOUDINARY_URL_KEY);
      if (savedUrl) {
        setCloudinaryUrl(savedUrl);
      }
    } catch (error) {
      console.error("Erreur lors du chargement de l'image:", error);
    }
  };

  const uploadToCloudinary = async (uri: string) => {
    try {
      const cloudName = 'daur4tjkn';
      const uploadPreset = 'preset1';

      const formData = new FormData();
      formData.append('file', {
        uri: uri,
        type: 'image/jpeg',
        name: 'photo.jpg',
      } as any);

      formData.append('upload_preset', uploadPreset);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      const data = await response.json();
      const secureUrl = data.secure_url;

      // Sauvegarde l'URL de l'image
      await AsyncStorage.setItem(CLOUDINARY_URL_KEY, secureUrl);
      console.log('Image uploadée et sauvegardée:', secureUrl);
      setCloudinaryUrl(secureUrl); // Mise à jour de l'URL de la photo
    } catch (error) {
      console.error("Erreur lors de l'upload:", error);
    }
  };

  const openCamera = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

      if (!permissionResult.granted) {
        alert("Vous devez autoriser l'accès à la caméra pour utiliser cette fonctionnalité");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        const imageUri = result.assets[0].uri;
        setImageUri(imageUri);
        await uploadToCloudinary(imageUri); // Upload image to Cloudinary
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Capture d'image</Text>
      <TouchableOpacity onPress={openCamera} style={styles.button}>
        <Text style={styles.buttonText}>📸 Prendre une photo</Text>
      </TouchableOpacity>

      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.userImg} />
      ) : (
        <Text>Aucune image sélectionnée</Text>
      )}
    </View>
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
  button: {
    padding: 10,
    backgroundColor: '#007AFF',
    borderRadius: 5,
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  userImg: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginTop: 20,
  },
});

export default Camera;
