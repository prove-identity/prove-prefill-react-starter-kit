import React, { useEffect, useMemo, useState } from "react";
import moment, { Moment } from "moment";
import {
  Box,
  CircularProgress,
  Container,
  Stack,
  Typography,
} from "@mui/material";
import ProveButton from "../components/ProveButton";
import { identity } from "../services/ProveService";
import DOBInputField from "../components/DOBInputField";
import { sleep } from "../util/helpers";

interface Props {
  accessToken: string;
}

const ConfirmDOB = (props: Props) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [dob, setDOB] = useState<Moment | null>(null);

  const handleDOBChange = (newDOB: Moment | null) => {
    setDOB(newDOB);
  };

  const dobError = useMemo(() => {
    return !dob?.isValid();
  }, [dob]);

  const checkIdentity = async () => {
    if (loading) {
      return;
    }

    setLoading(true);
    const formattedDOB = moment(dob).format("YYYY-MM-DD");

    try {
      const idResult = await identity(
        formattedDOB,
        props.accessToken
      );
      if (idResult.data.verified) {
        const prefillData = idResult.data.prefillData;
        let prefillQueryParams = "";
        if (!idResult.data.manualEntryRequired) {
          // @ts-ignore
          prefillQueryParams = Object.keys(prefillData)
            // @ts-ignore
            .map((key) => key + "=" + prefillData[key])
            .join("&");
        }

        window.open(`/review?${prefillQueryParams}`, "_self");
      } else {
        alert("We were unable to verify your data. Please try again.");
      }
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  const load = async () => {
    setLoading(true);

    try {
      await sleep(3);
    } catch (e) {
      alert(
        "An error ocurred when verifying your identity. Please check your information and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
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
