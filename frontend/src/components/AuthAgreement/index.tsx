import { Box, Grid, Typography } from '@mui/material';

const AuthAgreement = () => {
    return (
        <Box display="flex" pb={1.5}>
            <Grid container spacing={1}>
                <Grid item xs={12}>
                    <Typography
                            fontSize="1.1rem"
                            pl={1}
                            sx={{ display: 'flex', alignItems: 'center' }}
                        >
                        By providing your date of birth, First Street will attempt to find your information to expedite your request.
                    </Typography>
                </Grid>
                <Grid item xs={12}>
                    <Typography
                        fontSize="1.1rem"
                        pl={1}
                        sx={{ display: 'flex', alignItems: 'center' }}
                    >
                        By clicking 'Continue' you accept our Terms and Conditions
                    </Typography>
                </Grid>
            </Grid>
        </Box>
    )
}

export default AuthAgreement;