/* eslint-disable @typescript-eslint/ban-ts-comment */
import {SpringValue} from "@react-spring/three";
import nipplejs from 'nipplejs';
import {Html} from "@react-three/drei";
import {useEffect} from "react";
import './joystick.css';
import {useTransitionState} from "../../hooks/transitionState.ts";

export type JoystickMoveEvent = {
  x: number;
  y: number;
};

const Joystick = ({ opacity, onJoystickMove }: { opacity: SpringValue, onJoystickMove: (event: JoystickMoveEvent) => void }) => {
  const transitionState = useTransitionState(opacity);

  useEffect(() => {
    setTimeout(() => {
      const options: nipplejs.JoystickManagerOptions = {
        zone: document.getElementById('zone_joystick') as HTMLElement,
        mode: 'static',
        position: {bottom: '80px'},
        color: 'black',
        restJoystick: false,
        restOpacity: 1
      };
      const manager = nipplejs.create(options);
      manager.on('move', (event) => {
        onJoystickMove(event.target.nipples[0].frontPosition)
      });
    }, 200);
  }, []);

  return (
    <Html
      fullscreen={true}
      occlude={false}
      zIndexRange={[50, 40]}
    >
      <div className={`joystick ${transitionState === 'ENTERING' ? 'fade-in-slow': ''} ${transitionState === 'LEAVING' ? 'fade-out': ''}`}>
        <div id="zone_joystick" ></div>
      </div>
    </Html>
  )
}

export { Joystick }