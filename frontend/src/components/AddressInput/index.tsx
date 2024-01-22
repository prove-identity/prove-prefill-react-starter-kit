import { ChangeEvent } from 'react';
import { Grid, MenuItem, TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';
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
    const { t } = useTranslation();

    return (
        <Grid container gap={2}>
            <Grid item xs={12}>
                <CustomFormInput
                    label={t('dataCollection.address.label')}
                    value={props.address}
                    onChange={props.onAddressChanged}
                    error={props.addressError}
                    errorText={props.addressErrorText ?? t('dataCollection.address.errorText')}
                />
            </Grid>
            {/* TODO: handle Extended Address */}
            <Grid item xs={12}>
                <CustomFormInput
                    label={t('dataCollection.address.label')}
                    value={props.extendedAddress}
                    onChange={props.onExtendedAddressChanged}
                />
            </Grid>
            <Grid item xs={12}>
                <CustomFormInput
                    label={t('dataCollection.city.label')}
                    value={props.city}
                    onChange={props.onCityChanged}
                    error={props.cityError}
                    errorText={props.cityErrorText ?? ''}
                />
            </Grid>
            <Grid item xs={5}>
                <TextField
                    label={t('dataCollection.region.label')}
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
                    helperText={props.regionError ? (props.regionErrorText || t('dataCollection.region.errorText')) : null}
                >
                    {
                        US_STATES.map(state => <MenuItem key={state.shortCode} value={state.shortCode} sx={{ fontWeight: 'bold', fontSize: '1.4rem' }}>{state.name}</MenuItem>)
                    }
                </TextField>
            </Grid>
            <Grid item xs={5}>
                <CustomFormInput
                    label={t('dataCollection.postalCode.label')}
                    value={props.postalCode}
                    onChange={props.onPostalCodeChanged}
                    error={props.postalCodeError}
                    errorText={props.postalCodeErrorText ?? t('dataCollection.postalCode.errorText')}
                />
            </Grid>
        </Grid>
    )
}

export default AddressInput;