import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, CircularProgress, Container, Stack, Typography } from '@mui/material';
import { checkTrust, getVerifyStatus, resendAuthSMS } from '../services/ProveService';

const SMS_SEND_ATTEMPTS_LIMIT = 3;
const POLLING_INTERVAL_TIME_MS = 5000;

interface Props {
    accessToken: string;
    env: 'sandbox' | 'production';
    phoneNumber: string;
}

const SMSWaitingPage = (props: Props) => {
    const navigate = useNavigate();

    const checkTrustPollingHandle = useRef<NodeJS.Timer>();
    const [loading, setLoading] = useState<boolean>(true);
    const [currentSendAttempt, setCurrentSendAttempt] = useState<number>(0);
    const [sendingLink, setSendingLink] = useState<boolean>(false);

    const resendButtonDisabled = useMemo(() => {
        return currentSendAttempt > SMS_SEND_ATTEMPTS_LIMIT || sendingLink;
    }, [currentSendAttempt, sendingLink]);

    const handleResendLink = async () => {
        if (sendingLink || resendButtonDisabled) {
            return;
        }

        try {
            setCurrentSendAttempt(currentSendAttempt + 1);
            await resendAuthSMS(props.env, props.accessToken);
        } catch (e) {
            // don't show anything for now when the resend fails
        } finally {
            setSendingLink(false);
        }
    }

    const checkUserTrust = async () => {
        try {
            setLoading(true);

            const result = await checkTrust(props.env, props.phoneNumber, props.accessToken);
            if (result.data.verified) {
                startPolling();
            } else {
                alert('Your identity could not be verified.');
                navigate(-1);
            }
        } catch (e) {
            alert('An error ocurred while contacting our servers. Please try again.');
            navigate(-1);
        } finally {
            setLoading(false);
        }
    }

    const startPolling = () => {
        const pollingHandle = setInterval(async () => {
            try {
                const pollResult = await getVerifyStatus(props.env, props.accessToken);

                if (pollResult.data.possessionCheck) {
                    navigate('/confirm-dob');
                } else {
                    // The user has not clicked their link yet...
                }
            } catch (e) {
                navigate('/verify-failure');
            }
        }, POLLING_INTERVAL_TIME_MS);

        checkTrustPollingHandle.current = (pollingHandle);
    }

    const load = async () => {
        await checkUserTrust();
    }

    const cleanup = () => {
        if (checkTrustPollingHandle.current) {
            clearInterval(checkTrustPollingHandle.current);
        }
    }

    useEffect(() => {
        load();

        return () => {
            cleanup();
        }
    }, [])

    return (
        <Container>
            {loading ? <Box pt={4} display="flex" alignItems={'center'} justifyContent="center">
                <CircularProgress />
            </Box> :
                <Stack alignItems="center" gap={2} sx={{ animation: '0.4s fadeIn forwards' }}>
                    <Typography textAlign="center" component="h1" variant="h4" fontWeight="bold">Please click on the link sent to your mobile number</Typography>
                    <img className="fadeIn" width={70} height={70} src={`${process.env.PUBLIC_URL}/img/linkPhone.png`} alt="Prove Logo" />
                    <Stack alignItems="center" gap={.1}>
                        <Typography variant="body1">Didn't recieve the link?</Typography>
                        <Button sx={{ textTransform: "none" }} disabled={resendButtonDisabled} onClick={handleResendLink}>
                            <Typography variant="body1">Resend the Link</Typography>
                        </Button>
                    </Stack>
                </Stack>
            }
        </Container>
    )
}

export default SMSWaitingPage;