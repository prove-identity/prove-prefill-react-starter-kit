import React from 'react';
import { Stack, Typography } from '@mui/material';

// Possible TODO: Merge with Failure Page? What if we want them to be different in the future?
const ConfirmationPage = () => {
    return (
        <Stack alignItems="center" gap={2} className="fadeIn">
            <Stack alignItems="center" gap={1}>
                <Typography component="h1" variant="h4" fontWeight="bold">Congratulations</Typography>
                <Typography variant="body1" fontSize="1.4rem">Identity Verified</Typography>
            </Stack>
            <img className="fadeIn" width={70} height={70} src={`${process.env.PUBLIC_URL}/img/success.png`} />
        </Stack>
    )
}

export default ConfirmationPage;