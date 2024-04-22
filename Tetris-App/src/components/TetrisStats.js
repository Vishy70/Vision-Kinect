
//CSS
import './TetrisStats.css'

//~Hooks
import React from "react";

function TetrisStats({ tetrisStats })
{
    const {level, points, linesCompleted, linesPerLevel} = tetrisStats;
    const linesToNextLevel = linesPerLevel - linesCompleted

    return (
        <ul className="TetrisStats TetrisStats__right">
            <li>Level</li>
            <li className="value">{level}</li>
            <li>Lines to next level</li>
            <li className="value">{linesToNextLevel}</li>
            <li>Points</li>
            <li className="value">{points}</li>
        </ul>
    );
}

export default React.memo(TetrisStats)