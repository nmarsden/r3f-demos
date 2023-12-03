import {SpringValue} from "@react-spring/three";
import {useState} from "react";
import {Html} from "@react-three/drei";
import './counter.css';

// TODO use useTransitionState hook
const Counter = ({ opacity, count, maxCount } : { opacity: SpringValue, count: number, maxCount: number }) => {
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
  return (
    <Html
      fullscreen={true}
      occlude={false}
      zIndexRange={[50, 40]}
    >
      <div
        className={`boxCounter ${isEntering ? 'isEntering': ''} ${isLeaving ? 'isLeaving': ''}`}
        style={{ color: (count === maxCount ? 'orange' : 'white' )}}
      >
        {count}
      </div>
    </Html>
  )
}

export { Counter }