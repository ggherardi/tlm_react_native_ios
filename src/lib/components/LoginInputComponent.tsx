import React from 'react';
import { Input } from 'native-base';
import { KeyboardTypeOptions } from 'react-native';
import { ColorType } from 'native-base/lib/typescript/components/types';

interface ILoginInputProps {
  defaultValue: string;
  placeholder: string;
  onChange: Function;
  keyboardType?: KeyboardTypeOptions;
  borderColor?: ColorType;
}

const LoginInputComponent = (props: ILoginInputProps) => {
  return (
    <Input
      defaultValue={props.defaultValue}      
      placeholder={props.placeholder}
      onChange={(e: any) => props.onChange(e)}
      borderRadius='full'
      borderColor={props.borderColor ? props.borderColor : 'gray.300'}
      backgroundColor={'gray.300'}
      color={'gray.900'}
      keyboardType={props.keyboardType ? props.keyboardType : 'ascii-capable'}></Input>
  );
}

export default LoginInputComponent;