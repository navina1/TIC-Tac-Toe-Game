
import { useEffect, useState } from 'react'
import './App.css'
import Square from './components/square/Square'
const renderFrom = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9]
]
function App() {
  const [gameState, setGameState] = useState(renderFrom);
  const [currentPlayer, setCurrentPlayer] = useState('circle');
  const [winner, setWinner] = useState();
  const [winnerArray,setWinnerArray]=useState([]);
  const [playOnline,setPlayOnline]=useState(false);

  useEffect(() => {
    const result = checkWinner();
    if (result == "circle" || result == "cross" || result == "draw") {
      setWinner(result)
    }
  }, [gameState])
  const checkWinner = () => {
    // Check rows and columns for a winner
    for (let i = 0; i < 3; i++) {
      if (gameState[i][0] && gameState[i][0] === gameState[i][1] && gameState[i][0] === gameState[i][2]) {
        setWinnerArray([i*3,i*3+1,i*3+2])
        return gameState[i][0]; // Winner found in a row
      }
      if (gameState[0][i] && gameState[0][i] === gameState[1][i] && gameState[0][i] === gameState[2][i]) {
        setWinnerArray([i,i+3,i+6])
        return gameState[0][i]; // Winner found in a column
      }
    }

    // Check diagonals for a winner
    if (gameState[0][0] && gameState[0][0] === gameState[1][1] && gameState[0][0] === gameState[2][2]) {
      setWinnerArray([0,4,8])
      return gameState[0][0]; // Winner found in the main diagonal
    }
    if (gameState[0][2] && gameState[0][2] === gameState[1][1] && gameState[0][2] === gameState[2][0]) {
      setWinnerArray([2,4,6])
      return gameState[0][2]; // Winner found in the anti-diagonal
    }

    // Check for a draw
    const isdraw=gameState.flat().every((val)=> {
      if(val=="circle"||val=="cross"){
        return true
      }
    })
    if(isdraw){
      return 'draw'
    }
    return null; // No one
  };
  if(!playOnline){
    return(
      <div className='main'>
          <button className='playonline'>PLAY ONLINE</button>
      </div>
    )
  }else{
  return (
    <div className='main'>
      <div className='players'>
        <div className='left lightbg'>
          yourself
        </div>
        <div className='right lightbg'>
          opponent
        </div>
      </div>
      <div>
        <h1 className='lightbg'>Tic Tac Toe</h1>
        <div className='square-wrapper'>
          {gameState.map((array, rowIndex) => {
            return array.map((item, colIndex) => {
              return <Square
                key={rowIndex * 3 + colIndex}
                id={rowIndex * 3 + colIndex}
                setGameState={setGameState}
                currentPlayer={currentPlayer}
                setCurrentPlayer={setCurrentPlayer}
                winner={winner}
                winnerArray={winnerArray}
              />
            })
          })}
        </div>
        {console.log(winner)}
        {winner && (
          <h3 className='winner'>{winner === "draw" ? "Game Over" : `${winner} won the game`}</h3>
        )}

      </div>
    </div>
  )
}
}

export default App
