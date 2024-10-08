// src/components/ExperimentLayout.tsx
import React, { ReactNode } from "react";
import { Box, Flex, Heading, IconButton, Spacer } from "@chakra-ui/react";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";

interface ExperimentLayoutProps {
  title: string;
  children: ReactNode;
}

const ExperimentWrapper: React.FC<ExperimentLayoutProps> = ({
  title,
  children,
}) => {
  const navigate = useNavigate();

  return (
    <Flex direction="column" height="100vh">
      {/* Navigation Bar */}
      <Flex
        as="nav"
        align="center"
        justify="space-between"
        padding="1rem"
        bg="teal.500"
        color="white"
        zIndex={100}
      >
        <IconButton
          aria-label="Back to Gallery"
          icon={<ArrowBackIcon />}
          onClick={() => navigate("/")}
          variant="ghost"
          color="white"
        />
        <Heading size="md">{title}</Heading>
        <Spacer />
      </Flex>

      {/* Content Area */}
      <Box flex="1" position="relative" overflow="hidden">
        {children}
      </Box>
      {/* dat.GUI Container */}
      <div
        id="gui-container"
        style={{
          position: "absolute",
          top: "160px", // Adjust based on your navigation bar height
          right: "0",
          zIndex: 1000,
        }}
      />
    </Flex>
  );
};

export default ExperimentWrapper;
