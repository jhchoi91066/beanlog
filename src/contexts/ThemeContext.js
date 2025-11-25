import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '../constants/colors';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [themeLoaded, setThemeLoaded] = useState(false);

    // Load theme preference on mount
    useEffect(() => {
        loadTheme();
    }, []);

    const loadTheme = async () => {
        try {
            const savedTheme = await AsyncStorage.getItem('darkModeEnabled');
            if (savedTheme !== null) {
                setIsDarkMode(JSON.parse(savedTheme));
            }
        } catch (error) {
            console.error('Error loading theme:', error);
        } finally {
            setThemeLoaded(true);
        }
    };

    const toggleTheme = async (value) => {
        try {
            setIsDarkMode(value);
            await AsyncStorage.setItem('darkModeEnabled', JSON.stringify(value));
        } catch (error) {
            console.error('Error saving theme:', error);
        }
    };

    // Define dynamic colors based on theme
    const themeColors = {
        ...Colors, // Default to light mode colors
        ...(isDarkMode ? {
            // Dark Mode Overrides
            background: '#1C1917',        // stone-900
            backgroundWhite: '#292524',   // stone-800
            backgroundMuted: '#44403C',   // stone-700

            textPrimary: '#FAFAF9',       // stone-50
            textSecondary: '#A8A29E',     // stone-400
            textTertiary: '#78716C',      // stone-500

            border: '#44403C',            // stone-700
            divider: '#44403C',           // stone-700

            hoverBg: '#44403C',           // stone-700
            activeBg: '#57534E',          // stone-600

            stone50: '#1C1917',
            stone100: '#292524',
            stone200: '#44403C',
            stone800: '#FAFAF9',          // Invert for some UI elements if needed
            stone900: '#FFFFFF',
        } : {})
    };

    return (
        <ThemeContext.Provider value={{ isDarkMode, toggleTheme, colors: themeColors, themeLoaded }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
