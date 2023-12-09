/* eslint-disable @typescript-eslint/ban-ts-comment */
import {SpringValue} from "@react-spring/three";
import {Ball, BallRef} from "./ball.tsx";
import {MazeBox, MazeBoxRef} from "./mazeBox.tsx";
import {FloorSensor} from "./floorSensor.tsx";
import {Suspense, useCallback, useContext, useEffect, useRef, useState} from "react";
import {Physics} from "@react-three/rapier";
import {MainContext} from "../../mainContext.ts";
import {useTransitionState} from "../../hooks/transitionState.ts";
import {Score} from "./score.tsx";

// TODO have ability to reset once goal is reached
// TODO indicate maze is completed
const Maze = ({ opacity }: { opacity: SpringValue }) => {
  const mainContext = useContext(MainContext)
  const ball = useRef<BallRef>(null!);
  const mazeBox = useRef<MazeBoxRef>(null!);
  const transitionState = useTransitionState(opacity);
  const [score, setScore] = useState(0)

  const onFloorHit = useCallback(() => {
    if (ball.current && mazeBox.current) {
      setScore(0);
      ball.current.respawn();
      mazeBox.current.reset();
    }
  }, []);

  const onCheckPointCompleted = useCallback((checkPointNum: number) => {
    setScore(score + checkPointNum * 100);
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
          <Score opacity={opacity} score={score} />
          <Ball ref={ball} opacity={opacity}/>
          <MazeBox ref={mazeBox} opacity={opacity} onCheckPointCompleted={onCheckPointCompleted}/>
          <FloorSensor opacity={opacity} onHit={onFloorHit}/>
        </Physics>
      </Suspense>
    </>
  )
}

export { Maze }