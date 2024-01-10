import { ChangeEvent, useEffect, useMemo, useState } from 'react';
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
    const [last4, setLast4] = useState<string | null>('');

    const isPhoneValid = useMemo(() => {
        return matchIsValidTel(props.phoneNumber)
    }, [props.phoneNumber]);

    const socialSecurityError = useMemo(() => {
        return !last4 || isNaN(parseInt(last4!)) || last4?.length !== 4;
    }, [last4]);

    const handleLast4Change = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.value.length <= 4) {
            setLast4(e.target.value);
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
                                    value={last4}
                                    onChange={handleLast4Change}
                                    startAdornment={
                                        <InputAdornment position="start" sx={{ fontWeight: 'bold', fontSize: '1.5rem' }}>
                                            ***  **
                                        </InputAdornment>
                                    }
                                />
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
                        <AuthAgreement />
                        <ProveButton
                            size="large"
                            disabled={!isPhoneValid || socialSecurityError}
                            onClick={handleContinueButton}
                        >
                            Continue
                        </ProveButton>
                    </Stack>
                </>
            }
        </Container >
    )
}

export default EnterPhonePage;