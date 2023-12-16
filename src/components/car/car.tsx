/* eslint-disable @typescript-eslint/ban-ts-comment */
import {SpringValue} from "@react-spring/three";
import {Suspense, useContext, useEffect} from "react";
import {Physics} from "@react-three/rapier";
import {MainContext} from "../../mainContext.ts";
import {useTransitionState} from "../../hooks/transitionState.ts";
import {JeepModel} from "./jeepModel.tsx";

const Car = ({ opacity }: { opacity: SpringValue }) => {
  const mainContext = useContext(MainContext)
  const transitionState = useTransitionState(opacity);

  useEffect(() => {
    if (!mainContext.controls.current) return;

    if (transitionState === 'ENTERING') {
      mainContext.controls.current.enabled = false;
    } else if (transitionState === 'LEAVING') {
      mainContext.controls.current.enabled = true;
    }
  }, [mainContext, transitionState]);

  return (
    <>
      <Suspense>
        <Physics debug={false}>
          <JeepModel rotation-y={Math.PI * 0.5} scale={0.25} position={[0, -3, 0]}/>
        </Physics>
      </Suspense>
    </>
  )
}

export { Car }
