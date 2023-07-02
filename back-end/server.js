const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const cors = require('cors');
var bodyParser = require('body-parser')

const app = express();
let config = require("./config.json");
const database = require("mime-db");
config = config[config['mode']];
let frontEnd = process.env.frontEnd || config.frontEnd;
let port = process.env.port || 3000;
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: [frontEnd]
    }
});

io.on('connection', client => {
    
    
    client.on('disconnect', () => {  //On Connect and Disconnect we update the UI for Player online status
        try {
            let roomData = Array.from(io.sockets.adapter.rooms.get(client.roomId));
            io.sockets.to(client.roomId).emit('playersStatus', { roomData });
        } catch (error) {}

    });

    client.on('joinGame', (data) => {  //On Connect and Disconnect we update the UI for Player online status
        try {
            client.roomId = data.roomId;
            client.join(data.roomId)
            let roomData = Array.from(io.sockets.adapter.rooms.get(data.roomId));
            io.sockets.to(data.roomId).emit('playersStatus', { roomData });
        } catch (error) {}
    })
    
    client.on('error', (error) => {
        console.log(error)
    })
});

app.post('/moveDone', function (req, res) {
    try {
        if (!req.body.roomId) {
            return res.status(400).send({
                status: "error",
                response: "Room Id not present to connect"
            })
        }
        io.sockets.to(req.body.roomId).emit('moveDoneClient', { "move": req.body.move, "index": req.body.index})
        return res.status(200).send({
            status: "success",
            response: "Move Succesful"
        })
    }
    catch (error) {
        //console.log("Error in moveDone API ", error)
    }

})


app.post('/resetGame', function (req, res) {
    if (!req.body.roomId) {
        return res.status(400).send({
            status: "error",
            response: "Room Id not present to connect"
        })
    }
    io.sockets.to(req.body.roomId).emit('resetGameClient', { "message": "Game Reseted" })
    return res.status(200).send({
        status: "success",
        response: "Move Succesful"
    })
})
httpServer.listen(port);