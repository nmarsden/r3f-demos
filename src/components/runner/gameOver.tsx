import {PlayAgainButton} from "../maze/playAgainButton.tsx";
import {Message} from "../maze/message.tsx";
import {Billboard, ScreenSpace} from "@react-three/drei";

const GameOver = ({ onPlayAgainButtonClicked } : { onPlayAgainButtonClicked: () => void }) => {
  return (
    <>
      <ScreenSpace depth={1}>
        <Billboard>
          <Message text={'GAME OVER!'} />
          <PlayAgainButton onButtonClicked={onPlayAgainButtonClicked}/>
        </Billboard>
      </ScreenSpace>
    </>
  )
}

export { GameOver }