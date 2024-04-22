
//Hooks
import { useState, useCallback } from "react";

//Utilities
import { randomTetromino } from "../utils/Tetrominoes";

function buildPlayer(previous)
{
    let tetrominoes;

    if(previous)
    {
        tetrominoes = [...previous.tetrominoes]
        tetrominoes.unshift(randomTetromino())
    }
    else
    {
        tetrominoes = Array(4).fill(0).map(() => randomTetromino())
    }

    return {
        collided: false,
        isFastDropping: false,
        position: {row: 0, col: 4},
        tetrominoes,
        tetromino: tetrominoes.pop()
    }
}

export function usePlayer()
{
    const [player, setPlayer] = useState(buildPlayer())
    const resetPlayer = useCallback(() =>
    {
        setPlayer((previous) => buildPlayer(previous))
    }, [])

    return [player, setPlayer, resetPlayer]
}