# Tetris in React - Design

## High Level Overview

Tetris app is majorly a front-end only app, using Node.js for basic website hosting. The app is currently designed using the React framework, styled using plain(TODO: Bootstrap/Tailwind for standard & consistent UI) CSS.The `src` folder contains the main `App` component, which contains all other components and is rendered onto the `index` page. It simply renders the `Game` component. `src` has 3 sub-directories:

- `components` to organize the different functionalities/logic used in tetris, designed as javascript functions with jsx to render html.

- `hooks` a crucial API, providing *state* for functional components. For more detials about **state** and **hooks**, refer the [React docs](https://react.dev/reference/react/hooks). This dir contains all custom hooks.

- `utils` to house some important functionality, which aren't rendered as components. We look into further depth about these later.

List of all Components includes:

- `Game` conditionally renders two components, based on if the game is over or not: `Menu` or `Tetris`. `Menu` has two buttons, which will redirect to the `Tetris` component and `Testcam`(TODO...) component respectively.

- `Tetris` component renders the following: `CamControl` (webcam to control tetris actions), `Board` (to display the board), `Previews` (to display upcoming *tetrominoes*), `TetrisStats` (for stats), and `GameController` (takes care of all *actions*  TODO: connect `CamControl` and `GameController` through props and callbacks...).

- `CamControl` consists of `Webcam` and `canvas` components, which tie together with the *CV model* to give the user Vision-based actions.

- `Board` renders (**rows** x **columns**) grid of `BoardCell` components, to render the entire dynamically changing tetris board.

- `Previews` displays n next-in-line `Preview` tetromino components, to help the user plan their next move (typically, n = 3). `Preview` reuses `BoardCell` grid for the tetromino, albeit on a smaller scale.

- `TetrisStats` simply renders the user's current stats: things like level, lines to next level, points, etc.

- `GameController` is actually an *invisible* component that is used to take handle all in-game action events, making appropriate dynamic adjustments to the rest of the components. In fact, the only thing the component displays is if the game is paused (one of the actions).

A summary of this tree/hierarchy is shown in Fig1: the children and parent components communicate via props and callbacks. The diagram also shows all internal functions, hooks, and utilities used by each component.

(TODO: Fig1!)

The remainder delves into some details regarding the state setup across components, custom hooks and utilities implemented to handle different tetris logic, and how they are tied together in the components.

## Tetris - State and Hooks

One of the key reasons React was used in Vision Kinect, is due to React's ability to re-render specific components of the DOM, due to **state** changes. With state, we can trust the React engine to make appropriate changes to the Game Interface as our important variables change, reducing an otherwise tricky burden and giving some more freedom to make the game more responsive. The different *state* present is displayed in a top-down manner:

- gameOver: This keeps track of if the game is over or not. Provides a setter and resetter (reset to false ie start the game) via the **useGameOver** hook. Resetter passed to `Menu` (to reset on button clicking) and Setter passed to `Tetris`.

- tetrisStats: keeps track of any game stats (current level, lines completed in current level, lines per level, points). Default stats are provided at the start by *buildTetrisStats*. Exposes only a 'addLinesCleared' setter provided by **useTetrisStats** hook, which updates the points, level reached and lines cleared in this level at once. Provided to `TetrisStats` for display and `GameController` for updation.

- player: a virtual representation of the user, keeping track of things like currently falling tetromino and its location, next-in-line tetrominoes, if current tetromino has collided, list of next tetrominoes, etc. `usePlayer` hook provides setter and updater callbacks, to change the player dynamically. player and its setter is passed to `GameController`; `Previews` uses player's tetrominoes list to preview the upcoming tetrominoes.

- board: an object that keeps track of the displayed tetris board; the board is a (**rows** x **columns**) grid of cells, initialized as 'defaultCell' from `Cell`-util and built using *buildBoard()*. There is also a setter used internally by this **useBoard** hook; the hook sets up a **useEffect** that calls the setter whenever dependency *player* changes: the setter essentially calls *nextBoard()* (all of which shall be explained in the next section). board is passed to `Board` and `GameController`.

- dropTime: state to keep track of the time to next auto-slow drop. This is necessary, due to updation on a per-level basis, as well as implementing pausing mechanism (and keep track of this time during the pause). The hook **useDropTime** provides two callbacks: *pauseDropTime()* and *resumeDropTime()*, which do as the name suggests. 

- paused: Just a small piece of state that keeps track of the game being paused, and to conditionally render "Paused" (Note: this couldn't be done with dropTime, due to the way 'reset slow drop time' mechanism works).

The **useInterval** hook, as well as all *utilities* and their uses in some *Components* shall be disucssed in the next section.

## Utilities

