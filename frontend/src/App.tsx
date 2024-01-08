import { useEffect, useRef, useState } from "react";
import { Route, Routes, useLocation, } from "react-router-dom";
import {
  Box,
  CircularProgress,
  styled,
  Typography,
} from "@mui/material";
import FailurePage from "./pages/FailurePage";
import SuccessPage from "./pages/SuccessPage";
import ConfirmDOB from "./pages/ConfirmDOB";
import ReviewInfo from "./pages/ReviewInfo";
import { NAV_HEIGHT } from "./constants";
import SMSWaitingPage from "./pages/SMSWaitingPage";
import EnterPhonePage from "./pages/EnterPhonePage";
import ContinueAuth from "./pages/ContinueAuth";
import { AppEnv, exchangePublicTokenForAccessToken, SessionConfig } from "./services/ProveService";
import Logo from "./components/Logo";
import { v4 as uuid } from 'uuid';

const AppContainer = styled(Box)`
  width: 100%;
  height: 100%;
`;

const WidgetOverlay = styled(Box)`
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  background-color: 'rgba(144, 144, 144, 0.98)';
  height: 100%;
`;

const MainContainer = styled(Box)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
`;

const MainContent = styled(Box)(({ theme }) => ({
  flex: "0 0 auto",
  margin: "auto",
  borderRadius: "16px",
  width: "100%",
  minHeight: "320px",
  height: "100%",
  marginTop: "20px",
  [theme.breakpoints.up("sm")]: {
    width: "360px",
  },
}));

const CompWrapper = styled("main")`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 100%;
  height: 100%;
  width: 100%;
  margin: 0;
  margin-top: 10px;
  flex-grow: 1;
  padding: 0 1.8rem;
`;

const Nav = styled("nav")`
  display: flex;
  flex: 0 0 auto;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  height: ${NAV_HEIGHT};
`;

const NavTitle = styled("span")`
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: 0.8rem;
  font-size: 17px;
  font-weight: 600;
  letter-spacing: -0.3px;

  img {
    width: 74px;
  }
`;

export const Layout = ({ children }: { children: any }) => {
  return (
    <MainContent className="fadeIn main-container">
      <Nav>
        <NavTitle>
          <Logo />
        </NavTitle>
      </Nav>
      <div id="animationWrapper">{children}</div>
    </MainContent>
  );
};

const App = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const vfp = searchParams.get('vfp');
  const sessionId = searchParams.get('sessionId') || `${uuid()}`;
  const userId = searchParams.get('userId') || "123456";

  const sessionData = useRef<SessionConfig | null>()
  const accessToken = useRef<string>('');
  const appEnv = useRef<AppEnv>((import.meta.env.REACT_APP_ENV || AppEnv.STAGING) as AppEnv);

  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [error, setError] = useState<string>();
  const [ready, setReady] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const exchangeTokenAndOpenApp = async (config: SessionConfig) => {
    try {
      const newConfigData = {
        sessionId: config.sessionId as string,
        userId: config.userId as string
      };
      sessionData.current = newConfigData;

      if (!sessionData.current?.sessionId) {
        alert('No session token provided');
        return;
      }

      // exchange public token for access token
      const exchangeResult = await exchangePublicTokenForAccessToken(sessionData.current!);

      if (exchangeResult.data.access_token) {
        accessToken.current = (exchangeResult.data.access_token);
        // Allow the UI to be shown to the consumer 
        setReady(true);
      } else {
        throw new Error();
      }
    } catch (e: any) {
      setError('An error occurred while contacting our server. Please try again.')
    } finally {
      setLoading(false);
    }
  }

  const initApp = async (config: SessionConfig) => {
    try {
      //INITIAL LOAD OF CLIENT-SIDE APP
      await exchangeTokenAndOpenApp({
        sessionId: config.sessionId as string,
        userId: config.userId as string
      });
      setReady(true);
    } catch (e: any) {
      setLoading(false);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    console.log('Effect running with sessionId:', sessionId, 'and userId:', userId);
    if(!vfp) {
      initApp({ sessionId: sessionId, userId: userId });
    }
  }, []); // This effect runs when either sessionId or userId changes

  // For the ContinueAuth path (when the user clicks the SMS link), we use a different router
  if (vfp) {
    return (
      <AppContainer>
        <Routes>
          <Route path="/:env?" element={<ContinueAuth vfp={vfp} env={appEnv.current} />} />
          <Route path="/:env/:userAuthGuid" element={<ContinueAuth vfp={vfp} env={appEnv.current} isRedirected />} />
        </Routes>
      </AppContainer>
    )
  }

  return (
    <AppContainer className={"main-container"}>
      <WidgetOverlay>
        <MainContainer>
          {loading ? (
            <Box sx={{ background: "transparent", zIndex: 2147483648 }}>
              <CircularProgress />
            </Box>
          ) : (
            <CompWrapper>
              <Layout>
                {ready && !error ? (
                  <Routes>
                    <Route
                      path="confirm-dob"
                      element={
                        <ConfirmDOB accessToken={accessToken.current} />
                      }
                    />
                    <Route
                      path="review"
                      element={
                        <ReviewInfo accessToken={accessToken.current} />
                      }
                    />
                    <Route path="sms-waiting" element={
                      <SMSWaitingPage phoneNumber={phoneNumber} accessToken={accessToken.current!} />
                    } />
                    <Route path="verify-success" element={
                      <SuccessPage />
                    } />
                    <Route path="verify-failure" element={
                      <FailurePage />
                    } />
                    <Route path="*" element={
                      <EnterPhonePage phoneNumber={phoneNumber} onPhoneNumberChanged={setPhoneNumber} accessToken={accessToken.current!} />
                    } />
                  </Routes>
                ) : (
                  <MainContent display="flex">
                    <Typography
                      variant="caption"
                      textAlign="center"
                      sx={{
                        lineHeight: "32px",
                        fontSize: "24px",
                        marginBottom: "32px",
                        margin: "auto",
                        color: "rgb(0,0,0,.6)",
                        p: 1,
                      }}
                    >
                      {error ||
                        "We ran into an error. Please refresh and try again."}
                    </Typography>
                  </MainContent>
                )}
              </Layout>
            </CompWrapper>
          )}
        </MainContainer>
      </WidgetOverlay>
    </AppContainer>
  );
};

export default App;
