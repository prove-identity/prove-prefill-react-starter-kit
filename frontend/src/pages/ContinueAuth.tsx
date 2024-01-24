import { MutableRefObject, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, CircularProgress, Container, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { getInstantAuthResult } from '../services/ProveService';
import { AppEnv } from '../../src/services/ProveService';

interface Props {
    env: AppEnv;
    vfp: string;
    isRedirected?: boolean;
    accessToken?: MutableRefObject<string>;
    handleAppReady?: (e: any) => void;
    handleLast4?: (e: any) => void;
}

const ContinueAuth = (props: Props) => {
    const { t } = useTranslation();
    let { userAuthGuid } = useParams();
    const navigate = useNavigate();

    const [verified, setVerified] = useState<boolean>();
    const [loading, setLoading] = useState<boolean>(true);

    const load = async () => {
        if (props.vfp) {
            if (props.isRedirected && userAuthGuid && props.env) {
                try {
                    const authResult = await getInstantAuthResult(props.vfp, userAuthGuid);
                    console.log('authResult: ', authResult);
                    setVerified(authResult.data.verified);
                    if(authResult?.data?.verified === true && authResult?.data?.isMobile === true ) {
                        //@ts-ignore
                        props.accessToken.current = authResult?.data?.access_token as string;
                        //@ts-ignore
                        props.handleAppReady(true); 
                        //@ts-ignore
                        //TODO: issue with passing back last4
                        props.handleLast4()
                        navigate('/review');
                    }
                } catch (e) {
                    setVerified(false);
                } finally {
                    setLoading(false);
                }
            } else {
                const continueAuthURL = props.env === AppEnv.PRODUCTION ? import.meta.env.REACT_APP_CONTINUE_AUTH_URL_PROD : import.meta.env.REACT_APP_CONTINUE_AUTH_URL_SANDBOX;
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