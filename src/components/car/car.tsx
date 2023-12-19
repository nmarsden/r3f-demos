/* eslint-disable @typescript-eslint/ban-ts-comment */
import {SpringValue} from "@react-spring/three";
import {Suspense, useCallback, useContext, useEffect, useRef, useState} from "react";
import {Physics} from "@react-three/rapier";
import {MainContext} from "../../mainContext.ts";
import {useTransitionState} from "../../hooks/transitionState.ts";
import {JeepModel, JeepModelRef} from "./jeepModel.tsx";
import {Ground} from "./ground.tsx";
import {ControlPanel} from "./controlPanel.tsx";
import {ButtonHoveredChangedEvent} from "../pushButton/pushButton.tsx";
import {useCursor} from "@react-three/drei";

type GameState = 'PLAYING' | 'GAME_OVER';

// TODO make ControlPanel a shared component
const Car = ({ opacity }: { opacity: SpringValue }) => {
  const mainContext = useContext(MainContext)
  const transitionState = useTransitionState(opacity);
  const jeep = useRef<JeepModelRef>(null);
  const [gameState, setGameState] = useState<GameState>('PLAYING');
  const [hovered, setHovered] = useState(false);
  const [jumping, setJumping] = useState(false);

  const onControlPanelButtonHovered = useCallback((event: ButtonHoveredChangedEvent) => {
    setHovered(event.isHovered);
  }, []);

  useCursor(hovered);

  const onButtonClicked = useCallback(() => {
    if (!jeep.current || jumping) return;

    setJumping(true);
    jeep.current?.jump();
  }, [jeep, jumping]);

  const onGroundHit = useCallback(() => {
    if (!jumping) return;

    setJumping(false);
  }, [jumping]);

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
          {opacity.isAnimating ? null : (
            <>
              <JeepModel ref={jeep} opacity={opacity} position={[0,2,0]}/>
              <Ground opacity={opacity} onGroundHit={onGroundHit} />
              <ControlPanel opacity={opacity} onButtonClicked={onButtonClicked} onButtonHovered={onControlPanelButtonHovered} enabled={gameState === 'PLAYING'}/>
            </>
          )}
        </Physics>
      </Suspense>
    </>
  )
}

export { Car }
