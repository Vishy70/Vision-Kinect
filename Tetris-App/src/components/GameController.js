
//CSS
import './GameController.css'

//Hooks
import { useCallback, useEffect, useState } from 'react'
import { useInterval } from '../hooks/useInterval'
import { useDropTime } from '../hooks/useDropTime'

//Utilities
import { playerController } from '../utils/PlayerController'
import { Action, actionForKey, actionIsDrop } from '../utils/Input'


export function GameController({ board, tetrisStats, player, setGameOver, setPlayer })
{
    //state
    const [dropTime, pauseDropTime, resumeDropTime] = useDropTime({ tetrisStats })
    const [paused, setPaused] = useState(false)

    //Interval effect: enforce slow drop after dropTime
    useInterval(() =>
    {
        handleInput({ action: Action.SlowDrop })//auto drop
    }, dropTime)//every second

    //Input handler: Takes action from Event effect, passes to player controller
    const handleInput = useCallback(({ action }) =>
    {
        playerController({ action, board, player, setPlayer, setGameOver})
    }, [board, player, setGameOver, setPlayer])

    //On Key Up/Down Event Handlers
    //**Specifically handles *second part* reset of slow-drop timer, if player decides to slow-drop!
    const onKeyUp = useCallback((e) =>
    {
        //console.log(typeof(e.code))
        //console.log(e.code)
        const action = actionForKey(e.code)
        if(actionIsDrop(action)) resumeDropTime()
    }, [resumeDropTime])

    //On Key Down: Handles pause, quit and movement
    //Also separately handles *first part* of reset of slow-drop timer, if player decides to slow-drop!
    const onKeyDown = useCallback((e) =>
    {
        console.log(e.code)
        const action = actionForKey(e.code)

        //Pause Block
        if(action === Action.Pause)
        {
            if(dropTime)
            {
                pauseDropTime()
                setPaused(true)
            }
            else
            {
                resumeDropTime()
                setPaused(false)
            }
        }

        //Quit Block
        else if(action === Action.Quit)
        {
            setGameOver(true)
        }

        //Movement Block
        else if(action !== Action.Start)
        {
            if(actionIsDrop(action)) {pauseDropTime()}
            handleInput({ action })
        }
    }, [dropTime, handleInput, pauseDropTime, resumeDropTime, setGameOver]) 

    //Event effect: detect players actions, based on keyboard inputs TODO: AND CV outputs
    useEffect(() => {
        /*eslint-disable no-restricted-globals*/
        addEventListener("keydown", onKeyDown); 
        addEventListener("keyup", onKeyUp); 

        return () => {
            removeEventListener("keydown", onKeyDown);
            removeEventListener("keyup", onKeyUp);
            /*eslint-enable no-restricted-globals*/ 
        };
    }, [onKeyUp, onKeyDown]);

    //dummy pause div, to use GameController directly as component!
    return (
        //<input className='GameController' type='text' onKeyDown={onKeyDown} onKeyUp={onKeyUp} autoFocus></input>
        (paused) ? <div className='GameController'>Paused</div> : <div className='GameController'></div>
    )
}