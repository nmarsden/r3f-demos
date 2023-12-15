/* eslint-disable @typescript-eslint/ban-ts-comment */
import {SpringValue} from "@react-spring/three";
import {Ball, BallRef} from "./ball.tsx";
import {Suspense, useCallback, useContext, useEffect, useRef, useState} from "react";
import {Physics} from "@react-three/rapier";
import {Ground, GroundBoundsChangedEvent} from "./ground.tsx";
import {MainContext} from "../../mainContext.ts";
import {useTransitionState} from "../../hooks/transitionState.ts";
import {ControlPanel} from "./controlPanel.tsx";
import {Obstacles} from "./obstacles.tsx";
import * as THREE from "three";
import {Score} from "./score.tsx";

// TODO add a start state
// TODO add a loss state
// TODO add a completed state
const Runner = ({ opacity }: { opacity: SpringValue }) => {
  const mainContext = useContext(MainContext)
  const transitionState = useTransitionState(opacity);
  const [score, setScore] = useState(0);
  const ball = useRef<BallRef>(null);
  const [jumping, setJumping] = useState(false);
  const [groundBounds, setGroundBounds] = useState<THREE.Box2>(new THREE.Box2());

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

  const onGroundBoundsChanged = useCallback((event: GroundBoundsChangedEvent) => {
    setGroundBounds(event.bounds);
  }, []);

  const onObstacleHit = useCallback(() => {
    console.info('Game Over! score=', score);
  }, [score]);

  const onObstaclePassed = useCallback(() => {
    setScore(score + 1);
  }, [score]);

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
          <Ground opacity={opacity} onGroundHit={onGroundHit} onGroundBoundsChanged={onGroundBoundsChanged}/>
          <Obstacles opacity={opacity} groundBounds={groundBounds} onObstacleHit={onObstacleHit} onObstaclePassed={onObstaclePassed}/>
          <ControlPanel opacity={opacity} onButtonClicked={onButtonClicked}/>
          <Score opacity={opacity} score={score} />
        </Physics>
      </Suspense>
    </>
  )
}

export { Runner }
