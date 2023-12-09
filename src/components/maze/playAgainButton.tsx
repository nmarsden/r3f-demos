import {Html} from "@react-three/drei";
import './playAgainButton.css';

const PlayAgainButton = ({ onButtonClicked } : { onButtonClicked: () => void }) => {
  return (
    <group rotation-x={Math.PI}>
      <Html
        fullscreen={true}
        zIndexRange={[50, 40]}
      >
        <div className={'playAgainButton-container fade-in'}>
          <div className={'playAgainButton-button'} onClick={onButtonClicked}>PLAY AGAIN</div>
        </div>
      </Html>
    </group>
  )
}

export { PlayAgainButton }