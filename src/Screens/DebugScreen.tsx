import { useEffect, useState } from 'react';
import React, { Button, Image, ScrollView } from 'react-native';
import DocumentScanner, { ResponseType } from 'react-native-document-scanner-plugin'
import { FileManager } from '../lib/FileManager';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
// import TextRecognition from '@react-native-ml-kit/text-recognition';
// import MlkitOcr from 'react-native-mlkit-ocr';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons/faWhatsapp';

// @ts-ignore
const DebugScreen = ({ navigation }) => {
  const [scannedImage, setScannedImage] = useState<string>();
  const [photo, setPhoto] = useState<any>();

  const scanDocument = async () => {
    try {
      const { scannedImages } = await DocumentScanner.scanDocument({
        responseType: ResponseType.ImageFilePath
      });
      if (scannedImages && scannedImages.length > 0) {
        // const base64Image = scannedImages[0];
        const scannedImage = scannedImages[0];
        const tempPhoto = {
          uri: `${scannedImage}`,
          type: 'image/jpg'
        }
        setPhoto(tempPhoto);
        // const resultFromUri = await MlkitOcr.detectFromUri(photo.uri);
        // console.log(resultFromUri);
      }
    } catch (err) {
      console.log(err);
    }
  }

  const imagePickerCommonOptions = { mediaType: "photo", maxWidth: 800, maxHeight: 600, includeBase64: true };
  const onSelectImagePress = async () => {
    let hasPermissions: boolean = false;
    try {
      const permissions = await FileManager.checkStorageReadPermissions();
      hasPermissions = permissions.success;
    } catch (err) {
      hasPermissions = false;
    }
    if (!hasPermissions) {
      return;
    }
    // @ts-ignore
    launchImageLibrary(imagePickerCommonOptions, onImageSelect);
  }

  const onImageSelect = async (media: any) => {
    if (!media.didCancel && media.assets[0]) {
      const photo = media.assets[0];
      setPhoto(photo);
      // const resultFromUri = await MlkitOcr.detectFromUri(photo.uri);
      // console.log(resultFromUri);
            
      /* GG: WIP total amount recognition */
      let newArr: any[] = [];
      // resultFromUri.map(a => { 
      //     const splittedText = a.text.replace(',', '.').split(' ');    
      //     splittedText.map(st => { 
      //         if (st.indexOf('.') > -1 && !isNaN(Number(st))) { 
      //             newArr = [...newArr, Number(st)];
      //         }
      //     });    
      //     return splittedText;
      // })
      const guessedTotalAmount = Math.max(...newArr);
    }
  };

  console.log("Image: ", scannedImage);
  useEffect(() => {
    // call scanDocument on load
    FileManager.checkCameraPermissions();
  }, []);

  const debug = () => {

  };

  return (
    <ScrollView>
      <Button title={'Debug button'} onPress={scanDocument} />
      <Button title={'Pick image'} onPress={onSelectImagePress} />
      <FontAwesomeIcon icon={faWhatsapp} />
      {/* <Image
        resizeMode="contain"
        style=
      source=
    /> */}
    </ScrollView>);
}

export default DebugScreen;