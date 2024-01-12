import { Box, Button, Typography } from '@mui/material';

const AuthAgreement = () => {
    return (
        <Box display="flex" alignItems="center">
            <Typography fontSize="1.2rem">
                By clicking 'Continue' you accept our{' '}
                <Button 
                    color="primary" 
                    variant="text" 
                    href="https://www.prove.com/legal/overview#End-User-Terms-Conditions" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{
                        padding: 0,
                        minWidth: 'auto', 
                        lineHeight: 'inherit',
                        verticalAlign: 'baseline'
                    }}
                >
                    Terms and Conditions
                </Button>
            </Typography>
        </Box>
    );
}

export default AuthAgreement;
