/* eslint-disable @typescript-eslint/ban-ts-comment */
import {SpringValue} from "@react-spring/three";
import {Ball, BallRef} from "./ball.tsx";
import {Suspense, useCallback, useContext, useEffect, useRef, useState} from "react";
import {Physics} from "@react-three/rapier";
import {Ground, GroundBoundsChangedEvent, GroundRef} from "./ground.tsx";
import {MainContext} from "../../mainContext.ts";
import {useTransitionState} from "../../hooks/transitionState.ts";
import {ControlPanel} from "./controlPanel.tsx";
import {Obstacles, ObstaclesRef} from "./obstacles.tsx";
import * as THREE from "three";
import {Score} from "./score.tsx";
import {GameOver} from "./gameOver.tsx";
import {ButtonHoveredChangedEvent} from "../pushButton/pushButton.tsx";
import {useCursor} from "@react-three/drei";

type GameState = 'PLAYING' | 'GAME_OVER';

// TODO increase difficulty overtime, maybe increase obstacle height?
// TODO add a start state
const Runner = ({ opacity }: { opacity: SpringValue }) => {
  const mainContext = useContext(MainContext)
  const transitionState = useTransitionState(opacity);
  const [score, setScore] = useState(0);
  const ball = useRef<BallRef>(null);
  const obstacles = useRef<ObstaclesRef>(null);
  const ground = useRef<GroundRef>(null);
  const [jumping, setJumping] = useState(false);
  const [groundBounds, setGroundBounds] = useState<THREE.Box2>(new THREE.Box2());
  const [gameState, setGameState] = useState<GameState>('PLAYING');
  const [hovered, setHovered] = useState(false);
  const [paused, setPaused] = useState(false);

  const onControlPanelButtonHovered = useCallback((event: ButtonHoveredChangedEvent) => {
    setHovered(event.isHovered);
  }, []);

  useCursor(hovered);

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
    setHovered(false);
    ball.current?.pause();
    ground.current?.pause();
    setPaused(true);
    setGameState('GAME_OVER');
  }, []);

  const onObstaclePassed = useCallback(() => {
    setScore(score + 1);
  }, [score]);

  const onPlayAgainButtonClicked = useCallback(() => {
    setScore(0);
    ball.current?.unpause();
    ground.current?.unpause();
    obstacles.current?.reset();
    setPaused(false)
    setGameState('PLAYING');
  }, [obstacles]);

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
        <Physics debug={false} paused={paused}>
          <Ball ref={ball} opacity={opacity}/>
          <Ground ref={ground} opacity={opacity} onGroundHit={onGroundHit} onGroundBoundsChanged={onGroundBoundsChanged}/>
          <Obstacles ref={obstacles} opacity={opacity} groundBounds={groundBounds} onObstacleHit={onObstacleHit} onObstaclePassed={onObstaclePassed}/>
          <ControlPanel opacity={opacity} onButtonClicked={onButtonClicked} onButtonHovered={onControlPanelButtonHovered} enabled={gameState === 'PLAYING'}/>
          <Score opacity={opacity} score={score} />
          {gameState === 'GAME_OVER' ? <GameOver opacity={opacity} onPlayAgainButtonClicked={onPlayAgainButtonClicked}/> : null}
        </Physics>
      </Suspense>
    </>
  )
}

export { Runner }
