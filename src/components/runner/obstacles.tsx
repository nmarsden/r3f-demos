/* eslint-disable @typescript-eslint/ban-ts-comment */
import {SpringValue, animated, useSpring, config} from "@react-spring/three";
import {RigidBody} from "@react-three/rapier";
import * as THREE from "three";
import {useEffect} from "react";

type ObstaclesProps = {
  opacity: SpringValue;
  position: THREE.Vector3;
};

const BOX_WIDTH = 0.25;
const BOX_HEIGHT = 4;
const BOX_DEPTH = 4;
const BOX_COLOR = 'red';

const Obstacles = ({ opacity, position }: ObstaclesProps) => {
  const [{ obstacleOpacity }, api] = useSpring(() => ({
    from: { obstacleOpacity: 0 },
    config: config.molasses
  }))

  useEffect(() => {
    if (!opacity.isAnimating) {
      api.start({
        to: { obstacleOpacity: 1 }
      })
    }
  }, [opacity.isAnimating]);

  return (
      (opacity.isAnimating) ? (
        <></>
      ) : (
        <>
          <RigidBody
            type={'kinematicPosition'}
          >
            <mesh castShadow={true} receiveShadow={true} position={position}>
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