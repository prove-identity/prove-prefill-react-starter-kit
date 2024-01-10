import { useEffect, useMemo, useState } from "react";
import { useNavigate } from 'react-router-dom';
import moment, { Moment } from "moment";
import {
  Box,
  CircularProgress,
  Container,
  Stack,
  Typography,
} from "@mui/material";
import ProveButton from "../components/ProveButton";
import { eligibility, identity } from "../services/ProveService";
import DOBInputField from "../components/DOBInputField";

interface Props {
  accessToken: string;
}

const ConfirmDOB = ({ accessToken }: Props) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const [dob, setDOB] = useState<Moment | null>(null);

  const handleDOBChange = (newDOB: Moment | null) => {
    setDOB(newDOB);
  };

  const dobError = useMemo(() => !dob?.isValid(), [dob]);

  const formatQueryParams = (data: Record<string, any>) => {
    return Object.entries(data)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');
  };

  const verifyData = async (checkFunction: () => Promise<any>) => {
    try {
      const result = await checkFunction();
      if (!result.data.verified) {
        alert("We were unable to verify your data. Please try again.");
        return false;
      }
      return result;
    } catch (e) {
      console.error('Verification error:', e);
      alert("An error occurred when verifying your identity. Please check your information and try again.");
      return false;
    }
  };

  const checkIdentity = async () => {
    const formattedDOB = moment(dob).format("YYYY-MM-DD");
    return verifyData(() => identity(formattedDOB, accessToken));
  };

  const checkEligibility = async () => {
    return verifyData(() => eligibility(accessToken));
  };

  const processVerification = async () => {
    setLoading(true);

    try {
      const eligibilityResult = await checkEligibility();
      if (!eligibilityResult) return;

      const identityResult = await checkIdentity();
      if (!identityResult) return;

      const { prefillData, manualEntryRequired } = identityResult.data;
      let prefillQueryParams = '';
      if (!manualEntryRequired) {
        prefillQueryParams = formatQueryParams(prefillData);
      }
      navigate(`/review?${prefillQueryParams}`);
    } catch (e) {
      console.error('Error during verification:', e);
      alert("An error occurred during the verification process. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    processVerification();
  }, []);

  return (
    <Container>
      {loading ? (
        <Box display="flex" alignItems="center" justifyContent="center" pt={4}>
          <CircularProgress />
        </Box>
      ) : (
        <Stack alignItems="center" gap={2.5} className="fadeIn">
          <Typography
            textAlign="center"
            component="h1"
            variant="h4"
            fontWeight="bold"
          >
            Phone Verified!
            <br />
            Enter your date of birth to verify your identity
          </Typography>
          <Stack alignItems="center" gap={1.5} width="100%">
            <DOBInputField
              dob={dob}
              dobError={dobError}
              onDOBChanged={handleDOBChange}
              fontSize="large"
            />
            <Stack
              width="100%"
              justifyContent="flex-end"
              gap={2}
              mt={0.75}
              pb={2}
            >
              <ProveButton
                size="large"
                disabled={dobError || loading}
                onClick={checkIdentity}
              >
                Continue
              </ProveButton>
            </Stack>
          </Stack>
        </Stack>
      )}
    </Container>
  );
};

export default ConfirmDOB;
