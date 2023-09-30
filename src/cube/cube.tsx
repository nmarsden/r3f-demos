/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  OrbitControls,
  Environment,
  StatsGl,
  Outlines
} from "@react-three/drei";
import {useEffect, useRef, useState} from "react";
import {useSpring, animated, config, AnimationResult} from '@react-spring/three'
import * as THREE from "three";

const Cube = () => {
  const boxMesh = useRef<THREE.Mesh>(null!)
  const spotLight = useRef<THREE.SpotLight>(null!);
  const [hovered, hover] = useState(false)

  const INITIAL_ANIMATION = () => ({
    from: { scale: 0, rotateX: 0, rotateY: 0, rotateZ: 0, position: [0, 0, 0] },
    // @ts-ignore
    to: async (next)=> {
      await next({ scale: 2 })
      await next({ rotateX: Math.PI })
      await next({ rotateY: Math.PI })
      await next({ rotateZ: Math.PI })
      await next({ position: [0, 0.5, 0] })
    },
    onRest: (result: AnimationResult) => {
      if (result.finished) {
        api.start(FLOATING_ANIMATION)
      }
    },
    config: config.wobbly
  })

  const FLOATING_ANIMATION = () => ({
    from: { scale: 2, rotateX: Math.PI, rotateY: Math.PI, rotateZ: Math.PI, position: [0, 0.5, 0] },
    to: [
      { rotateX: Math.PI*0.75 },
      { position: [0, 1, 0] },
      { rotateX: Math.PI },
      { position: [0, 0.5, 0] }
    ],
    loop: true,
    config: {
      duration: 4000
    }
  })

  const [{ scale, rotateX, rotateY, rotateZ, position }, api] = useSpring(INITIAL_ANIMATION)

  useEffect(() => {
    document.body.style.cursor = hovered ? 'pointer' : 'auto'
    return () => {
      document.body.style.cursor = 'auto';
    }
  }, [hovered])

  return (
    <>
      <StatsGl />
      <ambientLight intensity={1} />
      <spotLight ref={spotLight} angle={0.2} intensity={100} castShadow={true} position={[0, 10, 0]} />
      <animated.mesh
        ref={boxMesh}
        castShadow={true}
        receiveShadow={true}
        scale={scale}
        // @ts-ignore
        rotation-x={rotateX}
        // @ts-ignore
        rotation-y={rotateY}
        // @ts-ignore
        rotation-z={rotateZ}
        // @ts-ignore
        position={position}
        onClick={() => api.start(INITIAL_ANIMATION)}
        onPointerOver={() => hover(true)}
        onPointerOut={() => hover(false)}
      >
        <boxGeometry />
        <meshStandardMaterial color="white" />
        {hovered && <Outlines
          thickness={0.05}
          color="orange"
          angle={Math.PI}
          screenspace={false}
          opacity={1}
          transparent={false}
        />}
      </animated.mesh>
      <Environment preset={'sunset'} background blur={1}/>
      <mesh position={[0, -1.5, 0]} scale={10} rotation={[-Math.PI / 2, 0, 0]} receiveShadow={true}>
        <planeGeometry />
        <shadowMaterial opacity={1} />
      </mesh>
      <OrbitControls
        makeDefault={true}
        maxPolarAngle={Math.PI / 2}
        minDistance={3}
        maxDistance={8}
        autoRotate={true}
        autoRotateSpeed={0.25}
      />
    </>
  )
}

export { Cube }