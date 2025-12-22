import { useState, useEffect } from 'react';
import { getFeatureFlag, getRemoteString, initRemoteConfig } from '../services/remoteConfig';

/**
 * Hook to use Remote Config values
 * @returns {Object} { loading, showSeasonalBanner, bannerTitle, bannerText }
 */
export const useRemoteConfig = () => {
    const [loading, setLoading] = useState(true);
    const [config, setConfig] = useState({
        showSeasonalBanner: false,
        bannerTitle: '',
        bannerText: '',
    });

    useEffect(() => {
        const fetchConfig = async () => {
            await initRemoteConfig();

            setConfig({
                showSeasonalBanner: getFeatureFlag('show_seasonal_banner'),
                bannerTitle: getRemoteString('seasonal_banner_title'),
                bannerText: getRemoteString('seasonal_banner_text'),
            });
            setLoading(false);
        };

        fetchConfig();
    }, []);

    return { loading, ...config };
};
