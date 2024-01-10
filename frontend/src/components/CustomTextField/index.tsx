import React, { ChangeEvent } from 'react';
import { TextField } from '@mui/material';
import { useCustomTheme } from '../../context/ThemeProvider';

interface FormInputProps {
    label: string;
    value: string | null;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    disabled?: boolean;
    error?: boolean;
    errorText?: React.ReactNode;
    maxLength?: number;
    placeholder?: string;
    startAdornment?: React.ReactNode;
}

const CustomFormInput = (props: FormInputProps) => {
    const {  mode } = useCustomTheme();
    return (
        <TextField
            error={props.error}
            helperText={props.error && props.errorText}
            fullWidth
            label={props.label}
            value={props.value}
            onChange={props.onChange}
            disabled={props.disabled}
            variant="standard"
            inputProps={{ maxLength: props.maxLength ?? 30, placeholder: props.placeholder,  }}
            InputProps={{
                sx: {
                    '.MuiInputBase-input': {
                        fontSize: '1.5rem',
                        fontWeight: 'bold', 
                        borderRadius: '12px',
                        paddingLeft: '16px',                        
                    },
                },
                disableUnderline: true,
                startAdornment: props.startAdornment
            }}
            InputLabelProps={{
                shrink: true,
                style: { fontSize: '1.2rem',  },
            }}
        />
    )
}

export default CustomFormInput;