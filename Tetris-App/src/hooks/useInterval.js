
//Hooks
import { useEffect, useRef } from "react";

//credit: Dan Abramov
export function useInterval(callback, delay)
{
    const savedCallback = useRef()

    //remember callback
    useEffect(() =>
    {
        savedCallback.current = callback
    }, [callback])

    //Setup interval
    useEffect(() =>
    {
        function tick(){savedCallback.current()}

        if(delay !== null)
        {
            const id = setInterval(tick, delay)
            return () => {clearInterval(id)}
        }
    }, [delay])
}