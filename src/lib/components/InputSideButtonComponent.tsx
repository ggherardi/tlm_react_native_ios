import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { Box, Icon } from 'native-base';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import GlobalStyles, { ThemeColors } from '../GlobalStyles';
import { Utility } from '../Utility';

interface IInputSideButtonProps {
  pressFunction: Function;
  icon: IconProp | undefined;
  iconColor?: string;
  iconStyle?: any;
  stretchHeight?: boolean;
  text?: string;
  size?: number;
  isDisabled?: boolean;
  textPosition?: TextPosition;
  fontSize?: number;
}

type TextPosition = 'top' | 'start' | 'end' | 'bottom';

export const InputSideButton = ({ pressFunction, icon, iconColor = ThemeColors.primary, iconStyle, stretchHeight, text, size, isDisabled = false, textPosition = 'start', fontSize = 15 }: IInputSideButtonProps) => (
  <Pressable onPress={() => pressFunction()} style={({ pressed }) => [{
    opacity: pressed ? 0.2 : 1,
    height: stretchHeight ? "100%" : "auto"
  }, styles.btnBox]} disabled={isDisabled}>
    {textPosition == 'top' && (
      <View>
        {Utility.IsNotNullOrUndefined(text) && (
          <Text style={{ color: isDisabled ? ThemeColors.inactive : ThemeColors.white, fontSize: fontSize, paddingBottom: 5, alignSelf: 'center', textAlign: 'center' }}>{text}</Text>
        )}
        {icon ? (
          <FontAwesomeIcon style={[iconStyle ? iconStyle : GlobalStyles.iconPrimary, { alignSelf: 'center', color: isDisabled ? ThemeColors.inactive : iconColor }]} icon={icon} size={size ? size : 20} />
        ) : (<></>)
        }
      </View>
    )}
    {textPosition == 'start' && (
      <View style={[GlobalStyles.flexRow]}>
        {Utility.IsNotNullOrUndefined(text) && (
          <Text style={{ color: isDisabled ? ThemeColors.inactive : ThemeColors.white, fontSize: fontSize }}>{text}</Text>
        )}
        {icon ? (
          <FontAwesomeIcon style={[iconStyle ? iconStyle : GlobalStyles.iconPrimary, { color: isDisabled ? ThemeColors.inactive : iconColor }]} icon={icon} size={size ? size : 20} />
        ) : (<></>)
        }
      </View>
    )}
    {textPosition == 'end' && (
      <View style={[GlobalStyles.flexRow]}>
        {Utility.IsNotNullOrUndefined(text) && (
          <Text style={{ color: isDisabled ? ThemeColors.inactive : ThemeColors.white, fontSize: fontSize }}>{text}</Text>
        )}
        {icon ? (
          <FontAwesomeIcon style={[iconStyle ? iconStyle : GlobalStyles.iconPrimary, { color: isDisabled ? ThemeColors.inactive : iconColor }]} icon={icon} size={size ? size : 20} />
        ) : (<></>)
        }
      </View>
    )}
    {textPosition == 'bottom' && (
      <View>        
        {icon ? (
          <FontAwesomeIcon style={[iconStyle ? iconStyle : GlobalStyles.iconPrimary, { alignSelf: 'center', color: isDisabled ? ThemeColors.inactive : iconColor }]} icon={icon} size={size ? size : 20} />
        ) : (<></>)}
        {Utility.IsNotNullOrUndefined(text) && (
          <Text style={{ color: isDisabled ? ThemeColors.inactive : ThemeColors.white, fontSize: fontSize, paddingTop: 5, alignSelf: 'center', textAlign: 'center' }}>{text}</Text>
        )}
      </View>
    )}
  </Pressable>);

const styles = StyleSheet.create({
  btnBox: {
    justifyContent: 'center',
    paddingHorizontal: 15
  },  
})