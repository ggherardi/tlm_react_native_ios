import AsyncStorage from '@react-native-async-storage/async-storage';

type Primitive = string | number | boolean | null;
type Storable = Primitive | object;

export default class DataStorage {
  private cache = new Map<string, string>();

  /**
   * Va chiamato UNA SOLA VOLTA all'avvio dell'app.
   * Carica tutte le chiavi e popola la cache in memoria.
   */
  async init(): Promise<void> {
    const keys = await AsyncStorage.getAllKeys();
    if (!keys?.length) return;

    const pairs = await AsyncStorage.multiGet(keys);
    this.cache.clear();

    for (const [k, v] of pairs) {
      if (k && v != null) this.cache.set(k, v);
    }
  }

  getAll = (): string[] => {
    return Array.from(this.cache.keys());
  };

  clearAll = (): void => {
    // Svuota subito cache (sync)
    this.cache.clear();
    // Persistenza async
    void AsyncStorage.clear();
  };

  deleteWithKey = (key: string): void => {
    console.log('Deleting ', key);
    this.cache.delete(key);
    void AsyncStorage.removeItem(key);
  };

  save = (key: string, dataContextKey: string, value: any): void => {
    const saveConstant = (SaveConstants as any)[dataContextKey];
    if (!saveConstant) return;

    switch (saveConstant.dataType) {
      case 'array':
      case 'json':
        value = JSON.stringify(value);
        break;
      default:
        // string/number/boolean/buffer li gestiamo sotto
        break;
    }

    // Normalizza in stringa: AsyncStorage salva solo stringhe
    let storedValue: string;
    if (typeof value === 'string') {
      storedValue = value;
    } else if (typeof value === 'number' || typeof value === 'boolean') {
      storedValue = String(value);
    } else if (value == null) {
      storedValue = '';
    } else {
      // fallback: serializza tutto
      storedValue = JSON.stringify(value);
    }

    console.log('SAVING Key: ', key, ' Value: ', storedValue);

    // Aggiorna subito cache (sync)
    this.cache.set(key, storedValue);

    // Persistenza async
    void AsyncStorage.setItem(key, storedValue);
  };

  load = (key: string, dataContextKey: string): any => {
    const saveConstant = (SaveConstants as any)[dataContextKey];
    if (!saveConstant) return undefined;

    const raw = this.cache.get(key);

    switch (saveConstant.dataType) {
      case 'string':
        return raw ?? undefined;
      case 'json':
        return raw ? JSON.parse(raw) : {};
      case 'array':
        return raw ? JSON.parse(raw) : [];
      case 'boolean':
        // salva come "true"/"false"
        return raw === 'true';
      case 'number': {
        const n = raw != null ? Number(raw) : NaN;
        return Number.isFinite(n) ? n : undefined;
      }
      case 'buffer':
        // AsyncStorage non gestisce buffer nativi.
        // Se ti serve davvero: converti in base64 a monte.
        return raw ? raw : undefined;
      default:
        return raw ?? undefined;
    }
  };
}

export const Storage = new DataStorage();

export const SaveConstants = {
  events: { key: 'events', dataType: 'array' },
  expenseReport: { key: 'expenseReport', dataType: 'array' },
  userProfile: { key: 'userProfile', dataType: 'array' },
  versionFile: { key: 'versionFile', dataType: 'json' },
};
