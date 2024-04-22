
//CSS
import './Menu.css'

//pending components...

export function Menu ({onClick})
{
    return (
        <div className="Button">
            <h1 className='Title'>Vision Tetris</h1>
            <button className="Button" onClick={onClick}>
                Press to Start
            </button>
            <button className="Button">
                Press to Check Camera
            </button>
        </div>
    );

}