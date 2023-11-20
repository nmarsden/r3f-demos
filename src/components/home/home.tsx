/* eslint-disable @typescript-eslint/ban-ts-comment */
import {SpringValue} from "@react-spring/three";
import {Suspense} from "react";
import {CuboidCollider, Physics, RigidBody} from "@react-three/rapier";
import {DemoBoxes} from "./demoBoxes.tsx";
import {DemoHeading} from "./demoHeading.tsx";

const Home = ({ opacity }: { opacity: SpringValue }) => {
  return (
    <>
      <Suspense>
        <Physics debug={false}>
          {opacity.isAnimating ? (
            <>
              <DemoHeading opacity={opacity}/>
              <DemoBoxes opacity={opacity} />
            </>
          ) : (
            <>
              <RigidBody type={'fixed'} colliders={'cuboid'}>
                <DemoHeading opacity={opacity}/>
              </RigidBody>

              <DemoBoxes opacity={opacity} />

              <CuboidCollider position={[0, -1.5, 0]} args={[20, 0.2, 20]} />
            </>
          )}
        </Physics>
      </Suspense>
    </>
  )
}

export { Home }