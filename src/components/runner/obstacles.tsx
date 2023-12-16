/* eslint-disable @typescript-eslint/ban-ts-comment */
import {SpringValue, animated, useSpring, config} from "@react-spring/three";
import {CuboidCollider, RigidBody} from "@react-three/rapier";
import * as THREE from "three";
import {forwardRef, useEffect, useImperativeHandle, useState} from "react";
import {useFrame} from "@react-three/fiber";

export type ObstaclesRef = {
  reset: () => void;
} | null;

type ObstaclesProps = {
  opacity: SpringValue;
  groundBounds: THREE.Box2;
  onObstacleHit: () => void;
  onObstaclePassed: () => void;
};

const BOX_WIDTH = 0.25;
const BOX_HEIGHT = 4;
const BOX_DEPTH = 4;
const BOX_COLOR = 'red';
const OBSTACLE_GAP = 10;

const Obstacles = forwardRef<ObstaclesRef, ObstaclesProps>(({ opacity, groundBounds, onObstacleHit, onObstaclePassed }: ObstaclesProps, ref) => {
  const [position, setPosition] = useState<THREE.Vector3 | null>(null);
  const [nextPosition, setNextPosition] = useState<THREE.Vector3 | null>(null);
  const [{ obstacleOpacity }, api] = useSpring(() => ({
    from: { obstacleOpacity: 0 },
    config: config.stiff
  }))

  useImperativeHandle(ref, () => ({
    reset: () => {
      setPosition(null);
      setNextPosition(null);
      api.start({ to: { obstacleOpacity: 0 }, immediate: true });
    },
  }), []);

  // -- Set initial position
  useEffect(() => {
    if (opacity.isAnimating || position || groundBounds.isEmpty()) return;

    setPosition(new THREE.Vector3(groundBounds.max.x + 2, groundBounds.max.y, 0));
    api.start({
      delay: 500,
      from: { obstacleOpacity: 0 },
      to: { obstacleOpacity: 1 } }
    );

  }, [opacity.isAnimating, position, groundBounds]);

  // -- Update position
  useEffect(() => {
    if (opacity.isAnimating || !nextPosition) return;

    api.start({
      from: { obstacleOpacity: 1 },
      to: { obstacleOpacity: 0 },
      onRest: () => {
        setPosition(nextPosition.clone());
        api.start({
          from: { obstacleOpacity: 0 },
          to: { obstacleOpacity: 1 }
        })
        setNextPosition(null);
      }
    })

  }, [opacity.isAnimating, nextPosition])

  // -- Update next position
  useFrame((state) => {
    if (opacity.isAnimating || !position || nextPosition) return;

    if ((state.camera.position.x - position.x) > OBSTACLE_GAP) {
      setNextPosition(new THREE.Vector3(groundBounds.max.x + 2, groundBounds.max.y, 0));
    }
  });

  return (
      (opacity.isAnimating || !position) ? (
        <></>
      ) : (
        <>
          <RigidBody
            type={'kinematicPosition'}
            position={position}
            onCollisionEnter={() => onObstacleHit()}
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
                opacity={obstacleOpacity}
              />
            </mesh>
            <CuboidCollider
              args={[BOX_WIDTH, BOX_HEIGHT, BOX_DEPTH]}
              position={[2,0,0]}
              sensor={true}
              onIntersectionEnter={onObstaclePassed}
            />
          </RigidBody>
      </>
    )
  );
});

export { Obstacles }