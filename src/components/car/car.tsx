/* eslint-disable @typescript-eslint/ban-ts-comment */
import {SpringValue} from "@react-spring/three";
import {Suspense, useContext, useEffect} from "react";
import {CuboidCollider, Physics} from "@react-three/rapier";
import {MainContext} from "../../mainContext.ts";
import {useTransitionState} from "../../hooks/transitionState.ts";
import {JeepModel} from "./jeepModel.tsx";

// TODO auto-move to the right
//      - rolling wheels
//      - camera follow
const Car = ({ opacity }: { opacity: SpringValue }) => {
  const mainContext = useContext(MainContext)
  const transitionState = useTransitionState(opacity);

  useEffect(() => {
    if (!mainContext.controls.current) return;

    if (transitionState === 'ENTERING') {
      // mainContext.controls.current.enabled = false;
    } else if (transitionState === 'LEAVING') {
      mainContext.controls.current.enabled = true;
    }
  }, [mainContext, transitionState]);

  return (
    <>
      <Suspense>
        <Physics debug={true}>
          {opacity.isAnimating ? null : <JeepModel opacity={opacity} />}
          {opacity.isAnimating ? null : <CuboidCollider position={[0, -1.5, 0]} args={[20, 0.2, 20]} />}
        </Physics>
      </Suspense>
    </>
  )
}

export { Car }
