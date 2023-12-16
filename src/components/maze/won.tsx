import {TrophyModel} from "./trophyModel.tsx";
import {PlayAgainButton} from "../playAgainButton/playAgainButton.tsx";
import {Message} from "../message/message.tsx";
import {TrophyBackground} from "./trophyBackground.tsx";
import {SpringValue} from "@react-spring/three";

const Won = ({ opacity, onPlayAgainButtonClicked } : { opacity: SpringValue, onPlayAgainButtonClicked: () => void }) => {
  return (
    <>
      <TrophyBackground />
      <TrophyModel />
      <Message opacity={opacity} text={'YOU WON!'} />
      <PlayAgainButton opacity={opacity} onButtonClicked={onPlayAgainButtonClicked}/>
    </>
  )
}

export { Won }