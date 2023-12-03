/* eslint-disable @typescript-eslint/ban-ts-comment */
import {SpringValue} from "@react-spring/three";
import {Ball, BallRef} from "./ball.tsx";
import {MazeBox} from "./mazeBox.tsx";
import {Joystick, JoystickMoveEvent} from "./joystick.tsx";
import {FloorSensor} from "./floorSensor.tsx";
import {Suspense, useCallback, useContext, useEffect, useRef, useState} from "react";
import {Physics} from "@react-three/rapier";
import {MainContext} from "../../mainContext.ts";
import {useTransitionState} from "../../hooks/transitionState.ts";

// TODO introduce checkpoints
// TODO show progress
// TODO must pass all checkpoints in the correct order to complete the maze
// TODO reward goal reached
// TODO have ability to reset once goal is reached
const Maze = ({ opacity }: { opacity: SpringValue }) => {
  const mainContext = useContext(MainContext)
  const ball = useRef<BallRef>(null!);
  const [rotationX, setRotationX] = useState(0);
  const [rotationZ, setRotationZ] = useState(0);
  const transitionState = useTransitionState(opacity);

  const onJoystickMove = useCallback((event: JoystickMoveEvent) => {
    const JOY_LENGTH = 300;
    const rotX = Math.atan(event.y / JOY_LENGTH);
    const rotZ = Math.atan(-event.x / JOY_LENGTH);

    setRotationX(rotX);
    setRotationZ(rotZ);
  }, []);

  const onFloorHit = useCallback(() => {
    if (ball.current) {
      ball.current.respawn();
    }
  }, []);

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
          <MazeBox opacity={opacity} rotationX={rotationX} rotationZ={rotationZ}/>
          <Joystick opacity={opacity} onJoystickMove={onJoystickMove}/>
          <FloorSensor opacity={opacity} onHit={onFloorHit}/>
        </Physics>
      </Suspense>
    </>
  )
}

export { Maze }