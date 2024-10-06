// src/Gallery.tsx
import React from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  SimpleGrid,
  Image,
  Text,
  Link,
  Stack,
  Heading,
} from "@chakra-ui/react";

const experiments = [
  {
    id: "bubblewave",
    title: "Bubble Wave",
    description: "A wave of bubbles using Three.js.",
    image: "/images/bubblewave.png", // Provide appropriate images
  },
  {
    id: "boids",
    title: "Bird Flock simulation",
    description: "A flock of boids.",
    image: "/images/boids.png", // Provide appropriate images
  },
];

const Gallery: React.FC = () => {
  return (
    <Box p={5}>
      <Heading mb={6} textAlign="center">
        My Three.js Experiments
      </Heading>
      <SimpleGrid columns={[1, 2, 3]} spacing={10}>
        {experiments.map((exp) => (
          <Box
            key={exp.id}
            borderWidth="1px"
            borderRadius="lg"
            overflow="hidden"
          >
            <Image src={import.meta.env.BASE_URL + exp.image} alt={exp.title} />
            <Box p={6}>
              <Stack spacing={2}>
                <Heading size="md">{exp.title}</Heading>
                <Text>{exp.description}</Text>
                <Link
                  as={RouterLink}
                  to={`/${exp.id}`}
                  color="teal.500"
                  fontWeight="bold"
                >
                  View Experiment
                </Link>
              </Stack>
            </Box>
          </Box>
        ))}
      </SimpleGrid>
    </Box>
  );
};

export default Gallery;
