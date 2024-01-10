import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import moment, { Moment } from "moment";
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Container, Divider, Grid, InputAdornment, Stack, Typography } from '@mui/material';
import ProveButton from '../components/ProveButton';
import AddressInput from '../components/AddressInput';
import CustomFormInput from '../components/CustomTextField';
import DOBInputField from '../components/DOBInputField';
import {verifyIdentity } from '../services/ProveService';


interface ReviewInfoProps {
    accessToken: string;
    last4: string;
}

const ReviewInfo = (props: ReviewInfoProps) => {
    const navigate = useNavigate();

    const [loading, setLoading] = useState<boolean>(false);
    const [canEdit, setCanEdit] = useState<boolean>(true);
    // Name
    const [firstName, setFirstName] = useState<string>('');
    const [lastName, setLastName] = useState<string>('');

    // Address
    const [address, setAddress] = useState<string>('');
    const [city, setCity] = useState<string>('');
    const [region, setRegion] = useState<string>('');
    const [postalCode, setPostalCode] = useState<string>('');
    const [last4SSN, setLast4SSN] = useState<string>('');

    const [dob, setDOB] = useState<Moment | null>(null);

    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const firstNameParam = params.get('first_name');
        const lastNameParam = params.get('last_name');
        const addressParam = params.get('address');
        const cityParam = params.get('city');
        const regionParam = params.get('region');
        const postalCodeParam = params.get('postal_code');
        const dobParam = params.get('dob');
        const last4Param = params.get('last4');

        if (firstNameParam) {
            setFirstName(firstNameParam);
        }
        if (lastNameParam) {
            setLastName(lastNameParam);
        }
        if (addressParam) {
            setAddress(addressParam);
        }
        if (cityParam) {
            setCity(cityParam);
        }
        if (regionParam) {
            setRegion(regionParam);
        }
        if (postalCodeParam) {
            setPostalCode(postalCodeParam);
        }
        if (last4Param) {
            setLast4SSN(last4Param);
        }
        if (dobParam) {
            // Depending on the format of your dob parameter, convert it to a Moment object and set it
            const dobMoment = moment(dobParam, 'YYYY-MM-DD');
                setDOB(dobMoment);
        }
    }, [location.search]);

    const confirm = async () => {
        if (invalidAddress || firstNameError || lastNameError || dateOfBirthError /*|| socialSecurityError*/) {
            return;
        }
        console.log('Confirming identity');

        setLoading(true);
        try {
            const verificationResult = await verifyIdentity(
                props.accessToken,
                firstName!,
                lastName!,
                dob!,
                props.last4!,
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
        setDOB(newDOB as Moment);
    };

    const handlePostalCodeChange = (e: ChangeEvent<HTMLInputElement>) => {
        setPostalCode(e.target.value);
    }

    const handleSSNChange = (e: ChangeEvent<HTMLInputElement>) => {
        setLast4SSN(e.target.value)
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

    // const socialSecurityError = useMemo(() => {
    //     return last4SSN || isNaN(parseInt(last4SSN!)) || last4SSN.length !== 4;
    // }, [last4SSN]);

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
        if (!props.accessToken) {
            navigate('/');
        }
    }, [])

    if (!props.accessToken) {
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
                                // error={socialSecurityError}
                                errorText="Enter the last 4 of your social security number"
                                value={last4SSN}
                                //TODO: check on this
                                disabled={false} // If we were supplied a SSN, dont allow the user to change it
                                //TODO: check on this
                                onChange={handleSSNChange}
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