import {Html} from "@react-three/drei";
import './message.css';
import {SpringValue} from "@react-spring/three";
import {useTransitionState} from "../../hooks/transitionState.ts";

const Message = ({ opacity, text } : { opacity: SpringValue, text: string }) => {
  const transitionState = useTransitionState(opacity);

  return (
    <group rotation-x={Math.PI}>
      <Html
        fullscreen={true}
        zIndexRange={[50, 40]}
      >
        <div className={`message-container ${transitionState === "LEAVING" ? 'hide' : 'fade-in'}`}>
          <div className={'message-text'}>{text}</div>
        </div>
      </Html>
    </group>
  )
}

export { Message }