
//CSS
import './BoardCell.css'

export function BoardCell({ cell })
{
    return (
        <div className={`BoardCell ${cell.className}`}>
            <div className='sparklez'>
            </div>
        </div>
    );
}