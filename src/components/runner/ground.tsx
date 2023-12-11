/* eslint-disable @typescript-eslint/ban-ts-comment */
import {SpringValue, animated} from "@react-spring/three";
import {InstancedRigidBodyProps, RapierRigidBody, RigidBody, vec3} from "@react-three/rapier";
import * as THREE from "three";
import {useFrame} from "@react-three/fiber";
import {useEffect, useRef} from "react";
import {useTransitionState} from "../../hooks/transitionState.ts";

type GroundProps = {
  opacity: SpringValue;
};

const BOX_WIDTH = 0.8;
const BOX_HEIGHT = 0.125;
const BOX_DEPTH = 2;
const BOX_COLOR = 'white';
const BOX_GAP = 0.1;

const BOX_MOVE_TIME_GAP = 0.5;

const NUM_BOXES = 10;

const TOTAL_WIDTH = (NUM_BOXES * BOX_WIDTH) + ((NUM_BOXES - 1) * BOX_GAP);
const TOTAL_HEIGHT = (NUM_BOXES * BOX_HEIGHT) + ((NUM_BOXES - 1) * BOX_GAP);

const BOX_MOVE_Y_GAP = BOX_HEIGHT;

const DESIRED_POSITIONS: THREE.Vector3[] = new Array(NUM_BOXES);
const INSTANCES: InstancedRigidBodyProps[] = new Array(NUM_BOXES);

let headBoxIndex = 0;
let lastTimeBoxMoved = 0;

const Ground = ({ opacity }: GroundProps) => {
  const transitionState = useTransitionState(opacity);
  const rigidBodies = useRef<RapierRigidBody[]>([]);

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
      headBoxIndex = 0;
      lastTimeBoxMoved = 0;
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

    // -- Update desired positions
    const diff = state.clock.elapsedTime - lastTimeBoxMoved

    if (diff > BOX_MOVE_TIME_GAP) {

      // update last time box moved
      lastTimeBoxMoved = state.clock.elapsedTime;

      // update desired position
      const headBoxPosition = DESIRED_POSITIONS[headBoxIndex];
      headBoxPosition.setX(headBoxPosition.x + TOTAL_WIDTH);
      headBoxPosition.setY(headBoxPosition.y - TOTAL_HEIGHT);

      // update headBoxIndex
      headBoxIndex = (headBoxIndex === (NUM_BOXES-1) ? 0 : headBoxIndex + 1);
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
              >
                <mesh>
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
      </>
    )
  );
}

export { Ground }