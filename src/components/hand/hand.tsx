/* eslint-disable @typescript-eslint/ban-ts-comment */
import {Bvh} from "@react-three/drei";
import {Robohand2Model} from "./robohand2Model";
import {SpringValue} from "@react-spring/three";
import {useFrame, useThree} from "@react-three/fiber";

const Hand = ({ opacity }: { opacity: SpringValue }) => {
  const { events } = useThree();

  useFrame(() => {
    // Ensure that the mouse events are also triggered when the mesh moves and mouse does not move
    // @ts-ignore
    events.update()
  })

  return (
    <>
      <Bvh firstHitOnly>
        <Robohand2Model scale={0.12} position={[0, 0.5, 0]} rotation={[0, -Math.PI * 0.05, -Math.PI/4]} opacity={opacity}/>
      </Bvh>
    </>
  )
}

export { Hand }