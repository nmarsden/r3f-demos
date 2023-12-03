/* eslint-disable @typescript-eslint/ban-ts-comment */
import {SpringValue} from "@react-spring/three";
import nipplejs from 'nipplejs';
import {Html} from "@react-three/drei";
import {useEffect, useState} from "react";
import './joystick.css';

export type JoystickMoveEvent = {
  x: number;
  y: number;
};

// TODO use useTransitionState hook
const Joystick = ({ opacity, onJoystickMove }: { opacity: SpringValue, onJoystickMove: (event: JoystickMoveEvent) => void }) => {
  const [isEntering, setIsEntering] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  if (opacity.isAnimating && !isEntering && opacity.goal === 1) {
    setIsEntering(true);
    setIsLeaving(false);
  }
  if (opacity.isAnimating && !isLeaving && opacity.goal === 0) {
    setIsEntering(false);
    setIsLeaving(true);
  }

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
      <div className={`joystick ${isEntering ? 'isEntering': ''} ${isLeaving ? 'isLeaving': ''}`}>
        <div id="zone_joystick" ></div>
      </div>
    </Html>
  )
}

export { Joystick }