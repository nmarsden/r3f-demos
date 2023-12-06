import {SpringValue} from "@react-spring/three";
import {Html} from "@react-three/drei";
import './counter.css';
import {useTransitionState} from "../../hooks/transitionState.ts";

const Counter = ({ opacity, count, maxCount } : { opacity: SpringValue, count: number, maxCount: number }) => {
  const transitionState = useTransitionState(opacity);
  return (
    <Html
      fullscreen={true}
      occlude={false}
      zIndexRange={[50, 40]}
    >
      <div
        className={`boxCounter ${transitionState === 'ENTERING' ? 'fade-in': ''} ${transitionState === 'LEAVING' ? 'fade-out': ''}`}
        style={{ color: (count === maxCount ? 'orange' : 'white' )}}
      >
        {count}
      </div>
    </Html>
  )
}

export { Counter }