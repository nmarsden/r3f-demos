/* eslint-disable @typescript-eslint/ban-ts-comment */
import {SpringValue, animated, useSpring, config} from "@react-spring/three";
import {
  CELL_SIZE,
  CHECKPOINT_CELLS,
  HALF_CELL_SIZE,
  HALF_MAZE_SIZE,
  NUM_CELLS,
  WALL_HEIGHT
} from "./mazeConstants.ts";
import {Box, useTexture} from "@react-three/drei";
import {RigidBody} from "@react-three/rapier";
import {forwardRef, useCallback, useEffect, useImperativeHandle, useState} from "react";

const CHECKPOINT_SIZE = CELL_SIZE;
const CHECKPOINT_HEIGHT = WALL_HEIGHT;

type CheckpointType = {
  checkPointNum: number;
  position: number[];
  completed: boolean;
};

const CHECKPOINTS: CheckpointType[] = CHECKPOINT_CELLS.map((cell, index) => {
  const row = Math.floor(index / NUM_CELLS);
  const col = index % NUM_CELLS;
  const x = col * CELL_SIZE - HALF_MAZE_SIZE + HALF_CELL_SIZE;
  const z = row * CELL_SIZE - HALF_MAZE_SIZE + HALF_CELL_SIZE;
  return {
    checkPointNum: cell,
    position: [x, CHECKPOINT_HEIGHT * -0.2, z],
    completed: false
  };
}).filter(checkPoint => checkPoint.checkPointNum > 0);

const CheckPoint = ({ checkPointNum, position, completed, onHit } : { checkPointNum: number, position: number[], completed: boolean, onHit: () => void }) => {
  const texture = useTexture(`/r3f-demos/maze/checkpoint-${checkPointNum}.png`)
  const [{ opacity }, api] = useSpring(() => ({
    from: { opacity: 0 },
    config: config.molasses
  }))

  useEffect(() => {
    api.start({
      to: { opacity: 0.5 }
    })
  }, []);

  return (
    <RigidBody
      sensor={true}
      gravityScale={0}
      mass={0}
      density={0}
      onIntersectionEnter={(event) => {
        // @ts-ignore
        if (event.other.rigidBodyObject.name === 'Ball') {
          onHit()
        }
      }}
    >
      <Box
        // @ts-ignore
        position={position}
        args={[CHECKPOINT_SIZE, CHECKPOINT_HEIGHT, CHECKPOINT_SIZE]}
      >
        { /* @ts-ignore */ }
        <animated.meshStandardMaterial attach="material-0" color={completed ? 'orange' : 0x2176AE} transparent={true} opacity={opacity} />
        <animated.meshStandardMaterial attach="material-1" color={completed ? 'orange' : 0x2176AE} transparent={true} opacity={opacity} />
        <animated.meshStandardMaterial attach="material-2" color={completed ? 'orange' : 0x2176AE} transparent={true} opacity={opacity} map={texture} />
        <animated.meshStandardMaterial attach="material-3" color={completed ? 'orange' : 0x2176AE} transparent={true} opacity={opacity} />
        <animated.meshStandardMaterial attach="material-4" color={completed ? 'orange' : 0x2176AE} transparent={true} opacity={opacity} />
        <animated.meshStandardMaterial attach="material-5" color={completed ? 'orange' : 0x2176AE} transparent={true} opacity={opacity} />
      </Box>
    </RigidBody>
  );
}

export type CheckPointsRef = {
  reset: () => void
} | null;

type CheckPointsProps = {
  opacity: SpringValue;
  onCheckPointCompleted: (checkPointNumber: number) => void
};

const CheckPoints = forwardRef<CheckPointsRef, CheckPointsProps>(({ opacity, onCheckPointCompleted }: CheckPointsProps, ref) => {
  const [lastCheckPointReached, setLastCheckPointReached] = useState(0);
  const [checkPoints, setCheckPoints] = useState(CHECKPOINTS);

  useImperativeHandle(ref, () => ({
    reset: () => {
      setLastCheckPointReached(0);
      setCheckPoints(prevState => prevState.map(checkPoint => ({ ...checkPoint, completed: false })));
    }
  }));

  const onHit = useCallback((checkPointNum: number) => {
    // only update if previous checkpoint was passed
    if (lastCheckPointReached + 1 === checkPointNum) {
      setLastCheckPointReached(checkPointNum);
      setCheckPoints(prevState => prevState.map((checkPoint) => {
        return checkPoint.checkPointNum === checkPointNum ? { ...checkPoint, completed: true } : checkPoint;
      }));
      onCheckPointCompleted(checkPointNum);
    }
  }, [lastCheckPointReached, checkPoints])

  return (
    <>
      {opacity.isAnimating ? (
        <></>
      ) : (
        <>
          {checkPoints.map((checkPoint) => {
            return <CheckPoint
                      key={`${checkPoint.checkPointNum}`}
                      checkPointNum={checkPoint.checkPointNum}
                      position={checkPoint.position}
                      completed={checkPoint.completed}
                      onHit={() => onHit(checkPoint.checkPointNum)}
            />
          })}
        </>
      )}
    </>
  )
});

export { CheckPoints }