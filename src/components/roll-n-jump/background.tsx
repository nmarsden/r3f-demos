/* eslint-disable @typescript-eslint/ban-ts-comment */
import {SpringValue, animated, useSpring, config} from "@react-spring/three";
import * as THREE from "three";
import {useEffect, useState} from "react";
import {useFrame} from "@react-three/fiber";

type BackgroundBlockProps = {
  opacity: SpringValue;
  groundBounds: THREE.Box2;
  delay: number;
  offset: THREE.Vector3;
};

type BackgroundProps = {
  opacity: SpringValue;
  groundBounds: THREE.Box2;
};

const BOX_WIDTH = 2;
const BOX_HEIGHT = 2;
const BOX_DEPTH = 2;
const BOX_COLOR = new THREE.Color(0x2176AE).multiplyScalar(5);
const OBSTACLE_GAP = 10;
const NUM_BLOCKS = 40;

type Block = {
  delay: number;
  offset: THREE.Vector3;
};

const BLOCKS: Block[] = [];
for (let i=0; i < NUM_BLOCKS; i++) {
  const x = THREE.MathUtils.randInt(0, 20);
  const y = THREE.MathUtils.randInt(-10, 10);
  const z = i % 2 ? THREE.MathUtils.randInt(-5, -10) : THREE.MathUtils.randInt(5, 10);
  BLOCKS.push({
    delay: x * 500,
    offset: new THREE.Vector3(x, y, z)
  })
}

const BackgroundBlock = ({ opacity, groundBounds, delay, offset }: BackgroundBlockProps) => {
  const [initialized, setInitialized] = useState(false);
  const [position, setPosition] = useState<THREE.Vector3 | null>(null);
  const [nextPosition, setNextPosition] = useState<THREE.Vector3 | null>(null);
  const [{ obstacleOpacity }, api] = useSpring(() => ({
    from: { obstacleOpacity: 0 },
    config: config.molasses
  }))

  // -- Set initial position
  useEffect(() => {
    if (opacity.isAnimating || position || groundBounds.isEmpty() || initialized) return;

    setInitialized(true);

    setTimeout(() => {
      setPosition(new THREE.Vector3(groundBounds.max.x + 10 + offset.x, groundBounds.max.y - 5 + offset.y, offset.z));
      api.start({
        delay: 500,
        from: { obstacleOpacity: 0 },
        to: { obstacleOpacity: 0.5 } }
      );
    }, delay)

  }, [opacity.isAnimating, position, groundBounds, initialized]);

  // -- Update position
  useEffect(() => {
    if (opacity.isAnimating || !nextPosition) return;

    api.start({
      from: { obstacleOpacity: 0.5 },
      to: { obstacleOpacity: 0 },
      onRest: () => {
        setPosition(nextPosition.clone());
        api.start({
          from: { obstacleOpacity: 0 },
          to: { obstacleOpacity: 0.5 }
        })
        setNextPosition(null);
      }
    })

  }, [opacity.isAnimating, nextPosition])

  // -- Update next position
  useFrame((state) => {
    if (opacity.isAnimating || !position || nextPosition) return;

    if ((state.camera.position.x - position.x) > OBSTACLE_GAP) {
      setNextPosition(new THREE.Vector3(groundBounds.max.x + 10 + offset.x, groundBounds.max.y - 5 + offset.y, offset.z));
    }
  });

  return (
      (opacity.isAnimating || !position) ? (
        <></>
      ) : (
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
    )
  );
}

const Background = ({ opacity, groundBounds }: BackgroundProps) => {
  return (
    <>
      {BLOCKS.map((block, index) => {
        return <BackgroundBlock key={`${index}`} opacity={opacity} groundBounds={groundBounds} delay={block.delay} offset={block.offset} />
      })}
    </>
  );
}

export { Background }