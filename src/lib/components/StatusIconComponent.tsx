import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import GlobalStyles, { ThemeColors } from '../GlobalStyles';
import { BusinessEvent } from '../models/BusinessEvent';
import { Utility } from '../Utility';

interface IStatusIconProps {
  event: BusinessEvent;
}

export const StatusIconComponent = (props: IStatusIconProps) => {
  let icon: IconProp = 'hourglass-start';
  let color = ThemeColors.info;
  const todayDate = new Date();
  const daysToEventEnd = Utility.GetNumberOfDaysBetweenDates(todayDate.toString(), props.event.endDate);    
  if (props.event.sentToCompany) {
    icon = 'circle-check';
    color = ThemeColors.green;
  } else {
    if (daysToEventEnd >= 0 && daysToEventEnd <= 3) {
      icon = 'hourglass-half';
      color = ThemeColors.warning;
    }
    if (daysToEventEnd < 0) {
      icon = 'hourglass-end';
      color = ThemeColors.danger;
    }
  }
  return (<FontAwesomeIcon icon={icon} color={color} />);
};
