
//Hooks
import { useEffect, useState } from "react";

//Utilities
import { buildBoard, nextBoard } from "../utils/Boards";

export function useBoard({ rows, cols, player, resetPlayer, addLinesCleared})
{
    const [board, setBoard] = useState(buildBoard({rows, cols}))

    useEffect(() => 
    {
        setBoard((prevBoard) => 
        (
            nextBoard({ board: prevBoard, player, resetPlayer, addLinesCleared })
        ))
    }, [player, resetPlayer, addLinesCleared])

    return [board]//setBoard not used outside currently; plase update if required... 
}