
//Hooks
import { useState, useCallback} from 'react'

function buildTetrisStats()
{
    return (
        {
            level: 1,
            points: 0,
            linesCompleted: 0,
            linesPerLevel: 10,
        }
    )
}

export function useTetrisStats()
{
    const [tetrisStats, setTetrisStats] = useState(buildTetrisStats())

    const addLinesCleared = useCallback((linesCleared) => 
    {
        setTetrisStats((prev) =>
        {
            const points = prev.points + linesCleared * 100 // can maybe change to look like actual tetris
            const { linesPerLevel } = prev
            const newLinesCompleted = prev.linesCompleted + linesCleared
            const level = newLinesCompleted >=linesPerLevel ?
                prev.level + 1 :
                prev.level

            const nowLinesCompleted = newLinesCompleted % linesPerLevel

            return{
                level,
                linesCompleted: nowLinesCompleted,
                linesPerLevel,
                points
            }
        }, [])

    }, [])

    return [tetrisStats, addLinesCleared]
}