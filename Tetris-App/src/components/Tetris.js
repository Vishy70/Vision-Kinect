
//CSS
import './Tetris.css'

//Interesting...
import { useRef } from 'react';
import Webcam from 'react-webcam';

//Components
import TetrisStats from '../components/TetrisStats';
import { Board } from '../components/Board'
import { Previews } from '../components/Previews'
import { GameController } from '../components/GameController';

//Hooks
import { useBoard } from '../hooks/useBoard';
import { useTetrisStats } from '../hooks/useTetrisStats'
import { usePlayer } from '../hooks/usePlayer'


export function Tetris({rows, cols, setGameOver})
{
    const [tetrisStats, addLinesCleared] = useTetrisStats();
    const [player, setPlayer, resetPlayer] = usePlayer();
    const [board] = useBoard({rows, cols, player, resetPlayer, addLinesCleared})

    const webcamRef = useRef(null)
    const canvasRef = useRef(null)

    //<CamControl /> needs to be implemented
    return (
        <div className='Tetris'>
            <Webcam className='Webcam' ref={webcamRef} mirrored={true}/>
            <canvas className='Canvas' ref={canvasRef}></canvas>
            <Board board={board}/>
            <TetrisStats tetrisStats={tetrisStats}/>
            <Previews tetrominoes={player.tetrominoes} />
            <GameController board={board} tetrisStats={tetrisStats} player={player} setGameOver={setGameOver} setPlayer={setPlayer} />
        </div>
    );
}