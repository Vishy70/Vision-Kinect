
//CSS
import './Preview.css'

//Components
import { BoardCell } from '../components/BoardCell'

//~Hooks
import React from 'react'

//Utilities
import { buildBoard } from '../utils/Boards'
import { transferToBoard } from '../utils/Tetrominoes'


function Preview ({ tetromino, index })
{
    const { shape, className } = tetromino

    const board = buildBoard({ rows: 4, cols: 4}) //fixed small size
    const style = {top: `${index * 7}vw`} //TODO: remove offset?

    board.rows = transferToBoard({
        className, //this syntax auto assigns key-value
        isOccupied: false,
        position: {row: 0, col: 0},
        rows: board.rows,
        shape
    })

    return (
        <div className='Preview' style={style}>
            <div className='Preview-board'>
                {
                    board.rows.map((row, y) =>
                    (
                        row.map((cell, x) =>
                        (
                                <BoardCell key={x * board.size.cols + x} cell={cell} />
                        ))
                    ))
                }
            </div>
        </div>
    )

}

export default React.memo(Preview)

