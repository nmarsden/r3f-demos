/* eslint-disable @typescript-eslint/ban-ts-comment */
import {SpringValue, animated, useSpring, config} from "@react-spring/three";
import {forwardRef, useEffect, useImperativeHandle, useLayoutEffect, useState} from "react";
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
  const [{ ballOpacity }, api] = useSpring(() => ({
    from: { ballOpacity: 0 },
    config: config.molasses
  }))
  const [enabled, setEnabled] = useState(false);
  const texture = useTexture('/r3f-demos/maze/ball-texture.jpg')

  useImperativeHandle(ref, () => ({
    respawn: () => {
      // console.info('ball: respawn!');
      setEnabled(false);
      setTimeout(() => setEnabled(true), 300);
    }
  }));

  useEffect(() => {
    api.start({
      from: { ballOpacity: 0 },
      to: { ballOpacity: 1 }
    })
  }, [enabled]);

  useLayoutEffect(() => {
    // Initial enabling of ball
    if (!opacity.isAnimating && !enabled) {
      setEnabled(true);
    }
  }, [opacity.isAnimating, enabled]);

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
              opacity={ballOpacity}
            />
          </Sphere>
        </RigidBody>
      )}
    </>
  )
});

export { Ball }