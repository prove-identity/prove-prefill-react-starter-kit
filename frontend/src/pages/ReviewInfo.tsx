import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import moment, { Moment } from "moment";
import { useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Container, Grid, InputAdornment, Stack, Typography } from '@mui/material';
import ProveButton from '../components/ProveButton';
import AddressInput from '../components/AddressInput';
import CustomFormInput from '../components/CustomTextField';
import DOBInputField from '../components/DOBInputField';
import { eligibility, identity, verifyIdentity } from '../services/ProveService';

interface ReviewInfoProps {
    accessToken: string;
    last4: string;
    onLast4Changed: (e: any) => void;
}

const ReviewInfo = ({ accessToken, last4, onLast4Changed }: ReviewInfoProps) => {
    const navigate = useNavigate();

    const [loading, setLoading] = useState<boolean>(false);
    const [canEdit, setCanEdit] = useState<boolean>(true);

    // Name
    const [firstName, setFirstName] = useState<string>('');
    const [lastName, setLastName] = useState<string>('');

    // Address
    const [address, setAddress] = useState<string>('');
    const [extendedAddress, setExtendedAddress] = useState<string>('');
    const [city, setCity] = useState<string>('');
    const [region, setRegion] = useState<string>('');
    const [postalCode, setPostalCode] = useState<string>('');

    const [dob, setDOB] = useState<Moment | null>(moment(''));

    const handleLast4Change = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.value.length <= 4) {
            onLast4Changed(e.target.value);
        }
    }

    const verifyData = async (checkFunction: () => Promise<any>) => {
        try {
            const result = await checkFunction();
            if (!result.data.verified) {
                alert("We were unable to verify your data. Please try again.");
                return false;
            }
            return result;
        } catch (e) {
            console.error('Verification error:', e);
            alert("An error occurred when verifying your identity. Please check your information and try again.");
            return false;
        }
    };

    const checkIdentity = async () => {
        return verifyData(() => identity(last4, accessToken));
    };

    const verifyEligibility = async () => {
        console.log("Verifying eligibility")
        return verifyData(() => eligibility(accessToken));
    };

    const processVerification = async () => {
        setLoading(true);
        try {
            const eligibilityResult = await verifyEligibility();
             //TODO: this should kick you out
            if (!eligibilityResult) return;

            const identityResult = await checkIdentity();
            if (!identityResult) return;

            const { prefillData, manualEntryRequired } = identityResult.data;
            console.log('prefillData: ', prefillData);
            if (!manualEntryRequired) {
                const {
                    first_name,
                    last_name,
                    dob,
                    address,
                    extended_address,
                    city,
                    region,
                    postalCode,
                } = prefillData;
                setFirstName(first_name);
                setLastName(last_name)
                setDOB(dob);
                setAddress(address);
                setExtendedAddress(extended_address);
                setCity(city);
                setRegion(region);
                setPostalCode(postalCode);
            }
        } catch (e) {
            console.error('Error during verification:', e);
            alert("An error occurred during the verification process. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!accessToken) {
            navigate('/');
        }
    }, [])

    useEffect(() => {
        processVerification();
    }, []);

    const confirm = async () => {
        if (invalidAddress || firstNameError || lastNameError || dateOfBirthError || socialSecurityError) {
            return;
        }
        console.log('Confirming identity');

        setLoading(true);
        try {
            const verificationResult = await verifyIdentity(
                accessToken,
                firstName!,
                lastName!,
                dob!,
                last4!,
                city!,
                address!,
                extendedAddress,
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
        const addressElements = [address, extendedAddress, city, region, postalCode];
        if (addressElements.every(s => s != null)) {
            return `${address}, ${extendedAddress}, ${city}, ${region} ${postalCode}`;
        }

        return '';
    }, [address, extendedAddress, city, region, postalCode]);

    const handleDOBChange = (newDOB: Moment | null) => {
        setDOB(newDOB as Moment);
    };

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
        return !last4 || isNaN(parseInt(last4!)) || last4.length !== 4;
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

    if (!accessToken) {
        return null;
    }

    return (
        <Container sx={{ pb: 2, height: '100%', overflowX: 'hidden', overflowY: 'scroll' }}>
            {loading ? (
                <Box display="flex" alignItems="center" justifyContent="center" pt={4}>
                    <CircularProgress />
                </Box>
            ) : (
                <Box width="100%">
                    <Box width="100%" mb={3}>
                        <Typography
                            textAlign="left"
                            component="h1"
                            variant="h4"
                            fontWeight="bold"
                        >
                            Your Information
                        </Typography>
                        <Typography
                            textAlign="left"
                            component="h2"
                            variant="h6"
                            fontWeight="bold"
                            pb={1}
                            mb={2}
                        >
                            All fields are required unless stated otherwise
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
                            <Grid item xs={12} sx={{ pt: 1 }}>
                                {
                                    canEdit ?
                                        <AddressInput
                                            address={address}
                                            addressError={addressError}
                                            extendedAddress={extendedAddress}
                                            city={city}
                                            cityError={cityError}
                                            postalCode={postalCode}
                                            postalCodeError={postalCodeError}
                                            region={region}
                                            regionError={regionError}
                                            onAddressChanged={(e: ChangeEvent<HTMLInputElement>) => setAddress(e.target.value)}
                                            onExtendedAddressChanged={(e: ChangeEvent<HTMLInputElement>) => setExtendedAddress(e.target.value)}
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
                            <Grid item xs={12} sx={{ pt: 1 }}>
                                <DOBInputField
                                    label="Date of Birth"
                                    disabled={!canEdit}
                                    fontSize="large"
                                    dob={dob}
                                    dobError={dateOfBirthError}
                                    onDOBChanged={handleDOBChange}
                                    showErrorText
                                />
                            </Grid>
                            <Grid item xs={12} sx={{ pt: 1, mt: 1 }}>
                                <CustomFormInput
                                    label="Social Security Number"
                                    error={socialSecurityError}
                                    errorText="Enter the last 4 of your social security number"
                                    value={last4}
                                    disabled={!canEdit} // If we were supplied a SSN, dont allow the user to change it
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
                        <ProveButton onClick={confirm}>
                            Confirm
                        </ProveButton>
                    </Box>
                </Box>
            )}
        </Container>
    )
}

export default ReviewInfo;