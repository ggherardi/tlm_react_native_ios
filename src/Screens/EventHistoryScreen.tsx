import React from 'react-native';
import CameraComponent from '../lib/CameraManager';
import { PhotoFile } from 'react-native-vision-camera';

const EventHistoryScreen = () => {
    const usePhoto = (photo: PhotoFile) => {
        console.log("The photo has been saved to: ", photo.path);
    }

    return (
        <CameraComponent assignPhoto={usePhoto} />
    )
};

export default EventHistoryScreen;