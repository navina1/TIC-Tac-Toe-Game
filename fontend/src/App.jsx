
import { useEffect, useState } from 'react';
import './App.css';
import { io } from 'socket.io-client';
import Square from './components/square/Square';
import Swal from "sweetalert2";
const renderFrom = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9]
]
function App() {
  const [gameState, setGameState] = useState(renderFrom);
  const [currentPlayer, setCurrentPlayer] = useState('circle');
  const [winner, setWinner] = useState();
  const [winnerArray, setWinnerArray] = useState([]);
  const [playOnline, setPlayOnline] = useState(false);
  const [socket, setSocket] = useState(null);
  const [playerName, setPlayerName] = useState('');
  const [opponentName, setOpponentName] = useState(null);
  const [playingAs,setPlayingAs]=useState(null);
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
        setWinnerArray([i * 3, i * 3 + 1, i * 3 + 2])
        return gameState[i][0]; // Winner found in a row
      }
      if (gameState[0][i] && gameState[0][i] === gameState[1][i] && gameState[0][i] === gameState[2][i]) {
        setWinnerArray([i, i + 3, i + 6])
        return gameState[0][i]; // Winner found in a column
      }
    }

    // Check diagonals for a winner
    if (gameState[0][0] && gameState[0][0] === gameState[1][1] && gameState[0][0] === gameState[2][2]) {
      setWinnerArray([0, 4, 8])
      return gameState[0][0]; // Winner found in the main diagonal
    }
    if (gameState[0][2] && gameState[0][2] === gameState[1][1] && gameState[0][2] === gameState[2][0]) {
      setWinnerArray([2, 4, 6])
      return gameState[0][2]; // Winner found in the anti-diagonal
    }

    // Check for a draw
    const isdraw = gameState.flat().every((val) => {
      if (val == "circle" || val == "cross") {
        return true
      }
    })
    if (isdraw) {
      return 'draw'
    }
    return null; // No one
  };
  const playOnlineHandler = async (e) => {
    const result = await takePlayerName();
    if (!result.isConfirmed) {
      return
    }
    setPlayerName(result?.value)
    e.preventDefault()
    const newSocket = io('http://localhost:3000', {
      autoConnect: true
    });
    newSocket?.emit("request_to_play", {
      playerName: result?.value,
    })
    setSocket(newSocket)
  }
  const takePlayerName = async () => {
    const result = await Swal.fire({
      title: "Enter your name",
      input: "text",
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) {
          return "You need to write something!";
        }
      }
    });
    return result
  }
  // useEffect(()=>{
  //   if(socket?.on){
  //     setPlayOnline(true)
  //   }
  // },[socket])
  socket?.on("connect", function () {
    setPlayOnline(true)
  })
  socket?.on("opponentNotFound", function () {
    setOpponentName(null)
  })
  socket?.on("opponentFound", function (data) {
    setOpponentName(data.opponentName);
    setPlayingAs(data.playingAs)
    //console.log(data.playingAs);
  })
  socket?.on("enemyMoved",(data)=>{
    console.log(data)
    const id = data.state.id;
    setGameState((prevState) => {
      let newState = [...prevState];
      const rowIndex = Math.floor(id / 3);
      const colIndex = id % 3;
      newState[rowIndex][colIndex] = data.state.sign;
      return newState;
    });
    setCurrentPlayer(data.state.sign === "circle" ? "cross" : "circle");
  })
  if (!playOnline) {
    return (
      <div className='main'>
        <button onClick={playOnlineHandler} className='playonline'>PLAY ONLINE</button>
      </div>
    )
  }
  if (playOnline && !opponentName) {
    return (
      <div className='waiting'>
        <p>Waiting for opponent......</p>
      </div>
    )
  }
  if (playOnline && opponentName) {
    return (
      <div className='main'>
        <div className='players'>
          <div className={`left lightbg ${currentPlayer == playingAs ? 'current-move-'+currentPlayer :""}`}>
            {playerName}
          </div>
          <div className={`right lightbg ${currentPlayer != playingAs ? 'current-move-'+currentPlayer :""}`}>
            {opponentName}
          </div>
        </div>
        <div>
          <h1 className='lightbg'>Tic Tac Toe</h1>
          <div className='square-wrapper'>
            {gameState.map((array, rowIndex) => {
              return array.map((item, colIndex) => {
                return <Square
                  socket={socket}
                  gameState={gameState}
                  key={rowIndex * 3 + colIndex}
                  id={rowIndex * 3 + colIndex}
                  setGameState={setGameState}
                  currentPlayer={currentPlayer}
                  setCurrentPlayer={setCurrentPlayer}
                  winner={winner}
                  winnerArray={winnerArray}
                  currentElement={item}
                />
              })
            })}
          </div>
          {winner && (
            <h3 className='winner'>{winner === "draw" ? "Game Over" : `${winner} won the game`}</h3>
          )}
          {!winner && opponentName &&(
            <h3>You are playing against   {opponentName}</h3>
          )}
        </div>
      </div>
    )
  }


}

export default App
