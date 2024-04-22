
//Hooks
import { useState, useCallback, useEffect } from "react"

const defaultDropTime = 1000
const minDropTime = 100
const speedIncrement = 50

export function useDropTime({ tetrisStats })
{
    const [dropTime, setDropTime] = useState(defaultDropTime)
    const [prevDropTime, setPrevDropTime] = useState()

    const pauseDropTime = useCallback(() =>
    {
        if(dropTime)//ie if non-zero
        {
            setPrevDropTime(dropTime)
        }
        setDropTime(null)
    }, [dropTime, setPrevDropTime])

    const resumeDropTime = useCallback(() =>
    {
        if(!prevDropTime) return

        setDropTime(prevDropTime)
        setPrevDropTime(null)
        
    }, [prevDropTime])

    useEffect(() =>
    {
        const speed = speedIncrement * (tetrisStats.level - 1)//default on 1st level
        const newDropTime = Math.max(defaultDropTime - speed, minDropTime)
        
        setDropTime(newDropTime)
    }, [tetrisStats.level, setDropTime])

    return [dropTime, pauseDropTime, resumeDropTime]
}