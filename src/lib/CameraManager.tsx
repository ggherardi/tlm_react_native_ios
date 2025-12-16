import { useIsFocused } from "@react-navigation/native";
import { useEffect, useRef, useState } from "react";
import { Button, Pressable, StyleSheet, Text, View } from "react-native";
import { GestureHandlerRootView, TouchableOpacity } from "react-native-gesture-handler";
import { Camera, CameraDevice, parsePhysicalDeviceTypes, useCameraDevices } from "react-native-vision-camera"

interface ICameraComponentProps {
    assignPhoto: Function;
}

const CameraComponent = ({ assignPhoto }: ICameraComponentProps) => {
    const [authorized, setAuthorized] = useState(false);
    const [imageSource, setImageSource] = useState('');

    const devices = useCameraDevices();
    const device = devices.back;
    const camera = useRef<Camera>(null)
    const isFocused = useIsFocused();

    useEffect(() => {
        const managePermissions = async () => {
            let cameraPermission = await Camera.getCameraPermissionStatus()
            if (cameraPermission == "not-determined") {
                cameraPermission = await Camera.requestCameraPermission();
            }
            switch (cameraPermission) {
                case "authorized":
                    setAuthorized(true);
                    // setAuthorized(true);
                    break;
                case "denied":
                // Linking API            
                case "restricted":
                    // Restricted on IOS (i.e. parental control)
                    break;
            }
        };
        managePermissions();
    }, []);

    const takePhoto = async () => {
        const photo = await camera.current?.takePhoto();
        if (photo) {
            assignPhoto(photo);
            setImageSource(photo.path);
        }
    }

    if (authorized && device) {
        return (
            <View style={{ flex: 1 }}>
                <Camera
                    ref={camera}
                    style={{ flex: 1 }}
                    device={device as CameraDevice}
                    isActive={isFocused}
                    photo={true} />
                <View style={styles.buttonContainer}>
                    <GestureHandlerRootView>
                        <TouchableOpacity style={styles.camButton} onPress={() => takePhoto()}></TouchableOpacity>
                    </GestureHandlerRootView>
                </View>
            </View>
        );
    } else if (!authorized) {
        return (
            <Text>Per utilizzare la fotocamera, fornire le autorizzazioni dal menu delle impostazioni del dispositivo</Text>
        )
    } else {
        return (
            <Text>Caricamento..</Text>
        )
    }
}

const styles = StyleSheet.create({
    camButton: {
        height: 80,
        width: 80,
        borderRadius: 40,
        //ADD backgroundColor COLOR GREY
        backgroundColor: '#B2BEB5',
        opacity: 1,
        alignSelf: 'center',
        borderWidth: 4,
        borderColor: 'white',
    },
    buttonContainer: {
        backgroundColor: 'rgba(0,0,0,0.2)',
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        bottom: 0,
        padding: 20,
    },
})

export default CameraComponent;