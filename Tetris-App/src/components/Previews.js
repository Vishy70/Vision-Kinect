
//Components
import Preview from '../components/Preview'

//~Hooks
import React from "react"


export function Previews({ tetrominoes })
{
    //We want all, but reverse order TODO: remove slice
    const previewTetrominoes = tetrominoes.slice(- tetrominoes.length).reverse()
    //console.log(tetrominoes)
    //console.log(previewTetrominoes)
    return (
        <>
        {
            previewTetrominoes.map((tetromino, index) =>
            (
                
                <Preview tetromino={tetromino} key={index} index={index} />
            ))
        }
        </>
    )
}