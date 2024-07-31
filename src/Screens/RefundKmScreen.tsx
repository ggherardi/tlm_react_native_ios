import DateTimePicker from '@react-native-community/datetimepicker';
import { FormControl, Input, NativeBaseProvider, TextArea, Checkbox } from 'native-base';
import React, { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import { InputSideButton } from '../lib/components/InputSideButtonComponent';
import GlobalStyles from '../lib/GlobalStyles';
import { BusinessEvent } from '../lib/models/BusinessEvent';
import { Utility } from '../lib/Utility';
import dataContext from '../lib/models/DataContext';
import { useCustomHeaderWithButtonAsync } from '../lib/components/CustomHeaderComponent';
import { Currency, GetCurrencies, GetCurrency } from '../lib/data/Currencies';
import { InputNumber } from '../lib/components/InputNumberComponent';
import { FormErrorMessageComponent } from '../lib/components/FormErrorMessageComponent';
import ModalLoaderComponent from '../lib/components/ModalWithLoader';
import { Constants } from '../lib/Constants';

const RefundKmScreen = ({ navigation, route }: any) => {
  const event: BusinessEvent = route.params.event;
  const [events, setEvents] = useState(dataContext.Events.getAllData())
  const [needCarRefund, setNeedCarRefund] = useState(event.needCarRefund);
  const [startingCity, setStartingCity] = useState(event.refundStartingCity);
  const [arrivalCity, setArrivalCity] = useState(event.refundArrivalCity);
  const [totalTravelledKms, setTotalTravelledKms] = useState(event.totalTravelledKms);
  const [travelDate, setTravelDate] = useState<Date | undefined>(event.travelDate ? new Date(event.travelDate) : new Date());
  const [travelDateString, setTravelDateString] = useState<string>(event.travelDate ? event.travelDate : new Date().toString());
  const [refundForfait, setRefundForfait] = useState(event.travelRefundForfait);
  const [isFormValid, setIsFormValid] = useState(true);
  const [validationErrors, setValidationErrors] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showDateTimePicker, setShowDateTimePicker] = useState(false);

  useEffect(() => {
    useCustomHeaderWithButtonAsync(navigation, Utility.GetEventHeaderTitle(event), () => saveEvent(), undefined, 'Rimborso chilometrico', !isFormValid, 'salva');
  });

  const saveEvent = async () => {
    setIsLoading(true);
    if (!validate()) {
      setIsLoading(false);
      return;
    }
    const eventToEdit = events.find(e => e.id == event.id);
    if (eventToEdit) {
      console.log("TRAVEL DATE: ", travelDate);
      eventToEdit.needCarRefund = needCarRefund;
      eventToEdit.refundStartingCity = startingCity;
      eventToEdit.refundArrivalCity = arrivalCity;
      eventToEdit.totalTravelledKms = totalTravelledKms;
      eventToEdit.travelDate = (travelDate as Date).toString();
      eventToEdit.travelRefundForfait = refundForfait;
      dataContext.Events.saveData(events);
      Utility.ShowSuccessMessage("Rimborso chilometrico modificato correttamente");
      navigation.navigate(Constants.Navigation.EventHome, { event: eventToEdit });
      setIsLoading(false);
    }
  };

  const validate = (): boolean => {
    let isValid = true;
    let validationErrorsTemp = {};

    if (!startingCity) {
      validationErrorsTemp = { ...validationErrorsTemp, startingCity: 'Campo obbligatorio' };
      isValid = false;
    }
    if (!arrivalCity) {
      validationErrorsTemp = { ...validationErrorsTemp, arrivalCity: 'Campo obbligatorio' };
      isValid = false;
    }
    if (!totalTravelledKms) {
      validationErrorsTemp = { ...validationErrorsTemp, totalTravelledKms: 'Campo obbligatorio' };
      isValid = false;
    }
    if (!travelDate) {
      validationErrorsTemp = { ...validationErrorsTemp, travelDate: 'Campo obbligatorio' };
      isValid = false;
    }
    if (!refundForfait || refundForfait == 0) {
      validationErrorsTemp = { ...validationErrorsTemp, refundForfait: 'Campo obbligatorio' };
      isValid = false;
    }

    setValidationErrors(validationErrorsTemp);
    return isValid;
  }

  return (
    <NativeBaseProvider>
      <ModalLoaderComponent isLoading={isLoading} text='Modifica evento in corso..' />
      <ScrollView contentContainerStyle={styles.container}>
        <FormControl style={GlobalStyles.mt15}>
          <Checkbox value="Rimborso chilometrico" defaultIsChecked={needCarRefund} onChange={(e) => setNeedCarRefund(e)}>Rimborso chilometrico</Checkbox>
        </FormControl>
        {needCarRefund && (
          <View>
            <FormControl style={GlobalStyles.mt15} isRequired isInvalid={'startingCity' in validationErrors}>
              <FormControl.Label>Località di partenza (città)</FormControl.Label>
              <Input defaultValue={event.refundStartingCity} placeholder="es. Roma" onChange={(e) => setStartingCity(e.nativeEvent.text)}></Input>
              <FormErrorMessageComponent text='Campo obbligatorio' field='startingCity' validationArray={validationErrors} />
            </FormControl>
            <FormControl style={GlobalStyles.mt15} isRequired isInvalid={'arrivalCity' in validationErrors}>
              <FormControl.Label>Località di arrivo (città)</FormControl.Label>
              <Input defaultValue={event.refundArrivalCity} placeholder="es. Firenze" onChange={(e) => setArrivalCity(e.nativeEvent.text)}></Input>
              <FormErrorMessageComponent text='Campo obbligatorio' field='arrivalCity' validationArray={validationErrors} />
            </FormControl>
            <FormControl style={GlobalStyles.mt15} isRequired isInvalid={'totalTravelledKms' in validationErrors}>
              <FormControl.Label>Totale KM percorsi</FormControl.Label>
              <InputNumber defaultValue={event.totalTravelledKms} placeholder="es. 35.8" onChange={(e: any) => setTotalTravelledKms(e.nativeEvent.text)}></InputNumber>
              <FormErrorMessageComponent text='Campo obbligatorio' field='totalTravelledKms' validationArray={validationErrors} />
            </FormControl>
            <FormControl style={GlobalStyles.mt15} isRequired isInvalid={'travelDate' in validationErrors}>
              <FormControl.Label>Data della spesa</FormControl.Label>
              <Input
                caretHidden={true}
                placeholder="gg/mm/aaaa"
                onPressIn={() => setShowDateTimePicker(true)}
                value={travelDateString ? Utility.FormatDateDDMMYYYY(travelDateString) : ''}
                InputLeftElement={
                  <InputSideButton
                    icon="calendar-day"
                    iconStyle={GlobalStyles.iconPrimary}
                    pressFunction={() => {
                      setShowDateTimePicker(true);
                    }}
                  />
                }
              />
              {showDateTimePicker && (
                <DateTimePicker
                  mode="date"
                  display="inline"
                  locale="it-IT"
                  value={travelDate ? travelDate : new Date()}
                  onChange={(event, date) => {
                    setShowDateTimePicker(false);
                    setTravelDate(date as Date);
                    setTravelDateString((date as Date)?.toString())
                  }}
                />
              )}
              <FormErrorMessageComponent text='Campo obbligatorio' field='travelDate' validationArray={validationErrors} />
            </FormControl>
            <FormControl style={GlobalStyles.mt15} isRequired isInvalid={'refundForfait' in validationErrors}>
              <FormControl.Label>Importo rimborso forfetario (€)</FormControl.Label>
              <InputNumber defaultValue={event.travelRefundForfait} placeholder="es. 0.20" onChange={(e: any) => { console.log("Setting: ", e.nativeEvent.text); setRefundForfait(e.nativeEvent.text) }}></InputNumber>
              <FormErrorMessageComponent text='Campo obbligatorio' field='refundForfait' validationArray={validationErrors} />
            </FormControl>
          </View>
        )}
      </ScrollView>
    </NativeBaseProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 30,
  }
});

export default RefundKmScreen;
