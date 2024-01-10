import { useTheme } from '@mui/material/styles';

const Logo = () => {
    const theme = useTheme();

    const logoSrc = theme.palette.mode === 'dark' ? '/img/proveLogo-light.png' : '/img/proveLogo-light.png';

    return (
        <>
            <img className="fadeIn" src={logoSrc} alt="Prove Logo" />
        </>
    );
}


export default Logo;
