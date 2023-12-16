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
import {Won} from "./won.tsx";

type GameState = 'PLAYING' | 'LOST' | 'WON';

const Maze = ({ opacity }: { opacity: SpringValue }) => {
  const mainContext = useContext(MainContext)
  const ball = useRef<BallRef>(null!);
  const mazeBox = useRef<MazeBoxRef>(null!);
  const transitionState = useTransitionState(opacity);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<GameState>('PLAYING');

  const resetGame = useCallback(() => {
    if (ball.current && mazeBox.current) {
      setScore(0);
      ball.current.respawn();
      mazeBox.current.reset();
    }
  }, []);

  const onFloorHit = useCallback(() => {
    resetGame();
  }, [resetGame]);

  const onCheckPointCompleted = useCallback((checkPointNum: number) => {
    setScore(score + checkPointNum * 100);
    if (checkPointNum === 4) {
      setGameState('WON');
    }
  }, [score]);

  const onPlayAgainButtonClicked = useCallback(() => {
    setGameState('PLAYING');
  }, []);

  useEffect(() => {
    if (!mainContext.controls.current) return;

    if (transitionState === 'ENTERING') {
      mainContext.controls.current.enabled = false;
    } else if (transitionState === 'LEAVING') {
      mainContext.controls.current.enabled = true;
    }
  }, [mainContext, transitionState]);

  useEffect(() => {
    if (gameState === 'PLAYING') {
      resetGame();
    }
  }, [resetGame,gameState]);

  return (
    <>
      <Suspense>
        <Physics debug={false}>
          <Score opacity={opacity} score={score} />
          <Ball ref={ball} opacity={opacity} paused={gameState !== 'PLAYING'}/>
          <MazeBox ref={mazeBox} opacity={opacity} paused={gameState !== 'PLAYING'} onCheckPointCompleted={onCheckPointCompleted}/>
          <FloorSensor opacity={opacity} onHit={onFloorHit}/>
          {gameState === 'WON' ? <Won opacity={opacity} onPlayAgainButtonClicked={onPlayAgainButtonClicked}/> : null}
        </Physics>
      </Suspense>
    </>
  )
}

export { Maze }