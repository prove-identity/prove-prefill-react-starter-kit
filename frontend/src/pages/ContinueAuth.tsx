import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, CircularProgress, Container, Typography } from '@mui/material';
import { getInstantAuthResult } from '../services/ProveService';
import {AppEnv} from '../../src/services/ProveService';

/* 
Sample url:
    https://verify.url.io/mobile/:userAuthGuid?vfp=<vfp>
*/

interface Props {
    env: AppEnv;
    vfp: string;
    isRedirected?: boolean;
}

const ContinueAuth = (props: Props) => {
    let { env, userAuthGuid } = useParams();

    const [verified, setVerified] = useState<boolean>();
    const [loading, setLoading] = useState<boolean>(true);

    const load = async () => {
        if (props.vfp) {
            if (props.isRedirected && userAuthGuid && env) {
                try {
                    const authResult = await getInstantAuthResult(props.vfp, userAuthGuid);
                    console.log('authResult: ', authResult);
                    setVerified(authResult.data.verified);
                } catch (e) {
                    setVerified(false);
                } finally {
                    setLoading(false);
                }
            } else {
                const envType = import.meta.env.REACT_APP_ENV === 'production' ? 'PROD' : 'SANDBOX';
                const continueAuthURL = import.meta.env[`REACT_APP_CONTINUE_AUTH_URL_${envType}`] || 'defaultURL';
                window.location.href = `${continueAuthURL}?vfp=${props.vfp}`;
            }
        }
    }

    useEffect(() => {
        load();
    }, [])

    if (!props.vfp) {
        return null;
    }

    return (
        <Container maxWidth={'sm'}>
            <Box
                display="flex"
                justifyContent="center"
                height="100%"
                width="100%"
            >
                <Box
                    display="flex"
                    justifyContent="center"
                    pt={'200px'}
                    width="100%"
                >
                    {
                        loading ?
                            <CircularProgress />
                            : <Typography
                                variant="caption"
                                textAlign="center"
                                sx={{
                                    lineHeight: '32px',
                                    fontSize: '24px',
                                    marginBottom: '32px',
                                    margin: 'auto',
                                    color: 'white',
                                }}
                            >
                                {verified ?
                                    'Your identity is verified. Please go back to the app to complete this process.'
                                    : 'An error occurred and you could not be verified. Please contact support.'
                                }
                            </Typography>
                    }
                </Box>
            </Box>
        </Container>
    );
}

export default ContinueAuth;