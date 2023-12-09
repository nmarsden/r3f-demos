import {TrophyModel} from "./trophyModel.tsx";
import {PlayAgainButton} from "./playAgainButton.tsx";
import {Message} from "./message.tsx";
import {TrophyBackground} from "./trophyBackground.tsx";

const Won = ({ onPlayAgainButtonClicked } : { onPlayAgainButtonClicked: () => void }) => {
  return (
    <>
      <TrophyBackground />
      <TrophyModel />
      <Message text={'YOU WON!'} />
      <PlayAgainButton onButtonClicked={onPlayAgainButtonClicked}/>
    </>
  )
}

export { Won }