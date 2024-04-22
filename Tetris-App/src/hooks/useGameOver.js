
//Hooks
import { useState, useCallback } from "react";

export function useGameOver()
{
    const [gameOver, setGameOver] = useState(true)

    //Is callBack reqd?
    const resetGameOver = useCallback(() =>
    (setGameOver(false)), [])

    return [gameOver, setGameOver, resetGameOver]
}