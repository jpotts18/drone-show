// src/Gallery.tsx
import React from "react";
import { Link as RouterLink } from "react-router-dom";
import { Box, SimpleGrid, Image, Text, Stack, Heading } from "@chakra-ui/react";

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
  {
    id: "easing",
    title: "Easing Functions",
    description: "Visualizing easing functions.",
    image: "/images/easing.png", // Provide appropriate images
  },
  {
    id: "sphere",
    title: "Beating Sphere",
    description: "A sphere with a texture.",
    image: "/images/sphere.png", // Provide appropriate images
  },
  {
    id: "cube",
    title: "Pulsating Cube",
    description: "Cube with drones.",
    image: "/images/cube.png", // Provide appropriate images
  },
  {
    id: "disk",
    title: "Disk Ripple",
    description: "Disk with drones.",
    image: "/images/disk.png", // Provide appropriate images
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
          <RouterLink key={exp.id} to={`/${exp.id}`}>
            <Box borderWidth="1px" borderRadius="lg" overflow="hidden">
              <Image
                src={import.meta.env.BASE_URL + exp.image}
                alt={exp.title}
              />
              <Box p={6}>
                <Stack spacing={2}>
                  <Heading size="md">{exp.title}</Heading>
                  <Text>{exp.description}</Text>
                </Stack>
              </Box>
            </Box>
          </RouterLink>
        ))}
      </SimpleGrid>
    </Box>
  );
};

export default Gallery;
