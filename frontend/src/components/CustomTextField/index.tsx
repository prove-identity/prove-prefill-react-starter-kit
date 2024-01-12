import React, { ChangeEvent } from 'react';
import { TextField } from '@mui/material';

interface FormInputProps {
    label: string;
    value: string | null;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    disabled?: boolean;
    error?: boolean;
    errorText?: React.ReactNode;
    maxLength?: number;
    inputMode?: 'text' | 'numeric';
    placeholder?: string;
    variant?: 'standard' | 'outlined'
    startAdornment?: React.ReactNode;
}

const CustomFormInput = (props: FormInputProps) => {
    return (
        <TextField
            error={props.error}
            helperText={props.error && props.errorText}
            fullWidth
            label={props.label}
            value={props.value}
            onChange={props.onChange}
            disabled={props.disabled}
            variant="outlined"
            inputProps={{ inputMode: props?.inputMode || 'text' , maxLength: props.maxLength ?? 30, placeholder: props.placeholder,  }}
            InputProps={{
                sx: {
                    borderRadius: '12px',
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