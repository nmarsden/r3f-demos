import {Html} from "@react-three/drei";
import './playAgainButton.css';
import {SpringValue} from "@react-spring/three";
import {useTransitionState} from "../../hooks/transitionState.ts";

const PlayAgainButton = ({ opacity, onButtonClicked } : { opacity: SpringValue, onButtonClicked: () => void }) => {
  const transitionState = useTransitionState(opacity);

  return (
    <group rotation-x={Math.PI}>
      <Html
        fullscreen={true}
        zIndexRange={[50, 40]}
      >
        <div className={`playAgainButton-container  ${transitionState === "LEAVING" ? 'hide' : 'fade-in'}`}>
          <div className={'playAgainButton-button'} onClick={onButtonClicked}>PLAY AGAIN</div>
        </div>
      </Html>
    </group>
  )
}

export { PlayAgainButton }