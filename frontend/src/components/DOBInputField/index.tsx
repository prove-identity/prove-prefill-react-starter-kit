import React from 'react';
import { Moment } from 'moment';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { DatePicker } from '@mui/x-date-pickers';
import { TextField, TextFieldProps } from '@mui/material';

interface DOBInputFieldProps {
    dob: Moment | null;
    onDOBChanged: (newDOB: Moment | null) => void;
    dobError: boolean;
    errorText?: string;
    showErrorText?: boolean;
    label?: string;
    fontSize?: 'normal' | 'large';
    hideOutline?: boolean;
    disabled?: boolean;
}

const DOBInputField = (props: DOBInputFieldProps) => {
    return (
        <LocalizationProvider dateAdapter={AdapterMoment}>
            <DatePicker
                label={props.label}
                inputFormat="MM/DD/YYYY"
                value={props.dob}
                onChange={props.onDOBChanged}
                disabled={props.disabled}
                InputProps={{
                    disableUnderline: true
                }}
                renderInput={(params: TextFieldProps) => <TextField
                    error={!props.dobError}
                    helperText={!props.showErrorText ? null : (props.errorText && props.dobError) && "Enter your date of birth"}
                    fullWidth {...params}
                    placeholder="MM/DD/YYYY"
                    sx={{
                        '.MuiInputBase-input': {
                            fontWeight: 'bold',
                            fontSize: props.fontSize == 'large' ? '1.4rem' : '1rem'
                        }
                    }}
                    variant={props.hideOutline ? 'standard' : 'outlined'}
                />
                }
            />
        </LocalizationProvider>
    )
}

export default DOBInputField;