// ThemeContext.js
import React, { createContext, useContext, useState } from 'react';
import { createTheme, ThemeProvider as MUIThemeProvider } from '@mui/material/styles';
import { PaletteMode } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';

// Define the shape of the context data
interface ThemeContextType {
  mode: PaletteMode;
  toggleTheme: () => void;
}

// Create a context with a default value
const ThemeContext = createContext<ThemeContextType>({
  mode: 'light',
  toggleTheme: () => {},
});

export const useCustomTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }: { children: any }) => {
    //TODO: return to browser preference settings 
    //const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
    //const [mode, setMode] = useState<PaletteMode>(prefersDarkMode ? 'dark' : 'light');

    const [mode, setMode] = useState<PaletteMode>( 'light');
 
    const theme = createTheme({
        typography: {
            fontFamily: 'Gellix, sans-serif',
        },
        palette: {
            mode: mode,
        },
    });

    const toggleTheme = () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
    };

    return (
        <ThemeContext.Provider value={{ mode, toggleTheme }}>
            <MUIThemeProvider theme={theme}>
                {children}
            </MUIThemeProvider>
        </ThemeContext.Provider>
    );
};