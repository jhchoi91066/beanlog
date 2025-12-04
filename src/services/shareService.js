import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';

/**
 * Capture a view ref and share it as an image
 * @param {Object} viewRef - React ref of the view to capture
 * @returns {Promise<void>}
 */
export const captureAndShare = async (viewRef) => {
    try {
        if (!viewRef.current) {
            console.error('View ref is null');
            return;
        }

        // 1. Capture the view
        const uri = await captureRef(viewRef, {
            format: 'png',
            quality: 0.9,
            result: 'tmpfile',
        });

        console.log('Image captured at:', uri);

        // 2. Check if sharing is available
        const isAvailable = await Sharing.isAvailableAsync();
        if (!isAvailable) {
            alert('Sharing is not available on this device');
            return;
        }

        // 3. Open share dialog
        await Sharing.shareAsync(uri, {
            mimeType: 'image/png',
            dialogTitle: 'Share your Coffee Passport',
            UTI: 'public.png', // for iOS
        });

    } catch (error) {
        console.error('Error sharing image:', error);
        alert('Failed to share image');
    }
};
