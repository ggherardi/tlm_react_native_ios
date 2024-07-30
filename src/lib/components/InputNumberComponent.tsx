import { Input } from 'native-base';
import React, { useState } from 'react';

interface IInputNumber {
    onChange: Function;
    placeholder: string;
    isRequired?: boolean;
    style?: any;
    defaultValue?: number | undefined;
}

export const InputNumber = (config: IInputNumber) => {
    const [currentValue, setCurrentValue] = useState('');
    const validateNumber = (e: any) => {
        const text = e.nativeEvent.text;
        const validRegex = /[^0-9.]/g;
        // GG: If text is not empty and all characters are valid (0-9 and including , for decimals)
        if (text && !text.match(validRegex)?.length) {
            setCurrentValue(text);
            config.onChange(e);            
        } else {
            setCurrentValue(e.nativeEvent.text.replace(validRegex, ''));
        }
    };

    return (
        <Input
            placeholder={config.placeholder}
            keyboardType='decimal-pad'
            onChange={validateNumber}
            isRequired={config.isRequired} 
            style={config.style}
            defaultValue={config.defaultValue ? config.defaultValue.toString() : ''} />
    )
}