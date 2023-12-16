import {PlayAgainButton} from "../maze/playAgainButton.tsx";
import {Message} from "../maze/message.tsx";
import {Billboard, ScreenSpace} from "@react-three/drei";
import {SpringValue} from "@react-spring/three";

const GameOver = ({ opacity, onPlayAgainButtonClicked } : { opacity: SpringValue, onPlayAgainButtonClicked: () => void }) => {
  return (
    <>
      <ScreenSpace depth={1}>
        <Billboard>
          <Message opacity={opacity} text={'GAME OVER!'} />
          <PlayAgainButton opacity={opacity} onButtonClicked={onPlayAgainButtonClicked}/>
        </Billboard>
      </ScreenSpace>
    </>
  )
}

export { GameOver }