import React, { ChangeEvent, useEffect, useMemo, useState } from 'react';
import moment, { Moment } from 'moment';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Container, Divider, Grid, InputAdornment, Stack, Typography } from '@mui/material';
import ProveButton from '../components/ProveButton';
import AddressInput from '../components/AddressInput';
import CustomFormInput from '../components/CustomTextField';
import DOBInputField from '../components/DOBInputField';
import { AppEnv, verifyIdentity } from '../services/ProveService';

interface ReviewInfoProps {
    env: AppEnv;
    accessToken: string;
}

const ReviewInfo = (props: ReviewInfoProps) => {
    const navigate = useNavigate();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);

    const [loading, setLoading] = useState<boolean>(false);
    const [canEdit, setCanEdit] = useState<boolean>(true);

    const providedFirstName = searchParams.get('firstName');
    const providedLastName = searchParams.get('lastName');
    const providedAddress = searchParams.get('address');
    const providedCity = searchParams.get('city');
    const providedRegion = searchParams.get('region');
    const providedPostalCode = searchParams.get('postalCode');
    const providedDOB = searchParams.get('dob') ? moment(searchParams.get('dob')) : null;
    const providedLast4 = searchParams.get('last4');

    // Name
    const [firstName, setFirstName] = useState<string | null>(providedFirstName);
    const [lastName, setLastName] = useState<string | null>(providedLastName);

    // Address
    const [address, setAddress] = useState<string | null>(providedAddress);
    const [city, setCity] = useState<string | null>(providedCity);
    const [region, setRegion] = useState<string | null>(providedRegion);
    const [postalCode, setPostalCode] = useState<string | null>(providedPostalCode);

    const [dob, setDOB] = useState<Moment | null>(providedDOB);
    const [last4, setLast4] = useState<string | null>(providedLast4);

    const confirm = async () => {
        if (invalidAddress || firstNameError || lastNameError || dateOfBirthError || socialSecurityError) {
            return;
        }

        setLoading(true);
        try {
            const verificationResult = await verifyIdentity(
                props.env,
                props.accessToken,
                firstName!,
                lastName!,
                dob!,
                last4!,
                city!,
                address!,
                region!,
                postalCode!
            );

            if (verificationResult.data.verified) {
                navigate('/verify-success')
            } else {
                throw new Error('Your information is invalid. Please re-check and try again.')
            }
        } catch (e: any) {
            alert(e.message ?? 'Please check your information and try again.');
        } finally {
            setLoading(false);
        }
    }

    const stringifiedAddress = useMemo(() => {
        const addressElements = [address, city, region, postalCode];
        if (addressElements.every(s => s != null)) {
            return `${address}, ${city}, ${region} ${postalCode}`;
        }

        return '';
    }, [address, city, region, postalCode]);
    
    const handleDOBChange = (newDOB: Moment | null) => {
        setDOB(newDOB);
    };

    const handleLast4Change = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.value.length <= 4) {
            setLast4(e.target.value);
        }
    }

    const handlePostalCodeChange = (e: ChangeEvent<HTMLInputElement>) => {
        setPostalCode(e.target.value);
    }

    const firstNameError = useMemo(() => {
        return !firstName;
    }, [firstName]);

    const lastNameError = useMemo(() => {
        return !lastName;
    }, [lastName]);

    const dateOfBirthError = useMemo(() => {
        return !dob?.isValid();
    }, [dob]);

    const socialSecurityError = useMemo(() => {
        return !last4 || isNaN(parseInt(last4!)) || last4?.length !== 4;
    }, [last4]);

    const addressError = useMemo(() => {
        return !address;
    }, [address]);

    const cityError = useMemo(() => {
        return !city;
    }, [city]);

    const regionError = useMemo(() => {
        return !region;
    }, [region]);

    const postalCodeError = useMemo(() => {
        return !postalCode || postalCode.length < 5;
    }, [postalCode]);

    const invalidAddress = addressError || cityError || regionError || postalCodeError;

    useEffect(() => {
        if (!props.env || !props.accessToken) {
            navigate('/');
        }
    }, [])

    if (!props.env || !props.accessToken) {
        return null;
    }

    return (
        <Container sx={{ position: 'relative', pb: 2, height: '100%', overflowX: 'hidden', overflowY: 'scroll' }}>
            <Box width="100%">
                <Box width="100%" mb={3}>
                    <Typography
                        textAlign="center"
                        component="h1"
                        variant="h4"
                        fontWeight="bold"
                    >
                        Review your information
                    </Typography>
                </Box>
                <Stack gap={1} mb={1} className="fadeIn">
                    <Grid container spacing={2}>
                        <Grid item xs={6} sx={{ pt: 1 }}>
                            <CustomFormInput
                                label="First Name"
                                value={firstName}
                                error={firstNameError}
                                errorText="Enter your legal first name"
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setFirstName(e.target.value)}
                                disabled={!canEdit}
                            />
                        </Grid>
                        <Grid item xs={6} sx={{ pt: 1 }}>
                            <CustomFormInput
                                label="Last Name"
                                value={lastName}
                                error={lastNameError}
                                errorText="Enter your legal last name"
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setLastName(e.target.value)}
                                disabled={!canEdit}
                            />
                        </Grid>
                    </Grid>
                    <Divider sx={{ mt: .5, mb: .5 }} />
                    <Grid container spacing={2}>
                        <Grid item xs={12} sx={{ pt: 1 }}>
                            {
                                canEdit ?
                                    <AddressInput
                                        address={address}
                                        addressError={addressError}
                                        city={city}
                                        cityError={cityError}
                                        postalCode={postalCode}
                                        postalCodeError={postalCodeError}
                                        region={region}
                                        regionError={regionError}
                                        onAddressChanged={(e: ChangeEvent<HTMLInputElement>) => setAddress(e.target.value)}
                                        onCityChanged={(e: ChangeEvent<HTMLInputElement>) => setCity(e.target.value)}
                                        onPostalCodeChanged={handlePostalCodeChange}
                                        onRegionChanged={(e: any) => setRegion(e.target.value)}
                                    />
                                    :
                                    <CustomFormInput
                                        label="Home Address"
                                        value={stringifiedAddress}
                                        disabled={true}
                                        onChange={() => { }} // Explicitly do nothing here
                                    />
                            }
                        </Grid>
                    </Grid>
                    <Divider sx={{ mt: .5, mb: .5 }} />
                    <Grid container spacing={2}>
                        <Grid item xs={12} sx={{ pt: 1 }}>
                            <DOBInputField
                                label="Date of Birth"
                                disabled={!canEdit}
                                fontSize="large"
                                dob={dob}
                                dobError={dateOfBirthError}
                                onDOBChanged={handleDOBChange}
                                hideOutline
                                showErrorText
                            />
                        </Grid>
                    </Grid>
                    <Divider sx={{ mt: .5, mb: .5 }} />
                    <Grid container spacing={2}>
                        <Grid item xs={12} sx={{ pt: 1 }}>
                            <CustomFormInput
                                label="Social Security Number"
                                error={socialSecurityError}
                                errorText="Enter the last 4 of your social security number"
                                value={last4}
                                disabled={providedLast4?.length === 4} // If we were supplied a SSN, dont allow the user to change it
                                onChange={handleLast4Change}
                                startAdornment={
                                    <InputAdornment position="start" sx={{ fontWeight: 'bold', fontSize: '1.4rem' }}>
                                        ***  **
                                    </InputAdornment>
                                }
                            />
                        </Grid>
                        <Grid item xs={12} sx={{ pt: '0px !important' }}>
                            <Typography variant="caption" color={'gray'}>This is required by finance regulations</Typography>
                        </Grid>
                    </Grid>
                </Stack>
                <Box display="flex" gap={1} mt={2.5} mb={2} className="fadeIn">
                    {/* <ProveButton
                        variant="outlined"
                        onClick={edit}
                        sx={{ backgroundColor: 'white', color: 'black', border: '1px solid rgba(0, 0, 0, 0.5)' }}
                    >
                        Edit
                    </ProveButton> */}
                    <ProveButton onClick={confirm}>
                        Confirm
                    </ProveButton>
                </Box>
            </Box>
            <Box sx={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                top: 0,
                left: 0,
                background: 'white',
                display: loading ? 'flex' : 'none',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '16px',
                animation: '0.4s fadeIn forwards',
            }}>
                <CircularProgress />
            </Box>
        </Container >
    )
}

export default ReviewInfo;