import React, { useMemo, useState } from 'react';
import { matchIsValidTel, MuiTelInputInfo } from 'mui-tel-input';
import { NAV_HEIGHT } from '../constants';
import { Container, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ProveButton from '../components/ProveButton';
import AuthAgreement from '../components/AuthAgreement';
import PhoneNumberInputField from '../components/PhoneNumberInputField';

interface EnterPhonePageProps {
    accessToken: string;
    env: 'sandbox' | 'production';
    phoneNumber: string;
    onPhoneNumberChanged: (e: any) => void;
}

const EnterPhonePage = (props: EnterPhonePageProps) => {
    const navigate = useNavigate();

    const [error, setError] = useState<string>('');

    const [consent, setConsent] = useState<boolean>(false);

    const handleConsent = () => setConsent(!consent);

    const isPhoneValid = useMemo(() => {
        if (props.env === 'sandbox') {
            return props.phoneNumber.length === 12; // 10 number + 2 spaces
        }
        return matchIsValidTel(props.phoneNumber)
    }, [props.phoneNumber]);

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
                    <Stack flexGrow={1} mb={1} className="fadeInSlow">
                        <Typography
                            textAlign="center"
                            component="h1"
                            variant="h4"
                            fontWeight="bold"
                            pb={1}
                        >
                            Identity Verification
                        </Typography>
                        <PhoneNumberInputField
                            phoneNumber={props.phoneNumber}
                            onChange={handleChangePhoneNumber}
                        />
                    </Stack>
                    <Stack
                        width="100%"
                        justifyContent="flex-end"
                        gap={1}
                        pb={2}
                    >
                        <AuthAgreement
                            checked={consent}
                            onChange={handleConsent}
                        />
                        <ProveButton
                            size="large"
                            disabled={!consent || !isPhoneValid}
                            onClick={handleContinueButton}
                        >
                            Continue
                        </ProveButton>
                        <a
                            style={{ textAlign: 'center' }}
                            href="https://www.prove.com/legal/overview#Enduser"
                            rel="noreferrer"
                            target="_blank"
                        >
                            <Typography fontSize="12px" variant="body1">Terms & Conditions</Typography>
                        </a>
                    </Stack>
                </>
            }
        </Container >
    )
}

export default EnterPhonePage;