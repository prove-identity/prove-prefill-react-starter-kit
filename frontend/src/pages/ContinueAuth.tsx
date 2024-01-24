import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, CircularProgress, Container, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { InstantAuthResult, getInstantAuthResult } from '../services/ProveService';
import { AppEnv } from '../services/ProveService';

interface Props {
    env: AppEnv;
    vfp: string;
    isRedirected?: boolean;
    onAuthSuccessMobile?: (data: { mobileAccessToken: string; last4: string }) => void;
}

const useAuthenticateUser = (vfp: string, userAuthGuid: string | undefined, env: string) => {
    const [authResult, setAuthResult] = useState<InstantAuthResult | null>();
    const [loading, setLoading] = useState(true);
    const [verified, setVerified] = useState<boolean>();

    useEffect(() => {
        if (vfp && userAuthGuid && env) {
            (async () => {
                try {
                    const result = await getInstantAuthResult(vfp, userAuthGuid) as InstantAuthResult;
                    setVerified(result.data.verified);
                    setAuthResult(result as InstantAuthResult);
                } catch (e) {
                    setAuthResult(null);
                } finally {
                    setLoading(false);
                }
            })();
        } else {
            const continueAuthURL = env === AppEnv.PRODUCTION ? import.meta.env.REACT_APP_CONTINUE_AUTH_URL_PROD : import.meta.env.REACT_APP_CONTINUE_AUTH_URL_SANDBOX;
            window.location.href = `${continueAuthURL}?vfp=${vfp}`;
        }
    }, [vfp, userAuthGuid, env]);

    return { authResult, loading, verified };
};

const ContinueAuth = ({ env, vfp, isRedirected, onAuthSuccessMobile }: Props) => {
    const { t } = useTranslation();
    const { userAuthGuid } = useParams();
    const navigate = useNavigate();

    const { authResult, loading, verified } = useAuthenticateUser(vfp, userAuthGuid, env);

    useEffect(() => {
        if (authResult?.data?.verified && onAuthSuccessMobile && authResult.data.isMobile) {
            onAuthSuccessMobile({
                mobileAccessToken: authResult.data.access_token as string,
                last4: authResult.data.last4 as string
            });
            navigate(`/review`);
        }
    }, [authResult, onAuthSuccessMobile, navigate]);

    if (!vfp || (!isRedirected && userAuthGuid && env)) {
        return null;
    }

    return (
        <Container maxWidth={'sm'}>
            <Box display="flex" justifyContent="center" height="100%" width="100%">
                <Box display="flex" justifyContent="center" pt={'200px'} width="100%">
                    {loading ? (
                        <CircularProgress />
                    ) : (
                        <Typography
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
                            {verified ? t('continueAuth.successMessage') : t('continueAuth.errorMessage')}
                        </Typography>
                    )}
                </Box>
            </Box>
        </Container>
    );
}

export default ContinueAuth;
