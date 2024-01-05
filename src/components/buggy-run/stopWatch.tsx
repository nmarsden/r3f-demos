/* eslint-disable @typescript-eslint/ban-ts-comment */
import {SpringValue, animated} from "@react-spring/three";
import {Text} from "@react-three/drei";
import {Vector3} from "three";
import {forwardRef, useCallback, useImperativeHandle, useRef, useState} from "react";

const POSITION_HEADING = new Vector3(0, 1.54, 0);
const POSITION_SCORE = new Vector3(0, 1.44, 0);

const CustomText = ({ opacity, position, size, text, color, outlineColor } : { opacity: SpringValue, position: Vector3, size: number, text: string, color: string | number, outlineColor: string | number }) => {
  return (
    <Text position={position} fontSize={size} letterSpacing={0.1} outlineWidth={0.01} outlineColor={outlineColor}>
      { /* @ts-ignore */ }
      <animated.meshStandardMaterial
        metalness={1}
        roughness={1}
        color={color}
        transparent={true}
        opacity={opacity}
      />
      {text}
    </Text>
  )
}

export type StopWatchRef = {
  start: () => void;
  stop: () => void;
  reset: () => void;
  isStarted: () => boolean;
  getTime: () => number;
} | null;

type StopWatchProps = {
  opacity: SpringValue;
};

const StopWatch = forwardRef<StopWatchRef, StopWatchProps>(({ opacity }: StopWatchProps, ref) => {
  const [time, setTime] = useState<number>(0);
  const intervalHandle = useRef<number>();

  const start = useCallback(() => {
    if (intervalHandle.current) return;

    intervalHandle.current = setInterval(() => {
      setTime(prevTime => prevTime + 1 );
    }, 1000)
  }, [setTime]);

  const stop = useCallback(() => {
    clearInterval(intervalHandle.current);
    intervalHandle.current = undefined;
  }, []);

  const reset = useCallback(() => {
    setTime(0);
  }, [setTime]);

  const isStarted = useCallback(() => {
    return !!intervalHandle.current;
  }, []);

  const getTime = useCallback(() => {
    return time;
  }, [time]);

  useImperativeHandle(ref, () => ({
    start: () => start(),
    stop: () => stop(),
    reset: () => reset(),
    isStarted: () => isStarted(),
    getTime: () => getTime()
  }), [start, stop, reset, isStarted, getTime]);

  const formattedTime = () => {
    return `${Math.floor(time / 60)}`.padStart(2, '0') + ':' + `${Math.floor(time % 60)}`.padStart(2, '0');
  };

  return (
    <>
      <CustomText opacity={opacity} position={POSITION_HEADING} size={0.05} text={'TIME'} color={0xFFFFFF} outlineColor={0x333333}/>
      <CustomText opacity={opacity} position={POSITION_SCORE} size={0.1} text={formattedTime()} color={0x333333} outlineColor={0xFFFFFF}/>
    </>
  )
});

export { StopWatch }
