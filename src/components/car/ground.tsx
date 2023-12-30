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

type ObjectType = 'NONE' | 'WALL' | 'HOLE' | 'RAMP_UP' | 'RAMP_FLAT' | 'RAMP_DOWN';

type LevelObject = {
  type: ObjectType;
  posX: number;
}

const CHAR_TO_OBJECT_TYPE: Map<string, ObjectType> = new Map([
  ['_', 'NONE'],
  ['|', 'WALL'],
  ['X', 'HOLE'],
  ['/', 'RAMP_UP'],
  ['O', 'RAMP_FLAT'],
  ['L', 'RAMP_DOWN'],
]);

const buildLevelObjects = (level: string): LevelObject[] => {
  const LEVEL_OBJECT_WIDTH = CarConstants.objectWidth;
  const levelObjects: LevelObject[] = [];
  let posX = 0;
  level.split('').forEach(char => {
    const type = CHAR_TO_OBJECT_TYPE.get(char) as ObjectType;
    switch(type) {
      case 'NONE': break;
      default: levelObjects.push({ type, posX })
    }
    posX += LEVEL_OBJECT_WIDTH;
  })
  return levelObjects;
}

const LEVEL = "_/__/__/__L_|_/O_OL";

const levelObjects = buildLevelObjects(LEVEL);

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
        {levelObjects.map((levelObject, index) => {
          const key = `${index}`;
          switch(levelObject.type) {
            case 'WALL':      return <Wall key={key} opacity={opacity} position={[levelObject.posX, 0, 0]} onHit={() => onObstacleHit({ obstacle: 'WALL' })} />
            case 'RAMP_UP':   return <Ramp key={key} opacity={opacity} position={[levelObject.posX, 0, 0]} type={'up'} />
            case 'RAMP_FLAT': return <Ramp key={key} opacity={opacity} position={[levelObject.posX, 0, 0]} type={'flat'} />
            case 'RAMP_DOWN': return <Ramp key={key} opacity={opacity} position={[levelObject.posX, 0, 0]} type={'down'} />
            case 'HOLE':      return <Hole key={key} position={[levelObject.posX, 0, 0]} onHit={() => onObstacleHit({ obstacle: 'HOLE' })} />
          }
        })}
      </>
    )
}

export { Ground }