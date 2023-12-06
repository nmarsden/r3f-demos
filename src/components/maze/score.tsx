/* eslint-disable @typescript-eslint/ban-ts-comment */
import {SpringValue} from "@react-spring/three";
import {Html} from "@react-three/drei";
import {useTransitionState} from "../../hooks/transitionState.ts";
import './score.css';

const MAX_SCORE = 1000;

const Score = ({ opacity, score }: { opacity: SpringValue, score: number }) => {
  const transitionState = useTransitionState(opacity);

  return (
    <Html
      fullscreen={true}
      occlude={false}
      zIndexRange={[50, 40]}
    >
      <div className={`mazeScore ${transitionState === 'ENTERING' ? 'fade-in': ''} ${transitionState === 'LEAVING' ? 'fade-out': ''}`}>
        <div style={{ color: '#555555', fontSize: '1rem' }}>SCORE</div>
        <div style={{ color: (score === MAX_SCORE ? 'orange' : 'white' )}}>{score}</div>
      </div>
    </Html>
  )
}

export { Score }