// ThemeContext.js
import React, { createContext, useContext, useState } from 'react';
import { createTheme, ThemeProvider as MUIThemeProvider } from '@mui/material/styles';
import { PaletteMode } from '@mui/material';

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

export const CustomThemeProvider = ({ children }: { children: any }) => {
    const [mode, setMode] = useState<PaletteMode>('light');

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