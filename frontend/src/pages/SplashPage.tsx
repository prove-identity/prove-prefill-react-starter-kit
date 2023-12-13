import { Button, Stack, Typography, Box } from "@mui/material";
import { useEffect } from "react";

const customProps = {
  bgColor: "#d3e3ea",
  primaryColor: "#949ce1",
};

const buttonProperties = {
  height: "10rem",
  width: "30rem",
  fontSize: "large",
};
const SplashPage = (props: any) => {
  const isPreviewMode = props?.isPreviewMode === true;
  if (props.backgroundColor) {
    customProps.bgColor = props.backgroundColor;
  }
  if (props.primaryColor) {
    customProps.primaryColor = props.primaryColor;
  }

  useEffect(() => {
    const mainContainerElements = document.getElementsByClassName(
      "main-container"
    ) as any;
    if (mainContainerElements.length > 0) {
      for (const element of mainContainerElements) {
        element.style.backgroundColor = customProps.bgColor;
      }
    }
  }, []);
  const handleClick = () => {
    console.log("Button clicked!");
    window.open("/confirm-dob", "_self");
  };

  return (
    <Stack alignItems="center" gap={2} className="fadeIn text-center">
      <Typography
        variant="h3"
        component="h3"
        gutterBottom
        mx={isPreviewMode ? 5 : 10}
      >
        Welcome to Swift Confirm
      </Typography>
      <Box mt={4} my={isPreviewMode ? 5 : 20}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={handleClick}
          style={{
            backgroundColor: customProps.primaryColor,
            ...(isPreviewMode ? {} : buttonProperties),
          }}
        >
          Verify Me!
        </Button>
      </Box>
    </Stack>
  );
};

export default SplashPage;
