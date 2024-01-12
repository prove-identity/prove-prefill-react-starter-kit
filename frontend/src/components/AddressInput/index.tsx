import React, { ChangeEvent } from 'react';
import { Grid, MenuItem, TextField } from '@mui/material';
import { US_STATES } from '../../util/states';
import CustomFormInput from '../CustomTextField';

export interface AddressInputProps {
    address: string | null;
    extendedAddress: string | null;
    city: string | null;
    region: string | null;
    postalCode: string | null;

    addressErrorText?: string;
    extendedAddressErrorText?: string;
    cityErrorText?: string;
    regionErrorText?: string;
    postalCodeErrorText?: string

    addressError: boolean;
    cityError: boolean;
    regionError: boolean;
    postalCodeError: boolean;

    onAddressChanged: (e: ChangeEvent<HTMLInputElement>) => void;
    onExtendedAddressChanged: (e: ChangeEvent<HTMLInputElement>) => void;
    onCityChanged: (e: ChangeEvent<HTMLInputElement>) => void;
    onRegionChanged: (e: any) => void;
    onPostalCodeChanged: (e: ChangeEvent<HTMLInputElement>) => void;
}

const AddressInput = (props: AddressInputProps) => {
    return (
        <Grid container gap={2}>
            <Grid item xs={12}>
                <CustomFormInput
                    label="Address"
                    value={props.address}
                    onChange={props.onAddressChanged}
                    error={props.addressError}
                    errorText={props.addressErrorText ?? 'Enter your full street address'}
                />
            </Grid>
            {/* TODO: handle Extended Address */}
            <Grid item xs={12}>
                <CustomFormInput
                    label="Extended Address"
                    value={props.extendedAddress}
                    onChange={props.onExtendedAddressChanged}
                />
            </Grid>
            <Grid item xs={12}>
                <CustomFormInput
                    label="City"
                    value={props.city}
                    onChange={props.onCityChanged}
                    error={props.cityError}
                    errorText={props.cityErrorText ?? 'Enter your city'}
                />
            </Grid>
            <Grid item xs={5}>
                <TextField
                    label="State"
                    select
                    value={props.region}
                    fullWidth
                    variant="outlined"
                    InputProps={{
                        disableUnderline: true,
                        sx: {
                            borderRadius: '12px',
                            '.MuiInputBase-input': {
                                fontSize: '1.4rem',
                                fontWeight: 'bold'
                            },
                        },
                    }}
                    InputLabelProps={{
                        shrink: true,
                        style: { fontSize: '1.2rem',  },
                    }}
                    onChange={props.onRegionChanged}
                    error={props.regionError}
                    helperText={props.regionError ? (props.regionErrorText || 'Enter your state') : null}
                >
                    {
                        US_STATES.map(state => <MenuItem key={state.shortCode} value={state.shortCode} sx={{ fontWeight: 'bold', fontSize: '1.4rem' }}>{state.name}</MenuItem>)
                    }
                </TextField>
            </Grid>
            <Grid item xs={5}>
                <CustomFormInput
                    label="Zip Code"
                    value={props.postalCode}
                    onChange={props.onPostalCodeChanged}
                    error={props.postalCodeError}
                    errorText={props.postalCodeErrorText ?? 'Enter your zip code'}
                />
            </Grid>
        </Grid>
    )
}

export default AddressInput;