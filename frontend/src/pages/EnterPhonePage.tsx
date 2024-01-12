import { ChangeEvent, useMemo, useState } from 'react';
import { matchIsValidTel, MuiTelInputInfo } from 'mui-tel-input';
import { NAV_HEIGHT } from '../constants';
import { Container, Grid, InputAdornment, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ProveButton from '../components/ProveButton';
import AuthAgreement from '../components/AuthAgreement';
import PhoneNumberInputField from '../components/PhoneNumberInputField';
import CustomFormInput from '../components/CustomTextField';

interface EnterPhonePageProps {
    accessToken: string;
    phoneNumber: string;
    onPhoneNumberChanged: (e: any) => void;
    last4: string;
    onLast4Changed: (e: any) => void;
}

const EnterPhonePage = (props: EnterPhonePageProps) => {
    const navigate = useNavigate();

    const [error, setError] = useState<string>('');

    const isPhoneValid = useMemo(() => {
        return matchIsValidTel(props.phoneNumber)
    }, [props.phoneNumber]);

    const socialSecurityError = useMemo(() => {
        return !props.last4 || isNaN(parseInt(props.last4!)) || props.last4?.length !== 4;
    }, [props.last4]);

    const handleLast4Change = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.value.length <= 4) {
            props.onLast4Changed(e.target.value);
        }
    }

    const handleChangePhoneNumber = (value: string, info: MuiTelInputInfo) => {
        if (info.nationalNumber!.length > 10) {
            return;
        }
        if (error) {
            setError('');
        }

        props.onPhoneNumberChanged(info.numberValue!);
    }

    const handleContinueButton = async () => {
        navigate('/sms-waiting');
    }

    return (
        <Container className="fadeIn" sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: `calc(100% - ${NAV_HEIGHT})` }}>
            {
                <>
                    <Stack mb={1} flexGrow={1} className="fadeInSlow">
                        <Grid container spacing={1}>
                            <Grid item xs={12}>
                                <Typography
                                    textAlign="left"
                                    component="h1"
                                    variant="h4"
                                    fontWeight="bold"
                                    pb={1}
                                >
                                    Let's begin by finding your info
                                </Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography
                                    textAlign="left"
                                    component="h2"
                                    variant="h6"
                                    fontWeight="bold"
                                    pb={1}
                                    mb={2}
                                >
                                    We can prefill some of this request like your name, address, and contact info for you.
                                </Typography>
                            </Grid>
                            <Grid item xs={12} mb={2}>
                                <CustomFormInput
                                    label="Social Security Number"
                                    error={socialSecurityError}
                                    errorText="Enter the last 4 of your social security number"
                                    value={props.last4}
                                    onChange={handleLast4Change}
                                    inputMode={'numeric'}
                                    startAdornment={
                                        <InputAdornment position="start" sx={{ fontWeight: 'bold', fontSize: '1.5rem' }}>
                                            ***  **
                                        </InputAdornment>
                                    }
                                />
                                <Typography
                                    fontSize="1.0rem"
                                    pt={1}
                                    sx={{ display: 'flex', alignItems: 'center' }}
                                >
                                    By providing your last 4 of your SSN, we will attempt to find your information to expedite your request.
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sx={{ pt: 1 }}>
                                <PhoneNumberInputField
                                    label='Phone Number'
                                    phoneNumber={props.phoneNumber}
                                    onChange={handleChangePhoneNumber}
                                />
                            </Grid>
                        </Grid>
                    </Stack>
                    <Stack
                        width="100%"
                        justifyContent="flex-end"
                        gap={1}
                        pb={2}
                    >
                        <Grid container spacing={1}>
                            <Grid item xs={12} mb={1}>
                                <AuthAgreement />
                            </Grid>
                            <Grid item xs={12} mb={1}>
                                <ProveButton
                                    size="large"
                                    disabled={!isPhoneValid || socialSecurityError}
                                    onClick={handleContinueButton}
                                >
                                    Continue
                                </ProveButton>
                            </Grid>

                        </Grid>
                    </Stack>
                </>
            }
        </Container >
    )
}

export default EnterPhonePage;