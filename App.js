import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, Image, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Firebase from 'firebase';

import { firebaseConfig } from "./firebase";
export default function App() {
  if(!Firebase.apps.length){
    Firebase.initializeApp(firebaseConfig)
  }
  const [image, setImage] = useState(null);
  const [uploadimg, setUploadimg] = useState("true")
  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          alert('Sorry, we need camera roll permissions to make this work!');
        }
      }
    })();
  }, []);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log(result);

    if (!result.cancelled) {
      setImage(result.uri);
    }
  };

  const uploadImage = async () => {
    const blob = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function() {
        resolve(xhr.response); // when BlobModule finishes reading, resolve with the blob
     };
     xhr.onerror = function() {
       reject(new TypeError('Network request failed')); // error occurred, rejecting
     };
     xhr.responseType = 'blob'; // use BlobModule's UriHandler
     xhr.open('GET', image, true); // fetch the blob from uri in async mode
     xhr.send(null); // no initial data
   });

   const ref = Firebase.storage().ref().child(new Date().toISOString())
   const snapshot = ref.put(blob)

   snapshot.on(
     Firebase.storage.TaskEvent.STATE_CHANGED, 
     () => {
    setUploadimg(true)
   },
   (error)=>{
     setUploadimg(false)
    console.log(error)
    blob.close();
    return;
   },
   ()=>{
    snapshot.snapshot.ref.getDownloadURL().then((url) => {
      setUploadimg(false)
      console.log("download url:", url)
      blob.close();
      return url;
    })
   
   });
  }

  return (
    <View style={styles.container}>
      <Image source={{uri:image}} style={{width: 300, height:300 }}/>
      <Button title="choose picutre" onPress={pickImage} />
        <Button title="upload" onPress={uploadImage} />
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
