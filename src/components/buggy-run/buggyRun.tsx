/* eslint-disable @typescript-eslint/ban-ts-comment */
import {SpringValue} from "@react-spring/three";
import {Suspense, useCallback, useContext, useEffect, useRef, useState} from "react";
import {Physics} from "@react-three/rapier";
import {MainContext} from "../../mainContext.ts";
import {useTransitionState} from "../../hooks/transitionState.ts";
import {JeepModel, JeepModelRef, VelocityChangedEvent} from "./jeepModel.tsx";
import {Level, LevelRef} from "./level.tsx";
import {ControlPanel} from "../controlPanel/controlPanel.tsx";
import {useCursor} from "@react-three/drei";
import {DashBoard} from "./dashBoard.tsx";
import {Bloom, EffectComposer} from "@react-three/postprocessing";
import {GameOver} from "./gameOver.tsx";
import {Pedal, PedalHoveredChangedEvent, PedalRef} from "./pedal.tsx";
import {ObstacleHitEvent} from "./obstacle.ts";
import {StopWatch, StopWatchRef} from "./stopWatch.tsx";

type GameState = 'PLAYING' | 'GAME_OVER' | 'FINISHED';

// TODO add power-up - invincible
// TODO add power-up - boost
// TODO add power-up - shrink
// TODO add power-up - anti-gravity

// TODO add obstacle - bouncing ball
// TODO add obstacle - rock
// TODO add obstacle - pressure sensor which triggers spikes
// TODO add obstacle - hammer swinging from the ceiling
// TODO add obstacle - treadmill
// TODO add obstacle - lift

// TODO introduce variations of spike, bumps, and lava, with and without platform

// TODO what if at the end of the level the jeep auto-drives onto a vertical half-pipe which rotates the level 180 degrees?
//      so you need to drive back through the same level, but now what was on the ceiling before is now on the ground

// TODO add texture to crate

// TODO fix wall incorrectly detects crate as a hit and ends the game
// TODO fix lava incorrectly detects crate as a hit and ends the game

const BuggyRun = ({ opacity }: { opacity: SpringValue }) => {
  const mainContext = useContext(MainContext)
  const transitionState = useTransitionState(opacity);
  const jeep = useRef<JeepModelRef>(null);
  const pedal = useRef<PedalRef>(null);
  const level = useRef<LevelRef>(null);
  const stopWatch = useRef<StopWatchRef>(null);
  const [gameState, setGameState] = useState<GameState>('PLAYING');
  const [hovered, setHovered] = useState(false);
  const [velocity, setVelocity] = useState(0);
  const [paused, setPaused] = useState(false);
  const [bestTimes, setBestTimes] = useState<number[]>([0, 0, 0]);
  const [newBestTime, setNewBestTime] = useState<boolean>(false);

  const onPedalHovered = useCallback((event: PedalHoveredChangedEvent) => {
    setHovered(event.isHovered);
  }, []);

  useCursor(hovered);

  const onPedalDown = useCallback(() => {
    if (!jeep.current) return;

    if (!stopWatch.current?.isStarted()) {
      stopWatch.current?.start();
    }
    jeep.current?.pedalDown();
  }, [jeep]);

  const onPedalUp = useCallback(() => {
    if (!jeep.current) return;

    jeep.current?.pedalUp();
  }, [jeep]);

  const onGroundHit = useCallback(() => {
  }, []);

  const onObstacleHit = useCallback((event: ObstacleHitEvent) => {
    setPaused(true)
    jeep.current?.pause();
    stopWatch.current?.stop();
    if (event.obstacle === 'FINISH') {
      const time = stopWatch.current?.getTime() as number;
      if (bestTimes[0] === 0 || time < bestTimes[0]) {
        setNewBestTime(true);
        setBestTimes(prevState => [time, prevState[0], prevState[1]]);
      }
      setGameState('FINISHED');
    } else {
      setGameState('GAME_OVER');
    }
  }, [bestTimes]);

  const onPlayAgainButtonClicked = useCallback(() => {
    setPaused(false);
    jeep.current?.reset();
    pedal.current?.reset();
    level.current?.reset();
    stopWatch.current?.reset();
    setNewBestTime(false);
    setGameState('PLAYING');
  }, []);

  const onVelocityChanged = useCallback((event: VelocityChangedEvent) => {
    setVelocity(event.velocity);
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
        <Physics debug={false} paused={paused}>
          {opacity.isAnimating ? null : (
            <>
              <JeepModel ref={jeep} opacity={opacity} onVelocityChanged={onVelocityChanged}/>
              <Level ref={level} opacity={opacity} onGroundHit={onGroundHit} onObstacleHit={onObstacleHit}/>
              {['GAME_OVER', 'FINISHED'].includes(gameState) ? (
                <GameOver
                  opacity={opacity}
                  isFinished={gameState === 'FINISHED'}
                  newBestTime={newBestTime}
                  bestTimes={bestTimes}
                  onPlayAgainButtonClicked={onPlayAgainButtonClicked}
                />) : null}
              <ControlPanel opacity={opacity}>
                <StopWatch ref={stopWatch} opacity={opacity} />
                <DashBoard opacity={opacity} velocity={velocity} />
                <Pedal
                  ref={pedal}
                  opacity={opacity}
                  onHoveredChanged={onPedalHovered}
                  onPedalDown={onPedalDown}
                  onPedalUp={onPedalUp}
                  enabled={gameState === 'PLAYING'}
                />
              </ControlPanel>
              <EffectComposer>
                <Bloom mipmapBlur={false} intensity={0.125} />
              </EffectComposer>
            </>
          )}
        </Physics>
      </Suspense>
    </>
  )
}

export { BuggyRun }
