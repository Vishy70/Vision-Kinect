import './App.css';
import Game from './components/Game'

function App() {
  return (
    <div className="App">
      <Game rows={20} cols={10} />
    </div>
  );
}

export default App;
