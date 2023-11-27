/* eslint-disable @typescript-eslint/ban-ts-comment */
import {SpringValue} from "@react-spring/three";
import {Suspense} from "react";
import {Physics} from "@react-three/rapier";
import {DemoBoxes} from "./demoBoxes.tsx";
import {DemoHeading} from "./demoHeading.tsx";

const Home = ({ opacity }: { opacity: SpringValue }) => {
  return (
    <>
      <Suspense>
        <Physics debug={false}>
          <DemoHeading opacity={opacity}/>
          <DemoBoxes opacity={opacity} />
        </Physics>
      </Suspense>
    </>
  )
}

export { Home }