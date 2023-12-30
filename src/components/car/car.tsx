/* eslint-disable @typescript-eslint/ban-ts-comment */
import {SpringValue} from "@react-spring/three";
import {Suspense, useCallback, useContext, useEffect, useRef, useState} from "react";
import {Physics} from "@react-three/rapier";
import {MainContext} from "../../mainContext.ts";
import {useTransitionState} from "../../hooks/transitionState.ts";
import {JeepModel, JeepModelRef, VelocityChangedEvent} from "./jeepModel.tsx";
import {Ground, GroundRef} from "./ground.tsx";
import {ControlPanel} from "../controlPanel/controlPanel.tsx";
import {ButtonHoveredChangedEvent} from "../pushButton/pushButton.tsx";
import {useCursor} from "@react-three/drei";
import {DashBoard} from "./dashBoard.tsx";
import {Bloom, EffectComposer} from "@react-three/postprocessing";
import {GameOver} from "./gameOver.tsx";

type GameState = 'PLAYING' | 'GAME_OVER';

// TODO add power-up - invincible
// TODO add power-up - boost
// TODO add power-up - shrink
// TODO add power-up - anti-gravity

// TODO add obstacle - bouncing ball
// TODO add obstacle - rock
// TODO add obstacle - pressure sensor which triggers spikes

// TODO add texture to crate
// TODO change wall to a log or something

// TODO fix wall incorrectly detects crate as a hit and ends the game
// TODO fix lava incorrectly detects crate as a hit and ends the game

// TODO fix rendering artifact at the end of 'flat' ramp and the start of 'down' ramp
const Car = ({ opacity }: { opacity: SpringValue }) => {
  const mainContext = useContext(MainContext)
  const transitionState = useTransitionState(opacity);
  const jeep = useRef<JeepModelRef>(null);
  const ground = useRef<GroundRef>(null);
  const [gameState, setGameState] = useState<GameState>('PLAYING');
  const [hovered, setHovered] = useState(false);
  const [jumping, setJumping] = useState(false);
  const [velocity, setVelocity] = useState(0);
  const [paused, setPaused] = useState(false);

  const onControlPanelButtonHovered = useCallback((event: ButtonHoveredChangedEvent) => {
    setHovered(event.isHovered);
  }, []);

  useCursor(hovered && !jumping);

  const onButtonClicked = useCallback(() => {
    if (!jeep.current || jumping) return;

    setJumping(true);
    jeep.current?.jump();
  }, [jeep, jumping]);

  const onGroundHit = useCallback(() => {
  }, []);

  const onObstacleHit = useCallback(() => {
    setGameState('GAME_OVER');
    setPaused(true)
    jeep.current?.pause();
  }, []);

  const onPlayAgainButtonClicked = useCallback(() => {
    setPaused(false);
    jeep.current?.reset();
    ground.current?.reset();
    setGameState('PLAYING');
  }, []);

  const onVelocityChanged = useCallback((event: VelocityChangedEvent) => {
    setVelocity(event.velocity);
  }, []);

  const onJumpCompleted = useCallback(() => {
    setJumping(false);
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
              <JeepModel ref={jeep} opacity={opacity} onVelocityChanged={onVelocityChanged} onJumpCompleted={onJumpCompleted}/>
              <Ground ref={ground} opacity={opacity} onGroundHit={onGroundHit} onObstacleHit={onObstacleHit}/>
              {gameState === 'GAME_OVER' ? <GameOver opacity={opacity} onPlayAgainButtonClicked={onPlayAgainButtonClicked}/> : null}
              <ControlPanel opacity={opacity} onButtonClicked={onButtonClicked} onButtonHovered={onControlPanelButtonHovered} enabled={gameState === 'PLAYING' && !jumping}>
                <DashBoard opacity={opacity} velocity={velocity} jumping={jumping}/>
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

export { Car }
