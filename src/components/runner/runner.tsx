/* eslint-disable @typescript-eslint/ban-ts-comment */
import {SpringValue} from "@react-spring/three";
import {Ball, BallRef} from "./ball.tsx";
import {Suspense, useCallback, useContext, useEffect, useRef, useState} from "react";
import {Physics} from "@react-three/rapier";
import {Ground} from "./ground.tsx";
import {MainContext} from "../../mainContext.ts";
import {useTransitionState} from "../../hooks/transitionState.ts";
import {ControlPanel} from "./controlPanel.tsx";
import {Obstacles} from "./obstacles.tsx";
import * as THREE from "three";
import {useFrame} from "@react-three/fiber";

const OBSTACLE_OFFSET_FROM_CAMERA = new THREE.Vector3(7, -2, -16);
const OBSTACLE_GAP = 10;

const vector = new THREE.Vector3();

// TODO obstacle: refactor to handle respawning itself
// TODO obstacle: fix bug with respawning in the wrong position when jumping
// TODO add a start state
// TODO add a loss state
// TODO add a completed state
const Runner = ({ opacity }: { opacity: SpringValue }) => {
  const mainContext = useContext(MainContext)
  const transitionState = useTransitionState(opacity);
  const ball = useRef<BallRef>(null);
  const [jumping, setJumping] = useState(false);
  const [obstaclePosition, setObstaclePosition] = useState(new THREE.Vector3(7, 1, 0));
  const [showObstacle, setShowObstacle] = useState(false);

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

  useEffect(() => {
    setShowObstacle(false);
    setTimeout(() => setShowObstacle(true), 1000);
  }, [obstaclePosition])

  useFrame((state) => {
    if (opacity.isAnimating || !ball.current) return;

    // -- Reposition obstacle
    if ((state.camera.position.x - obstaclePosition.x) > OBSTACLE_GAP) {

      state.camera.getWorldPosition(vector);
      vector.add(OBSTACLE_OFFSET_FROM_CAMERA);

      setObstaclePosition(vector.clone());
    }
  });

  return (
    <>
      <Suspense>
        <Physics debug={false}>
          <Ball ref={ball} opacity={opacity}/>
          <Ground opacity={opacity} onGroundHit={onGroundHit}/>
          {showObstacle ? <Obstacles opacity={opacity} position={obstaclePosition}/> : null}
          <ControlPanel opacity={opacity} onButtonClicked={onButtonClicked}/>
        </Physics>
      </Suspense>
    </>
  )
}

export { Runner }
