import { Button, FormControl, Input, NativeBaseProvider, ScrollView } from 'native-base';
import { Dimensions, Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import GlobalStyles, { ThemeColors } from '../lib/GlobalStyles';
import { Utility } from '../lib/Utility';
import { UserProfile } from '../lib/models/UserProfile';
import React, { useState, useEffect } from 'react';
import dataContext from '../lib/models/DataContext';
import LoginInputComponent from '../lib/components/LoginInputComponent';
import { Images } from '../assets/Images';
import { Constants } from '../lib/Constants';
import { SaveConstants, Storage } from '../lib/DataStorage';
import LoaderComponent, { LoaderSize } from '../lib/components/LoaderComponent';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { VersionFile } from '../lib/models/VersionFile';
import { VersionData } from '../lib/models/VersionData';

const appVersion: string = require('../../package.json').version;

const LoginScreen = ({ navigation, route }: any) => {
  const [userProfile, setUserProfile] = useState<UserProfile>(Utility.GetUserProfile());
  const [name, setName] = useState(userProfile.name);
  const [surname, setSurname] = useState(userProfile.surname);
  const [email, setEmail] = useState(userProfile.email);
  const [appHeight, setAppHeight] = useState(Dimensions.get('window').height);
  const [isLoading, setIsLoading] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    (async () => {
      let doesAppNeedUpdate = false;
      let versionFileJson: VersionFile = {
        version_schema: 1,
        global_message: null,
        maintenance: { enabled: false, message: '' },
        ios: {
          latest_version: appVersion,
          min_supported_version: appVersion,
          force_update: false,
          store_url: '',
          message: '',
          changelog: [],
        },
        android: {
          latest_version: appVersion,
          min_supported_version: appVersion,
          force_update: false,
          store_url: '',
          message: '',
          changelog: [],
        },
      };

      const needsUpdateOffline = (versionFile: VersionFile): boolean => {
        if (!versionFile) {
          return false;
        }
        const minVersionToCheck = Utility.IsIOS() ? versionFile.ios.min_supported_version : versionFile.android.min_supported_version;
        return appVersion < minVersionToCheck;
      };

      const versionData: VersionData = Utility.GetVersionData();
      if (needsUpdateOffline(versionData.versionFile)) {
        navigation.replace(Constants.Navigation.UpdateApp, { versionFile: versionData.versionFile });
        return;
      }

      try {
        const versionFileUrl = !__DEV__ ? Constants.VersionCheck.VersionFileUrl : Constants.VersionCheck.VersionFileUrlDebug;
        console.log("VersionFileUrl: ", versionFileUrl);
        const jsonPromise = await fetch(versionFileUrl, {
          method: 'GET',
          headers: { Accept: 'application/json' }, 
        });
        versionFileJson = await jsonPromise.json();
        Storage.save(SaveConstants.versionFile.key, 'versionFile', versionFileJson);
        console.log(versionFileJson);
        const minVersionToCheck = Utility.IsIOS() ? versionFileJson.ios.min_supported_version : versionFileJson.android.min_supported_version;
        console.log(`${appVersion} < ${minVersionToCheck}? ${appVersion < minVersionToCheck}`);
        console.log(`Version to check: ${minVersionToCheck}`);
        doesAppNeedUpdate = appVersion < minVersionToCheck;
        console.log("Does app need updated? ", doesAppNeedUpdate);
      } catch (err) {
        console.log("Errore while fetching", err);
      }
      if (doesAppNeedUpdate) {
        console.log("navigating with ", versionFileJson.version_schema);
        navigation.replace(Constants.Navigation.UpdateApp, { versionFile: versionFileJson });
        return;
      }
      if (userProfile && userProfile.name && userProfile.surname) {
        console.log("Logging in..");
        setIsLoading(true);
        Utility.ShowSuccessMessage(`Bentornato, ${userProfile.name}`);
        navigation.replace(Constants.Navigation.Home);
        setIsLoading(false);
      }
    })();
  }, []);

  const login = () => {
    setIsDisabled(true);
    setIsLoading(true);
    if (!validate()) {
      setIsDisabled(false);
      setIsLoading(false);
      return;
    }
    console.log("Loading: ", isLoading);
    const profile = new UserProfile();
    profile.name = name ? name.trim() : '';
    profile.surname = surname ? surname.trim() : '';
    profile.email = email ? email.trim() : 'nota-spese@tourleadermanagement.ch';
    dataContext.UserProfile.saveData([profile]);
    Utility.ShowSuccessMessage(`Bentornato, ${profile.name}`);
    navigation.replace(Constants.Navigation.Home);
    setIsLoading(false);
    setIsDisabled(false);
  };

  const validate = (): boolean => {
    let isValid = true;
    let validationErrorsTemp = {};
    if (!name) {
      validationErrorsTemp = { ...validationErrorsTemp, name: 'Campo obbligatorio' };
      isValid = false;
    }
    if (!surname) {
      validationErrorsTemp = { ...validationErrorsTemp, surname: 'Campo obbligatorio' };
      isValid = false;
    }
    // if (!email) {
    //   validationErrorsTemp = { ...validationErrorsTemp, email: 'Campo obbligatorio' };
    //   isValid = false;
    // }
    setValidationErrors(validationErrorsTemp);
    return isValid;
  }

  return (
    <NativeBaseProvider>
      <View style={[styles.container]} onLayout={(e) => setAppHeight(e.nativeEvent.layout.height)}>
        <Image source={Images.tlm_logo_transparent.rnSource} style={[styles.image]} />
        <View>
          <Text style={[{ display: showInfo ? 'flex' : 'none' }, styles.descriptionText]}>Inserire nome e cognome che verranno visualizzati da TLM quando verrà inviata la nota spese. Sarà sempre possibile cambiarli dalle impostazioni.</Text>
          <FormControl style={GlobalStyles.mt15} isRequired isInvalid={"name" in validationErrors}>
            <LoginInputComponent defaultValue={name} placeholder='nome*' onChange={(e: any) => setName(e.nativeEvent.text)} borderColor={"name" in validationErrors ? 'red.500' : 'gray.300'} />
          </FormControl>
          <FormControl style={GlobalStyles.mt15} isRequired isInvalid={"surname" in validationErrors}>
            <LoginInputComponent defaultValue={surname} placeholder='cognome*' onChange={(e: any) => setSurname(e.nativeEvent.text)} borderColor={"surname" in validationErrors ? 'red.500' : 'gray.300'} />
          </FormControl>
          {/* <FormControl style={GlobalStyles.mt15} isRequired isInvalid={"email" in validationErrors}>
            <LoginInputComponent defaultValue={email} placeholder='email*' onChange={(e: any) => setEmail(e.nativeEvent.text)} keyboardType='email-address' borderColor={"email" in validationErrors ? 'red.500' : 'gray.300'} />
          </FormControl> */}
          <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly', gap: 10 }}>
            <Pressable style={({ pressed }) => [{ opacity: pressed ? 0.2 : 1, flex: 1 }, styles.buttonContainer, GlobalStyles.mt15]} onPress={() => setShowInfo(!showInfo)}>
            <FontAwesomeIcon style={{ color: 'white', alignSelf: 'center' }} icon={'info'} />
            </Pressable>
            <Pressable style={({ pressed }) => [{ opacity: pressed ? 0.2 : 1, flex: 6 }, styles.buttonContainer, GlobalStyles.mt15]} onPress={() => login()}>
              <Text style={[styles.buttonText]}>{isLoading ? (<LoaderComponent color={ThemeColors.white} size={LoaderSize.small} />) : ('SALVA')}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </NativeBaseProvider>
  )
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 30,
    marginTop: -50,
    flex: 1,
    height: '100%',
    justifyContent: 'center'
  },
  descriptionText: {
    textAlign: 'center',
    color: ThemeColors.primary
  },
  image: {
    width: 250,
    alignSelf: 'center',
    resizeMode: 'contain'
  },
  buttonText: {
    color: ThemeColors.white,
    lineHeight: 40,
    alignSelf: 'center'
  },
  buttonContainer: {
    justifyContent: 'center',
    height: 40,
    backgroundColor: ThemeColors.primary,
    borderRadius: 50
  }
});

export default LoginScreen;
