/* eslint-disable @typescript-eslint/ban-ts-comment */
import {SpringValue} from "@react-spring/three";
import {Ball, BallRef} from "./ball.tsx";
import {Suspense, useCallback, useContext, useEffect, useRef, useState} from "react";
import {Physics} from "@react-three/rapier";
import {Ground} from "./ground.tsx";
import {MainContext} from "../../mainContext.ts";
import {useTransitionState} from "../../hooks/transitionState.ts";
import {ControlPanel} from "./controlPanel.tsx";

// TODO fix light changing when jumping
// TODO add obstacles
// TODO add a start state
// TODO add a loss state
// TODO add a completed state
const Runner = ({ opacity }: { opacity: SpringValue }) => {
  const mainContext = useContext(MainContext)
  const transitionState = useTransitionState(opacity);
  const ball = useRef<BallRef>(null);
  const [jumping, setJumping] = useState(false);

  const onButtonClicked = useCallback(() => {
    if (!ball.current || jumping) return;
    setJumping(true);
    ball.current?.jump();
  }, [ball, jumping]);

  const onGroundHit = useCallback(() => {
    if (!jumping) return;

    setJumping(false);
    ball.current?.resetForces();
  }, [ball,jumping]);

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
          <Ball ref={ball} opacity={opacity}/>
          <Ground opacity={opacity} onGroundHit={onGroundHit}/>
          <ControlPanel opacity={opacity} onButtonClicked={onButtonClicked}/>
        </Physics>
      </Suspense>
    </>
  )
}

export { Runner }
