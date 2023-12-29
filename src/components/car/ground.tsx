/* eslint-disable @typescript-eslint/ban-ts-comment */

import {animated, SpringValue} from "@react-spring/three";
import {RigidBody} from "@react-three/rapier";
import {Box} from "@react-three/drei";
import {CarConstants} from "./carConstants.ts";
import {ObstacleHitEvent} from "./obstacle.ts";
import {Terrain} from "./terrain.tsx";
import {Hole} from "./hole.tsx";
import {Ramp} from "./ramp.tsx";
import {Wall} from "./wall.tsx";

const BASE_HEIGHT = 20;

type GroundProps = {
  opacity: SpringValue;
  onGroundHit: () => void;
  onObstacleHit: (event: ObstacleHitEvent) => void;
};

const Base = ({ opacity, onGroundHit }: { opacity: SpringValue, onGroundHit: () => void }) => {
  return (
    <RigidBody
      type={'fixed'}
      position={[CarConstants.basePosX, BASE_HEIGHT * -0.5, 0]}
      onCollisionEnter={onGroundHit}
      friction={CarConstants.groundFriction}
    >
      <Box args={[CarConstants.groundLength, BASE_HEIGHT, CarConstants.baseDepth]} receiveShadow={true}>
        {/* @ts-ignore */}
        <animated.meshStandardMaterial
          metalness={0.15}
          roughness={0.75}
          color={'black'}
          transparent={true}
          opacity={opacity}
        />
      </Box>
    </RigidBody>
  )
}

const Ground = ({ opacity, onGroundHit, onObstacleHit }: GroundProps) => {
  return opacity.isAnimating ? null : (
      <>
        <Base opacity={opacity} onGroundHit={onGroundHit} />
        <Terrain />
        {/* Ramps, Holes & Walls */}
        <Wall opacity={opacity} position={[100,0,0]} onHit={() => onObstacleHit({ obstacle: 'WALL' })}/>
        <Ramp opacity={opacity} position={[150,0,0]} type={'up'}/>
        <Ramp opacity={opacity} position={[150+(CarConstants.rampWidth*2),0,0]} type={'flat'}/>
        <Hole position={[150+(CarConstants.rampWidth*2.5),0,0]} onHit={() => onObstacleHit({ obstacle: 'HOLE' })}/>
        <Ramp opacity={opacity} position={[150+(CarConstants.rampWidth*3.25),0,0]} type={'flat'}/>
        <Ramp opacity={opacity} position={[150+(CarConstants.rampWidth*4.25),0,0]} type={'down'}/>
      </>
    )
}

export { Ground }