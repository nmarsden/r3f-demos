/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  useGLTF,
  Bvh
} from "@react-three/drei";
import {Robohand2Model} from "./robohand2Model";

useGLTF.preload('/hand/scene.gltf')

const Hand = ({ opacity }: { opacity: number }) => {
  return (
    <>
      <Bvh firstHitOnly>
        <Robohand2Model scale={0.12} position={[0, 0.5, 0]} rotation={[0, -Math.PI * 0.05, -Math.PI/4]} opacity={opacity}/>
      </Bvh>
    </>
  )
}

export { Hand }