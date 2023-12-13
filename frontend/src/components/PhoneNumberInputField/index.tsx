import React from 'react';
import { Moment } from 'moment';
import { MuiTelInput, MuiTelInputInfo } from 'mui-tel-input';
import { styled } from '@mui/material';

const RoundTelInput = styled(MuiTelInput)(({ theme }) => ({
    width: '100%',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
    'fieldset': {
        borderRadius: '14px',
    },
    'input': {
        fontSize: '1.5rem',
    },
}));


interface PhoneNumberInputFieldProps {
    phoneNumber: string;
    onChange: (value: string, info: MuiTelInputInfo) => void;
    disabled?: boolean;
    label?: string;
    disableOutline?: boolean;
    hideCountryCodeInfo?: boolean;
}

const PhoneNumberInputField = (props: PhoneNumberInputFieldProps) => {
    return (
        <RoundTelInput
            label={props.label}
            variant={props.disableOutline ? 'standard' : 'outlined'}
            disableDropdown
            forceCallingCode
            fullWidth
            defaultCountry="US"
            onlyCountries={['US']}
            value={props.phoneNumber}
            onChange={props.onChange}
            disabled={props.disabled}
            inputProps={{
                style: {
                    fontWeight: 'bold'
                }
            }}
            InputProps={{ disableUnderline: true }}
            sx={{
                // Font size of the country code
                '&.MuiTelInput-TextField p.MuiTypography-root.MuiTypography-body1': {
                    fontSize: '1.4rem'
                },
                '&.MuiTelInput-TextField div.MuiInputAdornment-root': {
                    display: props.hideCountryCodeInfo ? 'none' : 'flex'
                }
            }}
        />)
}

export default PhoneNumberInputField;