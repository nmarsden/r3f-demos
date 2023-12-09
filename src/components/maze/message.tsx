import {Html} from "@react-three/drei";
import './message.css';

const Message = ({ text } : { text: string }) => {
  return (
    <group rotation-x={Math.PI}>
      <Html
        fullscreen={true}
        zIndexRange={[50, 40]}
      >
        <div className={'message-container fade-in'}>
          <div className={'message-text'}>{text}</div>
        </div>
      </Html>
    </group>
  )
}

export { Message }