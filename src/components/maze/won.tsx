import {TrophyModel} from "./trophyModel.tsx";
import {PlayAgainButton} from "./playAgainButton.tsx";
import {Message} from "./message.tsx";

const Won = ({ onPlayAgainButtonClicked } : { onPlayAgainButtonClicked: () => void }) => {
  return (
    <>
      <TrophyModel />
      <Message text={'YOU WON!'} />
      <PlayAgainButton onButtonClicked={onPlayAgainButtonClicked}/>
    </>
  )
}

export { Won }