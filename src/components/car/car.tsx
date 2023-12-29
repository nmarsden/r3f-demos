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

// TODO add power-up - invincible
// TODO add power-up - boost

// TODO add obstacle - bouncing ball
// TODO add obstacle - rock
// TODO add obstacle - wall

// TODO fix rendering view width to be equivalent for mobile and desktop
//      - maybe scale based on viewport.width (see https://codesandbox.io/p/sandbox/basic-react-example-7kuzy?file=%2Fsrc%2FApp.js%3A17%2C45)
// TODO fix rendering artifact at the end of 'flat' ramp and the start of 'down' ramp
const Car = ({ opacity }: { opacity: SpringValue }) => {
  const mainContext = useContext(MainContext)
  const transitionState = useTransitionState(opacity);
  const jeep = useRef<JeepModelRef>(null);
  const [gameState, setGameState] = useState<GameState>('PLAYING');
  const [hovered, setHovered] = useState(false);
  const [jumping, setJumping] = useState(false);
  const [velocity, setVelocity] = useState(0);

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
        <Physics debug={false}>
          {opacity.isAnimating ? null : (
            <>
              <JeepModel ref={jeep} opacity={opacity} onVelocityChanged={onVelocityChanged} onJumpCompleted={onJumpCompleted}/>
              <Ground opacity={opacity} onGroundHit={onGroundHit} />
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
