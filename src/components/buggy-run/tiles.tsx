/* eslint-disable @typescript-eslint/ban-ts-comment */

import {animated, SpringValue} from "@react-spring/three";
import {RigidBody} from "@react-three/rapier";
import {Box} from "@react-three/drei";

const TILE_WIDTH = 0.25;
const TILE_HEIGHT = 2;
const TILE_DEPTH = 2;

const Tile = ({ opacity, ...props } : { opacity: SpringValue } & JSX.IntrinsicElements['group']) => {
  return (
    <group position-y={TILE_HEIGHT * 0.5}>
      <RigidBody
        type={'dynamic'}
        position={props.position}
        mass={0.0001}
      >
        <Box args={[TILE_WIDTH,TILE_HEIGHT,TILE_DEPTH]}>
          {/* @ts-ignore */}
          <animated.meshStandardMaterial
            metalness={0.45}
            roughness={0.75}
            color={'white'}
            transparent={true}
            opacity={opacity}
          />
        </Box>
      </RigidBody>
    </group>
  );
};

const Tiles = ({ opacity, ...props } : { opacity: SpringValue } & JSX.IntrinsicElements['group']) => {
  return (
    <group position={props.position}>
      <Tile opacity={opacity} position={[0, TILE_HEIGHT * 0.5, TILE_DEPTH * 1.5]} />
      <Tile opacity={opacity} position={[0, TILE_HEIGHT * 0.5, TILE_DEPTH * 0.5]} />
      <Tile opacity={opacity} position={[0, TILE_HEIGHT * 0.5, TILE_DEPTH * -0.5]} />
      <Tile opacity={opacity} position={[0, TILE_HEIGHT * 0.5, TILE_DEPTH * -1.5]} />

      <Tile opacity={opacity} position={[0, TILE_HEIGHT * 1.5, TILE_DEPTH * 1.5]} />
      <Tile opacity={opacity} position={[0, TILE_HEIGHT * 1.5, TILE_DEPTH * 0.5]} />
      <Tile opacity={opacity} position={[0, TILE_HEIGHT * 1.5, TILE_DEPTH * -0.5]} />
      <Tile opacity={opacity} position={[0, TILE_HEIGHT * 1.5, TILE_DEPTH * -1.5]} />

      <Tile opacity={opacity} position={[0, TILE_HEIGHT * 2.5, TILE_DEPTH * 1.5]} />
      <Tile opacity={opacity} position={[0, TILE_HEIGHT * 2.5, TILE_DEPTH * 0.5]} />
      <Tile opacity={opacity} position={[0, TILE_HEIGHT * 2.5, TILE_DEPTH * -0.5]} />
      <Tile opacity={opacity} position={[0, TILE_HEIGHT * 2.5, TILE_DEPTH * -1.5]} />

      <Tile opacity={opacity} position={[0, TILE_HEIGHT * 3.5, TILE_DEPTH * 1.5]} />
      <Tile opacity={opacity} position={[0, TILE_HEIGHT * 3.5, TILE_DEPTH * 0.5]} />
      <Tile opacity={opacity} position={[0, TILE_HEIGHT * 3.5, TILE_DEPTH * -0.5]} />
      <Tile opacity={opacity} position={[0, TILE_HEIGHT * 3.5, TILE_DEPTH * -1.5]} />
    </group>
  );
};

export { Tiles }