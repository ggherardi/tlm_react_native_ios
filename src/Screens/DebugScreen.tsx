import { useEffect, useState } from 'react';
import React, { Button, Image, ScrollView } from 'react-native';
import DocumentScanner, { ResponseType } from 'react-native-document-scanner-plugin'
import { FileManager } from '../lib/FileManager';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
// import TextRecognition from '@react-native-ml-kit/text-recognition';
// import MlkitOcr from 'react-native-mlkit-ocr';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons/faWhatsapp';
import { Utility } from '../lib/Utility';
import dataContext from '../lib/models/DataContext';
import ReactNativeBlobUtil, { ReactNativeBlobUtilStat } from 'react-native-blob-util';
import NavigationHelper from '../lib/NavigationHelper';
import { Constants } from '../lib/Constants';
import { Input, NativeBaseProvider } from 'native-base';
import { NativeBaseConfigProvider } from 'native-base/lib/typescript/core/NativeBaseContext';

// @ts-ignore
const DebugScreen = ({ navigation }) => {
  const [scannedImage, setScannedImage] = useState<string>();
  const [photo, setPhoto] = useState<any>();
  const [directoryPath, setDirectoryPath] = useState("/var/mobile/Containers/Data/Application/9063147D-80E4-41EB-968D-1F997A991A9E/Documents/mmkv")

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

  const goBack = () => {
    console.log(navigation);
    navigation.replace(Constants.Navigation.Home);
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

  const readProfile = () => {
    console.log(dataContext.Events);
    const profile = Utility.GetUserProfile();
    // console.log(profile);
  }

  const stat = async () => {
    const stat: ReactNativeBlobUtilStat = await FileManager.stat(ReactNativeBlobUtil.fs.dirs.DocumentDir);
    console.log("Stat: ", stat);
  }

  const ls = async () => {
    const directories: ReactNativeBlobUtilStat[] = await FileManager.ls(ReactNativeBlobUtil.fs.dirs.DocumentDir);
    for (const dir in directories) {
      console.log(`[${dir}]`, directories[dir]);
    }
  }

  const listDirectory = async () => {
    const directories: ReactNativeBlobUtilStat[] = await FileManager.ls(directoryPath);
    for (const dir in directories) {
      console.log(`[${dir}]`, directories[dir]);
    }
  }

  const expenses = () => {
    console.log(dataContext.ExpenseReports.getAllData());
  }

  return (
    <NativeBaseProvider>
      <ScrollView>
        <Button title={'Read Profile'} onPress={readProfile} />
        <Button title={'Stat'} onPress={stat} />
        <Button title={'List Directories'} onPress={ls} />
        <Input multiline={true} defaultValue={directoryPath} placeholder="Directory"></Input>
        <Button title={'List Directory'} onPress={listDirectory} />
        <Button title={'Expenses'} onPress={expenses} />
        {/* <Image
        resizeMode="contain"
        style=
      source=
    /> */}
      </ScrollView>
    </NativeBaseProvider>
)}

export default DebugScreen;