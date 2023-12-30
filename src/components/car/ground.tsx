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
import {Lava} from "./lava.tsx";
import {Tiles} from "./tiles.tsx";
import {Crates} from "./crates.tsx";
import {forwardRef, useImperativeHandle, useState} from "react";

const BASE_HEIGHT = 20;

type ObjectType = 'NONE' | 'WALL' | 'HOLE' | 'RAMP_UP' | 'RAMP_FLAT' | 'RAMP_DOWN' | 'LAVA' | 'TILES' | 'CRATES';

type LevelObject = {
  type: ObjectType;
  posX: number;
}

const CHAR_TO_OBJECT_TYPE: Map<string, ObjectType> = new Map([
  ['_', 'NONE'],
  ['I', 'WALL'],
  ['O', 'HOLE'],
  ['<', 'RAMP_UP'],
  ['#', 'RAMP_FLAT'],
  ['>', 'RAMP_DOWN'],
  ['=', 'LAVA'],
  ['T', 'TILES'],
  ['C', 'CRATES'],
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

const LEVEL = "__<=>__<=#>___C__I";

const levelObjects = buildLevelObjects(LEVEL);

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

export type GroundRef = {
  reset: () => void;
} | null;

type GroundProps = {
  opacity: SpringValue;
  onGroundHit: () => void;
  onObstacleHit: (event: ObstacleHitEvent) => void;
};

const Ground = forwardRef<GroundRef, GroundProps>(({ opacity, onGroundHit, onObstacleHit }: GroundProps, ref) => {
  const [respawn, setRespawn] = useState(false);

  useImperativeHandle(ref, () => ({
    reset: () => {
      setRespawn(true);

      setTimeout(() => {
        setRespawn(false);
      }, 100);
    }
  }), []);

  return opacity.isAnimating ? null : (
      <>
        <Base opacity={opacity} onGroundHit={onGroundHit} />
        <Terrain />
        {respawn ? null : levelObjects.map((levelObject, index) => {
          const key = `${index}`;
          switch(levelObject.type) {
            case 'WALL':      return <Wall key={key} opacity={opacity} position={[levelObject.posX, 0, 0]} onHit={() => onObstacleHit({ obstacle: 'WALL' })} />
            case 'RAMP_UP':   return <Ramp key={key} opacity={opacity} position={[levelObject.posX, 0, 0]} type={'up'} />
            case 'RAMP_FLAT': return <Ramp key={key} opacity={opacity} position={[levelObject.posX, 0, 0]} type={'flat'} />
            case 'RAMP_DOWN': return <Ramp key={key} opacity={opacity} position={[levelObject.posX, 0, 0]} type={'down'} />
            case 'HOLE':      return <Hole key={key} position={[levelObject.posX, 0, 0]} onHit={() => onObstacleHit({ obstacle: 'HOLE' })} />
            case 'LAVA':      return <Lava key={key} position={[levelObject.posX, 0, 0]} onHit={() => onObstacleHit({ obstacle: 'LAVA' })} />
            case 'TILES':     return <Tiles key={key} opacity={opacity} position={[levelObject.posX, 0, 0]} />
            case 'CRATES':    return <Crates key={key} opacity={opacity} position={[levelObject.posX, 0, 0]} />
          }
        })}
      </>
    )
});

export { Ground }