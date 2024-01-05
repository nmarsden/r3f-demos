import {PlayAgainButton} from "../playAgainButton/playAgainButton.tsx";
import {Message} from "../message/message.tsx";
import {Billboard, ScreenSpace} from "@react-three/drei";
import {SpringValue} from "@react-spring/three";
import {Trophy} from "../trophy/trophy.tsx";

type GameOverProps = {
  opacity: SpringValue;
  isFinished: boolean;
  newBestTime: boolean;
  bestTimes: number[];
  onPlayAgainButtonClicked: () => void;
};

const formattedTime = (time: number): string => {
  return `${Math.floor(time / 60)}`.padStart(2, '0') + ':' + `${Math.floor(time % 60)}`.padStart(2, '0');
};

const GameOver = ({ opacity, isFinished, newBestTime, bestTimes, onPlayAgainButtonClicked } : GameOverProps) => {

  return (
    <ScreenSpace depth={1}>
      <Billboard>
        {isFinished ? (
          newBestTime ? (
            <>
              <group rotation-x={Math.PI * 0.5} position-z={-10}>
                <Trophy />
              </group>
              <Message opacity={opacity} text={['NEW BEST TIME']} />
            </>
        ) : (
            <Message opacity={opacity} text={[
              'BEST TIMES',
              `#1  ${formattedTime(bestTimes[0])}`,
              bestTimes[1] === 0 ? '' : `#2  ${formattedTime(bestTimes[1])}`,
              bestTimes[2] === 0 ? '' : `#3  ${formattedTime(bestTimes[2])}`,
            ]} />
          )
        ) : (
          <Message opacity={opacity} text={['GAME OVER!']} />
        )}
        <PlayAgainButton opacity={opacity} onButtonClicked={onPlayAgainButtonClicked}/>
      </Billboard>
    </ScreenSpace>
  )
}

export { GameOver }