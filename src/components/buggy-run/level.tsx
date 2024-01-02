/* eslint-disable @typescript-eslint/ban-ts-comment */

import * as THREE from 'three'
import {animated, SpringValue} from "@react-spring/three";
import {RigidBody} from "@react-three/rapier";
import {Box, Line} from "@react-three/drei";
import {BuggyRunConstants} from "./buggyRunConstants.ts";
import {ObstacleHitEvent} from "./obstacle.ts";
import {Terrain} from "./terrain.tsx";
import {Hole} from "./hole.tsx";
import {Ramp} from "./ramp.tsx";
import {Wall} from "./wall.tsx";
import {Lava} from "./lava.tsx";
import {Tiles} from "./tiles.tsx";
import {Crates} from "./crates.tsx";
import {Bumps} from "./bumps.tsx";
import {forwardRef, useImperativeHandle, useMemo, useState} from "react";

const BASE_HEIGHT = 20;

type ObjectType = 'NONE' | 'WALL' | 'HOLE' | 'RAMP_UP' | 'RAMP_FLAT' | 'RAMP_DOWN' | 'LAVA' | 'TILES' | 'CRATES' | 'BUMPS';

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
  ['w', 'BUMPS'],
]);

const buildLevelObjects = (level: string): LevelObject[] => {
  const LEVEL_OBJECT_WIDTH = BuggyRunConstants.objectWidth;
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

type Level = {
  ceiling: string;
  ground: string;
};

const LEVEL: Level = {
  ceiling: '_________w__<#>__w__<##>______',
  ground:  '__<=>_I__w__<#>__w__<##>______',
};

const LEVEL_WIDTH = LEVEL.ground.length * BuggyRunConstants.objectWidth;

const ceilingLevelObjects = buildLevelObjects(LEVEL.ceiling);
const groundLevelObjects = buildLevelObjects(LEVEL.ground);

const LevelObjectsHelper = ({ enabled } : { enabled: false }) => {
  const positions: THREE.Vector3[] = useMemo(() => {
    if (!enabled) return [];

    let x = 0;
    const positions: THREE.Vector3[] = [];
    const numObjects = LEVEL.ground.length;
    for (let i=0; i<numObjects; i++) {
      positions.push(new THREE.Vector3(x, 0, 0));
      x += BuggyRunConstants.objectWidth;
    }
    return positions;
  }, []);

  const points = useMemo(() => {
    return [
      [0,                             0,                              0],
      [0,                             BuggyRunConstants.objectHeight, 0],
      [BuggyRunConstants.objectWidth, BuggyRunConstants.objectHeight, 0],
      [BuggyRunConstants.objectWidth, 0,                              0],
      [0, 0, 0],
    ];
  }, []);

  return (
    <>
      {positions.map((position, index) => {
        const key = `${index}`;
        return (
          // @ts-ignore
          <Line key={key} position={position} points={points} color={"orange"} lineWidth={5} dashed={false} />
        )
      })}
    </>
  );
}

const Base = ({ opacity, onGroundHit }: { opacity: SpringValue, onGroundHit: () => void }) => {
  return (
    <RigidBody
      type={'fixed'}
      position={[LEVEL_WIDTH * 0.5, BASE_HEIGHT * -0.5, 0]}
      onCollisionEnter={onGroundHit}
      friction={BuggyRunConstants.groundFriction}
    >
      <Box args={[LEVEL_WIDTH, BASE_HEIGHT, BuggyRunConstants.baseDepth]} receiveShadow={true}>
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

const LevelObjects = ({ opacity, levelObjects, onObstacleHit }: { opacity: SpringValue, levelObjects: LevelObject[], onObstacleHit: (event: ObstacleHitEvent) => void }) => {
  return (
    levelObjects.map((levelObject, index) => {
      const key = `${index}`;
      switch(levelObject.type) {
        case 'WALL':      return <Wall key={key} opacity={opacity} position={[levelObject.posX, 0, 0]} onHit={() => onObstacleHit({ obstacle: 'WALL' })} />
        case 'RAMP_UP':   return <Ramp key={key} opacity={opacity} position={[levelObject.posX, 0, 0]} type={'up'} />
        case 'RAMP_FLAT': return <Ramp key={key} opacity={opacity} position={[levelObject.posX, 0, 0]} type={'flat'} />
        case 'RAMP_DOWN': return <Ramp key={key} opacity={opacity} position={[levelObject.posX, 0, 0]} type={'down'} />
        case 'HOLE':      return <Hole key={key} position={[levelObject.posX, 0, 0]} onHit={() => onObstacleHit({ obstacle: 'HOLE' })} />
        case 'LAVA':      return <Lava key={key} opacity={opacity} position={[levelObject.posX, 0, 0]} onHit={() => onObstacleHit({ obstacle: 'LAVA' })} />
        case 'TILES':     return <Tiles key={key} opacity={opacity} position={[levelObject.posX, 0, 0]} />
        case 'CRATES':    return <Crates key={key} opacity={opacity} position={[levelObject.posX, 0, 0]} />
        case 'BUMPS':     return <Bumps key={key} opacity={opacity} position={[levelObject.posX, 0, 0]} />
      }
    })
  );
};

export type LevelRef = {
  reset: () => void;
} | null;

type LevelProps = {
  opacity: SpringValue;
  onGroundHit: () => void;
  onObstacleHit: (event: ObstacleHitEvent) => void;
};

const Level = forwardRef<LevelRef, LevelProps>(({ opacity, onGroundHit, onObstacleHit }: LevelProps, ref) => {
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
        <LevelObjectsHelper enabled={false} />
        {/* Ceiling */}
        <group position={[0,20,0]} rotation={[Math.PI,0,0]}>
          <Base opacity={opacity} onGroundHit={onGroundHit} />
          <group position={[LEVEL_WIDTH, 0, 0]} rotation={[0,Math.PI,0]}>
            <Terrain levelWidth={LEVEL_WIDTH} />
          </group>
          {respawn ? null : <LevelObjects opacity={opacity} levelObjects={ceilingLevelObjects} onObstacleHit={onObstacleHit} />}
        </group>
        {/* Ground */}
        <Base opacity={opacity} onGroundHit={onGroundHit} />
        <Terrain levelWidth={LEVEL_WIDTH} />
        {respawn ? null : <LevelObjects opacity={opacity} levelObjects={groundLevelObjects} onObstacleHit={onObstacleHit} />}
      </>
    )
});

export { Level }