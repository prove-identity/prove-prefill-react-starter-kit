import React from 'react';
import { Box, Checkbox, Typography } from '@mui/material';

interface AuthAgreementProps {
    checked?: boolean;
    onChange: () => void;
}

const AuthAgreement = (props: AuthAgreementProps) => {
    return (
        <Box display="flex" pb={1.5}>
            <Checkbox
                size="medium"
                checked={props.checked}
                onChange={props.onChange}
                disableRipple
                sx={{
                    transform: 'scale(1.8)'
                }}
            />
            <Typography
                fontSize="1.1rem"
                pl={1}
                color="rgb(0,0,0,.6)"
                sx={{ display: 'flex', alignItems: 'center' }}
            >
                I authorize your wireless carrier to use or disclose information about my account.
            </Typography>
        </Box>
    )
}

export default AuthAgreement;