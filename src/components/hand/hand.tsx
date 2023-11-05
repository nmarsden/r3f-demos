/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  OrbitControls,
  useGLTF,
  Bvh
} from "@react-three/drei";
import {useRef} from "react";
import {OrbitControls as OrbitControlsRef} from 'three-stdlib'
import {Robohand2Model} from "./robohand2Model";

useGLTF.preload('/hand/scene.gltf')

const Hand = ({ opacity }: { opacity: number }) => {
  const orbitControls = useRef<OrbitControlsRef>(null!)

  return (
    <>
      <Bvh firstHitOnly>
        <Robohand2Model scale={0.12} position={[0, 0.5, 0]} rotation={[0, -Math.PI * 0.05, -Math.PI/4]} opacity={opacity}/>
        <OrbitControls
          ref={orbitControls}
          makeDefault={true}
          maxPolarAngle={Math.PI / 2}
          autoRotate={false}
          autoRotateSpeed={0.25}
          enableZoom={false}
          enablePan={false}
        />
      </Bvh>
    </>
  )
}

export { Hand }