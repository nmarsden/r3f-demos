/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  Text3D,
  Center,
  Lathe,
  useCursor,
  Box
} from "@react-three/drei";
import {animated, config, SpringValue, useSpring} from "@react-spring/three";
import * as THREE from 'three'
import {Suspense, useCallback, useMemo, useState} from "react";
import {Physics, RigidBody, CuboidCollider} from "@react-three/rapier";

const uiColor = 0x2176AE;

const Heading = ({ opacity }: { opacity: SpringValue }) => {
  return <>
    <Center position={[0, 1, 0]}>
      <Text3D
        castShadow={true}
        receiveShadow={true}
        curveSegments={20}
        bevelEnabled
        bevelSize={0.02}
        bevelThickness={0.1}
        height={0.25}
        lineHeight={0.75}
        letterSpacing={0.001}
        size={0.75}
        font="/shapes/Inter_Bold.json"
      >
        {"R3F"}
        {/* @ts-ignore */}
        <animated.meshStandardMaterial
          metalness={0.75}
          roughness={0.15}
          color={uiColor}
          transparent={true}
          opacity={opacity}
        />
      </Text3D>
    </Center>
    <Center position={[0, 0, 0]}>
      <Text3D
        castShadow={true}
        receiveShadow={true}
        curveSegments={20}
        bevelEnabled
        bevelSize={0.02}
        bevelThickness={0.1}
        height={0.25}
        lineHeight={0.75}
        letterSpacing={0.001}
        size={0.75}
        font="/shapes/Inter_Bold.json"
      >
        {"DEMO"}
        {/* @ts-ignore */}
        <animated.meshStandardMaterial
          metalness={0.75}
          roughness={0.15}
          color={uiColor}
          transparent={true}
          opacity={opacity}
        />
      </Text3D>
    </Center>
  </>
}

const ButtonBase = ({ opacity }: { opacity: SpringValue }) => {
  const triangleShape = useMemo(() => {
    const triangleShape = new THREE.Shape();
    triangleShape.moveTo(2, 0.5);
    triangleShape.lineTo(2, 0);
    triangleShape.lineTo(2.5, 0);
    triangleShape.lineTo(2, 0.5);
    return triangleShape;
  }, [])

  return (
    <Lathe
      args={[triangleShape.getPoints(), 32]}
      castShadow={true}
      receiveShadow={true}
    >
      {/* @ts-ignore */}
      <animated.meshStandardMaterial
        metalness={0.15}
        roughness={0.75}
        color={'grey'}
        transparent={true}
        opacity={opacity}
      />
    </Lathe>
  )
}

const PushButton = ({ opacity, onButtonClicked }: { opacity: SpringValue, onButtonClicked: () => void }) => {
  const [hovered, setHovered] = useState(false);
  const [{ positionY }, api] = useSpring(() => ({
    from: { positionY: 0.5 },
    config: config.stiff
  }))

  useCursor(hovered);

  return <group
      scale={0.25}
      position-z={1.75}
      position-y={-1.3}
    >
    <ButtonBase opacity={opacity} />
    <animated.mesh
      position-y={positionY}
      castShadow={true}
      receiveShadow={true}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onPointerDown={() => {
        api.start({
          to: [
            { positionY: 0.25 },
            { positionY: 0.5 }
          ]
        })
        onButtonClicked()
      }}
    >
      <cylinderGeometry args={[2, 2, 0.5]} />
      {/* @ts-ignore */}
      <animated.meshStandardMaterial
        metalness={0.75}
        roughness={0.15}
        color={'red'}
        transparent={true}
        opacity={opacity}
      />
    </animated.mesh>
  </group>
}

const Home = ({ opacity }: { opacity: SpringValue }) => {
  const [isShowBox, setShowBox] = useState(false);

  const onButtonClicked = useCallback(() => {
    setShowBox(false)
    setTimeout(() => setShowBox(true), 200)
  }, [])

  if (opacity.isAnimating && isShowBox) {
    setShowBox(false)
  }

  return (
    <>
      <Suspense>
        <Physics debug={false}>

          {!opacity.isAnimating ? (
            <>
              {isShowBox ? (
                <RigidBody>
                  <Box
                    position={[0, 5, 0.25]}
                    args={[0.5, 0.5, 0.5]}
                    castShadow={true}
                    receiveShadow={true}
                  >
                    {/* @ts-ignore */}
                    <animated.meshStandardMaterial
                      metalness={0.75}
                      roughness={0.15}
                      color={'white'}
                      transparent={true}
                      opacity={opacity}
                    />
                  </Box>
                </RigidBody>
              ) : (
                <></>
              )}

              <CuboidCollider position={[0, -1.5, 0]} args={[20, 0.2, 20]} />

              <RigidBody type={'fixed'} colliders={'cuboid'}>
                <Heading opacity={opacity}/>
              </RigidBody>

              <RigidBody type={'fixed'} colliders={'cuboid'}>
                <PushButton opacity={opacity} onButtonClicked={onButtonClicked}/>
              </RigidBody>
            </>
          ) : (
            <>
              <Heading opacity={opacity}/>
              <PushButton opacity={opacity} onButtonClicked={onButtonClicked}/>
            </>
          )}
        </Physics>
      </Suspense>
    </>
  )
}

export { Home }