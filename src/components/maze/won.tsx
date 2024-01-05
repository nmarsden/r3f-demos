import {PlayAgainButton} from "../playAgainButton/playAgainButton.tsx";
import {Message} from "../message/message.tsx";
import {SpringValue} from "@react-spring/three";
import {Trophy} from "../trophy/trophy.tsx";

const Won = ({ opacity, onPlayAgainButtonClicked } : { opacity: SpringValue, onPlayAgainButtonClicked: () => void }) => {
  return (
    <>
      <Trophy />
      <Message opacity={opacity} text={['YOU WON!']} />
      <PlayAgainButton opacity={opacity} onButtonClicked={onPlayAgainButtonClicked}/>
    </>
  )
}

export { Won }