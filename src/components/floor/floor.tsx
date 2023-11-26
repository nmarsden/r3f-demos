/* eslint-disable @typescript-eslint/ban-ts-comment */
import * as THREE from "three";
import {useEffect, useRef} from "react";
import {Decal, useTexture} from "@react-three/drei";
import {animated, useSpring} from "@react-spring/three";

const FLOOR_POSITION = new THREE.Vector3(0, -1.3, 0);

const Floor = ({ showCross } : { showCross: boolean }) => {
  const floorMesh = useRef<THREE.Mesh>(null!);
  const texture = useTexture('/r3f-demos/cross.png')
  const [{ decalScale, opacity }, api] = useSpring(() => ({
    from: { decalScale: 0, opacity: 0 },
    config: {
      duration: 650
    }
  }))

  useEffect(() => {
    api.start({
      to: [
        {
          decalScale: 0,
          opacity: 0
        },
        {
          decalScale: showCross ? 2 : 0,
          opacity: 0.6
        }
      ]
    })
  }, [showCross])

  return (
    <>
      <animated.mesh ref={floorMesh} position={FLOOR_POSITION} rotation={[-Math.PI / 2, 0, 0]} receiveShadow={true} renderOrder={-1}>
        <planeGeometry args={[1000,1000]} />
        {/* @ts-ignore */}
        <animated.shadowMaterial opacity={opacity} color={0x000000} depthTest={false}/>
      </animated.mesh>
      <animated.group position={FLOOR_POSITION} rotation={[-Math.PI / 2, 0, 0]} scale={decalScale} >
        <Decal mesh={floorMesh} debug={false} map={texture} position={[0, 0, 0]} rotation={[0,0,0]} renderOrder={-1} />
      </animated.group>
    </>
  )
}

export { Floor }