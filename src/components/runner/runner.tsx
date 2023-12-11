/* eslint-disable @typescript-eslint/ban-ts-comment */
import {SpringValue} from "@react-spring/three";
import {Ball} from "./ball.tsx";
import {Suspense, useContext, useEffect} from "react";
import {Physics} from "@react-three/rapier";
import {Ground} from "./ground.tsx";
import {MainContext} from "../../mainContext.ts";
import {useTransitionState} from "../../hooks/transitionState.ts";

// TODO fix: objects are no longer rendered after moving them to the right
// TODO fix: floor should not be enabled when 'runner'
// TODO add a button to make the ball jump
// TODO add obstacles
// TODO add a start state
// TODO add a loss state
// TODO add a completed state
const Runner = ({ opacity }: { opacity: SpringValue }) => {
  const mainContext = useContext(MainContext)
  const transitionState = useTransitionState(opacity);
  // const extraCamera = useRef<THREE.PerspectiveCamera>(null!);
  // const { camera } = useThree();

  // // @ts-ignore
  // useHelper(camera, THREE.CameraHelper)
  // useHelper(extraCamera, THREE.CameraHelper)

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
      {/*<CameraControls />*/}
      <Suspense>
        {/*<PerspectiveCamera makeDefault={false} position={[0, 0, 6]} near={1} far={10} fov={70} ref={extraCamera}>*/}
        {/*  <meshBasicMaterial />*/}
        {/*</PerspectiveCamera>*/}
        <Physics debug={true}>
          <Ball opacity={opacity}/>
          <Ground opacity={opacity}/>
        </Physics>
      </Suspense>
    </>
  )
}

export { Runner }
