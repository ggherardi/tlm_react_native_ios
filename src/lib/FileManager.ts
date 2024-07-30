import { PermissionsAndroid, Platform } from 'react-native';
// import RNFetchBlob from 'rn-fetch-blob';
import ReactNativeBlobUtil from 'react-native-blob-util';
import { PromiseResult } from './models/PromiseResult';
import ImageResizer, { Response } from '@bam.tech/react-native-image-resizer';

export const FileManager = {
  checkStoragePermissions: async (): Promise<PromiseResult> => {
    return new Promise<PromiseResult>(async (resolve, reject) => {
      // resolve(new PromiseResult(true, ''));
      resolve(new PromiseResult(true, 'Permissions granted'));
    });
  },

  checkCameraPermissions: async (): Promise<PromiseResult> => {
    return new Promise<PromiseResult>(async (resolve, reject) => {
      resolve(new PromiseResult(true, 'Permissions granted'));
    });
  },

  checkStorageReadPermissions: async (): Promise<PromiseResult> => {
    return new Promise<PromiseResult>(async (resolve, reject) => {
      resolve(new PromiseResult(true, 'Permissions granted'));
    });
  },

  checkNotificationPermissions: async (): Promise<PromiseResult> => {
    return new Promise<PromiseResult>(async (resolve, reject) => {
      if (Platform.OS == "android" && Platform.Version >= 33) {
        try {
          const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            resolve(new PromiseResult(true, 'Permissions granted'));
          } else {
            reject(new PromiseResult(false, 'Permissions not granted'));
          }
        } catch (err) {
          reject(new PromiseResult(false, 'Exception'));
        }
      } else {
        resolve(new PromiseResult(true, 'Permissions granted'));
      }
    });
  },

  checkCameraAndStoragePermissions: async (): Promise<PromiseResult> => {
    return new Promise<PromiseResult>(async (resolve, reject) => {
      try {
        const checkStoragePermissionsResult = await FileManager.checkStoragePermissions();
        const checkCameraPermissionsResult = await FileManager.checkCameraPermissions();
        // const checkStoragePermissionsResult = { success: true };
        if (checkStoragePermissionsResult.success && checkCameraPermissionsResult.success) {
          resolve(new PromiseResult(true, 'Permissions granted'));
        } else {
          reject(new PromiseResult(false, 'Permissions not granted'));
        }
      } catch (err) {
        reject(new PromiseResult(false, 'Permissions not granted'));
      }
    });
  },

  createFolder: async (path: string): Promise<string> => {
    console.log(ReactNativeBlobUtil.fs.dirs);
    return new Promise<string>(async (resolve, reject) => {
      const folderToCreate = `${ReactNativeBlobUtil.fs.dirs.DocumentDir}/${path}`;
      console.log("Folder to create:", folderToCreate);
      ReactNativeBlobUtil.fs.mkdir(folderToCreate)
        .then(() => resolve(folderToCreate))
        .catch(() => reject());
    });
  },

  deleteFileOrFolder: (path: string) => {
    console.log("Path is: ", path);
    ReactNativeBlobUtil.fs.unlink(path)
      .then((v) => console.log(`Folder ${path} deleted (${v})`))
      .catch((err) => console.log(`Error deleting path ${path} (${err})`))
  },

  moveFile: async (sourcePath: string, destinationPath: string) => {
    console.log("Moving file from path: ", sourcePath, " to path: ", destinationPath);
    return new Promise<boolean>((resolve, reject) => {
      ReactNativeBlobUtil.fs.mv(sourcePath, destinationPath)
        .then((v) => {
          console.log(`${sourcePath} moved to (${destinationPath}) (${v})`);
          resolve(true);
        })
        .catch(err => {
          console.log(`Error while moving ${sourcePath} to ${destinationPath} (${err})`)
          reject(false);
        })
    })
  },

  saveFromBase64: async (path: string, base64: string): Promise<boolean> => {
    return new Promise<boolean>((resolve, reject) => {
      ReactNativeBlobUtil.fs.writeFile(path, base64, 'base64')
        .then(v => {
          console.log(`Photo succesfully saved in path ${path} (${v})`);
          resolve(true);
        })
        .catch(err => {
          console.log(`Error while saving photo in path ${path} (${err})`)
          reject(false);
        })
    });
  },

  resizeImage: async (imagePath: string, outputDirectory: string, width: number, height: number): Promise<Response> => {
    return new Promise(async (resolve, reject) => {
      try {
        console.log("starting resize for image with imagePath: ", imagePath, " outputDirectory: ", outputDirectory);
        const response = await ImageResizer.createResizedImage(imagePath, width, height, 'JPEG', 100, undefined, outputDirectory);
        console.log("resize done")
        resolve(response);
      } catch (err) {
        console.log(`Could not resize image with path ${imagePath}: `, err);
        reject(false);
      }
    });
  }
}