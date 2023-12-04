/* eslint-disable @typescript-eslint/ban-ts-comment */
import {SpringValue, animated} from "@react-spring/three";
import {
  CELL_SIZE,
  CHECKPOINT_CELLS,
  HALF_CELL_SIZE,
  HALF_MAZE_SIZE,
  NUM_CELLS,
  WALL_HEIGHT
} from "./mazeConstants.ts";
import {Box} from "@react-three/drei";
import {RigidBody} from "@react-three/rapier";
import {forwardRef, useCallback, useImperativeHandle, useState} from "react";

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

const CheckPoint = ({ position, completed, onHit } : { position: number[], completed: boolean, onHit: () => void }) => {
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
        <animated.meshStandardMaterial
          metalness={0.45}
          roughness={0.75}
          color={completed ? 'orange' : 0x2176AE}
          transparent={true}
          opacity={0.5}
        />
      </Box>
    </RigidBody>
  );
}

export type CheckPointsRef = {
  reset: () => void
} | null;

type CheckPointsProps = {
  opacity: SpringValue,
};

const CheckPoints = forwardRef<CheckPointsRef, CheckPointsProps>(({ opacity }: CheckPointsProps, ref) => {
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