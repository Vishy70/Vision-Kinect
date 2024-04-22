
//Utilities
import { rotate } from '../utils/Tetrominoes'
import { isWithinBoard, hasCollision } from '../utils/Boards'
import { Action } from "../utils/Input"


function attemptRotation({ board, player, setPlayer })
{
    const shapeNew = rotate({piece: player.tetromino.shape, direction: 1})//1 is clockwise, 0 is counterclockwise
    const position = player.position

    const check1 = isWithinBoard({ board, position, shape: shapeNew })
    const check2 = !hasCollision({ board, position, shape: shapeNew })
    
    //console.log(`Inbounds? ${check1}. Collided? ${!check2}`)
    const isValidRotation = check1 && check2

    //console.log("Rotation will take place? ", !!isValidRotation)
    if(isValidRotation)
    {
        setPlayer({
            ...player, 
            tetromino:{
                ...player.tetromino,
                shape: shapeNew
            }

        })
    }
    else
    {
        return false
    }
}


export function movePlayer({ delta, position, shape, board })
{
    const desiredNextPosition = 
    {
        row: position.row + delta.row,
        col: position.col + delta.col
    }
    
    const isOnBoard = isWithinBoard({ board, position: desiredNextPosition, shape })
    const collided = hasCollision({ board, position: desiredNextPosition, shape })
    
    const preventMove = !isOnBoard || (isOnBoard && collided)
    const nextPosition = preventMove ? position : desiredNextPosition

    const isMovingDown = delta.row > 0
    const isHit = isMovingDown && (collided || !isOnBoard)

    return { collided: isHit, nextPosition }

}


function attemptMovement({ board, action, player, setPlayer, setGameOver })
{
    const delta = {row: 0, col: 0}
    let isFastDropping = false;

    if(action === Action.FastDrop)
    {
        isFastDropping = true;
    }
    else if(action === Action.SlowDrop)
    {
        delta.row += 1
    }
    else if(action === Action.Left)
    {
        delta.col -= 1
    }
    else if(action === Action.Right)
    {
        delta.col += 1
    }

    const { collided, nextPosition } = movePlayer({ delta, position: player.position, shape: player.tetromino.shape, board })

    const isGameOver = collided && player.position.row === 0
    if(isGameOver) 
    {
        setGameOver(isGameOver)
    }

    setPlayer({
        ...player,
        collided,
        isFastDropping,
        position: nextPosition
    })

}


export function playerController({ action, board, player, setPlayer, setGameOver })
{
    if(!action) return

    if(action === Action.Rotate)
    {
        attemptRotation({ board, player, setPlayer })
    }
    else
    {
        attemptMovement({ board, action, player, setPlayer, setGameOver })
    }
}