import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, CircularProgress, Container, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { getInstantAuthResult } from '../services/ProveService';
import { AppEnv } from '../../src/services/ProveService';

interface Props {
    env: AppEnv;
    vfp: string;
    isRedirected?: boolean;
}

const ContinueAuth = (props: Props) => {
    const { t } = useTranslation();
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
                    //TODO: handle isMobile here (to continue in the auth flow)
                    //TODO: need to handle accessToken setting logic for isMobile
                } catch (e) {
                    setVerified(false);
                } finally {
                    setLoading(false);
                }
            } else {
                const envType = props.env === 'production' ? 'PROD' : 'SANDBOX';
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
                                    t('continueAuth.successMessage')
                                    : t('continueAuth.errorMessage')
                                }
                            </Typography>
                    }
                </Box>
            </Box>
        </Container>
    );
}

export default ContinueAuth;