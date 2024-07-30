import React, { useEffect, useRef, useState } from 'react';
import { BusinessEvent } from '../models/BusinessEvent';
import { Pressable, StyleSheet, Text, Alert, Animated, View, Button, I18nManager } from 'react-native';
import { Row, VStack } from 'native-base';
import { Utility } from '../Utility';
import { GestureHandlerRootView, RectButton, Swipeable } from 'react-native-gesture-handler';
import { InputSideButton } from './InputSideButtonComponent';
import dataContext from '../models/DataContext';
import { ThemeColors } from '../GlobalStyles';
import { Constants } from '../Constants';
import DataContext from '../models/DataContext';
import { ExpenseReport } from '../models/ExpenseReport';
import { StatusTextComponent } from './StatusTextComponent';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { renderRightAction } from './SwipableActionsComponent';

interface IHomeDataRow {
    event: BusinessEvent;
    onDelete: Function;
    index: number;
    navigation: any;
}

export const HomeDataRowComponent = ({ event, onDelete, index, navigation }: IHomeDataRow) => {
    const [expenses, setExpenses] = useState<ExpenseReport[]>(Utility.GetExpensesForEvent(event));
    const [stateEvent, setStateEvent] = useState<BusinessEvent>(event);
    const tempExpenses = expenses.slice();
    tempExpenses.push(ExpenseReport.generateKmRefund(event));
    const totalAmount = Utility.CalculateTotalAmount(tempExpenses, 'amount') - event.cashFund;
    const swipableRef = useRef<Swipeable>(null);
    
    const goToEvent = () => {
        navigation.navigate(Constants.Navigation.EventHome, { event: event });
    };

    useEffect(() => {        
        const userProfile = Utility.GetUserProfile();
        if (!userProfile.swipeTutorialSeen && index == 0) {
            setTimeout(() => Utility.SwipableHint(swipableRef), 200);
            userProfile.swipeTutorialSeen = true;
            dataContext.UserProfile.saveData([userProfile]);
        }
    }, []);    

    const renderRightActions = () => (
        <View style={{ width: 160, flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row' }}>
            {!stateEvent.sentToCompany ? (
                <>
                    {renderRightAction("Nota spesa inviata?", 'circle-check', ThemeColors.green, setSentToCompany, swipableRef)}
                </>
            ) : (
                <>
                    {renderRightAction("Nota spese da inviare?", 'arrow-rotate-left', '#ffab00', cancelSentToCompany, swipableRef)}
                </>
            )}
            {renderRightAction("Cancellare l'evento?", 'trash', '#dd2c00', deleteEvent, swipableRef)}
        </View>
    );

    const setSentToCompany = (swipbaleRef: any) => {
        const events = dataContext.Events.getAllData();
        const eventToEdit = events.find(e => e.id == event.id);
        if (eventToEdit) {
            eventToEdit.sentToCompany = true;
            dataContext.Events.saveData(events);
            setStateEvent(eventToEdit);
            // This is not working!
            BusinessEvent.deleteNotifications(event);
            swipableRef?.current?.close();
        }
    }

    const cancelSentToCompany = (swipableRef: any) => {
        const events = dataContext.Events.getAllData();
        const eventToEdit = events.find(e => e.id == event.id);
        if (eventToEdit) {
            eventToEdit.sentToCompany = false;
            dataContext.Events.saveData(events);
            setStateEvent(eventToEdit);
            BusinessEvent.scheduleNotifications(event);
            swipableRef?.current?.close();
        }
    }

    const deleteEvent = (swipableRef: any) => {
        const onDeleteConfirm = () => {
            dataContext.Events.deleteWhere(event.id);
            DataContext.deleteEntryWithKey(event.expensesDataContextKey);
            onDelete();
            Utility.ShowSuccessMessage("Evento cancellato correttamente");
            swipableRef?.current?.close();
        }
        Alert.alert("Conferma cancellazione", "Tutti i dati legati all'evento verranno rimossi dal dispositivo.", [
            { text: "Ok", onPress: onDeleteConfirm },
            { text: "Annulla", style: "cancel" }
        ]);
    };

    Utility.OnFocus({ navigation: navigation, onFocusAction: () => setExpenses(Utility.GetExpensesForEvent(event)) });

    const eventTotalDays = Math.floor(Utility.GetNumberOfDaysBetweenDates(event.startDate, event.endDate));

    return (
        <GestureHandlerRootView>
            <Swipeable ref={swipableRef} key={`swipable_${event.name}_${index}_${Utility.GenerateRandomGuid()}`} renderRightActions={renderRightActions} overshootRight={false}>
                <Pressable key={`pressable_${event.name}_${index}_${Utility.GenerateRandomGuid()}`}
                    onPress={goToEvent} style={({ pressed }) => [
                        styles.container, { backgroundColor: pressed ? ThemeColors.selected : ThemeColors.white, borderTopWidth: index == 0 ? 1 : 0, borderBottomWidth: 1, borderColor: ThemeColors.lightGray }]}>
                    <Row>
                        <Text style={[styles.day]}>{Utility.FormatDateDDMM(event.startDate)} - {Utility.FormatDateDDMM(event.endDate)}</Text>
                        <StatusTextComponent event={stateEvent} />
                    </Row>
                    <Row>
                        <VStack style={styles.eventNameContainer}>
                            <Text style={[styles.eventName]}>{event.name}</Text>
                            <Text style={[styles.eventDescription]} numberOfLines={1}>{event.city}: {eventTotalDays} giorn{eventTotalDays > 1 ? 'i' : 'o'}</Text>
                        </VStack>
                        <VStack style={styles.totalAmountContainer}>
                            {stateEvent.sentToCompany ? (
                                <Text style={[styles.totalAmountText, { color: totalAmount >= 0 ? ThemeColors.green : ThemeColors.danger }]}>{totalAmount >= 0 ? "rimborso" : "rimborso"}</Text>
                            ) : (
                                <Text style={[styles.totalAmountText, { color: totalAmount >= 0 ? ThemeColors.green : ThemeColors.danger }]}>{totalAmount >= 0 ? "devi ricevere" : "devi restituire"}</Text>
                            )}
                            <Text style={[styles.totalAmountText, { color: totalAmount >= 0 ? ThemeColors.green : ThemeColors.danger }]}>{Math.abs(totalAmount)} {event.mainCurrency.symbol}</Text>
                        </VStack>
                    </Row>
                </Pressable>
            </Swipeable>
        </GestureHandlerRootView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexWrap: 'wrap',
        maxWidth: '100%',
        paddingHorizontal: 5,
        paddingVertical: 10,
        backgroundColor: ThemeColors.white
    },
    dateContainer: {
        flex: 1,
        flexDirection: 'column'
    },
    daysContainer: {
        flex: 1
    },
    eventNameContainer: {
        flex: 7,
        // paddingLeft: 10,
    },
    totalAmountContainer: {
        justifyContent: 'center',
        flex: 3
    },
    totalAmountText: {
        textAlign: 'right',
        fontSize: 12
    },
    day: {
        alignSelf: 'center',
        fontSize: 10
    },
    eventName: {
        fontSize: 17,
        fontWeight: 'bold'
    },
    eventDescription: {

    },
    swipedRow: {
        flexDirection: 'row',
        flex: 1,
        alignItems: 'center',
        paddingLeft: 5,
        minHeight: 50,
    },
    setEmailSentSwipedRow: {
        backgroundColor: ThemeColors.green,
    },
    restoreEmailSentSwipedRow: {
        backgroundColor: ThemeColors.warning,
    },
    deleteSwipedRow: {
        backgroundColor: '#d0342c',
    },
    deleteConfirmationText: {
        color: '#fcfcfc',
        fontWeight: 'bold',
        alignSelf: 'center'
    },
    deleteButton: {
        backgroundColor: '#b60000',
        flexDirection: 'column',
        justifyContent: 'center',
        height: '100%',
    },
    deleteButtonText: {
        color: '#fcfcfc',
        fontWeight: 'bold',
        padding: 3,
    },
    swipedConfirmationContainer: {
        flex: 1,
    },
    actionText: {
        color: 'white',
        fontSize: 16,
        backgroundColor: 'transparent',        
    },
});