/* eslint-disable @typescript-eslint/ban-ts-comment */
import {SpringValue, animated, useSpring, config} from "@react-spring/three";
import {RigidBody} from "@react-three/rapier";
import * as THREE from "three";
import {useEffect, useState} from "react";
import {useFrame} from "@react-three/fiber";

type ObstaclesProps = {
  opacity: SpringValue;
  groundBounds: THREE.Box2;
};

const BOX_WIDTH = 0.25;
const BOX_HEIGHT = 4;
const BOX_DEPTH = 4;
const BOX_COLOR = 'red';
const OBSTACLE_GAP = 10;

const Obstacles = ({ opacity, groundBounds }: ObstaclesProps) => {
  const [position, setPosition] = useState<THREE.Vector3>(null!);
  const [nextPosition, setNextPosition] = useState<THREE.Vector3>(null!);
  const [{ obstacleOpacity }, api] = useSpring(() => ({
    from: { obstacleOpacity: 0 },
    config: config.stiff
  }))
  const [updateNextPosition, setUpdateNextPosition] = useState(false);

  // -- Set initial position
  useEffect(() => {
    if (opacity.isAnimating || position || groundBounds.isEmpty()) return;

    setPosition(new THREE.Vector3(groundBounds.max.x + 2, groundBounds.max.y, 0));
    api.start({
      delay: 500,
      from: { obstacleOpacity: 0 },
      to: { obstacleOpacity: 1 } }
    );
    setUpdateNextPosition(true);

  }, [opacity.isAnimating, position, groundBounds]);

  // -- Update position
  useEffect(() => {
    if (opacity.isAnimating || updateNextPosition || !nextPosition) return;

    api.start({
      from: { obstacleOpacity: 1 },
      to: { obstacleOpacity: 0 },
      onRest: () => {
        setPosition(nextPosition.clone());
        api.start({
          from: { obstacleOpacity: 0 },
          to: { obstacleOpacity: 1 }
        })
        setUpdateNextPosition(true);
      }
    })

  }, [opacity.isAnimating, updateNextPosition, nextPosition])

  // -- Update next position
  useFrame((state) => {
    if (opacity.isAnimating || !updateNextPosition) return;

    if ((state.camera.position.x - position.x) > OBSTACLE_GAP) {

      setUpdateNextPosition(false);
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
          </RigidBody>
      </>
    )
  );
}

export { Obstacles }