import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightColors, darkColors, theme as baseTheme } from './theme';

type ThemeType = 'light' | 'dark';

interface ThemeContextData {
    theme: typeof lightColors;
    baseTheme: typeof baseTheme;
    isDarkMode: boolean;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextData>({} as ThemeContextData);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        loadTheme();
    }, []);

    const loadTheme = async () => {
        const savedTheme = await AsyncStorage.getItem('@app:theme');
        if (savedTheme) {
            setIsDarkMode(savedTheme === 'dark');
        }
    };

    const toggleTheme = async () => {
        const newState = !isDarkMode;
        setIsDarkMode(newState);
        await AsyncStorage.setItem('@app:theme', newState ? 'dark' : 'light');
    };

    const colors = isDarkMode ? darkColors : lightColors;

    return (
        <ThemeContext.Provider value={{ theme: colors, baseTheme, isDarkMode, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useAppTheme = () => useContext(ThemeContext);
