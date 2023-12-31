/* eslint-disable @typescript-eslint/ban-ts-comment */
import {SpringValue, animated} from "@react-spring/three";
import {InstancedRigidBodyProps, RapierRigidBody, RigidBody, vec3} from "@react-three/rapier";
import * as THREE from "three";
import {useFrame} from "@react-three/fiber";
import {forwardRef, useCallback, useEffect, useImperativeHandle, useRef} from "react";
import {useTransitionState} from "../../hooks/transitionState.ts";

export type GroundBoundsChangedEvent = {
  bounds: THREE.Box2;
};

export type GroundRef = {
  pause: () => void;
  unpause: () => void;
} | null;

type GroundProps = {
  opacity: SpringValue;
  onGroundHit: () => void;
  onGroundBoundsChanged: (event: GroundBoundsChangedEvent) => void
};

const NUM_BOXES = 10;

const BOX_WIDTH = 0.8;
const BOX_HEIGHT = 0.125;
const BOX_DEPTH = 2;
const BOX_COLOR = 'white';
const BOX_GAP = 0.1;

const TOTAL_WIDTH = (NUM_BOXES * BOX_WIDTH) + ((NUM_BOXES - 1) * BOX_GAP);
const TOTAL_HEIGHT = (NUM_BOXES * BOX_HEIGHT) + ((NUM_BOXES - 1) * BOX_GAP);

const MAX_X_DISTANCE_BETWEEN_HEAD_BOX_AND_CAMERA = (TOTAL_WIDTH * 0.5) - (BOX_WIDTH * 1.625);

const BOX_MOVE_Y_GAP = BOX_HEIGHT;

const DESIRED_POSITIONS: THREE.Vector3[] = new Array(NUM_BOXES);
const DESIRED_POSITIONS_XY: THREE.Vector2[] = new Array(NUM_BOXES);
for (let i =0; i<NUM_BOXES; i++) {
  DESIRED_POSITIONS_XY[i] = new THREE.Vector2();
}

const INSTANCES: InstancedRigidBodyProps[] = new Array(NUM_BOXES);

let headBoxIndex = 0;

const Ground = forwardRef<GroundRef, GroundProps>(({ opacity, onGroundHit, onGroundBoundsChanged }: GroundProps, ref) => {
  const transitionState = useTransitionState(opacity);
  const rigidBodies = useRef<RapierRigidBody[]>([]);
  // const [points, setPoints] = useState<number[][]>([])

  useImperativeHandle(ref, () => ({
    pause: () => {
      rigidBodies.current.forEach(rigidBody => rigidBody.setEnabled(false));
    },
    unpause: () => {
      rigidBodies.current.forEach(rigidBody => rigidBody.setEnabled(true));
    }
  }), [rigidBodies]);

  const updateGroundBounds = useCallback(() => {
    DESIRED_POSITIONS.forEach((desiredPosition, index) => {
      DESIRED_POSITIONS_XY[index].x = desiredPosition.x;
      DESIRED_POSITIONS_XY[index].y = desiredPosition.y;
    })
    const bounds = new THREE.Box2();
    bounds.setFromPoints(DESIRED_POSITIONS_XY);

    onGroundBoundsChanged({ bounds });

    // setPoints([
    //   [bounds.min.x, bounds.min.y, 0],
    //   [bounds.max.x, bounds.min.y, 0],
    //   [bounds.max.x, bounds.max.y, 0],
    //   [bounds.min.x, bounds.max.y, 0],
    //   [bounds.min.x, bounds.min.y, 0]
    // ])
  }, []);

  useEffect(() => {
    if (transitionState === 'ENTERING') {
      // Reset state
      for (let index=0; index<NUM_BOXES; index++) {
        const x = (BOX_WIDTH / 2) + (index * (BOX_WIDTH + BOX_GAP)) - (TOTAL_WIDTH / 2);
        const y = -((BOX_HEIGHT / 2) + (index * (BOX_HEIGHT + BOX_GAP)) - (TOTAL_HEIGHT / 2));
        const z = 0;
        DESIRED_POSITIONS[index] = new THREE.Vector3(x,y,z);
        INSTANCES[index] = {
          key: index,
          position: DESIRED_POSITIONS[index]
        };
      }
      updateGroundBounds();

      headBoxIndex = 0;
    }
  }, [transitionState]);

  useFrame((state) => {
    if (opacity.isAnimating || !rigidBodies.current || typeof rigidBodies.current[0] === 'undefined') return;

    // -- Lerp box positions to desired positions
    rigidBodies.current.forEach((rigidBody, index) => {
      if (opacity.isAnimating || !rigidBody.isValid()) return;

      const desiredPosition = DESIRED_POSITIONS[index];
      const rigidBodyPosition = vec3(rigidBody.translation());

      if (rigidBodyPosition.distanceTo(desiredPosition) > 0.03) {
        // Lerp position of rigidBody
        const newPosition = rigidBodyPosition.clone();

        const desiredPositionYOnly = desiredPosition.clone();
        desiredPositionYOnly.setX(rigidBodyPosition.x)

        if (rigidBodyPosition.distanceTo(desiredPositionYOnly) > BOX_MOVE_Y_GAP) {
          // adjust y only
          newPosition.lerp(desiredPositionYOnly, 0.07);
        } else {
          // adjust x & y
          newPosition.lerp(desiredPosition, 0.07);
        }

        // Update both instance position and rigidBody.setNextKinematicTranslation
        INSTANCES[index].position = newPosition;
        rigidBody.setNextKinematicTranslation(INSTANCES[index].position as THREE.Vector3);
      }
    });

    if (opacity.isAnimating) return;

    // -- Update desired position of head box
    const headBoxPosition = DESIRED_POSITIONS[headBoxIndex];
    const xDistanceBetweenHeadBoxAndCamera = state.camera.position.x - headBoxPosition.x;

    if (xDistanceBetweenHeadBoxAndCamera > MAX_X_DISTANCE_BETWEEN_HEAD_BOX_AND_CAMERA) {

      // update desired position
      headBoxPosition.setX(headBoxPosition.x + TOTAL_WIDTH + BOX_GAP);
      headBoxPosition.setY(headBoxPosition.y - (TOTAL_HEIGHT + BOX_GAP));

      // update headBoxIndex
      headBoxIndex = (headBoxIndex === (NUM_BOXES-1) ? 0 : headBoxIndex + 1);

      // re-calculate desired bounds
      updateGroundBounds();
    }
  });

  return (
      (opacity.isAnimating) ? (
        <></>
      ) : (
        <>
          {INSTANCES.map((instance, index) => {
            return (
              <RigidBody
                key={instance.key}
                ref={(rigidBody) => (rigidBodies.current[index] = rigidBody as RapierRigidBody)}
                type={'kinematicPosition'}
                position={instance.position}
                onCollisionEnter={onGroundHit}
              >
                <mesh castShadow={true} receiveShadow={true}>
                  <boxGeometry
                    args={[BOX_WIDTH, BOX_HEIGHT, BOX_DEPTH]}
                  />
                  { /* @ts-ignore */ }
                  <animated.meshStandardMaterial
                    metalness={0.55}
                    roughness={0.75}
                    color={BOX_COLOR}
                    transparent={true}
                    opacity={opacity}
                  />
                </mesh>
              </RigidBody>
            )
          })}
          { /* @ts-ignore */ }
          {/*<Line points={points} color={"orange"} lineWidth={5} dashed={false} />*/}
      </>
    )
  );
});

export { Ground }