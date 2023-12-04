/* eslint-disable @typescript-eslint/ban-ts-comment */
import {SpringValue, animated} from "@react-spring/three";
import {forwardRef, useImperativeHandle, useState} from "react";
import {RigidBody} from "@react-three/rapier";
import {Sphere, useTexture} from "@react-three/drei";

const BALL_SIZE = 0.18;

export type BallRef = {
  respawn: () => void
} | null;

type BallProps = {
  opacity: SpringValue;
};

const Ball = forwardRef<BallRef, BallProps>(({ opacity }: BallProps, ref) => {
  const [enabled, setEnabled] = useState(true);
  const texture = useTexture('/r3f-demos/maze/ball-texture.jpg')

  useImperativeHandle(ref, () => ({
    respawn: () => {
      // console.info('ball: respawn!');
      setEnabled(false);
      setTimeout(() => setEnabled(true), 300);
    }
  }));

  return (
    <>
      {(opacity.isAnimating || !enabled) ? (
        <></>
      ) : (
        <RigidBody name={'Ball'} colliders={'ball'}>
          <Sphere
            args={[BALL_SIZE, 64, 32]}
            position={[0, 0, 0]}
            rotation-x={Math.PI * -0.5}
            rotation-y={Math.PI * -0.1}
          >
            { /* @ts-ignore */ }
            <animated.meshStandardMaterial
              map={texture}
              metalness={0.45}
              roughness={0.75}
              color={'orange'}
              transparent={true}
              opacity={opacity}
            />
          </Sphere>
        </RigidBody>
      )}
    </>
  )
});

export { Ball }