
//CSS
import './Board.css'

//Components
import { BoardCell } from '../components/BoardCell'


export function Board({ board })
{
    //console.log('board', board)

    const boardStyles = 
    {
        gridTemplateRows: `repeat(${board.size.rows}, 1fr)`,
        gridTemplateColumns: `repeat(${board.size.cols}, 1fr)`
    }

    return (
        <div className="Board" style={boardStyles}>
            {board.rows.map((row, y) =>
                row.map((cell, x) =>
                    <BoardCell key={x * board.size.cols + x} cell={cell}/>))}
        </div>
    );
} 