/* eslint-disable @typescript-eslint/ban-ts-comment */
import {SpringValue} from "@react-spring/three";
import {Suspense, useCallback, useContext, useEffect, useRef, useState} from "react";
import {Physics} from "@react-three/rapier";
import {MainContext} from "../../mainContext.ts";
import {useTransitionState} from "../../hooks/transitionState.ts";
import {JeepModel, JeepModelRef, VelocityChangedEvent} from "./jeepModel.tsx";
import {Ground} from "./ground.tsx";
import {ControlPanel} from "../controlPanel/controlPanel.tsx";
import {ButtonHoveredChangedEvent} from "../pushButton/pushButton.tsx";
import {useCursor} from "@react-three/drei";
import {DashBoard} from "./dashBoard.tsx";
import {Bloom, EffectComposer} from "@react-three/postprocessing";

type GameState = 'PLAYING' | 'GAME_OVER';

// TODO improve the look of the jeep boost
const Car = ({ opacity }: { opacity: SpringValue }) => {
  const mainContext = useContext(MainContext)
  const transitionState = useTransitionState(opacity);
  const jeep = useRef<JeepModelRef>(null);
  const [gameState, setGameState] = useState<GameState>('PLAYING');
  const [hovered, setHovered] = useState(false);
  const [jumping, setJumping] = useState(false);
  const [boosted, setBoosted] = useState(false);
  const [velocity, setVelocity] = useState(0);

  const onControlPanelButtonHovered = useCallback((event: ButtonHoveredChangedEvent) => {
    setHovered(event.isHovered);
  }, []);

  useCursor(hovered && !boosted);

  const onButtonClicked = useCallback(() => {
    if (!jeep.current || boosted) return;

    setBoosted(true);
    jeep.current?.boost();
  }, [jeep, boosted]);

  // const onButtonClicked = useCallback(() => {
  //   if (!jeep.current || jumping) return;
  //
  //   setJumping(true);
  //   jeep.current?.jump();
  // }, [jeep, jumping]);

  const onGroundHit = useCallback(() => {
    if (!jumping) return;

    setJumping(false);
  }, [jumping]);

  const onVelocityChanged = useCallback((event: VelocityChangedEvent) => {
    setVelocity(event.velocity);
  }, []);

  const onBoostCompleted = useCallback(() => {
    setBoosted(false);
  }, []);

  useEffect(() => {
    if (!mainContext.controls.current) return;

    if (transitionState === 'ENTERING') {
      mainContext.controls.current.enabled = false;
    } else if (transitionState === 'LEAVING') {
      mainContext.controls.current.enabled = true;
    }
  }, [mainContext, transitionState]);

  // Jeep is initially boosted
  // useEffect(() => {
  //   if (!jeep.current) return;
  //
  //   onButtonClicked();
  //
  // }, [jeep.current]);

  return (
    <>
      <Suspense>
        <Physics debug={false}>
          {opacity.isAnimating ? null : (
            <>
              <JeepModel ref={jeep} opacity={opacity} onVelocityChanged={onVelocityChanged} onBoostCompleted={onBoostCompleted}/>
              <Ground opacity={opacity} onGroundHit={onGroundHit} />
              <ControlPanel opacity={opacity} onButtonClicked={onButtonClicked} onButtonHovered={onControlPanelButtonHovered} enabled={gameState === 'PLAYING' && !boosted}>
                <DashBoard opacity={opacity} velocity={velocity} boosted={boosted}/>
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
