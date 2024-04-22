
//Utilities
import { defaultCell } from '../utils/Cell'
import { movePlayer } from '../utils/PlayerController'
import { transferToBoard } from '../utils/Tetrominoes'


export function buildBoard ({ rows, cols })
{
    //specifying the length property crucial for Array.from()
    const builtRows = Array.from({length: rows}, () =>
        Array.from({length: cols}, () => ({...defaultCell})));

        return (
            {
                rows: builtRows,
                size: {rows, cols}
            }
        )
}

function findDropPosition({ board, position, shape })
{
	let max = board.size.rows - position.row + 1
	let dropRow = 0

	for(let i = 0; i < max; i++)
	{
		const delta = { row: i, col: 0 }
		const result = movePlayer({ delta, position, shape, board })
		const { collided } = result
		if(collided)
		{
			break;
		}

		dropRow = position.row + i
	}
	

	return {...position, row: dropRow}
}

export function nextBoard({ board, player, resetPlayer, addLinesCleared })
{ 
    const {tetromino, position } = player

    //update board, so that tetrominoes move, not smear!
    let rows = board.rows.map((row) =>
    (
        row.map((cell) =>
        (
            (cell.occupied) ? (cell) : ({...defaultCell})
        ))
    ))

    //drop & ghost position
    const dropPosition = findDropPosition({ board, position, shape: tetromino.shape })

	// Place ghost
	const className = `${tetromino.className} 
	${player.isFastDropping ? "" : "ghost"}`;
	  rows = transferToBoard
	  ({
		className,
		isOccupied: player.isFastDropping,
		position: dropPosition,
		rows,
		shape: tetromino.shape
	  });
	
	  // Place the piece.
	  // If it collided, mark the board cells as collided
	if (!player.isFastDropping) 
	{
		rows = transferToBoard
		({
			className: tetromino.className,
			isOccupied: player.collided,
			position,
			rows,
			shape: tetromino.shape
		});
	}

		// Make default cleared line
		const blankRow = rows[0].map((_) => ({ ...defaultCell }));

		let linesCleared = 0;
		rows = rows.reduce((acc, row) => //Check for cleared lines 
		{
			if (row.every((column) => column.occupied)) 
			{
				linesCleared++;
				acc.unshift([...blankRow]);
			}
			else
			{
				acc.push(row);
			}
			return acc;
		}, []);

	if (linesCleared > 0) 
	{
		addLinesCleared(linesCleared);
	}



    if(player.collided || player.isFastDropping)
    {
      resetPlayer()
    }

    return {
        rows,
        size: {...board.size}
    }

}

export function hasCollision({ board, position, shape })
{
    for (let y = 0; y < shape.length; y++) 
    {
      const row = y + position.row;
  
      for (let x = 0; x < shape[y].length; x++) 
      {
        if (shape[y][x]) 
        {
          const column = x + position.col;
          
          //if the row and column exist and it is occupied => has collided!
            if(board.rows[row] && board.rows[row][column] && board.rows[row][column].occupied)
            {
                return true;
            }
        }
      }
    }
  
    return false;
  };
  
  export function isWithinBoard({ board, position, shape })
  {
    //console.log("Shape: ", shape)
    for (let y = 0; y < shape.length; y++)
    {
      const row = y + position.row;
  
      for (let x = 0; x < shape[y].length; x++) 
      {
        if (shape[y][x])
        {
          const column = x + position.col;

          //check if row and column are valid
          const isValidPosition = board.rows[row] && board.rows[row][column];
          //console.log(`X: ${x} Y: ${y} row: ${row} column: ${column} Valid? ${!!isValidPosition}`)

          if (!isValidPosition) return false;
        }
      }
    }
  
    return true;
  };
  