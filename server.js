const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const cors = require('cors');
var bodyParser = require('body-parser')

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


const httpServer = createServer(app);
const io = new Server(httpServer, {   
    cors: {
    origin: ["http://localhost:4200","http://localhost:8080"]
  }
 });
let clientGlobal;
io.on('connection', client => { 
    clientGlobal = client;
    client.on('event', data => { console.log("event Event Handler",data) });
    client.on('disconnect', () => { console.log("disconnect Event Handler") });
    client.on('joinGame',(data)=>{
        console.log("kjhkjh")
        client.join(data.roomId)
    })
 });

 app.post('/joinGame',function(req,res){
    if(!req.body.roomId){
        return res.status(400).send({
            status:"error",
            response:"Room Id not present to connect"
        })
    }
    clientGlobal.join(req.body.roomId)
    return res.status(200).send({
        status:"success",
        response:"Two player Game started"
    })

 })

 app.post('/moveDone',function(req,res){
    if(!req.body.roomId){
        return res.status(400).send({
            status:"error",
            response:"Room Id not present to connect"
        })
    }
    console.log("req",req.body.roomId,req.body.move)
    io.sockets.to(req.body.roomId).emit('moveDoneClient',{"move":req.body.move})
    return res.status(200).send({
        status:"success",
        response:"Move Succesful"
    })
 })
 httpServer.listen(3000);