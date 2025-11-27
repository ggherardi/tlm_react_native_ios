import DateTimePicker from '@react-native-community/datetimepicker';
import { FormControl, HStack, Input, NativeBaseProvider, TextArea } from 'native-base';
import React, { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import GlobalStyles, { ThemeColors } from '../lib/GlobalStyles';
import { Utility } from '../lib/Utility';
import { ExpenseReport } from '../lib/models/ExpenseReport';
import dataContext from '../lib/models/DataContext';
import { InputNumber } from '../lib/components/InputNumberComponent';
import { BusinessEvent } from '../lib/models/BusinessEvent';
import { Constants } from '../lib/Constants';
import { useCustomHeaderWithButtonAsync } from '../lib/components/CustomHeaderComponent';
import ModalLoaderComponent from '../lib/components/ModalWithLoader';
import { FormErrorMessageComponent } from '../lib/components/FormErrorMessageComponent';
import { FileManager } from '../lib/FileManager';
import NavigationHelper from '../lib/NavigationHelper';

const expenseItems = [
  'cena',
  'pagamento servizi per ospiti',
  'parcheggio',
  'pedaggi',
  'pranzo',
  'taxi',
  'ticket mezzi pubblici',
  'altro',
];

const EditExpenseReportScreen = ({ route, navigation }: any) => {
  const expense: ExpenseReport = route.params.expense;
  const event: BusinessEvent = route.params.event;

  const [expenseName, setExpenseName] = useState(expense.name);
  const [expenseDescription, setExpenseDescription] = useState(expense.description ?? '');
  const [expenseDate, setExpenseDate] = useState<Date | undefined>(new Date(expense.date));
  const [expenseAmount, setExpenseAmount] = useState(expense.amount.toString());
  const [showDateTimePicker, setShowDateTimePicker] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    dataContext.setExpenseReportsKey(event.expensesDataContextKey);
    useCustomHeaderWithButtonAsync(
      navigation,
      Utility.GetEventHeaderTitle(event),
      () => saveExpenseReport(),
      undefined,
      'Modifica spesa',
      false,
      'salva',
    );
  }, [navigation, event]);

  const handleExpenseDescriptionChange = (e: any) => setExpenseDescription(e.nativeEvent.text);
  const handleExpenseAmount = (e: any) => setExpenseAmount(e.nativeEvent.text);

  const saveExpenseReport = async () => {
    setIsLoading(true);
    if (!validate()) {
      setIsLoading(false);
      return;
    }
    try {
      const expenses = dataContext.ExpenseReports.getAllData();
      const idx = expenses.findIndex((e) => e.id === expense.id);
      if (idx === -1) {
        setIsLoading(false);
        return;
      }
      const updatedExpense = { ...expense };
      updatedExpense.name = expenseName.trim();
      updatedExpense.description = expenseDescription.trim();
      updatedExpense.amount = Number(expenseAmount);
      updatedExpense.date = (expenseDate as Date).toString();
      updatedExpense.timeStamp = new Date().toString();

      expenses[idx] = updatedExpense;
      dataContext.ExpenseReports.saveData(expenses);

      Utility.ShowSuccessMessage('Spesa aggiornata correttamente');
      NavigationHelper.getEventTabNavigation().navigate(Constants.Navigation.Event);
    } catch {
      // ignore for now
    }
    setIsLoading(false);
  };

  const validate = (): boolean => {
    let isValid = true;
    let validationErrorsTemp: Record<string, string> = {};
    if (!expenseName) {
      validationErrorsTemp = { ...validationErrorsTemp, expenseName: 'Campo obbligatorio' };
      isValid = false;
    }
    if (!expenseDate) {
      validationErrorsTemp = { ...validationErrorsTemp, expenseDate: 'Campo obbligatorio' };
      isValid = false;
    }
    if (!expenseAmount) {
      validationErrorsTemp = { ...validationErrorsTemp, expenseAmount: 'Campo obbligatorio' };
      isValid = false;
    }
    if (expenseName == 'altro' && !expenseDescription) {
      validationErrorsTemp = { ...validationErrorsTemp, expenseDescription: 'Campo obbligatorio' };
      isValid = false;
    }
    setValidationErrors(validationErrorsTemp);
    return isValid;
  };

  const scrollToY = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd();
    }, 100);
  };

  return (
    <NativeBaseProvider>
      <ModalLoaderComponent isLoading={isLoading} text="Aggiornamento spesa in corso.." />
      <KeyboardAvoidingView behavior={Platform.OS == 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={100}>
        <ScrollView ref={scrollViewRef} style={styles.container}>
          <FormControl style={GlobalStyles.mt15} isRequired isInvalid={'expenseName' in validationErrors}>
            <FormControl.Label>Titolo spesa</FormControl.Label>
            <ScrollView horizontal={true} contentContainerStyle={{ flexGrow: 1 }} scrollEnabled={false}>
              <View style={{ width: '100%' }}>
                <HStack>
                  <Input
                    flex={1}
                    value={expenseName}
                    placeholder="Titolo spesa"
                    onChangeText={(val) => setExpenseName(val)}
                    borderColor={'expenseName' in validationErrors ? 'red.500' : 'gray.300'}
                  />
                </HStack>
              </View>
            </ScrollView>
            <FormErrorMessageComponent text="Campo obbligatorio" field="expenseName" validationArray={validationErrors} />
          </FormControl>

          <FormControl style={GlobalStyles.mt15} isRequired isInvalid={'expenseAmount' in validationErrors}>
            <FormControl.Label>Importo della spesa ({event.mainCurrency.symbol})</FormControl.Label>
            <InputNumber defaultValue={Number(expenseAmount)} placeholder="es. 50.5" onChange={handleExpenseAmount} isRequired={true} />
            <FormErrorMessageComponent text="Campo obbligatorio" field="expenseAmount" validationArray={validationErrors} />
          </FormControl>

          <FormControl style={GlobalStyles.mt15} isRequired isInvalid={'expenseDate' in validationErrors}>
            <FormControl.Label>Data della spesa</FormControl.Label>
            <Input
              caretHidden={true}
              showSoftInputOnFocus={false}
              placeholder="gg/mm/aaaa"
              onPressIn={() => setShowDateTimePicker(true)}
              value={expenseDate ? Utility.FormatDateDDMMYYYY(expenseDate.toString()) : ''}
            />
            {showDateTimePicker && (
              <DateTimePicker
                mode="date"
                themeVariant="light"
                display="inline"
                locale="it-IT"
                value={expenseDate ? expenseDate : new Date()}
                onChange={(event, date) => {
                  setShowDateTimePicker(false);
                  setExpenseDate(date as Date);
                }}
              />
            )}
            <FormErrorMessageComponent text="Campo obbligatorio" field="expenseDate" validationArray={validationErrors} />
          </FormControl>

          <FormControl style={GlobalStyles.mt15} isRequired={expenseName == 'altro'} isInvalid={'expenseDescription' in validationErrors}>
            <FormControl.Label>Descrizione della spesa</FormControl.Label>
            <TextArea
              autoCompleteType={true}
              placeholder="es. Taxi per trasferimento aeroporto"
              value={expenseDescription}
              onChange={handleExpenseDescriptionChange}
              onFocus={scrollToY}
              isInvalid={'expenseDescription' in validationErrors}
            />
            <FormErrorMessageComponent
              text='Campo obbligatorio con voce "altro" selezionata'
              field="expenseDescription"
              validationArray={validationErrors}
            />
          </FormControl>
        </ScrollView>
      </KeyboardAvoidingView>
    </NativeBaseProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    height: '100%',
    padding: 20,
    backgroundColor: 'white',
  },
  image: {
    height: 50,
    width: 50,
    marginRight: 10,
  },
});

export default EditExpenseReportScreen;
