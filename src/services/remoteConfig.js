import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

const DEFAULT_VALUES = {
    show_seasonal_banner: false,
    welcome_message: 'Welcome to BeanLog',
    seasonal_banner_title: 'Winter Season Event',
    seasonal_banner_text: 'Check out our winter special beans!',
};

let configCache = { ...DEFAULT_VALUES };

/**
 * Initialize Remote Config (Firestore Backend)
 * Note: Uses Firestore 'config/remote_config' doc because Firebase JS Remote Config SDK
 * requires indexedDB (browser) which is missing in Expo Go / React Native.
 */
export const initRemoteConfig = async () => {
    try {
        const configRef = doc(db, 'config', 'remote_config');
        const docSnap = await getDoc(configRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            // Merge defaults with fetched data
            configCache = { ...DEFAULT_VALUES, ...data };
            console.log('Remote Config: Fetched from Firestore:', configCache);
        } else {
            console.log('Remote Config: No config doc found, using defaults.');
        }
    } catch (error) {
        console.warn('Remote Config init error (Firestore):', error.message);
        // Fallback to defaults is automatic since configCache is initialized
    }
};

/**
 * Get Boolean Feature Flag
 * @param {string} key 
 * @returns {boolean}
 */
export const getFeatureFlag = (key) => {
    const value = configCache[key];
    return value !== undefined ? Boolean(value) : (DEFAULT_VALUES[key] || false);
};

/**
 * Get String Config
 * @param {string} key 
 * @returns {string}
 */
export const getRemoteString = (key) => {
    const value = configCache[key];
    return value !== undefined ? String(value) : (DEFAULT_VALUES[key] || '');
};

export default {
    init: initRemoteConfig,
    getFlag: getFeatureFlag,
    getString: getRemoteString,
};
