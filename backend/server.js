
const {createServer} =require("http");
const {Server}= require("socket.io");

const httpServer = createServer();
const io = new Server(httpServer, {
  cors:"http://127.0.0.1:5173/"
});
const allUsers=[];
io.on("connection", (socket) => {
    allUsers[socket.id]={socket:socket,online:true};
 
  socket.on("request_to_play",(data)=>{
    const currentUser=allUsers[socket.id];
    currentUser.playerName=data.playerName;
    let opponentPlayer;
    for(const key in allUsers){
        const user=allUsers[key];
        if(user.online && !user.playing && socket.id!==key){
            opponentPlayer=user;
            break;
        }
    }
    if(opponentPlayer){
        //console.log("opponent found");
        //console.log(currentUser.playerName)
        opponentPlayer.socket.emit("opponentFound",{
            opponentName:currentUser.playerName,
            playingAs:"circle"
        })
        //console.log(opponentPlayer.playerName);
        currentUser.socket.emit("opponentFound",{
            opponentName:opponentPlayer.playerName,
            playingAs:"cross"
        })
        currentUser.socket.on("playerMove", (data)=>{
            opponentPlayer.socket.emit( "enemyMoved", {
                ...data
            } )
        });
        opponentPlayer.socket.on("playerMove",(data)=>{
            currentUser.socket.emit("enemyMoved", {...data})
        })
    }else{
        currentUser.socket.emit("opponentNotFound")
    }
  })
  socket.on("disconnect",function(){
        const currentUser=allUsers[socket.id];
        currentUser.online=false;
  } )
});

httpServer.listen(3000);