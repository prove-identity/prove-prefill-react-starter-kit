import React from 'react';
import { Stack, Typography } from '@mui/material';

const FailurePage = () => {
    return (
        <Stack alignItems="center" gap={2} className="fadeIn">
            <Stack alignItems="center" gap={1}>
                <Typography component="h1" variant="h4" fontWeight="bold">Verification Completed</Typography>
                <Typography variant="body1" fontSize="1.4rem">Identity could not be verified</Typography>
            </Stack>
            <img className="fadeIn" width={70} height={70} src={`/img/failure.png`} />
        </Stack>
    )
}

export default FailurePage;