
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

//Tensorflow
//import * as tf from '@tensorflow/tfjs' 
//import * as tfn from '@tensorflow/tfjs-node' 


export function Tetris({rows, cols, setGameOver})
{
    const [tetrisStats, addLinesCleared] = useTetrisStats();
    const [player, setPlayer, resetPlayer] = usePlayer();
    const [board] = useBoard({rows, cols, player, resetPlayer, addLinesCleared})

    const webcamRef = useRef(null)
    const canvasRef = useRef(null)

    const tf = require('@tensorflow/tfjs');
    const tfnode = require('@tensorflow/tfjs-node');

    // async function loadModel(){
    //     const handler = tfnode.io.fileSystem('tfjs_model/model.json');
    //     const model = await tf.loadLayersModel(handler);
    //     console.log("Model loaded");
    // }


    //loadModel();

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