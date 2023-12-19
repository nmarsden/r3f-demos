/* eslint-disable @typescript-eslint/ban-ts-comment */
import {SpringValue} from "@react-spring/three";
import {Suspense, useContext, useEffect} from "react";
import {Physics} from "@react-three/rapier";
import {MainContext} from "../../mainContext.ts";
import {useTransitionState} from "../../hooks/transitionState.ts";
import {JeepModel} from "./jeepModel.tsx";
import {Ground} from "./ground.tsx";

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
          {opacity.isAnimating ? null : (
            <>
              <JeepModel opacity={opacity} position={[0,2,0]}/>
              <Ground opacity={opacity} />
            </>
          )}
        </Physics>
      </Suspense>
    </>
  )
}

export { Car }
