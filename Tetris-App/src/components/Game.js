//Components
import { Menu } from '../components/Menu'
import { Tetris } from '../components/Tetris';

//Hooks
import { useGameOver } from '../hooks/useGameOver';
import { useEffect, useCallback } from 'react';

//Utilities
import { Action, actionForKey } from '../utils/Input.js'

//Main Component: Game
function Game({rows, cols})
{
    //State: gameOver to keep track of game finished?
    const [gameOver, setGameOver, resetGameOver] = useGameOver();
    
    //locally memoize game-resetter
    const start = useCallback(() => 
    {
        resetGameOver();
    }, [resetGameOver])
    

    //TODO: CV ACTIONS
    const onKeyUp = useCallback((e) =>
    {
        console.log(e.code)
        const action = actionForKey(e.code)
        if(action === Action.Start)
        {
            start()
        }
    }, [start])

    //EVENT LISTENER!
    useEffect(() => 
    {
        /* eslint-disable no-restricted-globals */
        addEventListener("keyup", onKeyUp); 

        return (() => 
        {
            removeEventListener("keyup", onKeyUp);
            /* eslint-enable no-restricted-globals */
        })
    }, [onKeyUp]);

    //Child Components: Menu or Tetris
    return (
    <div className="Game">
        {
            gameOver ? 
            (<Menu onClick={start}/>) :
            (<Tetris className="Tetris" rows={rows} cols={cols} setGameOver={setGameOver}/>)
        }
    </div>);
}

export default Game;