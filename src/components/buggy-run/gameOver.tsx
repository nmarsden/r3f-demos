import {PlayAgainButton} from "../playAgainButton/playAgainButton.tsx";
import {Message} from "../message/message.tsx";
import {Billboard, ScreenSpace} from "@react-three/drei";
import {SpringValue} from "@react-spring/three";

const GameOver = ({ opacity, isFinished, onPlayAgainButtonClicked } : { opacity: SpringValue, isFinished: boolean, onPlayAgainButtonClicked: () => void }) => {
  return (
    <>
      <ScreenSpace depth={1}>
        <Billboard>
          <Message opacity={opacity} text={isFinished ? 'YOU WIN!' : 'GAME OVER!'} />
          <PlayAgainButton opacity={opacity} onButtonClicked={onPlayAgainButtonClicked}/>
        </Billboard>
      </ScreenSpace>
    </>
  )
}

export { GameOver }