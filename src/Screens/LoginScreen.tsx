import { Button, FormControl, Input, NativeBaseProvider, ScrollView } from 'native-base';
import { Dimensions, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import GlobalStyles, { ThemeColors } from '../lib/GlobalStyles';
import { Utility } from '../lib/Utility';
import { UserProfile } from '../lib/models/UserProfile';
import React, { useState, useEffect } from 'react';
import dataContext from '../lib/models/DataContext';
import LoginInputComponent from '../lib/components/LoginInputComponent';
import { Images } from '../assets/Images';
import { Constants } from '../lib/Constants';
import LoaderComponent, { LoaderSize } from '../lib/components/LoaderComponent';

const LoginScreen = ({ navigation, route }: any) => {
  const [userProfile, setUserProfile] = useState<UserProfile>(Utility.GetUserProfile());
  const [name, setName] = useState(userProfile.name);
  const [surname, setSurname] = useState(userProfile.surname);
  const [email, setEmail] = useState(userProfile.email);
  const [appHeight, setAppHeight] = useState(Dimensions.get('window').height);
  const [isLoading, setIsLoading] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (userProfile && userProfile.name && userProfile.surname && userProfile.email) {
      setIsLoading(true);
      Utility.ShowSuccessMessage(`Bentornato, ${userProfile.name}`);
      navigation.replace(Constants.Navigation.Home);
      setIsLoading(false);
    }
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
    profile.email = email ? email.trim() : '';
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
    if (!email) {
      validationErrorsTemp = { ...validationErrorsTemp, email: 'Campo obbligatorio' };
      isValid = false;
    }
    setValidationErrors(validationErrorsTemp);
    return isValid;
  }

  return (
    <NativeBaseProvider>
      <View style={[styles.container]} onLayout={(e) => setAppHeight(e.nativeEvent.layout.height)}>
        <Image source={Images.tlm_logo.rnSource} style={[styles.image]} />
        <View>
          <FormControl style={GlobalStyles.mt15} isRequired isInvalid={"name" in validationErrors}>
            <LoginInputComponent defaultValue={name} placeholder='nome*' onChange={(e: any) => setName(e.nativeEvent.text)} borderColor={"name" in validationErrors ? 'red.500' : 'gray.300'} />
          </FormControl>
          <FormControl style={GlobalStyles.mt15} isRequired isInvalid={"surname" in validationErrors}>
            <LoginInputComponent defaultValue={surname} placeholder='cognome*' onChange={(e: any) => setSurname(e.nativeEvent.text)} borderColor={"surname" in validationErrors ? 'red.500' : 'gray.300'} />
          </FormControl>
          <FormControl style={GlobalStyles.mt15} isRequired isInvalid={"email" in validationErrors}>
            <LoginInputComponent defaultValue={email} placeholder='email*' onChange={(e: any) => setEmail(e.nativeEvent.text)} keyboardType='email-address' borderColor={"email" in validationErrors ? 'red.500' : 'gray.300'} />
          </FormControl>
          <Pressable style={({ pressed }) => [{ opacity: pressed ? 0.2 : 1 }, GlobalStyles.mt15]} onPress={() => login()}>
            <Text style={[styles.button]}>{isLoading ? (<LoaderComponent color={ThemeColors.white} size={LoaderSize.small} />) : ('ACCEDI')}</Text>
          </Pressable>
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
  image: {
    width: 200,
    alignSelf: 'center',
    resizeMode: 'contain'
  },
  button: {
    alignSelf: 'center',
    textAlign: 'center',
    height: 40,
    verticalAlign: 'middle',
    backgroundColor: ThemeColors.primary,
    borderRadius: 50,
    width: '100%',
    color: ThemeColors.white
  }
});

export default LoginScreen;