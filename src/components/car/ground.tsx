/* eslint-disable @typescript-eslint/ban-ts-comment */

import {animated, SpringValue} from "@react-spring/three";
import {RigidBody} from "@react-three/rapier";
import {Box} from "@react-three/drei";

const WALL_COLOR = 0x11568E;
const WALL_HEIGHT = 6;
const WALL_WIDTH = 6;
const BASE_HEIGHT = 3;
const BASE_WIDTH = 30;
const GROUND_LENGTH = 1000;

const BASE_POS_OFFSET_X = -20;
const BASE_POS_X = GROUND_LENGTH * 0.5 + BASE_POS_OFFSET_X;
const BASE_POS_Y = BASE_HEIGHT * -0.5;

const WALL_OFFSET_Y = (BASE_HEIGHT * 0.5) + (WALL_HEIGHT * 0.5)
const WALL_OFFSET_Z = (BASE_WIDTH * 0.5) - (WALL_WIDTH * 0.5);

const NUM_MARKERS = 100;
const MARKER_SIZE = 1;
const MARKER_OFFSET = GROUND_LENGTH / NUM_MARKERS;
const MARKER_POSITIONS_X = new Array(NUM_MARKERS);
for (let i = 0; i<NUM_MARKERS; i++) {
  MARKER_POSITIONS_X[i] = (i * MARKER_OFFSET) + BASE_POS_OFFSET_X + (MARKER_SIZE * 0.5);
}
const MARKER_POS_Y = BASE_HEIGHT + (WALL_HEIGHT * 0.5) + (MARKER_SIZE * 0.5);
const MARKER_COLOR = 'red';

const Ground = ({ opacity, onGroundHit }: { opacity: SpringValue, onGroundHit: () => void; }) => {
  return opacity.isAnimating ? null : (
      <>
        <RigidBody type={'fixed'} position={[BASE_POS_X, BASE_POS_Y, 0]} onCollisionEnter={onGroundHit}>
          {/* Base */}
          <Box args={[GROUND_LENGTH, BASE_HEIGHT, BASE_WIDTH]} receiveShadow={true}>
            {/* @ts-ignore */}
            <animated.meshStandardMaterial
              metalness={0.15}
              roughness={0.75}
              color={0x2176AE}
              transparent={true}
              opacity={opacity}
            />
          </Box>
          {/* Walls */}
          <Box args={[GROUND_LENGTH, WALL_HEIGHT, WALL_WIDTH]} position={[0, WALL_OFFSET_Y, -WALL_OFFSET_Z]} receiveShadow={true}>
            {/* @ts-ignore */}
            <animated.meshStandardMaterial
              metalness={0.15}
              roughness={0.75}
              color={WALL_COLOR}
              transparent={true}
              opacity={opacity}
            />
          </Box>
          <Box args={[GROUND_LENGTH, WALL_HEIGHT, WALL_WIDTH]} position={[0, WALL_OFFSET_Y, WALL_OFFSET_Z]} receiveShadow={true}>
            {/* @ts-ignore */}
            <animated.meshStandardMaterial
              metalness={0.15}
              roughness={0.75}
              color={WALL_COLOR}
              transparent={true}
              opacity={opacity}
            />
          </Box>
        </RigidBody>
        {MARKER_POSITIONS_X.map((posX, index) =>
          <Box key={`${index}`} args={[MARKER_SIZE, MARKER_SIZE, MARKER_SIZE]} position={[posX, MARKER_POS_Y, WALL_OFFSET_Z]} receiveShadow={true}>
            {/* @ts-ignore */}
            <animated.meshStandardMaterial
              metalness={0.15}
              roughness={0.75}
              color={MARKER_COLOR}
              transparent={true}
              opacity={opacity}
            />
          </Box>
        )}
      </>
    )
}

export { Ground }