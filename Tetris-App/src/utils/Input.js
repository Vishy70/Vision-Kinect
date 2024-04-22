

export const Action = 
{
    Left: "Left",
    Right: "Right",
    Rotate: "Rotate",
    SlowDrop: "SlowDrop",
    FastDrop: "FastDrop",
    Start: "Start",
    Pause: "Pause",
    Quit: "Quit"
}


export const Key = 
{
    Enter: Action.Start,
    ArrowUp: Action.Rotate,
    ArrowDown: Action.SlowDrop,
    ArrowLeft: Action.Left,
    ArrowRight: Action.Right,
    KeyQ: Action.Quit,
    KeyP: Action.Pause,
    Space: Action.FastDrop
}


export const actionIsDrop = (action) => [Action.SlowDrop, Action.FastDrop].includes(action)


export const actionForKey = (keyCode) => Key[keyCode]
